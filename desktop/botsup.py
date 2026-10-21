"""Keeps the Telegram storage bot running alongside the Explorer.

The bot runs as its own process (TelegramFileBot.exe, or bot.py under the
project's venv while developing) and reads its own .env, so the Explorer
never touches the bot token. The supervisor only starts, stops and watches
it. The bot keeps running after the Explorer closes; the next launch simply
adopts it.
"""

from __future__ import annotations

import ctypes
import logging
import os
import subprocess
import sys
import threading
import time
from typing import Any, Dict, List, Optional

from . import appconfig

log = logging.getLogger("tfe.botsup")

MUTEX_NAME = "Local\\TelegramFileBot"
DATA_DIR = appconfig.PROJECT_DIR / "data"
PID_PATH = DATA_DIR / "bot.pid"
STOP_PATH = DATA_DIR / "bot.stop"
BOT_LOG_PATH = DATA_DIR / "bot.log"
CHECK_INTERVAL = 8.0
SYNCHRONIZE = 0x00100000

_kernel32 = None


def _k32():
    global _kernel32
    if _kernel32 is None and os.name == "nt":
        kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
        kernel32.OpenMutexW.argtypes = [ctypes.c_uint32, ctypes.c_bool, ctypes.c_wchar_p]
        kernel32.OpenMutexW.restype = ctypes.c_void_p
        kernel32.CreateMutexW.argtypes = [ctypes.c_void_p, ctypes.c_bool, ctypes.c_wchar_p]
        kernel32.CreateMutexW.restype = ctypes.c_void_p
        kernel32.CloseHandle.argtypes = [ctypes.c_void_p]
        kernel32.CloseHandle.restype = ctypes.c_int
        _kernel32 = kernel32
    return _kernel32


def bot_command() -> Optional[List[str]]:
    if getattr(sys, "frozen", False):
        exe = appconfig.PROJECT_DIR / "TelegramFileBot.exe"
        return [str(exe)] if exe.is_file() else None
    root = appconfig.PROJECT_DIR
    for name in ("pythonw.exe", "python.exe"):
        candidate = root / ".venv" / "Scripts" / name
        if candidate.is_file():
            return [str(candidate), str(root / "bot.py")]
    return None


def bot_available() -> bool:
    return bot_command() is not None


def mutex_exists() -> bool:
    kernel32 = _k32()
    if kernel32 is None:
        return False
    handle = kernel32.OpenMutexW(SYNCHRONIZE, False, MUTEX_NAME)
    if not handle:
        return False
    kernel32.CloseHandle(handle)
    return True


def _read_pid() -> Optional[int]:
    try:
        return int(PID_PATH.read_text(encoding="ascii", errors="ignore").strip())
    except (OSError, ValueError):
        return None


def status() -> Dict[str, Any]:
    running = mutex_exists()
    return {
        "running": running,
        "pid": _read_pid() if running else None,
        "available": bot_available(),
    }


def spawn() -> Dict[str, Any]:
    if mutex_exists():
        return status()
    command = bot_command()
    if not command:
        return {
            **status(),
            "error": "TelegramFileBot.exe was not found next to the Explorer.",
        }
    try:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        if BOT_LOG_PATH.exists() and BOT_LOG_PATH.stat().st_size > 2_000_000:
            BOT_LOG_PATH.write_bytes(b"")
        with open(BOT_LOG_PATH, "ab") as log_file:
            subprocess.Popen(
                command,
                cwd=str(appconfig.PROJECT_DIR),
                stdin=subprocess.DEVNULL,
                stdout=log_file,
                stderr=subprocess.STDOUT,
                creationflags=subprocess.CREATE_NO_WINDOW
                | subprocess.CREATE_NEW_PROCESS_GROUP,
            )
    except OSError:
        log.exception("Could not start the storage bot")
        return {**status(), "error": "The storage bot could not be started."}
    deadline = time.time() + 20.0
    while time.time() < deadline:
        if mutex_exists():
            break
        time.sleep(0.3)
    if not mutex_exists():
        return {**status(), "error": "The storage bot did not start. See data/bot.log."}
    log.info("Storage bot started (pid %s)", _read_pid())
    return status()


def _force_kill(pid: int) -> None:
    try:
        subprocess.run(
            ["taskkill", "/F", "/PID", str(pid)],
            capture_output=True,
            creationflags=subprocess.CREATE_NO_WINDOW,
            timeout=10,
        )
    except (OSError, subprocess.TimeoutExpired):
        log.exception("Could not force-stop the storage bot (pid %s)", pid)


def _force_kill_image() -> None:
    if not (appconfig.PROJECT_DIR / "TelegramFileBot.exe").is_file():
        return
    try:
        subprocess.run(
            ["taskkill", "/F", "/IM", "TelegramFileBot.exe"],
            capture_output=True,
            creationflags=subprocess.CREATE_NO_WINDOW,
            timeout=10,
        )
    except (OSError, subprocess.TimeoutExpired):
        log.exception("Could not force-stop the storage bot image")


def terminate() -> Dict[str, Any]:
    if mutex_exists():
        pid = _read_pid()
        if pid:
            try:
                STOP_PATH.write_text(str(pid), encoding="ascii")
            except OSError:
                pass
            deadline = time.time() + 8.0
            while time.time() < deadline:
                if not mutex_exists():
                    break
                time.sleep(0.3)
            if mutex_exists():
                _force_kill(pid)
        else:
            _force_kill_image()
    try:
        STOP_PATH.unlink(missing_ok=True)
    except OSError:
        pass
    log.info("Storage bot stopped")
    return status()


class Supervisor:
    """Auto-starts the bot and restarts it if it dies, unless stopped on purpose."""

    def __init__(self) -> None:
        self._stop = threading.Event()
        self._thread: Optional[threading.Thread] = None
        self.enabled = appconfig.load_settings().get("run_bot", "1") == "1"

    def start_watching(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._thread = threading.Thread(target=self._loop, name="tfe-botsup", daemon=True)
        self._thread.start()

    def shutdown(self) -> None:
        self._stop.set()

    def _loop(self) -> None:
        while not self._stop.wait(CHECK_INTERVAL):
            try:
                if self.enabled and bot_available() and not mutex_exists():
                    result = spawn()
                    if result.get("error"):
                        log.warning("Auto-start bot: %s", result["error"])
            except Exception:
                log.exception("Bot supervisor loop error")

    def snapshot(self) -> Dict[str, Any]:
        return {**status(), "enabled": self.enabled}

    def turn_on(self) -> Dict[str, Any]:
        self.enabled = True
        self._save_enabled(True)
        return {**spawn(), "enabled": True}

    def turn_off(self) -> Dict[str, Any]:
        self.enabled = False
        self._save_enabled(False)
        return {**terminate(), "enabled": False}

    def _save_enabled(self, value: bool) -> None:
        try:
            appconfig.save_settings({"run_bot": "1" if value else "0"})
        except OSError:
            log.exception("Could not save the run_bot setting")
