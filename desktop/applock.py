"""4-digit PIN lock for the explorer window."""

from __future__ import annotations

import hashlib
import re
import secrets

from . import appconfig

PIN_RE = re.compile(r"^\d{4}$")
SALT_KEY = "pin_salt"
HASH_KEY = "pin_hash"
SKIPPED_KEY = "pin_skipped"
_ROUNDS = 120_000


def _derive(pin: str, salt_hex: str) -> str:
    digest = hashlib.pbkdf2_hmac(
        "sha256", pin.encode("utf-8"), bytes.fromhex(salt_hex), _ROUNDS
    )
    return digest.hex()


def has_pin() -> bool:
    settings = appconfig.load_settings()
    return bool(settings.get(SALT_KEY) and settings.get(HASH_KEY))


def pin_skipped() -> bool:
    return bool(appconfig.load_settings().get(SKIPPED_KEY))


def verify(pin: str) -> bool:
    settings = appconfig.load_settings()
    salt = settings.get(SALT_KEY)
    stored = settings.get(HASH_KEY)
    if not salt or not stored:
        return False
    try:
        return secrets.compare_digest(_derive(pin, str(salt)), str(stored))
    except (TypeError, ValueError):
        return False


def set_pin(pin: str) -> None:
    if not PIN_RE.fullmatch(pin or ""):
        raise ValueError("The PIN must be exactly 4 digits.")
    salt = secrets.token_hex(16)
    appconfig.save_settings(
        {SALT_KEY: salt, HASH_KEY: _derive(pin, salt), SKIPPED_KEY: ""}
    )


def clear_pin() -> None:
    appconfig.save_settings({SALT_KEY: "", HASH_KEY: ""})


def mark_skipped() -> None:
    appconfig.save_settings({SKIPPED_KEY: "1"})
