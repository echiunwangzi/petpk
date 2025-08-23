@echo off
chcp 65001 >nul
title Expo 快速啟動

echo.
echo 🚀 啟動 Expo 開發伺服器 (隧道模式)
echo.

:: 檢查依賴
if not exist "node_modules" (
    echo 📦 安裝依賴中...
    npm install
)

:: 啟動服務
echo 🌐 啟動隧道模式...
echo 📱 支援任何網路環境連接
echo.
npx expo start --tunnel

pause 