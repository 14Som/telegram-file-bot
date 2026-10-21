# Telegram File Storage Bot

Your files live in **Telegram's cloud** — this project keeps them organized. A local
SQLite index holds names, folders, tags and notes, and a native Windows app lets you
browse, preview, upload and download everything without a browser and without Bot API
size limits.

Two parts, and either one is optional:

- **Telegram File Explorer** — the Windows desktop app (the main way to use this)
- **Storage bot** — a chat bot for the same archive (`/search`, `/get`, …)

## Quick start (Windows)

1. Get `TelegramFileExplorer.exe` (it's in this repo) and put it in its own folder.
2. Double-click it and sign in with the **QR code**: Telegram on your phone →
   Settings → Devices → *Link Desktop Device*. The *Phone code* tab works too.
3. Choose the private channel that holds your files.
4. Set a 4-digit PIN when asked — it locks the app on every launch.

That's all. Needs Windows 10/11 (WebView2 is built into Windows 11). The app's server
listens on `127.0.0.1` only and never leaves your PC.

If your library was saved to the vault channel before, it comes back automatically on
launch — folders, names, tags, notes, favorites, thumbnails and settings.

## What the app does

- **Browse** All files, Recent, Favorites and Hidden; restore files you removed
- **Folders** — nested, with emoji icons, notes, and a collapsible sidebar tree
- **Search & filters** — text, tag, type, size, date, notes-only; six sort orders
- **Previews** — images, video, audio, PDF and text inline; downloads keep the
  original filename
- **Uploads** — drag & drop files or whole folder trees with per-file progress.
  Anything above Telegram's 2 GB limit (4 GB with Premium) is split into parts
  automatically and rejoined with one click, up to 64 GB
- **Bulk actions** — Ctrl-click, Shift-click or Ctrl+A, then Download ZIP, Favorite,
  Move, Copy links or Delete (up to 300 files at once)
- **Themes** — System, Light, Dark, Mica, Acrylic
- **Keyboard** — arrows move, Enter opens, F2 renames, Delete removes, Ctrl+F
  searches, Alt+←/→ goes back/forward
- **Automatic backup** — on close and after every sync, the whole library is zipped
  into the vault channel (newest 3 kept, hidden from the file list)

## The bot (optional)

The bot answers Telegram commands for the same archive. If `TelegramFileBot.exe` sits
next to the Explorer, the app starts and supervises it automatically — the **Bot** chip
in the title bar shows its status and toggles it on or off.

To set it up yourself:

1. [@BotFather](https://t.me/BotFather) → `/newbot` → copy the token
2. [@userinfobot](https://t.me/userinfobot) → copy your numeric ID
3. Copy `.env.example` to `.env` and fill in `BOT_TOKEN` and `OWNER_ID`
4. `py -m venv .venv`, then `pip install -r requirements.txt`, then `py bot.py`

`Start Bot.bat` and `Stop Bot.bat` do the same thing with a visible console and logs.

| Command | What it does |
|---|---|
| `/menu` | tappable menu for everything below |
| `/search <text>` | find files by name, caption, tag or category |
| `/get <id>` | send a stored file back to you |
| `/recent` `/favorites` `/cat <name>` `/tag <name>` | browse lists, paged and sortable |
| `/rename` `/move` `/retag` `/delete` | edit one file — or tap ⚙️ next to it instead |
| `/saveas <name>` | choose the name for your next upload before sending it |
| `/stats` `/backup` `/export [csv\|json]` | overview, snapshot now, download the index |
| `/source` | zip of the whole project (code, launchers, EXEs, index) — never the token |
| `/vault [sync]` | vault status; `sync` copies older files into the channel |

The bot works **only in a private chat** and only for `OWNER_ID`; group messages are
ignored. In any chat, typing `@YourBot <query>` searches your archive inline.

## Vault channel (second copy + library backup)

1. Create a **private channel** in Telegram
2. Add the bot as an **administrator** with *Post messages* rights — it DMs you a
   ready-to-paste `VAULT_CHAT_ID=-100...` line
3. Add that line to `.env` and restart the bot

New uploads are copied automatically; `/vault sync` copies the older ones. The Explorer
uses the same channel to store its library archive, which is what makes a fresh PC a
one-QR-scan restore.

## Where your data lives

| Location | Contents |
|---|---|
| `%APPDATA%\TelegramFileExplorer\` | login session, `library.db`, settings, thumbnails, log |
| `data\files.db` | the bot's index, plus `data\backups\` (latest 14, written daily) |
| `.env` | your bot token — never share it, never commit it |

The Explorer never reads `BOT_TOKEN`, and your login session is never uploaded anywhere.

## Build from source

Run `Build Explorer EXE.bat` — it installs PyInstaller into `.venv` and writes both
`TelegramFileExplorer.exe` and `TelegramFileBot.exe` to the project folder. Desktop
dependencies: `pip install -r desktop\requirements.txt`.

## Limits & safety

- Telegram allows 2 GB per file (4 GB with Premium); the app splits anything larger
- `/delete` removes the index entry only — the message in your chat is the actual copy
- A restored index works only with the **same bot token**, because Telegram file IDs
  are bot-specific. With a new bot, re-send the files to rebuild it
- If your token ever leaks, revoke it in @BotFather and put the new one in `.env`
