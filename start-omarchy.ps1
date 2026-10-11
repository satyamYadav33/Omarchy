# Omarchy Linux Desktop PowerShell Launcher
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  OMARCHY LINUX - THE AGENTIC OS (LITE CLONE)" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "Starting high-end lightweight Omarchy environment..." -ForegroundColor Green

Set-Location $PSScriptRoot

if (Get-Command node -ErrorAction SilentlyContinue) {
    node omarchy-desktop/server.js
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    Start-Process "http://localhost:4040"
    python -m http.server 4040 -d omarchy-desktop
} else {
    Start-Process "$PSScriptRoot\omarchy-desktop\index.html"
}
