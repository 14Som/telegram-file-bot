@echo off
setlocal
:menu
cls
echo.
echo  ============================================
echo   Telegram File Bot - Autostart Setup
echo  ============================================
echo.
echo   A hidden watcher will start the bot
echo   automatically whenever the Telegram app
echo   is open on this PC.
echo.
echo   1. Enable autostart
echo   2. Disable autostart
echo   3. Exit
echo.
set /p choice="  Choose 1, 2 or 3: "
if "%choice%"=="1" goto enable
if "%choice%"=="2" goto disable
if "%choice%"=="3" exit /b 0
goto menu

:enable
powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $lnk = $ws.CreateShortcut([Environment]::GetFolderPath('Startup') + '\Telegram File Bot Watcher.lnk'); $lnk.TargetPath = 'powershell.exe'; $lnk.Arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File \"%~dp0watch_telegram.ps1\"'; $lnk.WorkingDirectory = '%~dp0'; $lnk.Description = 'Starts the Telegram file bot whenever Telegram is open'; $lnk.Save(); Write-Host 'Autostart ENABLED - the bot will start whenever Telegram is open.'"
echo.
echo  Takes effect from your next logon. To start the bot right now,
echo  double-click "Start Bot.bat".
echo.
pause
exit /b 0

:disable
powershell -NoProfile -Command "Remove-Item -LiteralPath (Join-Path ([Environment]::GetFolderPath('Startup')) 'Telegram File Bot Watcher.lnk') -ErrorAction SilentlyContinue; Write-Host 'Autostart DISABLED.'"
echo.
pause
exit /b 0
