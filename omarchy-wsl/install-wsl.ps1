# Omarchy Linux WSL Provisioner
# Automatically equips your Windows WSL distribution with the Omarchy Agentic OS toolchain

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  OMARCHY LINUX — WSL PROVISIONER" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan

$wslDistros = wsl -l -q | Where-Object { $_ -match '\S' } | ForEach-Object { $_.Trim().Replace("`0", "") }

if ($wslDistros.Count -eq 0) {
    Write-Host "No WSL distribution found. Please install Ubuntu using 'wsl --install -d Ubuntu'." -ForegroundColor Red
    exit 1
}

$chosenDistro = $wslDistros[0]
Write-Host "Target WSL Distribution: $chosenDistro" -ForegroundColor Green

$scriptPath = (Get-Item "$PSScriptRoot\install-omarchy.sh").FullName
# Convert Windows path to wslpath
$wslPath = wsl -d $chosenDistro wslpath -u ($scriptPath -replace '\\', '/')

Write-Host "Running Omarchy installation inside $chosenDistro..." -ForegroundColor Cyan
wsl -d $chosenDistro bash $wslPath

Write-Host ""
Write-Host "======================================================" -ForegroundColor Green
Write-Host "✔ Omarchy Linux is now active inside your WSL!" -ForegroundColor Green
Write-Host "To enter Omarchy terminal, simply type in PowerShell:" -ForegroundColor Yellow
Write-Host "  wsl -d $chosenDistro omarchy info" -ForegroundColor White
Write-Host "======================================================" -ForegroundColor Green
