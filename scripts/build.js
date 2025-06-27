#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI 颜色代码
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

function log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    log('\n' + '='.repeat(50), 'cyan');
    log(`  ${title}`, 'cyan');
    log('='.repeat(50), 'cyan');
}

// 项目根目录
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// 读取版本信息
function getVersionInfo() {
    const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
    const manifestPath = path.join(ROOT_DIR, 'manifest.json');
    let manifestVersion = packageJson.version;
    
    if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        manifestVersion = manifest.version;
    }
    
    return {
        packageVersion: packageJson.version,
        manifestVersion: manifestVersion,
        buildTime: new Date().toISOString(),
        buildNumber: Date.now()
    };
}

// 环境检查
function checkEnvironment() {
    logSection('环境检查');
    
    const versionInfo = getVersionInfo();
    
    // 检查 Node.js 版本
    const nodeVersion = process.version;
    log(`Node.js 版本: ${nodeVersion}`, 'green');
    log(`项目版本: ${versionInfo.packageVersion}`, 'green');
    log(`扩展版本: ${versionInfo.manifestVersion}`, 'green');
    
    // 版本一致性检查
    if (versionInfo.packageVersion !== versionInfo.manifestVersion) {
        log(`警告: package.json (${versionInfo.packageVersion}) 和 manifest.json (${versionInfo.manifestVersion}) 版本不一致`, 'yellow');
    }
    
    // 检查必要的文件
    const requiredFiles = [
        'webpack.config.js',
        'tsconfig.json',
        'src/popup.ts',
        'src/background.ts',
        'src/popup.html'
    ];
    
    for (const file of requiredFiles) {
        const filePath = path.join(ROOT_DIR, file);
        if (!fs.existsSync(filePath)) {
            log(`错误: 缺少必要文件 ${file}`, 'red');
            process.exit(1);
        }
        log(`✓ ${file}`, 'green');
    }
    
    // 检查 node_modules
    if (!fs.existsSync(path.join(ROOT_DIR, 'node_modules'))) {
        log('警告: node_modules 不存在，尝试安装依赖...', 'yellow');
        try {
            execSync('npm install', { cwd: ROOT_DIR, stdio: 'inherit' });
        } catch (error) {
            log('错误: 依赖安装失败', 'red');
            process.exit(1);
        }
    }
}

// 清理构建目录
function cleanBuild() {
    logSection('清理构建目录');
    
    if (fs.existsSync(DIST_DIR)) {
        fs.rmSync(DIST_DIR, { recursive: true, force: true });
        log('✓ 清理 dist 目录', 'green');
    }
    
    // 创建 dist 目录
    fs.mkdirSync(DIST_DIR, { recursive: true });
    log('✓ 创建 dist 目录', 'green');
}

// TypeScript 编译
function buildTypeScript() {
    logSection('TypeScript 编译');
    
    try {
        execSync('npx webpack --mode=production', { 
            cwd: ROOT_DIR, 
            stdio: 'inherit',
            env: { ...process.env, NODE_ENV: 'production' }
        });
        log('✓ TypeScript 编译成功', 'green');
    } catch (error) {
        log('错误: TypeScript 编译失败', 'red');
        process.exit(1);
    }
}

// 复制静态文件
function copyStaticFiles() {
    logSection('复制静态文件');
    
    const filesToCopy = [
        { src: 'src/popup.html', dest: 'popup.html' },
        { src: 'src/styles.css', dest: 'styles.css' },
        { src: 'manifest.json', dest: 'manifest.json' }
    ];
    
    for (const { src, dest } of filesToCopy) {
        const srcPath = path.join(ROOT_DIR, src);
        const destPath = path.join(DIST_DIR, dest);
        
        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
            log(`✓ 复制 ${src} -> ${dest}`, 'green');
        } else {
            log(`警告: 源文件不存在 ${src}`, 'yellow');
        }
    }
    
    // 复制图标文件
    const iconsDir = path.join(SRC_DIR, 'assets', 'icons');
    const distIconsDir = path.join(DIST_DIR, 'assets', 'icons');
    
    if (fs.existsSync(iconsDir)) {
        fs.mkdirSync(distIconsDir, { recursive: true });
        const iconFiles = fs.readdirSync(iconsDir);
        
        for (const iconFile of iconFiles) {
            fs.copyFileSync(
                path.join(iconsDir, iconFile),
                path.join(distIconsDir, iconFile)
            );
            log(`✓ 复制图标 ${iconFile}`, 'green');
        }
    }
    
    // 复制国际化文件
    const i18nDir = path.join(SRC_DIR, 'assets', 'i18n');
    const distI18nDir = path.join(DIST_DIR, 'assets', 'i18n');
    
    if (fs.existsSync(i18nDir)) {
        fs.mkdirSync(distI18nDir, { recursive: true });
        const i18nFiles = fs.readdirSync(i18nDir);
        
        for (const i18nFile of i18nFiles) {
            fs.copyFileSync(
                path.join(i18nDir, i18nFile),
                path.join(distI18nDir, i18nFile)
            );
            log(`✓ 复制国际化文件 ${i18nFile}`, 'green');
        }
    }
}

// 验证构建产物
function validateBuild() {
    logSection('验证构建产物');
    
    const requiredFiles = [
        'popup.html',
        'popup.js',
        'background.js',
        'styles.css',
        'manifest.json'
    ];
    
    let allValid = true;
    
    for (const file of requiredFiles) {
        const filePath = path.join(DIST_DIR, file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            log(`✓ ${file} (${(stats.size / 1024).toFixed(2)} KB)`, 'green');
        } else {
            log(`✗ 缺少文件: ${file}`, 'red');
            allValid = false;
        }
    }
    
    // 验证 manifest.json
    try {
        const manifestPath = path.join(DIST_DIR, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            log(`✓ Manifest 版本: ${manifest.version}`, 'green');
            
            // 检查图标文件
            if (manifest.icons) {
                for (const [size, iconPath] of Object.entries(manifest.icons)) {
                    const fullIconPath = path.join(DIST_DIR, iconPath);
                    if (fs.existsSync(fullIconPath)) {
                        log(`✓ 图标 ${size}x${size}: ${iconPath}`, 'green');
                    } else {
                        log(`✗ 缺少图标: ${iconPath}`, 'red');
                        allValid = false;
                    }
                }
            }
        }
    } catch (error) {
        log(`✗ Manifest 验证失败: ${error.message}`, 'red');
        allValid = false;
    }
    
    if (!allValid) {
        log('\n构建验证失败，请检查错误', 'red');
        process.exit(1);
    }
}

// 创建 ZIP 包
function createZipPackage() {
    logSection('创建 ZIP 包');
    
    const versionInfo = getVersionInfo();
    const packageName = `easy-todo-v${versionInfo.packageVersion}.zip`;
    const packagePath = path.join(ROOT_DIR, packageName);
    
    // 删除旧的 ZIP 包
    const oldPackages = fs.readdirSync(ROOT_DIR).filter(file => 
        file.startsWith('easy-todo') && file.endsWith('.zip')
    );
    
    oldPackages.forEach(oldPackage => {
        const oldPath = path.join(ROOT_DIR, oldPackage);
        fs.unlinkSync(oldPath);
        log(`清理旧包: ${oldPackage}`, 'yellow');
    });
    
    // 生成构建信息文件
    const buildInfo = {
        version: versionInfo.packageVersion,
        buildTime: versionInfo.buildTime,
        buildNumber: versionInfo.buildNumber,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
    };
    
    const buildInfoPath = path.join(DIST_DIR, 'build-info.json');
    fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
    log(`✓ 生成构建信息: build-info.json`, 'green');
    
    try {
        // 使用系统的 zip 命令
        execSync(`cd "${DIST_DIR}" && zip -r "../${packageName}" .`, { 
            stdio: 'pipe'
        });
        
        const zipStats = fs.statSync(packagePath);
        log(`✓ 创建版本化 ZIP 包: ${packageName} (${(zipStats.size / 1024).toFixed(2)} KB)`, 'green');
        
        // 创建一个通用链接
        const genericPackagePath = path.join(ROOT_DIR, 'easy-todo.zip');
        if (fs.existsSync(genericPackagePath)) {
            fs.unlinkSync(genericPackagePath);
        }
        fs.copyFileSync(packagePath, genericPackagePath);
        
        return packageName;
    } catch (error) {
        log(`警告: ZIP 包创建失败，请手动打包 dist 目录`, 'yellow');
        return null;
    }
}

// 生成构建报告
function generateBuildReport() {
    logSection('构建报告');
    
    const buildTime = new Date().toLocaleString('zh-CN');
    const distStats = fs.readdirSync(DIST_DIR, { withFileTypes: true });
    
    let totalSize = 0;
    const fileReport = [];
    
    function calculateDirSize(dirPath) {
        let size = 0;
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const item of items) {
            const itemPath = path.join(dirPath, item.name);
            if (item.isDirectory()) {
                size += calculateDirSize(itemPath);
            } else {
                const stats = fs.statSync(itemPath);
                size += stats.size;
            }
        }
        return size;
    }
    
    for (const item of distStats) {
        const itemPath = path.join(DIST_DIR, item.name);
        let size = 0;
        
        if (item.isDirectory()) {
            size = calculateDirSize(itemPath);
        } else {
            const stats = fs.statSync(itemPath);
            size = stats.size;
        }
        
        totalSize += size;
        fileReport.push({
            name: item.name,
            type: item.isDirectory() ? 'dir' : 'file',
            size: size
        });
    }
    
    log(`构建时间: ${buildTime}`, 'cyan');
    log(`总大小: ${(totalSize / 1024).toFixed(2)} KB`, 'cyan');
    log('\n文件详情:', 'cyan');
    
    fileReport
        .sort((a, b) => b.size - a.size)
        .forEach(item => {
            const sizeStr = (item.size / 1024).toFixed(2);
            const icon = item.type === 'dir' ? '📁' : '📄';
            log(`  ${icon} ${item.name}: ${sizeStr} KB`, 'white');
        });
}

// 主构建流程
function main() {
    const startTime = Date.now();
    const versionInfo = getVersionInfo();
    
    log('\n🚀 开始构建 Easy Todo Chrome 扩展', 'magenta');
    log(`📋 版本: ${versionInfo.packageVersion}`, 'magenta');
    
    try {
        checkEnvironment();
        cleanBuild();
        buildTypeScript();
        copyStaticFiles();
        validateBuild();
        const packageName = createZipPackage();
        generateBuildReport();
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        log(`\n✅ 构建完成！耗时 ${duration} 秒`, 'green');
        log('\n📦 产物位置:', 'cyan');
        log(`  - 构建文件: ${DIST_DIR}`, 'white');
        log(`  - 版本化包: ${ROOT_DIR}/${packageName}`, 'white');
        log(`  - 通用包: ${ROOT_DIR}/easy-todo.zip`, 'white');
        
    } catch (error) {
        log(`\n❌ 构建失败: ${error.message}`, 'red');
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = { main };
