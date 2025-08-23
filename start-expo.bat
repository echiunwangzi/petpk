@echo off
chcp 65001 >nul
title Expo 開發伺服器 (隧道模式)

echo.
echo ========================================
echo    🚀 Expo 開發伺服器啟動器
echo ========================================
echo.

:: 檢查 Node.js 是否安裝
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 錯誤：未找到 Node.js
    echo 請先安裝 Node.js：https://nodejs.org/
    pause
    exit /b 1
)

:: 檢查是否在正確的目錄
if not exist "package.json" (
    echo ❌ 錯誤：未找到 package.json
    echo 請確保在正確的專案目錄中執行此檔案
    pause
    exit /b 1
)

:: 檢查 node_modules 是否存在
if not exist "node_modules" (
    echo 📦 正在安裝依賴套件...
    npm install
    if errorlevel 1 (
        echo ❌ 依賴安裝失敗
        pause
        exit /b 1
    )
)

echo.
echo 🚀 啟動隧道模式...
echo 📱 支援任何網路環境連接
echo 🌐 可以從不同地點連接
echo ⚡ 自動處理防火牆問題
echo.

npx expo start --tunnel

echo.
echo 👋 開發伺服器已停止
pause 