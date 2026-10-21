# Hidden watcher: starts the bot whenever the Telegram desktop app is open.
# Installed by "Setup Autostart.bat" (runs from the Startup folder at logon).

$botDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$launcher = Join-Path $botDir "Start Bot.bat"
$pythonExe = Join-Path $botDir ".venv\Scripts\python.exe"

if (-not (Test-Path $pythonExe)) { exit 1 }

function Test-TelegramRunning {
    return [bool](Get-Process | Where-Object { $_.Name -like "*elegram*" })
}

function Test-BotRunning {
    if (Get-Process -Name 'TelegramFileBot' -ErrorAction SilentlyContinue) { return $true }
    $procs = Get-CimInstance Win32_Process -Filter "Name = 'python.exe' OR Name = 'pythonw.exe' OR Name = 'cmd.exe'" -ErrorAction SilentlyContinue
    foreach ($p in $procs) {
        $cl = $p.CommandLine
        if ($cl -like "*bot.py*" -or $cl -like "*Start Bot.bat*") { return $true }
    }
    return $false
}

while ($true) {
    if ((Test-TelegramRunning) -and -not (Test-BotRunning)) {
        Start-Process -FilePath $launcher -WindowStyle Minimized
    }
    Start-Sleep -Seconds 15
}
