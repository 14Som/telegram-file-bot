"""Windows launcher for Telegram File Explorer.

Starts the local server on a free loopback port and opens an app-style
Edge window. Only one copy may run; a second launch focuses the existing
server instead of starting another one.
"""

from __future__ import annotations

import json
import logging
import logging.handlers
import os
import shutil
import socket
import subprocess
import sys
import threading
import time
import urllib.request
import webbrowser
from pathlib import Path
from typing import Optional

PROJECT_DIR = Path(__file__).resolve().parent.parent
if str(PROJECT_DIR) not in sys.path:
    sys.path.insert(0, str(PROJECT_DIR))

try:
    from desktop import appconfig, server  # noqa: E402
except Exception as exc:  # missing FastAPI/Telethon or a broken install
    try:
        import ctypes

        ctypes.windll.user32.MessageBoxW(
            None,
            "The Explorer's Python packages are missing or broken:\n\n"
            f"{exc}\n\nRun this in the project folder:\n"
            ".venv\\Scripts\\python -m pip install -r desktop\\requirements.txt",
            "Telegram File Explorer",
            0x10,
        )
    except Exception:
        pass
    raise SystemExit(1)

IDLE_TIMEOUT = 300
SERVER_FILE = appconfig.HOME / "server.json"
WINDOW_PROFILE = appconfig.HOME / "window"
MUTEX_NAME = "Local\\TelegramFileExplorer"

log = logging.getLogger("tfe.launcher")


def setup_logging() -> None:
    appconfig.ensure_dirs()
    root = logging.getLogger()
    if root.handlers:
        return
    root.setLevel(logging.INFO)
    handler = logging.handlers.RotatingFileHandler(
        appconfig.LOG_PATH, maxBytes=1_500_000, backupCount=3, encoding="utf-8"
    )
    handler.setFormatter(
        logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s")
    )
    root.addHandler(handler)


def message(title: str, text: str, error: bool = False) -> None:
    (log.error if error else log.info)("%s: %s", title, text)
    try:
        import ctypes

        flags = 0x10 if error else 0x40
        ctypes.windll.user32.MessageBoxW(None, text, title, flags)
    except Exception:
        pass


def hold_mutex() -> Optional[int]:
    """Return a handle while this process is the only instance."""
    if os.name != "nt":
        return 1
    try:
        import ctypes

        kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
        kernel32.CreateMutexW.argtypes = [
            ctypes.c_void_p,
            ctypes.c_bool,
            ctypes.c_wchar_p,
        ]
        kernel32.CreateMutexW.restype = ctypes.c_void_p
        kernel32.CloseHandle.argtypes = [ctypes.c_void_p]
        kernel32.CloseHandle.restype = ctypes.c_int
        handle = kernel32.CreateMutexW(None, False, MUTEX_NAME)
        if not handle:
            return 1
        if ctypes.get_last_error() == 183:  # ERROR_ALREADY_EXISTS
            kernel32.CloseHandle(handle)
            return None
        return int(handle)
    except Exception:
        log.exception("Could not create the single-instance mutex")
        return 1


def read_server_file() -> Optional[dict]:
    try:
        data = json.loads(SERVER_FILE.read_text(encoding="utf-8"))
        if isinstance(data, dict) and data.get("url"):
            return data
    except (OSError, ValueError):
        pass
    return None


def ping(url: str, timeout: float = 0.8) -> bool:
    try:
        with urllib.request.urlopen(f"{url}/api/ping", timeout=timeout) as response:
            data = json.loads(response.read().decode("utf-8", "ignore"))
        return data.get("app") == "telegram-file-explorer"
    except Exception:
        return False


def find_running_server() -> Optional[str]:
    data = read_server_file()
    if data and ping(str(data["url"])):
        return str(data["url"])
    return None


def find_edge() -> Optional[str]:
    candidates = [
        Path(os.environ.get("ProgramFiles(x86)", r"C:\Program Files (x86)"))
        / "Microsoft/Edge/Application/msedge.exe",
        Path(os.environ.get("ProgramFiles", r"C:\Program Files"))
        / "Microsoft/Edge/Application/msedge.exe",
        Path(os.environ.get("LOCALAPPDATA", ""))
        / "Microsoft/Edge/Application/msedge.exe",
    ]
    for candidate in candidates:
        try:
            if candidate.is_file():
                return str(candidate)
        except OSError:
            continue
    return shutil.which("msedge")


def open_window(url: str, wait: bool) -> Optional[subprocess.Popen]:
    """Open the explorer as an app-style window; fall back to the browser."""
    edge = find_edge()
    if edge:
        try:
            WINDOW_PROFILE.mkdir(parents=True, exist_ok=True)
            process = subprocess.Popen(
                [
                    edge,
                    f"--app={url}",
                    f"--user-data-dir={WINDOW_PROFILE}",
                    "--no-first-run",
                    "--no-default-browser-check",
                    "--disable-features=msEdgeFirstRunExperience",
                    "--window-size=1380,880",
                ],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                cwd=str(PROJECT_DIR),
            )
            if wait:
                return process
            time.sleep(0.4)
            return None
        except OSError:
            log.exception("Could not launch Edge in app mode")
    webbrowser.open(url, new=1)
    return None


def free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def write_server_file(url: str, port: int) -> None:
    payload = {"url": url, "port": port, "pid": os.getpid()}
    tmp = SERVER_FILE.with_suffix(".tmp")
    try:
        tmp.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        os.replace(tmp, SERVER_FILE)
    except OSError:
        log.exception("Could not write %s", SERVER_FILE)


def clear_server_file() -> None:
    data = read_server_file()
    if data and data.get("pid") != os.getpid():
        return
    try:
        SERVER_FILE.unlink(missing_ok=True)
    except OSError:
        pass


def last_activity(default: float) -> float:
    try:
        return float(server.app.state.last_activity)
    except (AttributeError, TypeError, ValueError):
        return default


def wait_for_server(url: str, thread: threading.Thread, seconds: float = 25.0) -> bool:
    deadline = time.time() + seconds
    while time.time() < deadline:
        if ping(url):
            return True
        if not thread.is_alive():
            return False
        time.sleep(0.35)
    return False


def run() -> int:
    setup_logging()
    log.info("Starting Telegram File Explorer")

    existing = find_running_server()
    if existing:
        log.info("Already running at %s", existing)
        open_window(existing, wait=False)
        return 0

    mutex = hold_mutex()
    if mutex is None:
        deadline = time.time() + 20
        while time.time() < deadline:
            existing = find_running_server()
            if existing:
                open_window(existing, wait=False)
                return 0
            time.sleep(0.4)
        message(
            "Telegram File Explorer",
            "The app is already starting. Give it a few seconds, then try again.",
            error=True,
        )
        return 1

    import uvicorn

    port = free_port()
    url = f"http://127.0.0.1:{port}"
    config = uvicorn.Config(
        server.app,
        host="127.0.0.1",
        port=port,
        log_config=None,
        log_level="info",
        access_log=False,
        lifespan="on",
    )
    uv = uvicorn.Server(config)

    def serve() -> None:
        try:
            uv.run()
        except Exception:
            log.exception("The local server stopped unexpectedly")
        finally:
            server.QUIT.set()

    thread = threading.Thread(target=serve, name="tfe-server", daemon=True)
    thread.start()
    started = time.time()
    if not wait_for_server(url, thread):
        server.QUIT.set()
        uv.should_exit = True
        thread.join(timeout=5)
        message(
            "Telegram File Explorer could not start",
            "The local server did not respond. See explorer.log in:\n"
            f"{appconfig.HOME}",
            error=True,
        )
        return 1

    write_server_file(url, port)
    log.info("Serving %s", url)
    window = open_window(url, wait=True)

    try:
        while True:
            if server.QUIT.wait(1.0):
                break
            if not thread.is_alive():
                break
            idle = time.time() - last_activity(started)
            if idle > IDLE_TIMEOUT:
                log.info("No window activity for %ss; shutting down", IDLE_TIMEOUT)
                break
            if window is not None and window.poll() is not None and idle > 90:
                log.info("The app window was closed; shutting down")
                break
    except KeyboardInterrupt:
        pass
    finally:
        server.QUIT.set()
        uv.should_exit = True
        thread.join(timeout=10)
        clear_server_file()
        if mutex and mutex != 1 and os.name == "nt":
            try:
                import ctypes

                kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
                kernel32.CloseHandle.argtypes = [ctypes.c_void_p]
                kernel32.CloseHandle.restype = ctypes.c_int
                kernel32.CloseHandle(mutex)
            except Exception:
                pass
        log.info("Telegram File Explorer stopped")
    return 0


def main() -> None:
    try:
        code = run()
    except Exception as exc:
        log.exception("Fatal launcher error")
        message(
            "Telegram File Explorer could not start",
            f"{exc}\n\nSee explorer.log in:\n{appconfig.HOME}",
            error=True,
        )
        code = 1
    raise SystemExit(code)


if __name__ == "__main__":
    main()
