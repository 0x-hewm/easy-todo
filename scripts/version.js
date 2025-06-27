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

const ROOT_DIR = path.resolve(__dirname, '..');

// 获取当前版本
function getCurrentVersion() {
    const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
    return packageJson.version;
}

// 验证版本格式
function validateVersion(version) {
    const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
    return semverRegex.test(version);
}

// 解析版本号
function parseVersion(version) {
    const parts = version.split('.');
    return {
        major: parseInt(parts[0]),
        minor: parseInt(parts[1]),
        patch: parseInt(parts[2])
    };
}

// 升级版本号
function bumpVersion(currentVersion, type) {
    const version = parseVersion(currentVersion);
    
    switch (type) {
        case 'major':
            version.major += 1;
            version.minor = 0;
            version.patch = 0;
            break;
        case 'minor':
            version.minor += 1;
            version.patch = 0;
            break;
        case 'patch':
            version.patch += 1;
            break;
        default:
            throw new Error(`无效的版本类型: ${type}`);
    }
    
    return `${version.major}.${version.minor}.${version.patch}`;
}

// 更新文件版本
function updateFileVersion(newVersion) {
    logSection('更新版本号');
    
    // 更新 package.json
    const packageJsonPath = path.join(ROOT_DIR, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    log(`✓ 更新 package.json: ${newVersion}`, 'green');
    
    // 更新 manifest.json
    const manifestPath = path.join(ROOT_DIR, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        manifest.version = newVersion;
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
        log(`✓ 更新 manifest.json: ${newVersion}`, 'green');
    }
    
    // 更新 src/manifest.json
    const srcManifestPath = path.join(ROOT_DIR, 'src', 'manifest.json');
    if (fs.existsSync(srcManifestPath)) {
        const srcManifest = JSON.parse(fs.readFileSync(srcManifestPath, 'utf8'));
        srcManifest.version = newVersion;
        fs.writeFileSync(srcManifestPath, JSON.stringify(srcManifest, null, 2) + '\n');
        log(`✓ 更新 src/manifest.json: ${newVersion}`, 'green');
    }
}

// 更新 CHANGELOG.md
function updateChangelog(newVersion) {
    logSection('更新 CHANGELOG.md');
    
    const changelogPath = path.join(ROOT_DIR, 'CHANGELOG.md');
    if (!fs.existsSync(changelogPath)) {
        log('CHANGELOG.md 不存在，跳过更新', 'yellow');
        return;
    }
    
    const content = fs.readFileSync(changelogPath, 'utf8');
    const today = new Date().toISOString().split('T')[0];
    
    // 在 ## [Unreleased] 后添加新版本
    const newEntry = `\n## [${newVersion}] - ${today}\n\n### Added\n- 新增功能描述\n\n### Changed\n- 变更描述\n\n### Fixed\n- 修复问题描述\n`;
    
    const updatedContent = content.replace(
        /## \[Unreleased\]/,
        `## [Unreleased]${newEntry}`
    );
    
    fs.writeFileSync(changelogPath, updatedContent);
    log(`✓ 更新 CHANGELOG.md: ${newVersion}`, 'green');
    log(`请手动编辑 CHANGELOG.md 添加具体的更新内容`, 'yellow');
}

// Git 操作
function gitCommitAndTag(version) {
    logSection('Git 提交和标签');
    
    try {
        // 检查是否有 git 仓库
        execSync('git status', { stdio: 'pipe' });
        
        // 添加文件
        execSync('git add package.json manifest.json src/manifest.json CHANGELOG.md', { stdio: 'pipe' });
        
        // 提交
        execSync(`git commit -m "chore: bump version to ${version}"`, { stdio: 'pipe' });
        log(`✓ Git 提交: v${version}`, 'green');
        
        // 创建标签
        execSync(`git tag v${version}`, { stdio: 'pipe' });
        log(`✓ Git 标签: v${version}`, 'green');
        
        log('使用以下命令推送到远程仓库:', 'cyan');
        log(`  git push origin main`, 'white');
        log(`  git push origin v${version}`, 'white');
        
    } catch (error) {
        log('Git 操作失败，请手动提交', 'yellow');
        log('建议执行:', 'yellow');
        log(`  git add .`, 'white');
        log(`  git commit -m "chore: bump version to ${version}"`, 'white');
        log(`  git tag v${version}`, 'white');
        log(`  git push origin main --tags`, 'white');
    }
}

// 构建发布版本
function buildRelease() {
    logSection('构建发布版本');
    
    try {
        execSync('npm run build', { stdio: 'inherit' });
        log('✓ 构建完成', 'green');
    } catch (error) {
        log('构建失败，请检查错误信息', 'red');
        throw error;
    }
}

// 主函数
function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        log('使用方法:', 'cyan');
        log('  npm run version <type>     # 自动升级版本', 'white');
        log('  npm run version <version>  # 设置指定版本', 'white');
        log('', 'white');
        log('版本类型:', 'cyan');
        log('  major  # 主版本号 (1.0.0 -> 2.0.0)', 'white');
        log('  minor  # 次版本号 (1.0.0 -> 1.1.0)', 'white');
        log('  patch  # 补丁版本 (1.0.0 -> 1.0.1)', 'white');
        log('', 'white');
        log('示例:', 'cyan');
        log('  npm run version patch', 'white');
        log('  npm run version 1.2.3', 'white');
        return;
    }
    
    const currentVersion = getCurrentVersion();
    let newVersion;
    
    const input = args[0];
    
    if (['major', 'minor', 'patch'].includes(input)) {
        newVersion = bumpVersion(currentVersion, input);
    } else if (validateVersion(input)) {
        newVersion = input;
    } else {
        log(`错误: 无效的版本格式或类型: ${input}`, 'red');
        return;
    }
    
    log(`\n🚀 版本管理工具`, 'magenta');
    log(`当前版本: ${currentVersion}`, 'cyan');
    log(`新版本: ${newVersion}`, 'cyan');
    
    try {
        updateFileVersion(newVersion);
        updateChangelog(newVersion);
        gitCommitAndTag(newVersion);
        buildRelease();
        
        log(`\n✅ 版本发布完成: ${newVersion}`, 'green');
        log('\n📦 发布包位置:', 'cyan');
        log(`  - easy-todo-v${newVersion}.zip`, 'white');
        log(`  - easy-todo.zip (通用)`, 'white');
        
    } catch (error) {
        log(`\n❌ 版本发布失败: ${error.message}`, 'red');
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = { main };
