const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 检查Chrome是否正在运行扩展
const checkExtensionStatus = () => {
  console.log('📋 检查扩展状态...');
  if (fs.existsSync('dist/manifest.json')) {
    const manifest = JSON.parse(fs.readFileSync('dist/manifest.json', 'utf8'));
    console.log(`✅ 扩展已构建: ${manifest.name} v${manifest.version}`);
  } else {
    console.log('⚠️  扩展尚未构建，请先运行 npm run build');
  }
};

// 启动开发服务器
const startDev = () => {
  return new Promise((resolve, reject) => {
    console.log('🔧 启动开发模式...');
    
    const webpackCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const devProcess = spawn(webpackCmd, ['webpack', '--config', 'webpack.config.js', '--watch', '--progress'], {
      stdio: 'inherit',
      shell: true
    });

    devProcess.on('error', (error) => {
      console.error('启动开发服务器失败:', error);
      reject(error);
    });

    // 监听Ctrl+C中断
    process.on('SIGINT', () => {
      console.log('\n🛑 正在停止开发服务器...');
      devProcess.kill('SIGINT');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 正在停止开发服务器...');
      devProcess.kill('SIGTERM');
      process.exit(0);
    });
  });
};

// 主函数
const main = async () => {
  try {
    console.log('🚀 Easy Todo 开发模式');
    console.log('📝 文件变化将自动重新构建');
    console.log('🔄 在Chrome扩展管理页面点击刷新按钮来重新加载扩展');
    console.log('⚡ 按 Ctrl+C 停止开发服务器\n');
    
    checkExtensionStatus();
    await startDev();
  } catch (error) {
    console.error('❌ 开发模式启动失败:', error.message);
    process.exit(1);
  }
};

main();
