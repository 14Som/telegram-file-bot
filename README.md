# Telegram File Storage Bot

A personal Telegram bot that turns your chat with it into a searchable file archive.
Files are **stored in Telegram's cloud** (up to 2 GB per file, 4 GB with Premium) and
indexed in a **local SQLite database** — nothing big ever touches your disk. The bot
re-sends any file instantly via Telegram file references, so retrieval works at any
size.

## Features

- Send any document, photo, video, audio, voice message, GIF or sticker — indexed
  with name, size, type, category and tags
- **Categories**: put a file in a category with `@name` in the caption; the
  default is auto-detected from the file type and extension (3D Models, Archives,
  Software, Documents, Images, Videos, Audio, Ebooks, ...) — change it later
  with `/move`
- **Tags**: `#hashtags` in the caption become tags; `/retag` replaces them later
- **Rename**: `/rename <id> <new name>`
- **Search**: `/search <text>` matches names, captions, tags and categories
- **Button menu**: `/menu` groups every command into tappable sections
- **Per-file actions**: tap ⚙️ next to any file to send, favorite, rename, move,
  retag or delete it — with guided prompts instead of typed commands
- **Favorites**: star files and open them from the ⭐ Favorites view
- **Paged results**: every list is 10 per page with *Show more*, and can be sorted
  by newest, oldest, largest or smallest
- **Inline mode**: type `@YourBotName <query>` in *any* chat to search your archive
  and send files there
- **Private**: locked to your numeric user ID and ignored entirely in group chats
- **Backups**: a snapshot is written at every start and once a day (latest 14 kept);
  `/backup` makes one on demand and `/export` sends the index as CSV or JSON
- **Desktop Explorer (optional)**: a Windows Explorer-style window for the same
  private channel — account login, thumbnails, instant video/audio previews,
  drag-and-drop **file and folder uploads**, streaming **folder ZIP downloads**,
  advanced size/date/note filters, per-file and per-folder notes, custom folder
  icons, collapsible sidebar folders, System/Light/Dark/Mica/Acrylic themes,
  folders, tags, search, sorting, rename and restore
- **App lock**: the Explorer can require a 4-digit PIN on open (Settings →
  Security); the library and every file-data request stay hidden until it is
  entered, the title-bar lock button locks it instantly, and only a salted hash
  of the PIN is stored
- **Source archive**: `/source` (or **💾 Data → 📦 Source archive**) sends a zip of
  the bot code, the desktop Explorer, the built Windows EXEs and an index
  snapshot, so the whole project lives in Telegram too. It includes
  `RESTORE.txt`, never `.env`, the token, the venv, logs or the Explorer's
  local session
- **Vault (optional)**: mirror every file into a private channel so the archive
  survives even if your chat with the bot is deleted; `/vault sync` copies older
  files
- Duplicate detection and `/stats` overview

## Setup

1. **Create the bot** — message [@BotFather](https://t.me/BotFather) on Telegram:
   - `/newbot` → follow the prompts → copy the API token
   - `/setinline` → select your bot → set a placeholder like `Search my files...`
     *(required for the inline feature)*
2. **Get your user ID** — message [@userinfobot](https://t.me/userinfobot) and copy
   the numeric `Id`.
3. **Configure** — copy `.env.example` to `.env` and fill in:
   ```
   BOT_TOKEN=123456:ABC-your-token
   OWNER_ID=123456789
   ```
4. **Install & run** (Windows):
   ```
   py -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   py bot.py
   ```
   `BOT_TOKEN` and `OWNER_ID` are both required — the bot will refuse to start
   without them. The optional `VAULT_CHAT_ID` is described under *Vault channel*
   below.
5. Open your bot in Telegram, send `/start`, then send it a file with a caption like
   `@invoices #tax #2026`.

## Desktop Explorer (optional)

A Windows app with an Explorer-style window for the same channel. It signs in as
your **Telegram account** with MTProto (not with the bot token), so previews,
streaming and uploads have no Bot API size limits.

**Install once** in the project folder:

```
.venv\Scripts\python -m pip install -r desktop\requirements.txt
```

Then run **`Start Explorer.bat`**. On first launch:

1. Sign in on either tab — no my.telegram.org setup is required:
   - **QR code** — open Telegram on your phone → Settings → Devices → *Link
     Desktop Device*, then scan the code. The code refreshes automatically.
   - **Phone code** — enter your number with country code; Telegram sends the
     login code as a service message inside the app. Enter your 2FA password if
     you use one.
2. Choose the private channel that holds your files. Pick the bot's vault channel
   if you want the Explorer to adopt the names, categories and tags from the bot's
   index.

The Explorer ships with Telegram's published desktop app credentials, so sign-in
works immediately. They are shared, so if Telegram rate-limits them, open **Use
my own** on the sign-in screen and add a personal **API ID** and **API hash** from
[my.telegram.org/apps](https://my.telegram.org/apps) (they identify the app, not
your account). If that site says *Too many attempts*, it is a temporary IP limit —
use QR sign-in now and retry later or from another network.

**Standalone window (EXE)** — double-click `TelegramFileExplorer.exe` (or the
**Telegram File Explorer** desktop shortcut). The EXE hosts the UI in its own
window through Windows' built-in WebView2 control; it does not start Edge or any
browser window. The `127.0.0.1` address is internal to that window and never
needs to be opened in a browser. Build the EXE with **`Build Explorer EXE.bat`**
(installs PyInstaller in `.venv` and writes `TelegramFileExplorer.exe` to the
project folder). Keep the EXE next to `.env` and `data\` if you want it to reuse
the bot's index and vault channel; its login and library still live in
`%APPDATA%\TelegramFileExplorer`.

**What it can do**

- **The vault stores your library too**: on every close (and after every sync)
  the Explorer packs its index — folders, names, tags, notes, favorites — plus
  all thumbnails and its settings into a `tfe-data` archive inside the vault
  channel (the newest 3 are kept; they are auto-hidden from the file list).
  On launch the newest archive is restored automatically, so the whole
  library comes back even if the PC's data folder or the EXE is deleted. The
  login session itself never leaves the PC — sign in again with one QR scan
- **One click runs everything**: opening the Explorer also starts the storage
  bot (`TelegramFileBot.exe` kept in the same folder). A **Bot** chip in the
  title bar shows green while the bot answers your Telegram commands; click it
  to stop or start the bot. If the bot crashes the Explorer restarts it, and
  closing the Explorer leaves the bot running — the next launch just adopts it
- Browse All files, Recent, Favorites and **Hidden**; restore files you removed
  from the library
- Multi-select with Ctrl+click, Shift+click and Ctrl+A; a bulk bar offers
  Download (ZIP), Favorite, Move to folder, Copy Telegram links and Delete for
  the whole selection (up to 300 files)
- Nested folders with custom emoji icons and notes; rename, move and delete empty
  folders; download any folder as a streaming ZIP
- Tags, favorites, search, type filter, advanced filters (size, date, notes-only,
  include subfolders) and six sort orders
- Per-file notes that are searchable and stay in the local index
- Inline image, video, audio, PDF and text previews; downloads keep the original
  filename and support range requests
- Drag-and-drop or button uploads for files and whole folder trees, with per-file
  progress. There are no app-side daily caps — uploads follow your Telegram
  account's own limit (2 GB per file, 4 GB with Premium). Larger files are split
  into archive parts automatically and joined back with one click on any part
- Themes: **System**, **Light**, **Dark**, **Mica** and **Acrylic** (translucent
  blotter-style surfaces)
- Keyboard: arrow keys to move, Enter/Space to open, F2 to rename, Delete to remove,
  Ctrl+A to select all, Ctrl+F to search, Alt+Left/Right to go back/forward,
  Esc to clear the selection
- Settings → **Quit app** stops the local server; closing the app window also
  stops it

**Where things live** — `%APPDATA%\TelegramFileExplorer`:

| Path | Contents |
|---|---|
| `session\telegram.session` | your Telegram login (delete to sign out; never uploaded anywhere) |
| `library.db` | folders, tags, names and message references (mirrored into the vault) |
| `settings.json` | optional personal API credentials and selected channel (mirrored into the vault) |
| `thumbs\`, `cache\`, `explorer.log` | preview cache and logs (thumbnails mirrored into the vault) |
| `vault_data.json` | timestamp of the last vault save/restore |

The Explorer never reads `BOT_TOKEN` and never writes outside your profile. Its
server listens only on `127.0.0.1`, requires a per-run cookie for every API call
and runs in its own application window.

## Commands

| Command | What it does |
|---|---|
| `/menu` | button menu with every command, grouped |
| `/search <text>` | find files by name, caption, `#tag` or category |
| `/tag <name>` | all files with a tag |
| `/tags` | list all your tags |
| `/cat <name>` | all files in a category |
| `/cats` | list categories |
| `/recent` | paged list of the most recent files |
| `/favorites` | your starred files |
| `/get <id>` | send a stored file back |
| `/rename <id> <new name>` | rename a file |
| `/saveas <name>` | save your **next** upload under a custom name (great for photos/videos with no filename) |
| `/cancelname` | cancel a pending `/saveas` name |
| `/move <id> <category>` | change a file's category |
| `/retag <id> #tag1 #tag2` | replace a file's tags |
| `/delete <id>` | remove a file from the index |
| `/cancel` | cancel a pending guided rename, move or retag |
| `/stats` | counts by type, total size, categories |
| `/backup` | snapshot the local database now |
| `/export [csv\|json]` | send the whole index as a CSV or JSON file |
| `/source` | send a zip of the bot code, the desktop Explorer, the built EXEs and an index snapshot (no token, includes `RESTORE.txt`) |
| `/vault [sync]` | vault status; `sync` copies older files to the channel |

Search results and the browse views are paged 10 at a time: use **⬇️ Show more**
for the next page and the sort row to switch between newest, oldest, largest and
smallest.

## Button menu

`/start` and `/menu` show a tappable menu instead of a wall of commands:

- **📚 Browse** — Recent, Favorites, Categories, Tags, Stats, Search. Recent,
  category, tag and favorite views are built from your actual library, with paging
  and sorting; each file has a send button and a ⚙️ action button.
- **🛠 Organize** — Rename, Move, Retag, Delete. These need arguments, so tapping
  one shows the exact command with an example (and a shortcut to see file IDs).
  You can also do all of this from the ⚙️ panel next to any file.
- **☁️ Upload** — set a custom name for the next upload, or cancel a pending one.
- **💾 Data** — export CSV/JSON, back up now, download a source archive, vault
  status and sync.
- **❓ Help** — the full command reference.

Every list message also gets a **🎛 Menu** button, so you can return to the menu
from anywhere. The same menu message updates in place as you move between
sections.

### Per-file action panel

Tap **⚙️** beside a file in any list to open its panel:

- **📤 Send** — re-send the file
- **⭐ / ☆ Favorite** — toggle the star
- **✏️ Rename**, **📁 Move**, **🏷 Retag** — the bot asks for the new value;
  reply to the message with it (or `/cancel`)
- **🗑 Delete** — asks for confirmation, then removes only the index entry
- **✖ Close** — dismiss the panel

### Vault channel (optional second copy)

Telegram cloud storage is already durable, but if you delete your chat with the
bot the messages go too. The vault keeps a second copy in a private channel:

1. Create a **private channel** in Telegram.
2. Add this bot as an **administrator** with *Post messages* rights. As soon as
   it is added, the bot DMs you the channel ID as a ready-to-paste line:
   `VAULT_CHAT_ID=-100...`.
3. Add that line to `.env` in the project folder:
   ```
   VAULT_CHAT_ID=-1001234567890
   ```
   Manual fallback: copy any post's link from the channel — it looks like
   `https://t.me/c/1234567890/12` — and use `-1001234567890`.
4. Restart the bot. New uploads are copied automatically; run `/vault sync`
   (or tap **🔄 Sync existing files**) to copy your older files.

If the vault copy is unavailable, the bot falls back to the original file
reference automatically.

## Data safety

- `data/files.db` is the only local state — the files themselves live in
  Telegram. Snapshots are written to `data/backups/` at startup and every 24
  hours; the latest 14 are kept.
- `/backup` writes a snapshot immediately; `/export csv` or `/export json`
  downloads a copy of the index you can keep off-device.
- `/source` builds a portable zip containing the scripts, launchers, README,
  `.env.example`, `RESTORE.txt`, a consistent snapshot of `data/files.db` and
  the built Windows EXEs (`TelegramFileExplorer.exe`, `TelegramFileBot.exe`).
  Download it from the chat (or let the bot copy it to the vault channel) and
  you can restore the whole project on another PC. It deliberately **excludes
  `.env` and your token** — recreate `.env` after extracting. Existing file
  references in the snapshot only work with the **same bot token**, because
  Telegram file IDs are bot-specific; with a new bot, re-send the files to
  rebuild the index.
- The index does **not** contain the files themselves, just Telegram file
  references and metadata — losing it means re-sending files to rebuild it, but
  your Telegram messages are untouched. Keep a backup anyway.

## Inline mode

In any chat (including Saved Messages), type `@YourBotName` + space + query.
Matching files appear as tappable results and are sent into that chat instantly.
An empty query shows your 10 most recent files plus an *Open bot for commands*
button. Only you see results — everyone else gets nothing.

## Starting and stopping

**Easiest — just open the Explorer.** `TelegramFileExplorer.exe` starts the bot
automatically (`TelegramFileBot.exe` in the same folder, started hidden — no
console). The **Bot** chip in the title bar shows the live status; click it to
stop or start the bot. A single-instance lock makes it impossible to run two
pollers by accident, and `data\bot.log` keeps the bot's output.

Manual controls still work:

- **Start the bot**: double-click `Start Bot.bat` — a console window opens with
  live logs; closing it stops the bot
- **Stop the bot**: double-click `Stop Bot.bat` (stops both the exe and any
  console copy)

The bot only responds while it's running. Messages sent while it's offline are
delivered when it starts again, so nothing is lost.

## Start automatically when you open Telegram

1. Double-click `Setup Autostart.bat` and choose **Enable**
2. From your next logon, a hidden watcher runs in the background. Whenever the
   Telegram desktop app is open, it starts the bot in a minimized window (and
   restarts it within ~15 seconds if it crashes)
3. Closing Telegram does **not** stop the bot — use `Stop Bot.bat` when you
   want it off
4. To undo: `Setup Autostart.bat` → **Disable**

Configure `.env` first — otherwise the watcher will open an error window each
time Telegram starts.

## True 24/7 (optional)

`Setup Autostart.bat` ties the bot to Telegram being open. To run it around the
clock instead, use Task Scheduler:

1. Press `Win + R`, type `taskschd.msc`, press Enter
2. **Create Task...** → General: name it `Telegram File Bot`, check *Run
   whether user is logged on or not*
3. Triggers → New → *At startup*
4. Actions → New → *Start a program*:
   - Program/script: `C:\path\to\telegram-file-bot\.venv\Scripts\pythonw.exe`
   - Add arguments: `bot.py`
   - Start in: `C:\path\to\telegram-file-bot`
5. Settings tab: uncheck *Stop the task if it runs longer than*

Keep the PC awake (Settings → System → Power) and back up `data\files.db`
occasionally — it's your entire index; the files themselves are safe in
Telegram's cloud regardless.

## Linux cloud VM (free Oracle tier)

The bot runs unchanged on a Linux server. Oracle Cloud's Always Free tier
includes an AMD micro VM (1 GB RAM) in Mumbai or Hyderabad — enough for this
bot. Create an Ubuntu 24.04 instance, upload the project, create `.env` next
to `bot.py`, then run:

```
bash deploy/install.sh
```

That installs the dependencies and registers `telegram-file-bot` as a systemd
service: it starts on boot and restarts after crashes. Follow its logs with:

```
sudo journalctl -u telegram-file-bot -f
```

Stop the Windows bot and disable the autostart watcher before starting the
cloud copy — only one instance can poll. Oracle may stop Always Free VMs it
considers idle; start the instance again from the console if that happens.

## Notes & limits

- Telegram allows **2 GB per file** (4 GB with Telegram Premium) — the bot handles
  any of these since it never downloads, only indexes and re-sends
- `/delete` removes the file from the index; the original message in your chat
  with the bot remains (that's the actual cloud storage)
- The bot works **only in a private chat** and only for the `OWNER_ID` account;
  messages and buttons in groups are ignored
- Paged lists are kept in memory: after the bot restarts, re-run the search or
  browse command (buttons on old list messages will ask you to do so)
- Never share your `.env` — the token controls the bot
