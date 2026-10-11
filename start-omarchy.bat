@echo off
title Omarchy Linux Desktop (Lite Clone)
echo ======================================================
echo   OMARCHY LINUX - THE AGENTIC OS (LITE CLONE)
echo ======================================================
echo Starting local Omarchy Desktop environment...

cd /d "%~dp0"

where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    node omarchy-desktop/server.js
) else (
    where python >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        echo Node not found, starting with Python server...
        start http://localhost:4040
        python -m http.server 4040 -d omarchy-desktop
    ) else (
        echo Neither Node nor Python found. Opening index.html directly...
        start omarchy-desktop/index.html
    )
)
pause
