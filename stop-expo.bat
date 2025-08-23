@echo off
chcp 65001 >nul
title 停止 Expo 服務

echo.
echo 🛑 正在停止 Expo 開發伺服器...
echo.

:: 停止所有 Node.js 進程
taskkill /f /im node.exe >nul 2>&1

echo ✅ Expo 服務已停止
echo.
pause 