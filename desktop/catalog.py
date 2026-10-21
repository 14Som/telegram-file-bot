"""Local SQLite catalog for the desktop explorer.

Telegram is the storage; this file only holds names, folders, tags and
references to channel messages so the UI can be fast and searchable.
"""

from __future__ import annotations

import re
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

SCHEMA = """
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL,
    message_id INTEGER NOT NULL,
    doc_id INTEGER,
    access_hash INTEGER,
    name TEXT NOT NULL,
    name_source TEXT NOT NULL DEFAULT 'telegram',
    kind TEXT NOT NULL DEFAULT 'other',
    mime TEXT,
    size INTEGER,
    width INTEGER,
    height INTEGER,
    duration INTEGER,
    folder TEXT NOT NULL DEFAULT 'Other',
    folder_source TEXT NOT NULL DEFAULT 'default',
    tags TEXT NOT NULL DEFAULT '',
    tags_source TEXT NOT NULL DEFAULT 'default',
    favorite INTEGER NOT NULL DEFAULT 0,
    fav_source TEXT NOT NULL DEFAULT 'default',
    caption TEXT,
    note TEXT NOT NULL DEFAULT '',
    tg_date TEXT,
    added_at TEXT NOT NULL DEFAULT (datetime('now')),
    hidden INTEGER NOT NULL DEFAULT 0,
    thumb_version INTEGER NOT NULL DEFAULT 0,
    has_thumb INTEGER NOT NULL DEFAULT 1,
    UNIQUE(chat_id, message_id)
);
CREATE INDEX IF NOT EXISTS idx_items_name ON items(name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_items_folder ON items(folder COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_items_kind ON items(kind);
CREATE INDEX IF NOT EXISTS idx_items_message ON items(message_id);
CREATE TABLE IF NOT EXISTS folders (
    name TEXT PRIMARY KEY COLLATE NOCASE,
    icon TEXT NOT NULL DEFAULT '',
    note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"""

FOLDER_BY_KIND = {
    "image": "Images",
    "video": "Videos",
    "audio": "Music",
    "voice": "Voice notes",
    "document": "Documents",
    "sticker": "Stickers",
    "gif": "GIFs",
    "other": "Other",
}

SORT_COLUMNS = {
    "name": "name COLLATE NOCASE",
    "date": "COALESCE(tg_date, added_at)",
    "size": "COALESCE(size, 0)",
    "kind": "kind, name COLLATE NOCASE",
    "folder": "folder COLLATE NOCASE, name COLLATE NOCASE",
    "added": "id",
}

KIND_LABELS = {
    "image": "Image",
    "video": "Video",
    "audio": "Audio",
    "voice": "Voice note",
    "document": "Document",
    "sticker": "Sticker",
    "gif": "GIF",
    "other": "File",
}

_BAD_NAME = re.compile(r'[\\/:*?"<>|\x00-\x1f]')

UPSERT_SQL = """
INSERT INTO items (chat_id, message_id, doc_id, access_hash, name,
    kind, mime, size, width, height, duration, folder, caption,
    tg_date, has_thumb)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(chat_id, message_id) DO UPDATE SET
    doc_id = excluded.doc_id,
    access_hash = excluded.access_hash,
    kind = excluded.kind,
    mime = excluded.mime,
    size = excluded.size,
    width = excluded.width,
    height = excluded.height,
    duration = excluded.duration,
    caption = COALESCE(excluded.caption, items.caption),
    tg_date = COALESCE(excluded.tg_date, items.tg_date),
    has_thumb = excluded.has_thumb,
    name = CASE WHEN items.name_source = 'telegram'
                THEN excluded.name ELSE items.name END,
    folder = CASE WHEN items.folder_source = 'default'
                  THEN excluded.folder ELSE items.folder END
"""


def clean_name(name: str, fallback: str = "Untitled") -> str:
    name = _BAD_NAME.sub("_", (name or "").strip()).strip(". ")
    name = re.sub(r"\s+", " ", name)
    return name[:180] or fallback


def clean_folder_path(value: str, fallback: str = "") -> str:
    parts: List[str] = []
    for raw in str(value or "").replace("\\", "/").split("/"):
        part = clean_name(raw, "")
        if not part or part in {".", ".."}:
            continue
        candidate = "/".join([*parts, part])
        if len(candidate) > 180:
            break
        parts.append(part)
    return "/".join(parts) or fallback


def folder_parent(path: str) -> str:
    return path.rsplit("/", 1)[0] if "/" in path else ""


def folder_leaf(path: str) -> str:
    return path.rsplit("/", 1)[-1]


def join_folder(path: str, child: str) -> str:
    child = clean_folder_path(child, "")
    if not child:
        return clean_folder_path(path, "")
    return clean_folder_path(f"{path}/{child}" if path else child, "")


def normalize_tags(tags: str) -> str:
    seen: List[str] = []
    for raw in (tags or "").replace(",", " ").split():
        tag = raw.strip().lstrip("#").lower()
        tag = _BAD_NAME.sub("", tag)[:40]
        if tag and tag not in seen:
            seen.append(tag)
    return " ".join(seen)


def default_folder(kind: str) -> str:
    return FOLDER_BY_KIND.get(kind, "Other")


def _like(term: str) -> str:
    return term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def row_to_dict(row: sqlite3.Row) -> Dict[str, Any]:
    data = dict(row)
    data["favorite"] = bool(data.get("favorite"))
    data["hidden"] = bool(data.get("hidden"))
    data["kind_label"] = KIND_LABELS.get(data.get("kind", "other"), "File")
    return data


class Catalog:
    def __init__(self, path: Path):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.init()

    @contextmanager
    def connect(self):
        conn = sqlite3.connect(self.path, timeout=15)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA busy_timeout=15000")
        conn.execute("PRAGMA journal_mode=WAL")
        try:
            yield conn
            conn.commit()
        finally:
            conn.close()

    def init(self) -> None:
        with self.connect() as conn:
            conn.executescript(SCHEMA)
            columns = {row["name"] for row in conn.execute("PRAGMA table_info(items)")}
            additions = {
                "name_source": "TEXT NOT NULL DEFAULT 'telegram'",
                "folder_source": "TEXT NOT NULL DEFAULT 'default'",
                "tags_source": "TEXT NOT NULL DEFAULT 'default'",
                "fav_source": "TEXT NOT NULL DEFAULT 'default'",
                "note": "TEXT NOT NULL DEFAULT ''",
                "hidden": "INTEGER NOT NULL DEFAULT 0",
                "thumb_version": "INTEGER NOT NULL DEFAULT 0",
                "has_thumb": "INTEGER NOT NULL DEFAULT 1",
            }
            for name, ddl in additions.items():
                if name not in columns:
                    conn.execute(f"ALTER TABLE items ADD COLUMN {name} {ddl}")
            folder_columns = {row["name"] for row in conn.execute("PRAGMA table_info(folders)")}
            folder_additions = {
                "icon": "TEXT NOT NULL DEFAULT ''",
                "note": "TEXT NOT NULL DEFAULT ''",
            }
            for name, ddl in folder_additions.items():
                if name not in folder_columns:
                    conn.execute(f"ALTER TABLE folders ADD COLUMN {name} {ddl}")
            conn.execute("UPDATE items SET folder = 'Other' WHERE folder = ''")
            conn.execute("DELETE FROM folders WHERE name = ''")

    @staticmethod
    def _upsert_values(item: Dict[str, Any]) -> Tuple[Any, ...]:
        kind = str(item.get("kind") or "other")
        folder = clean_folder_path(
            str(item.get("folder") or default_folder(kind)), "Other"
        )
        return (
            int(item["chat_id"]), int(item["message_id"]), item.get("doc_id"),
            item.get("access_hash"), clean_name(str(item.get("name") or "")),
            kind, item.get("mime"), item.get("size"), item.get("width"),
            item.get("height"), item.get("duration"), folder, item.get("caption"),
            item.get("tg_date") or datetime.now(timezone.utc).isoformat(timespec="seconds"),
            1 if item.get("has_thumb", True) else 0,
        )

    def upsert(self, item: Dict[str, Any]) -> int:
        """Insert a channel message, refreshing technical metadata only.

        Names, folders, tags and favorites are only refreshed while they are
        still automatic, so edits made in the explorer always win.
        """
        with self.connect() as conn:
            conn.execute(UPSERT_SQL, self._upsert_values(item))
            row = conn.execute(
                "SELECT id FROM items WHERE chat_id = ? AND message_id = ?",
                (int(item["chat_id"]), int(item["message_id"])),
            ).fetchone()
            return int(row["id"])

    def upsert_many(self, items: List[Dict[str, Any]]) -> int:
        values = [self._upsert_values(item) for item in items]
        if not values:
            return 0
        with self.connect() as conn:
            conn.executemany(UPSERT_SQL, values)
        return len(values)

    def get(self, item_id: int) -> Optional[Dict[str, Any]]:
        with self.connect() as conn:
            row = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
        return row_to_dict(row) if row else None

    def by_message(self, chat_id: int, message_id: int) -> Optional[Dict[str, Any]]:
        with self.connect() as conn:
            row = conn.execute(
                "SELECT * FROM items WHERE chat_id = ? AND message_id = ?",
                (chat_id, message_id),
            ).fetchone()
        return row_to_dict(row) if row else None

    @staticmethod
    def _where(
        q: str = "",
        kind: str = "",
        folder: str = "",
        tag: str = "",
        favorite: bool = False,
        include_hidden: bool = False,
        hidden_only: bool = False,
        chat_id: Optional[int] = None,
        min_size: Optional[int] = None,
        max_size: Optional[int] = None,
        after: str = "",
        before: str = "",
        has_note: bool = False,
        recursive: bool = False,
    ) -> Tuple[str, List[Any]]:
        if hidden_only:
            clauses: List[str] = ["items.hidden = 1"]
        elif include_hidden:
            clauses = ["1 = 1"]
        else:
            clauses = ["items.hidden = 0"]
        params: List[Any] = []
        if chat_id is not None:
            clauses.append("items.chat_id = ?")
            params.append(int(chat_id))
        terms = [t.lstrip("#").lower() for t in (q or "").split()]
        for term in [t for t in terms if t]:
            like = f"%{_like(term)}%"
            clauses.append(
                "(items.name LIKE ? ESCAPE '\\' OR items.caption LIKE ? ESCAPE '\\'"
                " OR items.tags LIKE ? ESCAPE '\\' OR items.folder LIKE ? ESCAPE '\\'"
                " OR items.note LIKE ? ESCAPE '\\')"
            )
            params += [like, like, like, like, like]
        if kind and kind != "all":
            clauses.append("items.kind = ?")
            params.append(kind)
        if folder and folder != "all":
            if folder == "__none__":
                clauses.append("items.folder = ''")
            elif recursive:
                clauses.append(
                    "(items.folder = ? COLLATE NOCASE"
                    " OR lower(items.folder) LIKE ? ESCAPE '\\')"
                )
                params += [folder, f"{_like(folder.lower())}/%"]
            else:
                clauses.append("items.folder = ? COLLATE NOCASE")
                params.append(folder)
        if tag:
            clauses.append("(' ' || lower(items.tags) || ' ') LIKE ? ESCAPE '\\'")
            params.append(f"% {_like(tag.lower())} %")
        if favorite:
            clauses.append("items.favorite = 1")
        if min_size is not None and min_size > 0:
            clauses.append("COALESCE(items.size, 0) >= ?")
            params.append(int(min_size))
        if max_size is not None and max_size > 0:
            clauses.append("COALESCE(items.size, 0) <= ?")
            params.append(int(max_size))
        if after:
            clauses.append(
                "substr(COALESCE(items.tg_date, items.added_at), 1, 10) >= ?"
            )
            params.append(after)
        if before:
            clauses.append(
                "substr(COALESCE(items.tg_date, items.added_at), 1, 10) <= ?"
            )
            params.append(before)
        if has_note:
            clauses.append("length(trim(items.note)) > 0")
        return " AND ".join(clauses), params

    def list(
        self,
        q: str = "",
        kind: str = "",
        folder: str = "",
        tag: str = "",
        favorite: bool = False,
        sort: str = "date",
        direction: str = "desc",
        limit: int = 100,
        offset: int = 0,
        include_hidden: bool = False,
        hidden_only: bool = False,
        chat_id: Optional[int] = None,
        min_size: Optional[int] = None,
        max_size: Optional[int] = None,
        after: str = "",
        before: str = "",
        has_note: bool = False,
        recursive: bool = False,
    ) -> Dict[str, Any]:
        where, params = self._where(
            q, kind, folder, tag, favorite, include_hidden, hidden_only, chat_id,
            min_size, max_size, after, before, has_note, recursive,
        )
        column = SORT_COLUMNS.get(sort, SORT_COLUMNS["date"])
        order = "DESC" if str(direction).lower() == "desc" else "ASC"
        limit = max(1, min(int(limit or 100), 500))
        offset = max(0, int(offset or 0))
        with self.connect() as conn:
            total = int(
                conn.execute(f"SELECT COUNT(*) AS n FROM items WHERE {where}", params)
                .fetchone()["n"]
            )
            rows = conn.execute(
                f"SELECT * FROM items WHERE {where} ORDER BY {column} {order}"
                " LIMIT ? OFFSET ?",
                (*params, limit, offset),
            ).fetchall()
            totals = conn.execute(
                f"SELECT COALESCE(SUM(size), 0) AS size, COUNT(*) AS n"
                f" FROM items WHERE {where}",
                params,
            ).fetchone()
        return {
            "items": [row_to_dict(row) for row in rows],
            "total": total,
            "offset": offset,
            "limit": limit,
            "total_size": int(totals["size"]),
        }

    @staticmethod
    def _insert_ancestors(conn: sqlite3.Connection, path: str) -> None:
        parts = path.split("/")
        for index in range(1, len(parts) + 1):
            conn.execute(
                "INSERT OR IGNORE INTO folders (name) VALUES (?)",
                ("/".join(parts[:index]),),
            )

    def folders(self, chat_id: Optional[int] = None) -> List[Dict[str, Any]]:
        clause = "WHERE hidden = 0"
        params: List[Any] = []
        if chat_id is not None:
            clause += " AND chat_id = ?"
            params.append(int(chat_id))
        with self.connect() as conn:
            rows = conn.execute(
                f"SELECT folder, COUNT(*) AS n, COALESCE(SUM(size), 0) AS size"
                f" FROM items {clause} GROUP BY folder",
                params,
            ).fetchall()
            meta_rows = conn.execute(
                "SELECT name, icon, note FROM folders"
            ).fetchall()
        direct: Dict[str, Tuple[int, int]] = {}
        for row in rows:
            path = clean_folder_path(row["folder"], "")
            if path:
                direct[path] = (int(row["n"]), int(row["size"]))
        meta: Dict[str, Dict[str, Any]] = {}
        for row in meta_rows:
            path = clean_folder_path(row["name"], "")
            if path:
                meta[path] = {"icon": row["icon"] or "", "note": row["note"] or ""}
        paths = set(direct) | set(meta)
        for path in list(paths):
            parts = path.split("/")
            for index in range(1, len(parts) + 1):
                paths.add("/".join(parts[:index]))
        totals: Dict[str, List[int]] = {path: [0, 0] for path in paths}
        for path, (count, size) in direct.items():
            parts = path.split("/")
            for index in range(1, len(parts) + 1):
                prefix = "/".join(parts[:index])
                totals.setdefault(prefix, [0, 0])
                totals[prefix][0] += count
                totals[prefix][1] += size
        entries = []
        for path in paths:
            count, size = totals.get(path, [0, 0])
            direct_count, direct_size = direct.get(path, (0, 0))
            entries.append(
                {
                    "folder": path,
                    "name": folder_leaf(path),
                    "parent": folder_parent(path),
                    "depth": path.count("/"),
                    "n": count,
                    "size": size,
                    "direct_n": direct_count,
                    "direct_size": direct_size,
                    "icon": meta.get(path, {}).get("icon", ""),
                    "note": meta.get(path, {}).get("note", ""),
                }
            )
        return sorted(entries, key=lambda value: value["folder"].lower())

    def folder_info(
        self, name: str, chat_id: Optional[int] = None
    ) -> Optional[Dict[str, Any]]:
        folder = clean_folder_path(name, "")
        if not folder:
            return None
        for entry in self.folders(chat_id):
            if entry["folder"].lower() == folder.lower():
                return entry
        return None

    def create_folder(self, name: str) -> str:
        folder = clean_folder_path(name, "")
        if not folder:
            raise ValueError("Folder name cannot be empty.")
        with self.connect() as conn:
            existing = conn.execute(
                "SELECT name FROM folders WHERE name = ? COLLATE NOCASE", (folder,)
            ).fetchone()
            if existing is None:
                existing = conn.execute(
                    "SELECT folder AS name FROM items WHERE folder = ? COLLATE NOCASE"
                    " LIMIT 1",
                    (folder,),
                ).fetchone()
            canonical = str(existing["name"]) if existing is not None else folder
            self._insert_ancestors(conn, canonical)
        return canonical

    def set_folder_meta(
        self,
        name: str,
        icon: Optional[str] = None,
        note: Optional[str] = None,
    ) -> Dict[str, Any]:
        folder = clean_folder_path(name, "")
        if not folder:
            raise ValueError("Folder name cannot be empty.")
        updates: Dict[str, Any] = {}
        if icon is not None:
            clean_icon = re.sub(r"[\r\n\t]", "", str(icon)).strip()[:32]
            updates["icon"] = clean_icon
        if note is not None:
            updates["note"] = str(note).strip()[:4000]
        with self.connect() as conn:
            self._insert_ancestors(conn, folder)
            if updates:
                assignments = ", ".join(f"{key} = ?" for key in updates)
                conn.execute(
                    f"UPDATE folders SET {assignments} WHERE name = ? COLLATE NOCASE",
                    (*updates.values(), folder),
                )
        return self.folder_info(folder) or {
            "folder": folder,
            "name": folder_leaf(folder),
            "parent": folder_parent(folder),
            "depth": folder.count("/"),
            "n": 0,
            "size": 0,
            "direct_n": 0,
            "direct_size": 0,
            "icon": updates.get("icon", ""),
            "note": updates.get("note", ""),
        }

    def rename_folder(self, old_name: str, new_name: str) -> str:
        old = clean_folder_path(old_name, "")
        if not old:
            raise ValueError("Folder not found.")
        raw = str(new_name or "").strip()
        if "/" in raw.replace("\\", "/"):
            target = clean_folder_path(raw, "")
        else:
            target = join_folder(folder_parent(old), raw)
        if not target:
            raise ValueError("Folder name cannot be empty.")
        case_only = old.lower() == target.lower()
        with self.connect() as conn:
            exists = conn.execute(
                "SELECT 1 FROM folders WHERE name = ? COLLATE NOCASE"
                " UNION ALL SELECT 1 FROM items WHERE folder = ? COLLATE NOCASE LIMIT 1",
                (old, old),
            ).fetchone()
            if exists is None:
                raise ValueError("Folder not found.")
            if not case_only:
                conflict = conn.execute(
                    "SELECT 1 FROM folders WHERE name = ? COLLATE NOCASE"
                    " UNION ALL SELECT 1 FROM items WHERE folder = ? COLLATE NOCASE LIMIT 1",
                    (target, target),
                ).fetchone()
                if conflict is not None:
                    raise ValueError("A folder with that name already exists.")
            prefix = f"{_like(old.lower())}/%"
            conn.execute(
                "UPDATE items SET folder = ? || substr(folder, ?),"
                " folder_source = 'user'"
                " WHERE folder = ? COLLATE NOCASE"
                " OR lower(folder) LIKE ? ESCAPE '\\'",
                (target, len(old) + 1, old, prefix),
            )
            rows = conn.execute(
                "SELECT name, icon, note FROM folders"
                " WHERE name = ? COLLATE NOCASE OR lower(name) LIKE ? ESCAPE '\\'",
                (old, prefix),
            ).fetchall()
            conn.execute(
                "DELETE FROM folders WHERE name = ? COLLATE NOCASE"
                " OR lower(name) LIKE ? ESCAPE '\\'",
                (old, prefix),
            )
            mapped = [
                (target + row["name"][len(old):], row["icon"], row["note"])
                for row in rows
            ]
            if not any(entry[0].lower() == target.lower() for entry in mapped):
                mapped.append((target, "", ""))
            for path, icon, note in mapped:
                parent = folder_parent(path)
                if parent:
                    self._insert_ancestors(conn, parent)
                conn.execute(
                    "INSERT INTO folders (name, icon, note) VALUES (?, ?, ?)"
                    " ON CONFLICT(name) DO UPDATE SET icon = excluded.icon,"
                    " note = excluded.note",
                    (path, icon, note),
                )
        return target

    def delete_folder(self, name: str) -> bool:
        folder = clean_folder_path(name, "")
        if not folder:
            return False
        prefix = f"{_like(folder.lower())}/%"
        with self.connect() as conn:
            items = int(
                conn.execute(
                    "SELECT COUNT(*) AS n FROM items WHERE folder = ? COLLATE NOCASE"
                    " OR lower(folder) LIKE ? ESCAPE '\\'",
                    (folder, prefix),
                ).fetchone()["n"]
            )
            children = int(
                conn.execute(
                    "SELECT COUNT(*) AS n FROM folders WHERE lower(name) LIKE ? ESCAPE '\\'",
                    (prefix,),
                ).fetchone()["n"]
            )
            if items or children:
                return False
            cur = conn.execute(
                "DELETE FROM folders WHERE name = ? COLLATE NOCASE", (folder,)
            )
            return cur.rowcount > 0

    def folder_items(
        self,
        folder: str,
        chat_id: Optional[int] = None,
        include_hidden: bool = False,
    ) -> List[Dict[str, Any]]:
        path = clean_folder_path(folder, "")
        if not path:
            return []
        where, params = self._where(
            folder=path,
            recursive=True,
            include_hidden=include_hidden,
            chat_id=chat_id,
        )
        with self.connect() as conn:
            rows = conn.execute(
                f"SELECT * FROM items WHERE {where}"
                " ORDER BY folder COLLATE NOCASE, name COLLATE NOCASE LIMIT 5000",
                params,
            ).fetchall()
        return [row_to_dict(row) for row in rows]

    def tags(self, chat_id: Optional[int] = None) -> List[Dict[str, Any]]:
        sql = "SELECT tags FROM items WHERE hidden = 0 AND tags != ''"
        params: List[Any] = []
        if chat_id is not None:
            sql += " AND chat_id = ?"
            params.append(int(chat_id))
        with self.connect() as conn:
            rows = conn.execute(sql, params).fetchall()
        counts: Dict[str, int] = {}
        for row in rows:
            for tag in row["tags"].split():
                counts[tag] = counts.get(tag, 0) + 1
        return [
            {"tag": tag, "count": count}
            for tag, count in sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
        ]

    def kinds(self, chat_id: Optional[int] = None) -> List[Dict[str, Any]]:
        sql = "SELECT kind, COUNT(*) AS n FROM items WHERE hidden = 0"
        params: List[Any] = []
        if chat_id is not None:
            sql += " AND chat_id = ?"
            params.append(int(chat_id))
        sql += " GROUP BY kind ORDER BY n DESC"
        with self.connect() as conn:
            rows = conn.execute(sql, params).fetchall()
        return [
            {"kind": row["kind"], "label": KIND_LABELS.get(row["kind"], "File"),
             "count": int(row["n"])}
            for row in rows
        ]

    def name_index(self, chat_id: Optional[int] = None) -> List[Dict[str, Any]]:
        sql = "SELECT id, name, size FROM items WHERE hidden = 0"
        params: List[Any] = []
        if chat_id is not None:
            sql += " AND chat_id = ?"
            params.append(int(chat_id))
        with self.connect() as conn:
            rows = conn.execute(sql, params).fetchall()
        return [dict(row) for row in rows]

    def stats(self, chat_id: Optional[int] = None) -> Dict[str, Any]:
        clause = "WHERE hidden = 0"
        params: List[Any] = []
        if chat_id is not None:
            clause += " AND chat_id = ?"
            params.append(int(chat_id))
        with self.connect() as conn:
            row = conn.execute(
                f"SELECT COUNT(*) AS n, COALESCE(SUM(size), 0) AS size,"
                f" COALESCE(SUM(favorite), 0) AS favorites FROM items {clause}",
                params,
            ).fetchone()
            last = conn.execute(
                f"SELECT MAX(added_at) AS added FROM items {clause}", params
            ).fetchone()
            hidden = conn.execute(
                "SELECT COUNT(*) AS n FROM items WHERE hidden = 1"
                + (" AND chat_id = ?" if chat_id is not None else ""),
                params,
            ).fetchone()
        return {
            "count": int(row["n"]),
            "size": int(row["size"]),
            "favorites": int(row["favorites"]),
            "hidden": int(hidden["n"]),
            "last_sync": last["added"] if last else None,
        }

    def update(self, item_id: int, **fields: Any) -> Optional[Dict[str, Any]]:
        allowed = {
            "name", "folder", "tags", "favorite", "hidden", "caption", "note",
            "name_source", "folder_source", "tags_source", "fav_source",
            "has_thumb", "thumb_version",
        }
        updates = {key: value for key, value in fields.items() if key in allowed}
        if not updates:
            return self.get(item_id)
        assignments = ", ".join(f"{key} = ?" for key in updates)
        with self.connect() as conn:
            conn.execute(
                f"UPDATE items SET {assignments} WHERE id = ?",
                (*updates.values(), item_id),
            )
        return self.get(item_id)

    def rename(self, item_id: int, name: str) -> Optional[Dict[str, Any]]:
        return self.update(
            item_id, name=clean_name(name), name_source="user"
        )

    def move(self, item_id: int, folder: str) -> Optional[Dict[str, Any]]:
        folder = clean_folder_path(folder, "Other")
        self.create_folder(folder)
        return self.update(item_id, folder=folder, folder_source="user")

    def set_note(self, item_id: int, note: str) -> Optional[Dict[str, Any]]:
        return self.update(item_id, note=str(note or "").strip()[:4000])

    def set_tags(self, item_id: int, tags: str) -> Optional[Dict[str, Any]]:
        return self.update(
            item_id, tags=normalize_tags(tags), tags_source="user"
        )

    def set_favorite(self, item_id: int, favorite: bool) -> Optional[Dict[str, Any]]:
        return self.update(
            item_id, favorite=1 if favorite else 0, fav_source="user"
        )

    def hide(self, item_id: int) -> bool:
        with self.connect() as conn:
            cur = conn.execute("UPDATE items SET hidden = 1 WHERE id = ?", (item_id,))
            return cur.rowcount > 0

    def delete(self, item_id: int) -> bool:
        with self.connect() as conn:
            cur = conn.execute("DELETE FROM items WHERE id = ?", (item_id,))
            return cur.rowcount > 0

    def message_ids(self, chat_id: int) -> set:
        with self.connect() as conn:
            rows = conn.execute(
                "SELECT message_id FROM items WHERE chat_id = ?", (chat_id,)
            ).fetchall()
        return {int(row["message_id"]) for row in rows}

    def import_from_bot(self, bot_db: Path, chat_id: int) -> int:
        """Adopt names, categories, tags and favorites from the bot's index."""
        path = Path(bot_db)
        if not path.exists():
            return 0
        try:
            src = sqlite3.connect(f"file:{path.as_posix()}?mode=ro", uri=True, timeout=5)
            src.row_factory = sqlite3.Row
            rows = src.execute(
                "SELECT file_name, category, tags, favorite, caption, file_type,"
                " vault_message_id FROM files WHERE vault_message_id IS NOT NULL"
            ).fetchall()
            src.close()
        except sqlite3.Error:
            return 0

        changed = 0
        with self.connect() as conn:
            for row in rows:
                folder = clean_name(row["category"] or "", "")
                if not folder:
                    folder = default_folder(row["file_type"] or "other")
                cur = conn.execute(
                    """
                    UPDATE items SET
                      name = CASE WHEN name_source != 'user'
                                  THEN COALESCE(NULLIF(?, ''), name) ELSE name END,
                      name_source = CASE WHEN name_source != 'user' THEN 'bot'
                                         ELSE name_source END,
                      folder = CASE WHEN folder_source = 'default' THEN ? ELSE folder END,
                      folder_source = CASE WHEN folder_source = 'default' THEN 'bot'
                                           ELSE folder_source END,
                      tags = CASE WHEN tags_source = 'default' THEN ? ELSE tags END,
                      tags_source = CASE WHEN tags_source = 'default' THEN 'bot'
                                         ELSE tags_source END,
                      favorite = CASE WHEN fav_source = 'default' THEN ? ELSE favorite END,
                      fav_source = CASE WHEN fav_source = 'default' THEN 'bot'
                                        ELSE fav_source END,
                      caption = COALESCE(?, caption)
                    WHERE chat_id = ? AND message_id = ?
                    """,
                    (
                        clean_name(row["file_name"] or ""),
                        folder,
                        normalize_tags(row["tags"] or ""),
                        1 if row["favorite"] else 0,
                        row["caption"],
                        chat_id,
                        int(row["vault_message_id"]),
                    ),
                )
                changed += cur.rowcount
        return changed

    @staticmethod
    def clear_bot_vault(bot_db: Path, message_id: int) -> None:
        path = Path(bot_db)
        if not path.exists():
            return
        try:
            conn = sqlite3.connect(path, timeout=5)
            conn.execute("PRAGMA busy_timeout=5000")
            conn.execute(
                "UPDATE files SET vault_file_id = NULL, vault_message_id = NULL"
                " WHERE vault_message_id = ?",
                (message_id,),
            )
            conn.commit()
            conn.close()
        except sqlite3.Error:
            pass

    def sync_folder_to_bot(
        self, bot_db: Path, chat_id: int, folder: str, new_folder: str
    ) -> None:
        """Best-effort mirror of a folder rename into the bot's categories."""
        path = Path(bot_db)
        if not path.exists():
            return
        conn = None
        try:
            conn = sqlite3.connect(path, timeout=5)
            conn.execute("PRAGMA busy_timeout=5000")
            conn.execute("ATTACH DATABASE ? AS lib", (str(self.path),))
            conn.execute(
                "UPDATE files SET category = ? WHERE vault_message_id IN"
                " (SELECT message_id FROM lib.items WHERE chat_id = ?"
                " AND folder = ? COLLATE NOCASE)",
                (new_folder.lower(), int(chat_id), folder),
            )
            conn.commit()
            conn.execute("DETACH DATABASE lib")
        except sqlite3.Error:
            pass
        finally:
            if conn is not None:
                try:
                    conn.close()
                except sqlite3.Error:
                    pass

    @staticmethod
    def sync_to_bot(bot_db: Path, message_id: int, **fields: Any) -> None:
        """Best-effort mirror of explorer edits into the bot's own index."""
        path = Path(bot_db)
        if not path.exists():
            return
        allowed = {"name", "category", "tags", "favorite"}
        updates = {key: value for key, value in fields.items() if key in allowed}
        if not updates:
            return
        try:
            conn = sqlite3.connect(path, timeout=5)
            conn.execute("PRAGMA busy_timeout=5000")
            assignments = ", ".join(f"{key} = ?" for key in updates)
            conn.execute(
                f"UPDATE files SET {assignments} WHERE vault_message_id = ?",
                (*updates.values(), message_id),
            )
            conn.commit()
            conn.close()
        except sqlite3.Error:
            pass
