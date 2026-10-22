"""Telegram (MTProto) backend for the desktop explorer.

Uses a user account session instead of the Bot API so the app can show
thumbnails, stream any size and upload up to 2 GB.
"""

from __future__ import annotations

import asyncio
import contextlib
import io
import mimetypes
import os
import shutil
import time
from datetime import datetime
from pathlib import Path
from typing import Any, AsyncIterator, Dict, List, Optional, Set, Tuple

import segno
from telethon import TelegramClient, errors, types, utils
from telethon.tl.types import (
    DocumentAttributeAnimated,
    DocumentAttributeAudio,
    DocumentAttributeFilename,
    DocumentAttributeSticker,
    DocumentAttributeVideo,
    PeerChannel,
)

from . import appconfig
from .catalog import Catalog, clean_folder_path, clean_name, default_folder

APP_VERSION = "1.0"
MAX_UPLOAD = 2 * 1024 * 1024 * 1024
PREMIUM_MAX_UPLOAD = 4 * 1024 * 1024 * 1024
# Largest single Telegram upload that actually succeeds: the server allows
# at most 4000 upload parts of 512 KiB per file, so an exactly-2-GiB volume
# (4096 parts) is rejected with FilePartsInvalidError. Split parts must stay
# at or below this size.
PART_SIZE = 2000 * 1024 * 1024

# Telegram Desktop's published app credentials. They let the first sign-in
# start without a my.telegram.org app; custom credentials always take priority.
BUILTIN_API_ID = 2040
BUILTIN_API_HASH = "b18441a1ff607e10a989891a5462e627"

_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "audio/mpeg": ".mp3",
    "audio/ogg": ".ogg",
    "audio/mp4": ".m4a",
}

_LABELS = {
    "image": "Photo",
    "video": "Video",
    "audio": "Audio",
    "voice": "Voice note",
    "document": "File",
    "sticker": "Sticker",
    "gif": "Animation",
    "other": "File",
}


class TGError(Exception):
    """An error that is safe and useful to show in the UI."""


class TransferCancelled(TGError):
    """Raised inside a transfer when the user cancels it."""


def friendly_error(exc: Exception) -> str:
    if isinstance(exc, TGError):
        return str(exc)
    if isinstance(exc, errors.FloodWaitError):
        return f"Telegram asked us to wait {exc.seconds} seconds. Try again later."
    if isinstance(exc, errors.SessionPasswordNeededError):
        return "Two-step verification is enabled on this account."
    if isinstance(exc, errors.PasswordHashInvalidError):
        return "That two-step verification password is not correct."
    if isinstance(exc, errors.PhoneCodeInvalidError):
        return "That login code is not correct."
    if isinstance(exc, errors.PhoneCodeExpiredError):
        return "That login code expired. Request a new one."
    if isinstance(exc, errors.PhoneCodeEmptyError):
        return "Enter the code Telegram sent you."
    if isinstance(exc, errors.PhoneNumberInvalidError):
        return "That phone number is not valid. Include the country code, e.g. +91…"
    if isinstance(exc, errors.PhoneNumberBannedError):
        return "This phone number is banned from Telegram."
    if isinstance(exc, errors.ApiIdInvalidError):
        return "That API ID and API hash do not match. Copy them from my.telegram.org."
    if isinstance(exc, errors.ApiIdPublishedFloodError):
        return (
            "Telegram flagged the app credentials. Try QR sign-in; if that also "
            "fails, add your own API ID and hash from my.telegram.org (the site "
            "may need a different network or a later retry)."
        )
    if isinstance(exc, errors.AuthKeyUnregisteredError):
        return "The saved login was revoked. Log in again."
    if isinstance(exc, errors.ChannelPrivateError):
        return "That channel is private or this account is not a member."
    if isinstance(exc, (errors.UsernameNotOccupiedError, errors.UsernameInvalidError)):
        return "That channel username was not found."
    if isinstance(exc, errors.ChatAdminRequiredError):
        return "This account needs admin rights in the channel to do that."
    if isinstance(exc, errors.MessageDeleteForbiddenError):
        return "Telegram did not allow deleting this message."
    if isinstance(exc, (ConnectionError, asyncio.TimeoutError)):
        return "Could not reach Telegram. Check the internet connection and retry."
    name = type(exc).__name__
    text = str(exc).strip()
    lowered = text.lower()
    if "file_too_large" in lowered or "too large" in lowered:
        return "Telegram rejected the file because it is too large for this account."
    return f"Telegram error ({name}){': ' + text if text and len(text) < 200 else ''}"


def _attr(attributes: Any, cls: Any) -> Optional[Any]:
    for attribute in attributes or ():
        if isinstance(attribute, cls):
            return attribute
    return None


def _photo_size(photo: Any) -> int:
    best = 0
    for size in getattr(photo, "sizes", None) or ():
        value = getattr(size, "size", None)
        if isinstance(value, int):
            best = max(best, value)
        for part in getattr(size, "sizes", None) or ():
            if isinstance(part, int):
                best = max(best, part)
    return best


def _dimensions(photo: Any) -> Tuple[Optional[int], Optional[int]]:
    best = None
    for size in getattr(photo, "sizes", None) or ():
        width = getattr(size, "w", None)
        height = getattr(size, "h", None)
        if width and height and (best is None or width * height > best[0] * best[1]):
            best = (width, height)
    return best if best else (None, None)


class TelegramService:
    def __init__(self) -> None:
        self.client: Optional[TelegramClient] = None
        self._settings = appconfig.load_settings()
        self._state = "setup"
        self._authorized = False
        self._user: Optional[Dict[str, Any]] = None
        self._entity: Any = None
        self._vault: Optional[Dict[str, Any]] = None
        self._last_error: Optional[str] = None
        self._phone: Optional[str] = None
        self._code_hash: Optional[str] = None
        self._qr_task: Optional[asyncio.Task] = None
        self._qr_url: Optional[str] = None
        self._qr_svg: Optional[str] = None
        self._qr_expires: Optional[int] = None
        self._qr_version = 0
        self._qr_error: Optional[str] = None
        self._lock = asyncio.Lock()
        self.sync_state: Dict[str, Any] = {
            "running": False,
            "scanned": 0,
            "total": 0,
            "stored": 0,
            "imported": 0,
            "error": None,
            "started": None,
            "finished": None,
        }
        self.transfers: Dict[str, Dict[str, Any]] = {}
        self.cancelled_clients: Set[str] = set()
        self._thumb_locks: Dict[int, asyncio.Lock] = {}
        self._thumb_sem: Optional[asyncio.Semaphore] = None
        self._message_cache: Dict[int, Tuple[float, Any]] = {}

    # ------------------------------------------------------------------ state
    def status(self) -> Dict[str, Any]:
        return {
            "app": "telegram-file-explorer",
            "version": APP_VERSION,
            "state": self._state,
            "authorized": self._authorized,
            "user": self._user,
            "max_upload": PREMIUM_MAX_UPLOAD if (self._user or {}).get("premium") else MAX_UPLOAD,
            "vault": self._vault,
            "vault_configured": bool(self._settings.get("vault")),
            "has_api": bool(self._settings.get("api_id") and self._settings.get("api_hash")),
            "quick_api": True,
            "credentials": "custom" if (self._settings.get("api_id") and self._settings.get("api_hash")) else "builtin",
            "bot_index_linked": self.is_bot_vault(),
            "error": self._last_error,
            "sync": dict(self.sync_state),
        }

    def is_bot_vault(self) -> bool:
        if not self._vault:
            return False
        expected = appconfig.default_vault().strip()
        if not expected:
            return False
        try:
            return int(self._vault["id"]) == int(expected)
        except (KeyError, TypeError, ValueError):
            return str(self._vault.get("id")) == expected

    async def start(self) -> None:
        self._cleanup_cache()
        settings = appconfig.load_settings()
        self._settings = settings
        try:
            await self._ensure_client()
            if await self.client.is_user_authorized():
                await self._complete_login()
            else:
                self._state = "login"
        except Exception as exc:  # startup must not kill the local server
            self._state = "error"
            self._last_error = friendly_error(exc)

    async def close(self) -> None:
        await self.cancel_qr()
        if self.client is not None:
            try:
                await self.client.disconnect()
            except Exception:
                pass

    async def _ensure_client(self) -> TelegramClient:
        if self.client is None:
            settings = appconfig.load_settings()
            self._settings = settings
            api_id = str(settings.get("api_id") or "").strip()
            api_hash = str(settings.get("api_hash") or "").strip()
            if not api_id.isdigit() or not api_hash:
                api_id = str(BUILTIN_API_ID)
                api_hash = BUILTIN_API_HASH
            try:
                api_id_int = int(api_id)
            except ValueError:
                raise TGError("API ID must be a number.")
            appconfig.ensure_dirs()
            self.client = TelegramClient(
                str(appconfig.SESSION_PATH),
                api_id_int,
                api_hash,
                device_model="Telegram File Explorer",
                system_version="Windows",
                app_version=APP_VERSION,
                connection_retries=3,
                request_retries=3,
                auto_reconnect=True,
            )
        if not self.client.is_connected():
            await self.client.connect()
        return self.client

    def _require_client(self) -> TelegramClient:
        if self.client is None:
            raise TGError("Log in first.")
        return self.client

    def _require_ready(self) -> TelegramClient:
        client = self._require_client()
        if not self._authorized:
            raise TGError("Log in first.")
        if self._entity is None:
            raise TGError("Choose your Telegram channel first.")
        return client

    # ------------------------------------------------------------------ login
    async def configure(
        self, api_id: str = "", api_hash: str = "", vault: str = ""
    ) -> Dict[str, Any]:
        self._last_error = None
        await self.cancel_qr()
        if self._authorized:
            if vault is not None and str(vault).strip():
                return await self.set_vault(str(vault).strip())
            return self.status()

        api_id = str(api_id or "").strip()
        api_hash = str(api_hash or "").strip()
        if not api_id.isdigit():
            raise TGError("API ID must be the number from my.telegram.org.")
        if len(api_hash) < 20:
            raise TGError("API hash looks too short. Copy it from my.telegram.org.")

        changed = (
            api_id != str(self._settings.get("api_id") or "")
            or api_hash != str(self._settings.get("api_hash") or "")
        )
        self._settings = appconfig.save_settings({"api_id": api_id, "api_hash": api_hash})
        if vault:
            self._settings = appconfig.save_settings({"vault": vault})
        if changed and self.client is not None:
            try:
                await self.client.disconnect()
            except Exception:
                pass
            self.client = None
        await self._ensure_client()
        self._state = "login" if not await self.client.is_user_authorized() else "ready"
        if self._state == "ready":
            await self._complete_login()
        return self.status()

    async def set_vault(self, vault: str) -> Dict[str, Any]:
        self._last_error = None
        if self.sync_state.get("running"):
            raise TGError("Wait for the current sync to finish before changing channels.")
        if not self._authorized:
            raise TGError("Log in first.")
        self._settings = appconfig.save_settings({"vault": str(vault).strip()})
        self._entity = None
        self._vault = None
        await self._resolve_vault()
        self._state = "ready"
        return self.status()

    async def send_code(self, phone: str) -> Dict[str, Any]:
        self._last_error = None
        await self.cancel_qr()
        phone = str(phone or "").strip().replace(" ", "").replace("-", "")
        if not phone.startswith("+") and phone.isdigit():
            phone = "+" + phone
        if len(phone) < 8:
            raise TGError("Enter the full phone number with country code.")
        client = await self._ensure_client()
        if await client.is_user_authorized():
            await self._complete_login()
            return self.status()
        self._phone = phone
        try:
            sent = await client.send_code_request(phone)
        except Exception as exc:
            raise TGError(friendly_error(exc))
        self._code_hash = sent.phone_code_hash
        self._state = "code"
        hint = getattr(sent, "next_type", None)
        return {
            **self.status(),
            "phone": phone,
            "code_type": type(sent.type).__name__ if getattr(sent, "type", None) else None,
            "hint": hint,
        }

    async def verify_code(self, code: str) -> Dict[str, Any]:
        self._last_error = None
        await self.cancel_qr()
        code = str(code or "").strip().replace(" ", "")
        if not code:
            raise TGError("Enter the code Telegram sent you.")
        client = self._require_client()
        if not self._phone:
            raise TGError("Request a login code first.")
        try:
            await client.sign_in(
                phone=self._phone, code=code, phone_code_hash=self._code_hash
            )
        except errors.SessionPasswordNeededError:
            self._state = "password"
            return self.status()
        except errors.PhoneCodeExpiredError as exc:
            self._state = "login"
            raise TGError(friendly_error(exc))
        except errors.PhoneCodeInvalidError as exc:
            raise TGError(friendly_error(exc))
        except Exception as exc:
            raise TGError(friendly_error(exc))
        await self._complete_login()
        return self.status()

    async def verify_password(self, password: str) -> Dict[str, Any]:
        self._last_error = None
        await self.cancel_qr()
        if not password:
            raise TGError("Enter your two-step verification password.")
        client = self._require_client()
        try:
            await client.sign_in(password=password)
        except Exception as exc:
            raise TGError(friendly_error(exc))
        await self._complete_login()
        return self.status()

    # -------------------------------------------------------------------- qr
    def qr_payload(self) -> Dict[str, Any]:
        return {
            "state": self._state,
            "authorized": self._authorized,
            "qr": {
                "url": self._qr_url,
                "svg": self._qr_svg,
                "expires": self._qr_expires,
                "version": self._qr_version,
            },
            "error": self._qr_error,
            "status": self.status(),
        }

    async def start_qr(self) -> Dict[str, Any]:
        self._last_error = None
        client = await self._ensure_client()
        if await client.is_user_authorized():
            await self._complete_login()
            return self.qr_payload()
        await self.cancel_qr()
        try:
            qr = await client.qr_login()
        except Exception as exc:
            raise TGError(friendly_error(exc))
        self._qr_error = None
        self._publish_qr(qr)
        self._state = "qr"
        self._qr_task = asyncio.create_task(self._qr_loop(qr))
        return self.qr_payload()

    def _publish_qr(self, qr: Any) -> None:
        self._qr_url = qr.url
        self._qr_svg = _qr_svg(qr.url)
        self._qr_expires = int(qr.expires.timestamp())
        self._qr_version += 1

    async def _qr_loop(self, qr: Any) -> None:
        client = self._require_client()
        try:
            while True:
                try:
                    await qr.wait()
                    break
                except asyncio.TimeoutError:
                    await qr.recreate()
                    self._publish_qr(qr)
            self._qr_url = None
            self._qr_svg = None
            self._qr_expires = None
            if not await client.is_user_authorized():
                self._state = "password"
                return
            await self._complete_login()
        except errors.SessionPasswordNeededError:
            self._qr_url = None
            self._qr_svg = None
            self._qr_expires = None
            self._state = "password"
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            self._qr_url = None
            self._qr_svg = None
            self._qr_expires = None
            self._qr_error = friendly_error(exc)
            self._last_error = self._qr_error
            self._state = "login"
        finally:
            if self._qr_task is asyncio.current_task():
                self._qr_task = None

    async def cancel_qr(self) -> Dict[str, Any]:
        task = self._qr_task
        self._qr_task = None
        if task is not None and task is not asyncio.current_task() and not task.done():
            task.cancel()
            with contextlib.suppress(asyncio.CancelledError, Exception):
                await task
        self._qr_url = None
        self._qr_svg = None
        self._qr_expires = None
        if self._state == "qr":
            self._state = "login"
        return self.qr_payload()

    async def _complete_login(self) -> None:
        await self.cancel_qr()
        client = self._require_client()
        me = await client.get_me()
        self._authorized = True
        self._user = {
            "id": me.id,
            "first_name": me.first_name or "",
            "last_name": me.last_name or "",
            "username": me.username or "",
            "phone": me.phone or "",
            "premium": bool(getattr(me, "premium", False)),
        }
        self._state = "ready"
        self._last_error = None
        try:
            await self._resolve_vault()
        except TGError as exc:
            self._entity = None
            self._vault = None
            self._last_error = str(exc)

    async def logout(self) -> Dict[str, Any]:
        self._last_error = None
        await self.cancel_qr()
        if self.sync_state.get("running"):
            raise TGError("Wait for the current sync to finish before signing out.")
        if self.client is not None:
            try:
                await self.client.log_out()
            except Exception:
                pass
            try:
                await self.client.disconnect()
            except Exception:
                pass
        self.client = None
        self._authorized = False
        self._user = None
        self._entity = None
        self._vault = None
        self._phone = None
        self._code_hash = None
        self._state = "login"
        self._message_cache.clear()
        appconfig.clear_session_files()
        return self.status()

    async def reconnect(self) -> Dict[str, Any]:
        if self.sync_state.get("running"):
            raise TGError("Wait for the current sync to finish before reconnecting.")
        await self.cancel_qr()
        if self.client is not None:
            try:
                await self.client.disconnect()
            except Exception:
                pass
        self.client = None
        await self.start()
        return self.status()

    # ---------------------------------------------------------------- channel
    async def _resolve_vault(self) -> None:
        client = self._require_client()
        raw = str(self._settings.get("vault") or "").strip()
        if raw.startswith("http://") or raw.startswith("https://"):
            raw = raw.split("://", 1)[1]
        if raw.startswith("t.me/"):
            parts = raw.split("?", 1)[0].split("#", 1)[0].split("/")
            raw = parts[1] if len(parts) > 1 else ""
            if raw == "c" and len(parts) > 2:
                raw = parts[2]
        if raw.startswith("@") and not raw.startswith("@+"):
            raw = raw[1:]
        if not raw:
            raise TGError("Choose the Telegram channel that stores your files.")
        if not self._authorized:
            return
        try:
            number = int(raw)
        except ValueError:
            number = None
        try:
            if number is not None and number > 0:
                try:
                    entity = await client.get_entity(PeerChannel(number))
                except Exception:
                    entity = await client.get_entity(number)
            else:
                entity = await client.get_entity(number if number is not None else raw)
        except Exception as exc:
            raise TGError(
                "Could not open that channel. Make sure this account is a member."
            ) from exc
        if not getattr(entity, "title", None):
            raise TGError("That ID belongs to a user, not a channel.")
        peer_id = utils.get_peer_id(entity)
        title = entity.title or str(peer_id)
        username = getattr(entity, "username", None) or ""
        self._entity = entity
        self._vault = {
            "id": peer_id,
            "channel_id": entity.id,
            "title": title,
            "username": username,
        }
        saved = appconfig.save_settings({"vault": str(peer_id), "vault_title": title})
        self._settings = saved

    async def list_channels(self, query: str = "") -> List[Dict[str, Any]]:
        client = self._require_client()
        if not self._authorized:
            raise TGError("Log in first.")
        needle = (query or "").strip().lower()
        found: List[Dict[str, Any]] = []
        try:
            async for dialog in client.iter_dialogs(limit=500):
                entity = dialog.entity
                if not isinstance(entity, types.Channel):
                    continue
                title = entity.title or "(untitled)"
                username = entity.username or ""
                if needle and needle not in title.lower() and needle not in username.lower():
                    continue
                found.append(
                    {
                        "id": utils.get_peer_id(entity),
                        "title": title,
                        "username": username,
                        "broadcast": bool(getattr(entity, "broadcast", False)),
                        "megagroup": bool(getattr(entity, "megagroup", False)),
                        "members": getattr(entity, "participants_count", None),
                    }
                )
        except Exception as exc:
            raise TGError(friendly_error(exc))
        found.sort(key=lambda x: (not x["broadcast"], x["title"].lower()))
        return found

    # ------------------------------------------------------------------- sync
    async def sync(self, catalog: Catalog, bot_db: Path) -> None:
        if self.sync_state.get("running"):
            return
        self.sync_state = {
            "running": True,
            "scanned": 0,
            "total": 0,
            "stored": 0,
            "imported": 0,
            "error": None,
            "started": datetime.now().isoformat(timespec="seconds"),
            "finished": None,
        }
        try:
            client = self._require_ready()
            if self._vault is None:
                await self._resolve_vault()
            chat_id = int(self._entity.id)
            total = 0
            try:
                result = await client.get_messages(self._entity, limit=0)
                total = int(getattr(result, "total", 0) or 0)
            except Exception:
                total = 0
            self.sync_state["total"] = total
            stored = 0
            scanned = 0
            batch: List[Dict[str, Any]] = []
            async for message in client.iter_messages(
                self._entity, limit=None, wait_time=0
            ):
                scanned += 1
                info = self.describe(message, chat_id)
                if info is not None:
                    batch.append(info)
                    stored += 1
                    if len(batch) >= 200:
                        catalog.upsert_many(batch)
                        batch.clear()
                        self.sync_state["scanned"] = scanned
                        self.sync_state["stored"] = stored
                        await asyncio.sleep(0)
                if scanned % 25 == 0:
                    self.sync_state["scanned"] = scanned
                    self.sync_state["stored"] = stored
            if batch:
                catalog.upsert_many(batch)
            self.sync_state["scanned"] = scanned
            self.sync_state["stored"] = stored
            if total == 0:
                self.sync_state["total"] = scanned
            if self.is_bot_vault():
                self.sync_state["imported"] = catalog.import_from_bot(bot_db, chat_id)
        except Exception as exc:
            self.sync_state["error"] = friendly_error(exc)
        finally:
            self.sync_state["running"] = False
            self.sync_state["finished"] = datetime.now().isoformat(timespec="seconds")

    def describe(self, message: Any, chat_id: int) -> Optional[Dict[str, Any]]:
        if message is None:
            return None
        photo = getattr(message, "photo", None)
        document = getattr(message, "document", None)
        if photo is None and (document is None or not getattr(document, "id", 0)):
            return None
        attributes = list(getattr(document, "attributes", None) or ())
        file_info = getattr(message, "file", None)
        mime = (
            getattr(file_info, "mime_type", None)
            or getattr(document, "mime_type", None)
            or ""
        )
        video_attr = _attr(attributes, DocumentAttributeVideo)
        audio_attr = _attr(attributes, DocumentAttributeAudio)
        is_sticker = _attr(attributes, DocumentAttributeSticker) is not None
        is_animated = _attr(attributes, DocumentAttributeAnimated) is not None
        if photo is not None:
            kind = "image"
        elif is_sticker:
            kind = "sticker"
        elif is_animated:
            kind = "gif"
        elif video_attr is not None:
            kind = "video"
        elif audio_attr is not None:
            kind = "voice" if getattr(audio_attr, "voice", False) else "audio"
        elif mime.startswith("image/"):
            kind = "image"
        elif mime.startswith("video/"):
            kind = "video"
        elif mime.startswith("audio/"):
            kind = "audio"
        elif document is not None:
            kind = "document"
        else:
            kind = "other"

        name = None
        filename_attr = _attr(attributes, DocumentAttributeFilename)
        if filename_attr is not None and getattr(filename_attr, "file_name", None):
            name = filename_attr.file_name
        if not name:
            name = getattr(file_info, "name", None)
        caption = getattr(message, "message", None) or None
        if not name and caption:
            candidate = caption.strip()
            stem, extension = os.path.splitext(candidate)
            if extension and len(candidate) <= 160:
                name = candidate
        date = getattr(message, "date", None)
        if date is None:
            date = datetime.now().astimezone()
        stamp = date.astimezone().strftime("%Y-%m-%d %H.%M.%S")
        if not name:
            extension = _EXTENSIONS.get(mime) or mimetypes.guess_extension(mime or "")
            if not extension:
                extension = {
                    "image": ".jpg",
                    "video": ".mp4",
                    "audio": ".mp3",
                    "voice": ".ogg",
                    "sticker": ".webp",
                    "gif": ".mp4",
                }.get(kind, "")
            name = f"{_LABELS.get(kind, 'File')} {stamp}{extension}"

        width = getattr(video_attr, "w", None) if video_attr else None
        height = getattr(video_attr, "h", None) if video_attr else None
        duration = (
            getattr(video_attr, "duration", None)
            or getattr(audio_attr, "duration", None)
            or getattr(file_info, "duration", None)
        )
        if photo is not None:
            p_width, p_height = _dimensions(photo)
            width = width or p_width
            height = height or p_height
        size = getattr(file_info, "size", None)
        if not size:
            size = getattr(document, "size", None) if document is not None else _photo_size(photo)
        has_thumb = bool(getattr(document, "thumbs", None)) or photo is not None
        if kind == "sticker" and getattr(document, "mime_type", "") == "image/webp":
            has_thumb = True
        return {
            "chat_id": chat_id,
            "message_id": int(message.id),
            "doc_id": getattr(document, "id", None) if document is not None else None,
            "access_hash": getattr(document, "access_hash", None) if document is not None else None,
            "name": clean_name(name or f"{_LABELS.get(kind, 'File')} {stamp}"),
            "kind": kind,
            "mime": mime or None,
            "size": int(size) if size else None,
            "width": int(width) if width else None,
            "height": int(height) if height else None,
            "duration": int(duration) if duration else None,
            "folder": default_folder(kind),
            "caption": caption,
            "tg_date": date.isoformat(),
            "has_thumb": has_thumb,
        }

    # ------------------------------------------------------------------ media
    async def get_message(self, message_id: int) -> Any:
        client = self._require_ready()
        cached = self._message_cache.get(int(message_id))
        if cached and time.time() - cached[0] < 600:
            return cached[1]
        try:
            message = await client.get_messages(self._entity, ids=int(message_id))
        except Exception as exc:
            raise TGError(friendly_error(exc))
        if message is None:
            return None
        self._message_cache[int(message_id)] = (time.time(), message)
        if len(self._message_cache) > 300:
            oldest = min(self._message_cache, key=lambda key: self._message_cache[key][0])
            self._message_cache.pop(oldest, None)
        return message

    async def stream_chunks(self, message: Any, start: int, length: int) -> AsyncIterator[bytes]:
        remaining = max(0, int(length))
        if remaining == 0:
            return
        client = self._require_ready()
        offset = max(0, int(start))
        try:
            async for chunk in client.iter_download(
                message, offset=offset, request_size=1024 * 1024
            ):
                if remaining <= 0:
                    break
                data = bytes(chunk[:remaining])
                remaining -= len(data)
                if data:
                    yield data
                if remaining <= 0:
                    break
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            raise TGError(friendly_error(exc))

    async def thumbnail(self, item: Dict[str, Any]) -> Optional[Tuple[bytes, str]]:
        client = self._require_ready()
        item_id = int(item["id"])
        lock = self._thumb_locks.setdefault(item_id, asyncio.Lock())
        async with lock:
            # A folder of thumbnails fires many requests at once; cap the
            # downloads so media streams keep their share of the network.
            if self._thumb_sem is None:
                self._thumb_sem = asyncio.Semaphore(4)
            async with self._thumb_sem:
                message = await self.get_message(int(item["message_id"]))
                if message is None:
                    return None
                # For photos index 1 is a small preview; -1 fetches the full image.
                indexes = (1, -1) if getattr(message, "photo", None) is not None else (-1,)
                data = None
                for index in indexes:
                    buffer = io.BytesIO()
                    try:
                        await client.download_media(message, file=buffer, thumb=index)
                    except Exception:
                        continue
                    data = buffer.getvalue()
                    if data:
                        break
                if not data:
                    size = int(item.get("size") or 0)
                    kind = item.get("kind")
                    if kind in {"sticker", "image", "gif"} and 0 < size <= 6 * 1024 * 1024:
                        try:
                            data = await client.download_media(message, file=bytes)
                        except Exception:
                            data = None
                if not data:
                    return None
                return bytes(data), _sniff_image(data)

    async def media_info(self, item: Dict[str, Any]) -> Tuple[Any, int, str]:
        message = await self.get_message(int(item["message_id"]))
        if message is None:
            raise TGError("This file no longer exists in the channel.")
        file_info = getattr(message, "file", None)
        size = int(item.get("size") or getattr(file_info, "size", 0) or 0)
        mime = (
            item.get("mime")
            or getattr(file_info, "mime_type", None)
            or "application/octet-stream"
        )
        if not size:
            document = getattr(message, "document", None)
            size = int(getattr(document, "size", 0) or 0)
        return message, size, mime

    async def edit_caption(self, message_id: int, name: str) -> None:
        client = self._require_ready()
        message = await self.get_message(int(message_id))
        if message is None:
            return
        if getattr(message, "sticker", None) is not None or getattr(
            message, "video_note", None
        ) is not None:
            return
        try:
            await client.edit_message(self._entity, int(message_id), name)
        except errors.MessageNotModifiedError:
            return
        except Exception as exc:
            raise TGError(friendly_error(exc))

    async def delete_message(self, message_id: int) -> None:
        client = self._require_ready()
        try:
            await client.delete_messages(self._entity, [int(message_id)])
        except Exception as exc:
            raise TGError(friendly_error(exc))

    # ----------------------------------------------------------------- upload
    def new_transfer(self, name: str, size: int, client: str = "") -> str:
        transfer_id = f"t{int(time.time() * 1000)}-{len(self.transfers)}"
        cancelled = bool(client) and client in self.cancelled_clients
        self.transfers[transfer_id] = {
            "id": transfer_id,
            "name": name,
            "size": size,
            "sent": 0,
            "state": "cancelled" if cancelled else "queued",
            "error": None,
            "item_id": None,
            "item_ids": [],
            "client": client,
            "cancel": cancelled,
            "started": datetime.now().isoformat(timespec="seconds"),
        }
        self._prune_transfers()
        return transfer_id

    def cancel_transfer(self, transfer_id: str) -> bool:
        transfer = self.transfers.get(transfer_id)
        if transfer is None or transfer.get("cancel"):
            return False
        if transfer.get("state") in {"done", "error", "cancelled", "ready"}:
            return False
        transfer["cancel"] = True
        transfer["state"] = "cancelled"
        return True

    def cancel_client(self, client: str) -> int:
        client = str(client or "").strip()
        if not client:
            return 0
        if len(self.cancelled_clients) > 500:
            self.cancelled_clients.clear()
        self.cancelled_clients.add(client)
        return sum(
            1
            for transfer in list(self.transfers.values())
            if transfer.get("client") == client and self.cancel_transfer(transfer["id"])
        )

    def _prune_transfers(self) -> None:
        if len(self.transfers) <= 60:
            return
        finished = [
            key for key, value in self.transfers.items()
            if value["state"] in {"done", "error", "cancelled"}
        ]
        for key in finished[: len(self.transfers) - 60]:
            self.transfers.pop(key, None)

    def _progress(self, transfer_id: str, sent: int, total: int) -> None:
        transfer = self.transfers.get(transfer_id)
        if transfer is None:
            return
        transfer["sent"] = int(sent or 0)
        transfer["size"] = int(total or transfer["size"] or 0)
        transfer["state"] = "uploading"

    async def upload_one(self, entry: Dict[str, Any], catalog: Catalog) -> Dict[str, Any]:
        client = self._require_ready()
        transfer_id = entry["transfer_id"]
        name = clean_name(entry["name"])
        path = Path(entry["path"])
        folder = clean_folder_path(entry.get("folder") or "", "")
        transfer = self.transfers.get(transfer_id)
        if transfer is None or transfer.get("cancel"):
            raise TransferCancelled()
        shared = bool(entry.get("shared"))
        sent_base = int(entry.get("sent_base") or 0)
        transfer["state"] = "uploading"
        # Telegram's photo pipeline recompresses JPEG/PNG; keep originals intact.
        keep_original = Path(name).suffix.lower() in {".png", ".jpg", ".jpeg"}

        def report(sent: int, total: int) -> None:
            # Telethon calls this between upload parts; raising aborts the upload.
            if transfer.get("cancel"):
                raise TransferCancelled()
            self._progress(
                transfer_id,
                sent_base + sent,
                None if shared else total,
            )

        try:
            message = await client.send_file(
                self._entity,
                str(path),
                caption=name,
                force_document=keep_original,
                attributes=[DocumentAttributeFilename(name)],
                supports_streaming=True,
                progress_callback=report,
            )
            if transfer.get("cancel"):
                # The upload finished before the cancel landed; remove the
                # message so a cancelled file never shows up in the channel.
                try:
                    await client.delete_messages(self._entity, [message.id])
                except Exception:
                    pass
                raise TransferCancelled()
            info = self.describe(message, int(self._entity.id))
            if info is None:
                raise TGError("Telegram stored the file but it could not be indexed.")
            item_id = catalog.upsert(info)
            if shared:
                transfer.setdefault("item_ids", []).append(int(item_id))
            if folder:
                catalog.create_folder(folder)
                catalog.update(item_id, folder=folder, folder_source="user")
            item = catalog.get(item_id)
            if shared:
                if transfer is not None:
                    transfer.update(
                        state="done" if entry.get("last") else "uploading",
                        item_id=transfer.get("item_id") or item_id,
                        error=None,
                    )
                    if entry.get("last"):
                        transfer["sent"] = transfer["size"]
            else:
                transfer.update(
                    state="done", sent=transfer["size"], item_id=item_id, error=None
                )
            return item or {}
        except Exception as exc:
            if transfer.get("cancel") or isinstance(exc, TransferCancelled):
                transfer.update(state="cancelled", error=None)
                raise TransferCancelled() from exc
            message = friendly_error(exc)
            transfer.update(state="error", error=message)
            raise TGError(message)
        finally:
            try:
                path.unlink(missing_ok=True)
            except OSError:
                pass
            parent = path.parent
            try:
                if parent.is_dir() and not any(parent.iterdir()):
                    parent.rmdir()
            except OSError:
                pass

    def _cleanup_cache(self) -> None:
        appconfig.ensure_dirs()
        stale_uploads = time.time() - 24 * 3600
        try:
            for entry in (appconfig.CACHE_DIR / "uploads").iterdir():
                if entry.is_dir() and entry.stat().st_mtime < stale_uploads:
                    shutil.rmtree(entry, ignore_errors=True)
        except OSError:
            pass
        try:
            for entry in (appconfig.CACHE_DIR / "merge").iterdir():
                if entry.is_dir() and entry.stat().st_mtime < stale_uploads:
                    shutil.rmtree(entry, ignore_errors=True)
        except OSError:
            pass
        stale_thumbs = time.time() - 30 * 24 * 3600
        for pattern in ("*.thumb", "*.tmp"):
            try:
                for entry in appconfig.THUMB_DIR.glob(pattern):
                    if entry.stat().st_mtime < stale_thumbs:
                        entry.unlink(missing_ok=True)
            except OSError:
                pass


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


def _qr_svg(url: str) -> str:
    buffer = io.BytesIO()
    segno.make(url, error="m").save(
        buffer, kind="svg", scale=8, border=2, dark="#14213d", light="#ffffff"
    )
    return buffer.getvalue().decode("utf-8")
