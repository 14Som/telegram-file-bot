#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
SERVICE_NAME="telegram-file-bot"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
RUN_USER="${SUDO_USER:-${USER}}"

if [[ "${EUID}" -eq 0 ]]; then
    echo "Run this as your normal user (for example 'ubuntu'), not as root."
    exit 1
fi

if [[ ! -f "${APP_DIR}/.env" ]]; then
    echo "Missing ${APP_DIR}/.env"
    echo "Create it first with BOT_TOKEN, OWNER_ID and optional VAULT_CHAT_ID."
    exit 1
fi

if ! grep -q '^BOT_TOKEN=.' "${APP_DIR}/.env"; then
    echo ".env is missing a BOT_TOKEN value."
    exit 1
fi

if ! grep -q '^OWNER_ID=[0-9]' "${APP_DIR}/.env"; then
    echo ".env is missing a numeric OWNER_ID."
    exit 1
fi

chmod 600 "${APP_DIR}/.env"
sed -i 's/\r$//' "${APP_DIR}/.env"

if ! command -v python3 >/dev/null 2>&1; then
    echo "Installing Python 3..."
    sudo apt-get update
    sudo apt-get install -y python3 python3-venv python3-pip
elif ! python3 -c 'import venv, ensurepip' >/dev/null 2>&1; then
    echo "Installing Python venv support..."
    sudo apt-get update
    sudo apt-get install -y python3-venv python3-pip
fi

if [[ ! -x "${APP_DIR}/.venv/bin/python" ]]; then
    python3 -m venv "${APP_DIR}/.venv"
fi

"${APP_DIR}/.venv/bin/python" -m pip install --upgrade pip
"${APP_DIR}/.venv/bin/python" -m pip install -r "${APP_DIR}/requirements.txt"

mkdir -p "${APP_DIR}/data"

sudo tee "${SERVICE_FILE}" >/dev/null <<EOF
[Unit]
Description=Telegram File Storage Bot
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=${RUN_USER}
WorkingDirectory=${APP_DIR}
Environment=PYTHONUNBUFFERED=1
ExecStart=${APP_DIR}/.venv/bin/python bot.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable "${SERVICE_NAME}"
sudo systemctl restart "${SERVICE_NAME}"
sleep 3

if ! sudo systemctl is-active --quiet "${SERVICE_NAME}"; then
    echo "The bot failed to start. Recent logs:"
    sudo journalctl -u "${SERVICE_NAME}" -n 40 --no-pager
    exit 1
fi

echo
echo "Bot is running as the '${SERVICE_NAME}' service."
echo "Status: sudo systemctl status ${SERVICE_NAME}"
echo "Logs:   sudo journalctl -u ${SERVICE_NAME} -f"
echo "Stop:   sudo systemctl stop ${SERVICE_NAME}"
