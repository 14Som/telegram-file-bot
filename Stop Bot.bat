@echo off
title Stop Telegram File Bot
powershell -NoProfile -Command "$bots = Get-CimInstance Win32_Process -Filter \"Name = 'python.exe' OR Name = 'pythonw.exe'\" | Where-Object { $_.CommandLine -like '*bot.py*' }; if ($bots) { $bots | ForEach-Object { Stop-Process -Id $_.ProcessId -Force; Write-Host ('Stopped bot (PID ' + $_.ProcessId + ')') } }; $exe = Get-Process -Name 'TelegramFileBot' -ErrorAction SilentlyContinue; if ($exe) { $exe | Stop-Process -Force; Write-Host 'Stopped TelegramFileBot.exe' }; if (-not $bots -and -not $exe) { Write-Host 'Bot is not running.' }"
echo.
pause
