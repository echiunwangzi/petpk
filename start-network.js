const { exec } = require('child_process');
const os = require('os');

// 獲取本機 IP 地址
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return '127.0.0.1';
}

const localIP = getLocalIP();
console.log(`🌐 本機 IP 地址: ${localIP}`);
console.log('📱 網路連接選項:');
console.log('1. 本地網路 (LAN) - 同一 WiFi 下的裝置');
console.log('2. 隧道模式 (Tunnel) - 任何網路都能連接');
console.log('3. 本地模式 (Local) - 僅本機測試');

// 啟動不同模式的函數
function startExpo(mode) {
  let command;
  
  switch(mode) {
    case 'lan':
      command = `npx expo start --lan --host ${localIP}`;
      console.log(`🚀 啟動 LAN 模式，使用 IP: ${localIP}`);
      break;
    case 'tunnel':
      command = 'npx expo start --tunnel';
      console.log('🚀 啟動隧道模式，支援任何網路連接');
      break;
    case 'local':
      command = 'npx expo start --localhost';
      console.log('🚀 啟動本地模式，僅限本機測試');
      break;
    default:
      console.log('❌ 無效的模式');
      return;
  }
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ 錯誤: ${error}`);
      return;
    }
    console.log(stdout);
  });
}

// 如果直接執行此腳本
if (require.main === module) {
  const mode = process.argv[2] || 'tunnel';
  startExpo(mode);
}

module.exports = { startExpo, getLocalIP }; 