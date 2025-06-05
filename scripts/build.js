const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 确保目录存在
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// 清理构建目录
const clean = () => {
  console.log('🧹 清理构建目录...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
  }
  ensureDir('dist');
};

// 运行 webpack 构建
const build = () => {
  return new Promise((resolve, reject) => {
    console.log('🏗️ 运行 webpack 构建...');
    const webpack = exec('webpack --config webpack.config.js --progress', 
      { maxBuffer: 1024 * 1024 * 10 }, // 增加缓冲区大小
      (error, stdout, stderr) => {
        if (error) {
          console.error('构建失败，详细错误：', stderr);
          reject(error);
          return;
        }
        console.log(stdout);
        resolve();
      });

    // 实时输出构建日志
    webpack.stdout.pipe(process.stdout);
    webpack.stderr.pipe(process.stderr);
  });
};

// 准备图标
const prepareIcons = () => {
  console.log('🎨 准备图标文件...');
  const iconSizes = [16, 32, 48, 128];
  
  ensureDir('dist/assets/icons');
  
  // 复制已有的图标文件
  iconSizes.forEach(size => {
    const source = path.join('src', 'assets', 'icons', `icon${size}.png`);
    const target = path.join('dist', 'assets', 'icons', `icon${size}.png`);
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, target);
    }
  });
};

// 创建 zip 包
const createZip = () => {
  return new Promise((resolve, reject) => {
    console.log('📦 创建发布包...');
    exec('cd dist && zip -r ../easy-todo.zip *', (error, stdout, stderr) => {
      if (error) {
        console.error('创建 zip 包失败:', error);
        reject(error);
        return;
      }
      console.log('✅ 发布包已创建: easy-todo.zip');
      resolve();
    });
  });
};

// 主构建流程
const main = async () => {
  try {
    clean();
    await build();
    prepareIcons();
    await createZip();
    console.log('🎉 构建完成!');
  } catch (error) {
    console.error('构建过程中出现错误:', error);
    process.exit(1);
  }
};

main();