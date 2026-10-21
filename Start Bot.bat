@echo off
title Telegram File Storage Bot
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
    echo The virtual environment is missing. In this folder run:
    echo     py -m venv .venv
    echo     .venv\Scripts\python -m pip install -r requirements.txt
    pause
    exit /b 1
)
".venv\Scripts\python.exe" bot.py
echo.
echo Bot stopped.
pause
