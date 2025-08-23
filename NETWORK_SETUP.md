# 🌐 網路連接配置指南

## 📱 不同網路環境的連接方式

### 1. 隧道模式 (推薦 - 支援任何網路)
適用於：不同網路、不同地點的裝置連接

```bash
npm run start:tunnel
# 或
npx expo start --tunnel
```

**優點：**
- ✅ 支援任何網路環境
- ✅ 不需要在同一 WiFi 下
- ✅ 可以從任何地方連接
- ✅ 自動處理防火牆問題

**缺點：**
- ⚠️ 連接速度可能較慢
- ⚠️ 需要網路連接

### 2. 本地網路模式 (LAN)
適用於：同一 WiFi 網路下的裝置

```bash
npm run start:lan
# 或
npx expo start --lan
```

**優點：**
- ✅ 連接速度快
- ✅ 穩定可靠
- ✅ 適合開發測試

**缺點：**
- ⚠️ 需要裝置在同一網路
- ⚠️ 可能受防火牆影響

### 3. 本地模式 (Local)
適用於：僅本機測試

```bash
npm run start:local
# 或
npx expo start --localhost
```

**優點：**
- ✅ 最快速
- ✅ 最穩定
- ✅ 適合模擬器測試

**缺點：**
- ⚠️ 僅限本機使用
- ⚠️ 無法從其他裝置連接

## 🔧 網路故障排除

### 問題 1：無法掃描 QR 碼
**解決方案：**
1. 確保手機和電腦在同一網路
2. 嘗試使用隧道模式
3. 檢查防火牆設定

### 問題 2：連接超時
**解決方案：**
1. 重新啟動 Expo 開發伺服器
2. 清除 Expo Go 快取
3. 檢查網路連接

### 問題 3：隧道模式無法連接
**解決方案：**
1. 檢查網路連接
2. 嘗試使用 LAN 模式
3. 重新安裝 Expo CLI

## 📋 快速命令參考

```bash
# 隧道模式 (推薦)
npm run start:tunnel

# 本地網路模式
npm run start:lan

# 本地模式
npm run start:local

# 查看網路資訊
node start-network.js
```

## 🌍 網路配置腳本

專案包含 `start-network.js` 腳本，可以：
- 自動檢測本機 IP 地址
- 提供三種網路模式
- 顯示詳細的連接資訊

## 📱 Expo Go 使用提示

1. **安裝 Expo Go**：
   - iOS: App Store 搜尋 "Expo Go"
   - Android: Google Play 搜尋 "Expo Go"

2. **掃描 QR 碼**：
   - 開啟 Expo Go
   - 點擊 "Scan QR Code"
   - 掃描終端機中的 QR 碼

3. **手動輸入**：
   - 如果掃描失敗，可以手動輸入 URL
   - URL 格式：`exp://IP:PORT`

## 🔒 安全注意事項

- 隧道模式會將您的應用程式暴露到網際網路
- 僅在開發環境使用
- 生產環境請使用適當的安全措施 