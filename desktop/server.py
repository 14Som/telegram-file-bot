"""Local HTTP server that powers the Telegram File Explorer window."""

from __future__ import annotations

import asyncio
import json
import logging
import os
import re
import secrets
import shutil
import sqlite3
import struct
import sys
import threading
import time
import uuid
import zlib
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path
from typing import Any, AsyncIterator, Dict, List, Optional, Set, Tuple
from urllib.parse import quote

from fastapi import FastAPI, File, Form, HTTPException, Query, Request, Response, UploadFile
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from starlette.concurrency import run_in_threadpool

from . import appconfig, applock, botsup, vaultstore
from .catalog import (
    Catalog,
    clean_folder_path,
    clean_name,
    folder_leaf,
    join_folder,
    normalize_tags,
)
from .splitmerge import merge_parts, parse_part_name, split_file
from .tg import MAX_UPLOAD, PART_SIZE, TGError, TelegramService, friendly_error

log = logging.getLogger("tfe.server")

QUIT = threading.Event()
COOKIE = "tfe_session"
UI_DIR = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parent.parent)) / "desktop" / "ui"
UNSAFE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
# API paths that stay reachable while the app is PIN-locked (status, lock
# control, bot supervision and quit — none of them expose file data).
LOCK_OPEN_PATHS = {
    "/api/ping",
    "/api/status",
    "/api/unlock",
    "/api/lock",
    "/api/quit",
    "/api/bot/start",
    "/api/bot/stop",
}
# Files above Telegram's per-file cap are split into volumes; this is the
# largest source file the app will accept and split.
SPLIT_HARD_CAP = 64 * 1024 ** 3
CSP = (
    "default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; "
    "style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; "
    "frame-src 'self' blob:; object-src 'none'; base-uri 'none'; "
    "form-action 'self'; frame-ancestors 'self'"
)
PUBLIC_ITEM_KEYS = (
    "id", "message_id", "name", "kind", "kind_label", "mime", "size", "width",
    "height", "duration", "folder", "tags", "favorite", "caption", "note",
    "tg_date", "added_at", "hidden", "has_thumb", "thumb_version",
)


class SetupBody(BaseModel):
    api_id: str = ""
    api_hash: str = ""
    vault: str = ""


class VaultBody(BaseModel):
    vault: str


class PhoneBody(BaseModel):
    phone: str


class CodeBody(BaseModel):
    code: str


class PasswordBody(BaseModel):
    password: str


class PinBody(BaseModel):
    pin: str = ""


class ItemPatch(BaseModel):
    name: Optional[str] = None
    folder: Optional[str] = None
    tags: Optional[str] = None
    favorite: Optional[bool] = None
    hidden: Optional[bool] = None
    note: Optional[str] = None


class MergeBody(BaseModel):
    item_id: int


class BatchIdsBody(BaseModel):
    item_ids: List[int]


class BatchDeleteBody(BatchIdsBody):
    remote: bool = False


class BatchFavoriteBody(BatchIdsBody):
    favorite: bool = True


class BatchMoveBody(BatchIdsBody):
    folder: str


class FolderBody(BaseModel):
    name: str
    icon: Optional[str] = None
    note: Optional[str] = None


class FolderPatch(BaseModel):
    name: str
    new_name: Optional[str] = None
    icon: Optional[str] = None
    note: Optional[str] = None


def _state(request: Request) -> Any:
    return request.app.state


def _spawn(state: Any, coro: Any) -> asyncio.Task:
    task = asyncio.create_task(coro)
    state.tasks.add(task)
    task.add_done_callback(state.tasks.discard)
    return task


def _host_allowed(host: str) -> bool:
    host = (host or "").strip().lower()
    if not host:
        return False
    if host.startswith("["):
        name = host[1 : host.find("]")] if "]" in host else host
    else:
        name = host.rsplit(":", 1)[0] if host.count(":") == 1 else host
    return name in {"127.0.0.1", "localhost", "::1"}


def _mutation_guard(request: Request) -> Optional[JSONResponse]:
    state = _state(request)
    if request.headers.get("x-tfe") != "1":
        return JSONResponse({"detail": "Missing app request header."}, status_code=403)
    if request.cookies.get(COOKIE) != state.key:
        return JSONResponse(
            {"detail": "This window is not authenticated. Reload the app."},
            status_code=403,
        )
    return None


def _telegram_link(item: Dict[str, Any], vault: Optional[Dict[str, Any]]) -> Optional[str]:
    if not vault:
        return None
    message_id = item.get("message_id")
    if not message_id:
        return None
    username = vault.get("username")
    if username:
        return f"https://t.me/{username}/{message_id}"
    try:
        channel_id = int(vault.get("channel_id") or vault.get("id"))
    except (TypeError, ValueError):
        return None
    channel_id = abs(channel_id)
    if channel_id > 1_000_000_000_000:
        channel_id -= 1_000_000_000_000
    return f"https://t.me/c/{channel_id}/{message_id}"


def public_item(item: Dict[str, Any], vault: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    data = {key: item.get(key) for key in PUBLIC_ITEM_KEYS if key in item}
    data["favorite"] = bool(item.get("favorite"))
    data["has_thumb"] = bool(item.get("has_thumb"))
    data["tag_list"] = (item.get("tags") or "").split()
    data["part_of"] = item.get("part_of")
    data["telegram_link"] = _telegram_link(item, vault)
    data["thumb_url"] = (
        f"/api/thumb/{item['id']}?v={int(item.get('thumb_version') or 0)}"
        if item.get("has_thumb")
        else None
    )
    data["stream_url"] = f"/api/stream/{item['id']}"
    data["download_url"] = f"/api/download/{item['id']}"
    return data


def _vault(status: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    return status.get("vault")


def _chat_id(state: Any) -> Optional[int]:
    vault = state.service.status().get("vault")
    if not vault:
        return None
    channel_id = vault.get("channel_id")
    try:
        return int(channel_id) if channel_id else None
    except (TypeError, ValueError):
        return None


async def _scoped_item(state: Any, item_id: int) -> Dict[str, Any]:
    item = await run_in_threadpool(state.catalog.get, item_id)
    chat_id = _chat_id(state)
    if item is None or chat_id is None or int(item.get("chat_id")) != int(chat_id):
        raise HTTPException(status_code=404, detail="File not found in this channel.")
    return item


def _part_groups(state: Any) -> Dict[str, Dict[str, Any]]:
    """Group archive volumes by shared base name within the vault channel."""
    chat_id = _chat_id(state)
    groups: Dict[str, Dict[str, Any]] = {}
    if chat_id is None:
        return groups
    for row in state.catalog.name_index(chat_id):
        part = parse_part_name(row.get("name") or "")
        if part is None:
            continue
        key = f"{part['base'].lower()}|{part['ext']}"
        entry = groups.setdefault(
            key,
            {"base": part["base"], "count": 0, "size": 0, "nums": {}},
        )
        entry["count"] += 1
        entry["size"] += int(row.get("size") or 0)
        entry["nums"][int(part["num"])] = int(row["id"])
    return groups


def _attach_part_info(state: Any, items: List[Dict[str, Any]]) -> None:
    if not items:
        return
    groups = _part_groups(state)
    if not groups:
        return
    for item in items:
        part = parse_part_name(item.get("name") or "")
        if part is None:
            continue
        entry = groups.get(f"{part['base'].lower()}|{part['ext']}")
        if entry is None or entry["count"] < 2:
            continue
        item["part_of"] = {
            "base": entry["base"],
            "num": int(part["num"]),
            "count": entry["count"],
            "size": entry["size"],
        }


def parse_range(header: Optional[str], size: int) -> Optional[Tuple[int, int]]:
    """Return an inclusive (start, end) tuple, or None for an invalid range."""
    if not header or not header.strip():
        return None
    value = header.strip()
    if not value.lower().startswith("bytes="):
        return None
    spec = value[6:].split(",", 1)[0].strip()
    if "-" not in spec:
        return None
    start_text, end_text = spec.split("-", 1)
    try:
        if start_text == "":
            suffix = int(end_text)
            if suffix <= 0 or size <= 0:
                return None
            start = max(0, size - suffix)
            end = size - 1
        else:
            start = int(start_text)
            end = int(end_text) if end_text else size - 1
            if start < 0 or end < start or start >= max(size, 1):
                return None
            end = min(end, size - 1)
    except ValueError:
        return None
    return start, end


def _sniff_image(data: bytes) -> str:
    if data.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if data.startswith(b"GIF8"):
        return "image/gif"
    if len(data) > 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    return "image/jpeg"


def _content_disposition(name: str, download: bool) -> str:
    ascii_name = re.sub(r"[^A-Za-z0-9._ ()-]", "_", name or "file").strip() or "file"
    return (
        f"{'attachment' if download else 'inline'}; filename=\"{ascii_name}\";"
        f" filename*=UTF-8''{quote(name or 'file')}"
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    appconfig.ensure_dirs()
    state = app.state
    state.service = TelegramService()
    state.key = secrets.token_urlsafe(32)
    state.bot_db = appconfig.PROJECT_DIR / "data" / "files.db"
    state.last_activity = time.time()
    state.tasks: Set[asyncio.Task] = set()
    state.merge_jobs: Dict[str, Dict[str, Any]] = {}
    state.vault_restore: Dict[str, Any] = {}
    await state.service.start()
    info = state.service.status()
    if info["authorized"] and info.get("vault"):
        try:
            state.vault_restore = await vaultstore.restore(state.service)
            if state.vault_restore.get("restored"):
                log.info(
                    "Library restored from the vault (%s)",
                    state.vault_restore.get("stamp"),
                )
        except Exception:
            log.exception("Vault data restore failed; using the local library")
    # After restore: a PIN that arrived with the vault snapshot must lock the
    # app on this boot too.
    state.locked = applock.has_pin()
    state.catalog = Catalog(appconfig.LIBRARY_PATH)
    state.bot = botsup.Supervisor()
    state.bot.start_watching()
    info = state.service.status()
    if info["authorized"] and info.get("vault"):
        # Snapshot zips uploaded since the last sync are indexed on boot; hide
        # them right away instead of leaving them visible until the next sync.
        _spawn(state, _hide_snapshots_quietly(state))
    try:
        yield
    finally:
        for task in list(state.tasks):
            task.cancel()
        info = state.service.status()
        if info["authorized"] and info.get("vault"):
            try:
                await asyncio.wait_for(vaultstore.save(state.service), timeout=120.0)
            except Exception:
                log.exception("Vault data save on close failed")
        state.bot.shutdown()
        await state.service.close()


app = FastAPI(
    lifespan=lifespan,
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
    title="Telegram File Explorer",
)


@app.middleware("http")
async def guard(request: Request, call_next):
    if not _host_allowed(request.headers.get("host", "")):
        return JSONResponse({"detail": "Local access only."}, status_code=403)
    state = _state(request)
    is_api = request.url.path.startswith("/api/")
    if is_api:
        state.last_activity = time.time()
    if is_api and request.url.path != "/api/ping":
        if request.cookies.get(COOKIE) != state.key:
            blocked = JSONResponse(
                {"detail": "This window is not authenticated. Reload the app."},
                status_code=403,
            )
            _apply_cookie(blocked, state.key)
            return blocked
    if is_api and state.locked and request.url.path not in LOCK_OPEN_PATHS:
        blocked = JSONResponse({"detail": "The app is locked."}, status_code=423)
        _apply_cookie(blocked, state.key)
        return blocked
    if request.method in UNSAFE_METHODS:
        blocked = _mutation_guard(request)
        if blocked is not None:
            _apply_cookie(blocked, _state(request).key)
            return blocked
    response = await call_next(request)
    _apply_cookie(response, _state(request).key)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    response.headers.setdefault("X-Frame-Options", "SAMEORIGIN")
    content_type = response.headers.get("content-type", "")
    if content_type.startswith("text/html"):
        response.headers.setdefault("Content-Security-Policy", CSP)
        response.headers.setdefault("Cache-Control", "no-store")
    return response


def _apply_cookie(response: Response, key: str) -> None:
    if response.headers.get("set-cookie"):
        return
    response.set_cookie(
        COOKIE, key, httponly=True, samesite="strict", path="/", max_age=7 * 24 * 3600
    )


@app.exception_handler(TGError)
async def on_tg_error(request: Request, exc: TGError):
    return JSONResponse({"detail": str(exc)}, status_code=400)


@app.exception_handler(sqlite3.Error)
async def on_db_error(request: Request, exc: sqlite3.Error):
    log.exception("Database error on %s", request.url.path)
    return JSONResponse(
        {"detail": "The local library database could not be read. Close other copies and retry."},
        status_code=500,
    )


@app.exception_handler(Exception)
async def on_unhandled(request: Request, exc: Exception):
    log.exception("Unhandled error on %s", request.url.path)
    return JSONResponse(
        {"detail": "Something went wrong. See explorer.log for details."},
        status_code=500,
    )


# ------------------------------------------------------------------- UI files
@app.get("/", include_in_schema=False)
async def index():
    return FileResponse(UI_DIR / "index.html", media_type="text/html")


@app.get("/favicon.svg", include_in_schema=False)
async def favicon():
    return FileResponse(UI_DIR / "favicon.svg", media_type="image/svg+xml")


app.mount("/static", StaticFiles(directory=str(UI_DIR)), name="static")


# --------------------------------------------------------------------- status
@app.get("/api/ping")
async def ping():
    return {"app": "telegram-file-explorer", "version": "1.0"}


@app.get("/api/status")
async def status(request: Request):
    state = _state(request)
    payload = state.service.status()
    payload["split_max"] = SPLIT_HARD_CAP
    chat_id = _chat_id(state)
    payload["stats"] = state.catalog.stats(chat_id)
    payload["folder_count"] = len(state.catalog.folders(chat_id))
    payload["tag_count"] = len(state.catalog.tags(chat_id))
    payload["bot"] = state.bot.snapshot()
    payload["locked"] = state.locked
    payload["pin_set"] = applock.has_pin()
    payload["pin_skipped"] = applock.pin_skipped()
    return JSONResponse(payload, headers={"Cache-Control": "no-store"})


# ------------------------------------------------------------------ app lock
@app.post("/api/unlock")
async def unlock(body: PinBody, request: Request):
    state = _state(request)
    if not applock.has_pin():
        state.locked = False
        return {"unlocked": True}
    if not applock.verify(body.pin or ""):
        await asyncio.sleep(1.2)
        raise TGError("Wrong PIN.")
    state.locked = False
    return {"unlocked": True}


@app.post("/api/lock")
async def lock_now(request: Request):
    state = _state(request)
    if not applock.has_pin():
        raise TGError("Set a PIN first (Settings → Security).")
    state.locked = True
    return {"locked": True}


@app.post("/api/pin/set")
async def pin_set(body: PinBody, request: Request):
    state = _state(request)
    if state.locked:
        raise TGError("Unlock the app first.")
    try:
        applock.set_pin(body.pin or "")
    except ValueError as exc:
        raise TGError(str(exc))
    return {"pin_set": True}


@app.post("/api/pin/remove")
async def pin_remove(body: PinBody, request: Request):
    state = _state(request)
    if state.locked:
        raise TGError("Unlock the app first.")
    if applock.has_pin() and not applock.verify(body.pin or ""):
        await asyncio.sleep(1.2)
        raise TGError("Wrong PIN.")
    applock.clear_pin()
    state.locked = False
    return {"pin_set": False}


@app.post("/api/pin/skip")
async def pin_skip(request: Request):
    applock.mark_skipped()
    return {"skipped": True}


@app.post("/api/bot/start")
async def bot_start(request: Request):
    supervisor = _state(request).bot
    return JSONResponse({"bot": await run_in_threadpool(supervisor.turn_on)})


@app.post("/api/bot/stop")
async def bot_stop(request: Request):
    supervisor = _state(request).bot
    return JSONResponse({"bot": await run_in_threadpool(supervisor.turn_off)})


@app.get("/api/nav")
async def nav(request: Request):
    state = _state(request)
    chat_id = _chat_id(state)
    payload = {
        "folders": state.catalog.folders(chat_id),
        "tags": state.catalog.tags(chat_id)[:120],
        "kinds": state.catalog.kinds(chat_id),
        "stats": state.catalog.stats(chat_id),
        "vault": state.service.status().get("vault"),
    }
    return JSONResponse(payload, headers={"Cache-Control": "no-store"})


@app.post("/api/folders")
async def create_folder(body: FolderBody, request: Request):
    state = _state(request)
    try:
        name = await run_in_threadpool(state.catalog.create_folder, body.name)
        if body.icon is not None or body.note is not None:
            await run_in_threadpool(
                state.catalog.set_folder_meta, name, body.icon, body.note
            )
    except ValueError as exc:
        raise TGError(str(exc))
    chat_id = _chat_id(state)
    return {
        "folder": name,
        "info": state.catalog.folder_info(name, chat_id),
        "folders": state.catalog.folders(chat_id),
    }


@app.patch("/api/folders")
async def update_folder(body: FolderPatch, request: Request):
    state = _state(request)
    chat_id = _chat_id(state)
    name = body.name
    if body.new_name is not None and body.new_name.strip() and body.new_name != body.name:
        old = clean_folder_path(body.name, "")
        try:
            name = await run_in_threadpool(
                state.catalog.rename_folder, body.name, body.new_name
            )
        except ValueError as exc:
            raise TGError(str(exc))
        if chat_id is not None and state.service.is_bot_vault() and old:
            await run_in_threadpool(
                state.catalog.sync_folder_to_bot,
                state.bot_db,
                chat_id,
                old,
                name,
            )
    elif body.icon is None and body.note is None:
        raise TGError("Nothing to change.")
    if body.icon is not None or body.note is not None:
        try:
            await run_in_threadpool(
                state.catalog.set_folder_meta, name, body.icon, body.note
            )
        except ValueError as exc:
            raise TGError(str(exc))
    return {
        "folder": name,
        "info": state.catalog.folder_info(name, chat_id),
        "folders": state.catalog.folders(chat_id),
    }


@app.get("/api/folders/info")
async def folder_info(request: Request, name: str = Query(..., max_length=180)):
    state = _state(request)
    info = await run_in_threadpool(state.catalog.folder_info, name, _chat_id(state))
    if info is None:
        raise HTTPException(status_code=404, detail="Folder not found.")
    return info


@app.delete("/api/folders")
async def delete_folder(request: Request, name: str = Query(..., max_length=180)):
    state = _state(request)
    removed = await run_in_threadpool(state.catalog.delete_folder, name)
    if not removed:
        raise TGError("Only empty folders can be removed.")
    return {"deleted": True, "folders": state.catalog.folders(_chat_id(state))}


ZIP64_LIMIT = 0xFFFFFFFF


def _dos_stamp(value: Optional[str]) -> Tuple[int, int]:
    try:
        moment = datetime.fromisoformat((value or "").replace("Z", "+00:00"))
        if moment.tzinfo is not None:
            moment = moment.astimezone()
    except ValueError:
        moment = datetime.now()
    if moment.year < 1980:
        moment = datetime.now()
    dos_time = (moment.hour << 11) | (moment.minute << 5) | (moment.second // 2)
    dos_date = ((moment.year - 1980) << 9) | (moment.month << 5) | moment.day
    return dos_time, dos_date


def _zip_local_header(
    name: bytes, dos_time: int, dos_date: int, directory: bool, force_zip64: bool
) -> bytes:
    if directory:
        flags = 0x800
        version = 20
        extra = b""
    else:
        flags = 0x808
        version = 45 if force_zip64 else 20
        extra = struct.pack("<HHQQ", 0x0001, 16, 0, 0) if force_zip64 else b""
    return (
        struct.pack(
            "<IHHHHHIIIHH",
            0x04034B50,
            version,
            flags,
            0,
            dos_time,
            dos_date,
            0,
            0,
            0,
            len(name),
            len(extra),
        )
        + name
        + extra
    )


def _zip_central_header(
    name: bytes,
    dos_time: int,
    dos_date: int,
    crc: int,
    size: int,
    offset: int,
    directory: bool,
) -> bytes:
    flags = 0x800 if directory else 0x808
    external = ((0o40755 << 16) | 0x10) if directory else (0o100644 << 16)
    version = 20
    extra = b""
    size_field = size
    offset_field = offset
    if size >= ZIP64_LIMIT or offset >= ZIP64_LIMIT:
        version = 45
        values = b""
        if size >= ZIP64_LIMIT:
            values += struct.pack("<QQ", size, size)
            size_field = ZIP64_LIMIT
        if offset >= ZIP64_LIMIT:
            values += struct.pack("<Q", offset)
            offset_field = ZIP64_LIMIT
        extra = struct.pack("<HH", 0x0001, len(values)) + values
    return (
        struct.pack(
            "<IHHHHHHIIIHHHHHII",
            0x02014B50,
            version,
            version,
            flags,
            0,
            dos_time,
            dos_date,
            crc,
            size_field,
            size_field,
            len(name),
            len(extra),
            0,
            0,
            0,
            external,
            offset_field,
        )
        + name
        + extra
    )


def _zip_end(
    entries: List[Tuple[bytes, int, int, int, int, int, bool]], cd_offset: int
) -> bytes:
    directory = b"".join(
        _zip_central_header(name, dos_time, dos_date, crc, size, offset, is_dir)
        for name, dos_time, dos_date, crc, size, offset, is_dir in entries
    )
    count = len(entries)
    size = len(directory)
    if count >= 0xFFFF or size >= ZIP64_LIMIT or cd_offset >= ZIP64_LIMIT:
        eocd64 = struct.pack(
            "<IQHHIIQQQQ",
            0x06064B50,
            44,
            45,
            45,
            0,
            0,
            count,
            count,
            size,
            cd_offset,
        )
        locator = struct.pack("<IIQI", 0x07064B50, 0, cd_offset + size, 1)
        return (
            directory
            + eocd64
            + locator
            + struct.pack(
                "<IHHHHIIH",
                0x06054B50,
                0,
                0,
                0xFFFF,
                0xFFFF,
                ZIP64_LIMIT,
                ZIP64_LIMIT,
                0,
            )
        )
    return directory + struct.pack(
        "<IHHHHIIH", 0x06054B50, 0, 0, count, count, size, cd_offset, 0
    )


async def _zip_stream(
    state: Any,
    root_label: str,
    dir_names: List[str],
    items: List[Dict[str, Any]],
) -> AsyncIterator[bytes]:
    root = clean_name(root_label, "Folder")
    central: List[Tuple[bytes, int, int, int, int, int, bool]] = []
    used: Set[str] = set()
    offset = 0

    def unique(candidate: str, directory: bool) -> str:
        base, ext = os.path.splitext(candidate.rstrip("/"))
        attempt = candidate
        index = 2
        while attempt.lower() in used:
            attempt = f"{base} ({index}){ext}" + ("/" if directory else "")
            index += 1
        used.add(attempt.lower())
        return attempt

    stamp = _dos_stamp(None)
    folder_paths = [f"{root}/"]
    for rel in dir_names:
        if rel:
            folder_paths.append(f"{root}/{rel.strip('/')}/")
    for raw_path in folder_paths:
        arcname = unique(raw_path, True)
        raw = arcname.encode("utf-8")
        header = _zip_local_header(raw, stamp[0], stamp[1], True, False)
        central.append((raw, stamp[0], stamp[1], 0, 0, offset, True))
        offset += len(header)
        yield header

    for item in items:
        folder = item.get("folder") or ""
        if folder.lower() == root_label.lower():
            rel_folder = ""
        elif folder.lower().startswith(root_label.lower() + "/"):
            rel_folder = folder[len(root_label) + 1 :]
        else:
            rel_folder = ""
        candidate = (
            f"{root}/{rel_folder}/{item.get('name') or 'file'}"
            if rel_folder
            else f"{root}/{item.get('name') or 'file'}"
        )
        try:
            message, size, _mime = await state.service.media_info(item)
        except Exception as exc:
            log.warning("Skipping %s in folder archive: %s", item.get("id"), exc)
            continue
        force_zip64 = size >= ZIP64_LIMIT
        arcname = unique(candidate, False)
        raw = arcname.encode("utf-8")
        dos_time, dos_date = _dos_stamp(item.get("tg_date"))
        header = _zip_local_header(raw, dos_time, dos_date, False, force_zip64)
        header_offset = offset
        yield header
        offset += len(header)
        crc = 0
        written = 0
        async for chunk in state.service.stream_chunks(message, 0, size):
            if not chunk:
                continue
            crc = zlib.crc32(chunk, crc)
            written += len(chunk)
            yield chunk
        if force_zip64:
            descriptor = struct.pack(
                "<IIQQ", 0x08074B50, crc & ZIP64_LIMIT, written, written
            )
        else:
            descriptor = struct.pack(
                "<IIII", 0x08074B50, crc & ZIP64_LIMIT, written, written
            )
        yield descriptor
        offset += written + len(descriptor)
        central.append(
            (
                raw,
                dos_time,
                dos_date,
                crc & ZIP64_LIMIT,
                written,
                header_offset,
                False,
            )
        )
    yield _zip_end(central, offset)


@app.get("/api/folders/download")
async def download_folder(request: Request, name: str = Query(..., max_length=180)):
    state = _state(request)
    folder = clean_folder_path(name, "")
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found.")
    chat_id = _chat_id(state)
    info = await run_in_threadpool(state.catalog.folder_info, folder, chat_id)
    if info is None:
        raise HTTPException(status_code=404, detail="Folder not found.")
    items = await run_in_threadpool(state.catalog.folder_items, folder, chat_id)
    all_folders = await run_in_threadpool(state.catalog.folders, chat_id)
    lower = folder.lower()
    dir_names = [
        entry["folder"][len(folder) + 1 :]
        for entry in all_folders
        if entry["folder"].lower().startswith(lower + "/")
    ]
    zip_name = f"{folder_leaf(folder)}.zip"
    return StreamingResponse(
        _zip_stream(state, folder_leaf(folder), dir_names, items),
        media_type="application/zip",
        headers={
            "Content-Disposition": _content_disposition(zip_name, True),
            "Cache-Control": "no-store",
        },
    )


# ---------------------------------------------------------------------- login
@app.post("/api/setup")
async def setup(body: SetupBody, request: Request):
    state = _state(request)
    await state.service.configure(body.api_id, body.api_hash, body.vault)
    return state.service.status()


@app.post("/api/login/qr/start")
async def login_qr_start(request: Request):
    state = _state(request)
    return await state.service.start_qr()


@app.get("/api/login/qr")
async def login_qr_state(request: Request):
    state = _state(request)
    return state.service.qr_payload()


@app.post("/api/login/qr/cancel")
async def login_qr_cancel(request: Request):
    state = _state(request)
    return await state.service.cancel_qr()


@app.post("/api/vault")
async def set_vault(body: VaultBody, request: Request):
    state = _state(request)
    if not body.vault.strip():
        raise TGError("Choose a channel first.")
    await state.service.set_vault(body.vault)
    return state.service.status()


@app.get("/api/channels")
async def channels(request: Request, q: str = Query("", max_length=100)):
    state = _state(request)
    return {"channels": await state.service.list_channels(q)}


@app.post("/api/login/send_code")
async def login_send_code(body: PhoneBody, request: Request):
    state = _state(request)
    return await state.service.send_code(body.phone)


@app.post("/api/login/code")
async def login_code(body: CodeBody, request: Request):
    state = _state(request)
    return await state.service.verify_code(body.code)


@app.post("/api/login/password")
async def login_password(body: PasswordBody, request: Request):
    state = _state(request)
    return await state.service.verify_password(body.password)


@app.post("/api/logout")
async def logout(request: Request):
    state = _state(request)
    return await state.service.logout()


@app.post("/api/reconnect")
async def reconnect(request: Request):
    state = _state(request)
    return await state.service.reconnect()


@app.post("/api/quit")
async def quit_app():
    QUIT.set()
    return {"quitting": True}


# ----------------------------------------------------------------------- sync
@app.post("/api/sync")
async def sync_now(request: Request):
    state = _state(request)
    info = state.service.status()
    if info["sync"].get("running"):
        return {"started": False, "sync": info["sync"]}
    if not info["authorized"]:
        raise TGError("Log in first.")
    if not info["vault"]:
        raise TGError("Choose your channel first.")
    _spawn(state, _sync_and_snapshot(state))
    await asyncio.sleep(0)
    return {"started": True, "sync": state.service.sync_state}


async def _sync_and_snapshot(state) -> None:
    await state.service.sync(state.catalog, state.bot_db)
    info = state.service.status()
    if not (info["authorized"] and info.get("vault")):
        return
    try:
        await vaultstore.save(state.service)
    except Exception:
        log.exception("Vault data save after sync failed")
        return
    try:
        await _hide_snapshots(state)
    except Exception:
        log.exception("Could not hide vault data snapshots")


async def _hide_snapshots(state) -> None:
    result = await run_in_threadpool(
        state.catalog.list,
        q=vaultstore.PREFIX,
        limit=50,
        chat_id=_chat_id(state),
    )
    for item in result.get("items", []):
        await run_in_threadpool(state.catalog.hide, item["id"])


async def _hide_snapshots_quietly(state) -> None:
    try:
        await _hide_snapshots(state)
    except Exception:
        log.exception("Could not hide vault data snapshots at startup")


@app.get("/api/sync")
async def sync_status(request: Request):
    return {"sync": _state(request).service.sync_state}


# ---------------------------------------------------------------------- items
@app.get("/api/items")
async def items(
    request: Request,
    q: str = Query("", max_length=200),
    kind: str = Query("", max_length=30),
    folder: str = Query("", max_length=180),
    tag: str = Query("", max_length=80),
    favorite: bool = False,
    hidden: bool = False,
    recursive: bool = False,
    note: bool = False,
    min_size: Optional[int] = Query(None, ge=0),
    max_size: Optional[int] = Query(None, ge=0),
    after: str = Query("", max_length=10),
    before: str = Query("", max_length=10),
    sort: str = Query("date", max_length=20),
    direction: str = Query("desc", max_length=4),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    state = _state(request)
    for value in (after, before):
        if value and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
            raise TGError("Dates must use the YYYY-MM-DD format.")
    if min_size is not None and max_size is not None and min_size > max_size:
        raise TGError("The minimum size is larger than the maximum size.")
    result = await run_in_threadpool(
        state.catalog.list,
        q=q,
        kind=kind,
        folder=folder,
        tag=tag,
        favorite=favorite,
        sort=sort,
        direction=direction,
        limit=limit,
        offset=offset,
        hidden_only=hidden,
        chat_id=_chat_id(state),
        min_size=min_size,
        max_size=max_size,
        after=after,
        before=before,
        has_note=note,
        recursive=recursive,
    )
    vault = _vault(state.service.status())
    result["items"] = [public_item(item, vault) for item in result["items"]]
    _attach_part_info(state, result["items"])
    return JSONResponse(result, headers={"Cache-Control": "no-store"})


@app.get("/api/items/{item_id}")
async def get_item(item_id: int, request: Request):
    state = _state(request)
    item = await _scoped_item(state, item_id)
    public = public_item(item, _vault(state.service.status()))
    _attach_part_info(state, [public])
    return public


@app.patch("/api/items/{item_id}")
async def patch_item(item_id: int, body: ItemPatch, request: Request):
    state = _state(request)
    item = await _scoped_item(state, item_id)
    warning: Optional[str] = None
    if body.name is not None:
        name = clean_name(body.name, "")
        if not name:
            raise TGError("A file name cannot be empty.")
        item = await run_in_threadpool(state.catalog.rename, item_id, name)
        if item is None:
            raise HTTPException(status_code=404, detail="File not found.")
        if state.service.is_bot_vault():
            Catalog.sync_to_bot(state.bot_db, item["message_id"], name=item["name"])
        try:
            await state.service.edit_caption(item["message_id"], item["name"])
        except TGError as exc:
            warning = (
                "Renamed in the explorer, but the Telegram caption could not be "
                f"updated: {exc}"
            )
    if body.folder is not None:
        folder = clean_folder_path(body.folder, "")
        if not folder:
            raise TGError("Choose or type a folder name.")
        item = await run_in_threadpool(state.catalog.move, item_id, folder)
        if item is not None and state.service.is_bot_vault():
            Catalog.sync_to_bot(
                state.bot_db, item["message_id"], category=folder.lower()
            )
    if body.tags is not None:
        item = await run_in_threadpool(state.catalog.set_tags, item_id, body.tags)
        if item is not None and state.service.is_bot_vault():
            Catalog.sync_to_bot(state.bot_db, item["message_id"], tags=item["tags"])
    if body.favorite is not None:
        item = await run_in_threadpool(
            state.catalog.set_favorite, item_id, body.favorite
        )
        if item is not None and state.service.is_bot_vault():
            Catalog.sync_to_bot(
                state.bot_db, item["message_id"], favorite=1 if body.favorite else 0
            )
    if body.hidden is not None:
        item = await run_in_threadpool(
            state.catalog.update, item_id, hidden=1 if body.hidden else 0
        )
    if body.note is not None:
        item = await run_in_threadpool(state.catalog.set_note, item_id, body.note)
    if item is None:
        raise HTTPException(status_code=404, detail="File not found.")
    return {
        "item": public_item(item, _vault(state.service.status())),
        "warning": warning,
    }


@app.delete("/api/items/{item_id}")
async def delete_item(item_id: int, request: Request, remote: bool = False):
    state = _state(request)
    item = await _scoped_item(state, item_id)
    if remote:
        await state.service.delete_message(item["message_id"])
        await run_in_threadpool(state.catalog.delete, item_id)
        if state.service.is_bot_vault():
            Catalog.clear_bot_vault(state.bot_db, item["message_id"])
        return {"deleted": True, "remote": True, "item_id": item_id}
    await run_in_threadpool(state.catalog.hide, item_id)
    return {"deleted": True, "remote": False, "item_id": item_id}


BATCH_LIMIT = 300


def _parse_id_query(ids: str) -> List[int]:
    values: List[int] = []
    for part in re.split(r"[^0-9]+", ids or ""):
        if part:
            values.append(int(part))
    return list(dict.fromkeys(values))


def _collect_batch_items(
    state: Any, item_ids: List[int]
) -> List[Dict[str, Any]]:
    ids = list(dict.fromkeys(int(value) for value in item_ids))[:BATCH_LIMIT]
    if not ids:
        raise TGError("Select at least one file.")
    chat_id = _chat_id(state)
    found: List[Dict[str, Any]] = []
    for item_id in ids:
        item = state.catalog.get(item_id)
        if item is None or chat_id is None or int(item.get("chat_id")) != int(chat_id):
            raise HTTPException(status_code=404, detail="File not found in this channel.")
        found.append(item)
    return found


async def _batch_items(state: Any, item_ids: List[int]) -> List[Dict[str, Any]]:
    return await run_in_threadpool(_collect_batch_items, state, item_ids)


@app.post("/api/batch/delete")
async def batch_delete(body: BatchDeleteBody, request: Request):
    state = _state(request)
    items = await _batch_items(state, body.item_ids)
    removed = 0
    if body.remote:
        for item in items:
            await state.service.delete_message(item["message_id"])
            await run_in_threadpool(state.catalog.delete, item["id"])
            if state.service.is_bot_vault():
                Catalog.clear_bot_vault(state.bot_db, item["message_id"])
            removed += 1
    else:
        for item in items:
            await run_in_threadpool(state.catalog.hide, item["id"])
            removed += 1
    return {"deleted": removed, "remote": body.remote}


@app.post("/api/batch/favorite")
async def batch_favorite(body: BatchFavoriteBody, request: Request):
    state = _state(request)
    items = await _batch_items(state, body.item_ids)

    def apply() -> int:
        count = 0
        for item in items:
            updated = state.catalog.set_favorite(item["id"], body.favorite)
            if updated is not None:
                count += 1
                if state.service.is_bot_vault():
                    Catalog.sync_to_bot(
                        state.bot_db,
                        updated["message_id"],
                        favorite=1 if body.favorite else 0,
                    )
        return count

    return {"updated": await run_in_threadpool(apply), "favorite": body.favorite}


@app.post("/api/batch/move")
async def batch_move(body: BatchMoveBody, request: Request):
    state = _state(request)
    folder = clean_folder_path(body.folder, "")
    if not folder:
        raise TGError("Choose or type a folder name.")
    items = await _batch_items(state, body.item_ids)

    def apply() -> int:
        count = 0
        for item in items:
            updated = state.catalog.move(item["id"], folder)
            if updated is not None:
                count += 1
                if state.service.is_bot_vault():
                    Catalog.sync_to_bot(
                        state.bot_db, updated["message_id"], category=folder.lower()
                    )
        return count

    return {"moved": await run_in_threadpool(apply), "folder": folder}


@app.get("/api/batch/info")
async def batch_info(request: Request, ids: str = Query("", max_length=4000)):
    state = _state(request)
    items = await _batch_items(state, _parse_id_query(ids))
    vault = _vault(state.service.status())
    return {"items": [public_item(item, vault) for item in items]}


@app.get("/api/batch/download")
async def batch_download(request: Request, ids: str = Query("", max_length=4000)):
    state = _state(request)
    items = await _batch_items(state, _parse_id_query(ids))
    zip_name = "Selected files.zip"
    return StreamingResponse(
        _zip_stream(state, "Selected files", [], items),
        media_type="application/zip",
        headers={
            "Content-Disposition": _content_disposition(zip_name, True),
            "Cache-Control": "no-store",
        },
    )


# -------------------------------------------------------------------- uploads
@app.post("/api/upload")
async def upload(
    request: Request,
    files: List[UploadFile] = File(...),
    folder: str = Form(""),
    paths: str = Form("[]"),
):
    state = _state(request)
    info = state.service.status()
    if not info["authorized"] or not info["vault"]:
        raise TGError("Log in and choose your channel before uploading.")
    if not files:
        raise TGError("Choose at least one file.")
    max_upload = int(info.get("max_upload") or MAX_UPLOAD)
    try:
        requested = json.loads(paths) if paths else []
    except json.JSONDecodeError:
        requested = []
    if not isinstance(requested, list):
        requested = []
    base_folder = clean_folder_path(folder, "")
    batch = uuid.uuid4().hex
    batch_dir = appconfig.CACHE_DIR / "uploads" / batch
    entries: List[Dict[str, Any]] = []
    try:
        for index, upload_file in enumerate(files):
            raw = requested[index] if index < len(requested) else upload_file.filename
            parts = [
                part
                for part in str(raw or "").replace("\\", "/").split("/")
                if part not in {"", ".", ".."}
            ]
            name = clean_name(
                parts[-1] if parts else (upload_file.filename or f"File {index + 1}")
            )
            rel_dir = clean_folder_path("/".join(parts[:-1]), "")
            target_folder = join_folder(base_folder, rel_dir) if rel_dir else base_folder
            target_dir = batch_dir / str(index)
            target_dir.mkdir(parents=True, exist_ok=True)
            target = target_dir / name
            total = 0
            try:
                with target.open("wb") as handle:
                    while True:
                        chunk = await upload_file.read(4 * 1024 * 1024)
                        if not chunk:
                            break
                        total += len(chunk)
                        if total > SPLIT_HARD_CAP:
                            raise HTTPException(
                                status_code=413,
                                detail=(
                                    f"{name} is larger than the "
                                    f"{SPLIT_HARD_CAP // (1024 ** 3)} GB limit this "
                                    "app can split into parts."
                                ),
                            )
                        handle.write(chunk)
            finally:
                await upload_file.close()
            if total == 0:
                raise HTTPException(status_code=400, detail=f"{name} is empty.")
            label = join_folder(rel_dir, name) or name
            transfer_id = state.service.new_transfer(label, total)
            entries.append(
                {
                    "path": str(target),
                    "name": name,
                    "folder": target_folder,
                    "transfer_id": transfer_id,
                    "split": total > PART_SIZE,
                }
            )
    except Exception:
        for entry in entries:
            state.service.transfers.pop(entry["transfer_id"], None)
        await run_in_threadpool(shutil.rmtree, batch_dir, True)
        raise
    if not entries:
        raise TGError("No files were received.")
    _spawn(state, _run_uploads(state, entries))
    return {
        "transfers": [state.service.transfers[entry["transfer_id"]] for entry in entries]
    }


async def _run_uploads(state: Any, entries: List[Dict[str, Any]]) -> None:
    for entry in entries:
        transfer = state.service.transfers.get(entry["transfer_id"])
        original = Path(entry["path"])
        try:
            if entry.get("split"):
                if transfer is not None:
                    transfer.update(state="splitting", sent=0)
                workdir = appconfig.CACHE_DIR / "uploads" / f"split-{uuid.uuid4().hex}"
                try:
                    volumes = await run_in_threadpool(
                        split_file, original, workdir, PART_SIZE
                    )
                except Exception as exc:
                    shutil.rmtree(workdir, ignore_errors=True)
                    detail = str(exc) or "The file could not be split into parts."
                    raise HTTPException(status_code=500, detail=detail)
                if transfer is not None:
                    transfer["parts"] = len(volumes)
                try:
                    original.unlink(missing_ok=True)
                except OSError:
                    pass
                sent_base = 0
                last_index = len(volumes) - 1
                for index, volume in enumerate(volumes):
                    part_entry = {
                        **entry,
                        "path": str(volume),
                        "name": volume.name,
                        "sent_base": sent_base,
                        "shared": True,
                        "last": index == last_index,
                    }
                    sent_base += volume.stat().st_size
                    await state.service.upload_one(part_entry, state.catalog)
                shutil.rmtree(workdir, ignore_errors=True)
            else:
                await state.service.upload_one(entry, state.catalog)
        except Exception as exc:
            message = friendly_error(exc) if not isinstance(exc, HTTPException) else exc.detail
            if transfer is not None:
                transfer.update(state="error", error=message)
            log.warning("Upload failed for %s: %s", entry["name"], message)
        finally:
            path = original
            try:
                path.unlink(missing_ok=True)
                if path.parent.is_dir() and not any(path.parent.iterdir()):
                    path.parent.rmdir()
                    if path.parent.parent.is_dir() and not any(path.parent.parent.iterdir()):
                        path.parent.parent.rmdir()
            except OSError:
                pass


@app.get("/api/transfers")
async def transfers(request: Request):
    state = _state(request)
    return {"transfers": list(state.service.transfers.values())[-80:]}


# ------------------------------------------------------------------ merge
@app.post("/api/merge")
async def start_merge(body: MergeBody, request: Request):
    state = _state(request)
    item = await _scoped_item(state, body.item_id)
    part = parse_part_name(item.get("name") or "")
    if part is None:
        raise TGError("This file is not a split archive part.")
    groups = _part_groups(state)
    entry = groups.get(f"{part['base'].lower()}|{part['ext']}")
    if entry is None or entry["count"] < 2:
        raise TGError(
            "No other parts of this file are in the library, so it cannot be "
            "joined into the complete file."
        )
    nums = sorted(entry["nums"])
    missing = [n for n in range(1, (nums[-1] if nums else 1) + 1) if n not in entry["nums"]]
    if missing:
        listed = ", ".join(f".{n:03d}" for n in missing[:8])
        raise TGError(
            f"Parts {listed} are missing from the library. "
            "Upload or unhide them before downloading the complete file."
        )
    ordered_items = []
    total_size = 0
    for number in range(1, len(nums) + 1):
        row = state.catalog.get(entry["nums"][number])
        if row is None:
            raise TGError("A part went missing from the library. Sync and retry.")
        ordered_items.append(row)
        total_size += int(row.get("size") or 0)
    job_id = uuid.uuid4().hex[:16]
    transfer_id = state.service.new_transfer(entry["base"], total_size)
    transfer = state.service.transfers[transfer_id]
    transfer["state"] = "downloading"
    transfer["parts"] = len(ordered_items)
    job = {
        "id": job_id,
        "transfer_id": transfer_id,
        "items": ordered_items,
        "dir": appconfig.CACHE_DIR / "merge" / job_id,
        "name": entry["base"],
    }
    state.merge_jobs[job_id] = job
    _spawn(state, _run_merge(state, job))
    return {"transfer": transfer, "job": job_id}


async def _run_merge(state: Any, job: Dict[str, Any]) -> None:
    transfer = state.service.transfers.get(job["transfer_id"])
    parts_dir = job["dir"] / "parts"
    try:
        parts_dir.mkdir(parents=True, exist_ok=True)
        downloaded: List[Path] = []
        for index, part_item in enumerate(job["items"], start=1):
            if transfer is not None:
                transfer["state"] = "downloading"
            message, size, _mime = await state.service.media_info(part_item)
            target = parts_dir / clean_name(
                part_item.get("name") or f"part-{index:03d}"
            )
            with target.open("wb") as handle:
                async for chunk in state.service.stream_chunks(message, 0, size):
                    if QUIT.is_set():
                        raise TGError("The app is shutting down.")
                    handle.write(chunk)
                    if transfer is not None:
                        transfer["sent"] = int(transfer.get("sent") or 0) + len(chunk)
            downloaded.append(target)
        if transfer is not None:
            transfer["state"] = "merging"
        final, final_name = await run_in_threadpool(merge_parts, downloaded, job["dir"])
        job["path"] = str(final)
        job["name"] = final_name
        if transfer is not None:
            transfer.update(
                state="ready",
                sent=transfer["size"],
                result_url=f"/api/merged/{job['id']}",
                result_name=final_name,
                error=None,
            )
    except Exception as exc:
        if isinstance(exc, HTTPException):
            message = str(exc.detail)
        elif isinstance(exc, TGError):
            message = str(exc)
        else:
            message = friendly_error(exc)
        if transfer is not None:
            transfer.update(state="error", error=message)
        log.warning("Merge failed for %s: %s", job.get("name"), message)
        state.merge_jobs.pop(job["id"], None)
        shutil.rmtree(job["dir"], ignore_errors=True)


@app.get("/api/merged/{job_id}")
async def merged_download(job_id: str, request: Request):
    state = _state(request)
    job = state.merge_jobs.get(job_id)
    if job is None or not job.get("path"):
        raise HTTPException(
            status_code=404, detail="No merged file is ready for that request."
        )
    path = Path(job["path"])
    if not path.exists():
        raise HTTPException(
            status_code=410,
            detail="The merged file is no longer on this PC. Join the parts again.",
        )
    return FileResponse(
        path,
        media_type="application/octet-stream",
        filename=job.get("name") or path.name,
        headers={"Cache-Control": "no-store"},
    )


# --------------------------------------------------------------------- thumbs
@app.get("/api/thumb/{item_id}")
async def thumb(item_id: int, request: Request):
    state = _state(request)
    item = await _scoped_item(state, item_id)
    cache = appconfig.THUMB_DIR / f"{item_id}.thumb"
    if cache.exists():
        data = await run_in_threadpool(cache.read_bytes)
        media_type = _sniff_image(data)
        return Response(
            content=data,
            media_type=media_type,
            headers={"Cache-Control": "private, max-age=86400"},
        )
    if not item.get("has_thumb"):
        raise HTTPException(status_code=404, detail="No thumbnail.")
    try:
        result = await state.service.thumbnail(item)
    except TGError:
        result = None
    if not result:
        raise HTTPException(status_code=404, detail="No thumbnail.")
    data, media_type = result
    appconfig.THUMB_DIR.mkdir(parents=True, exist_ok=True)
    tmp = cache.with_suffix(".tmp")
    await run_in_threadpool(tmp.write_bytes, data)
    os.replace(tmp, cache)
    return Response(
        content=data,
        media_type=media_type,
        headers={"Cache-Control": "private, max-age=86400"},
    )


# -------------------------------------------------------------------- streams
@app.get("/api/stream/{item_id}")
async def stream(item_id: int, request: Request):
    return await _serve_media(request, item_id, download=False)


@app.head("/api/stream/{item_id}")
async def stream_head(item_id: int, request: Request):
    return await _serve_media(request, item_id, download=False)


@app.get("/api/download/{item_id}")
async def download(item_id: int, request: Request):
    return await _serve_media(request, item_id, download=True)


@app.head("/api/download/{item_id}")
async def download_head(item_id: int, request: Request):
    return await _serve_media(request, item_id, download=True)


# Video previews only need the beginning of a file; without a cap Chromium's
# open-ended "bytes=0-" request makes the server relay the whole video.
INLINE_STREAM_WINDOW = 8 * 1024 * 1024


async def _serve_media(request: Request, item_id: int, download: bool) -> Response:
    state = _state(request)
    item = await _scoped_item(state, item_id)
    message, size, mime = await state.service.media_info(item)
    name = item.get("name") or "file"
    headers = {
        "Accept-Ranges": "bytes",
        "Content-Disposition": _content_disposition(name, download),
        "Cache-Control": "private, max-age=3600",
        "ETag": f'W/"{item["message_id"]}-{size}"',
    }
    range_header = request.headers.get("range")
    if range_header:
        parsed = parse_range(range_header, size)
        if parsed is None:
            headers["Content-Range"] = f"bytes */{size}"
            return Response(status_code=416, headers=headers)
        start, end = parsed
        if not download:
            end = min(end, start + INLINE_STREAM_WINDOW - 1)
        length = end - start + 1
        headers["Content-Range"] = f"bytes {start}-{end}/{size}"
        headers["Content-Length"] = str(length)
        status_code = 206
    elif not download and size > INLINE_STREAM_WINDOW:
        start, length = 0, INLINE_STREAM_WINDOW
        headers["Content-Range"] = f"bytes 0-{INLINE_STREAM_WINDOW - 1}/{size}"
        headers["Content-Length"] = str(length)
        status_code = 206
    else:
        start, length = 0, size
        headers["Content-Length"] = str(size)
        status_code = 200
    if request.method == "HEAD":
        return Response(status_code=status_code, headers=headers, media_type=mime)

    async def body() -> AsyncIterator[bytes]:
        async for chunk in state.service.stream_chunks(message, start, length):
            if QUIT.is_set():
                return
            yield chunk

    return StreamingResponse(
        body(), status_code=status_code, headers=headers, media_type=mime
    )
