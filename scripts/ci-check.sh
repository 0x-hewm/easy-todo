#!/bin/bash

# CI/CD 流程本地验证脚本
# 这个脚本模拟 GitHub Actions 中的所有检查步骤

set -e  # 遇到错误立即退出

echo "🚀 开始 CI/CD 流程本地验证"
echo "========================================"

# 检查环境
echo "📋 环境信息"
echo "Node.js 版本: $(node --version)"
echo "npm 版本: $(npm --version)"
echo "项目目录: $(pwd)"
echo ""

# Step 1: 安装依赖
echo "📦 安装依赖..."
npm ci
echo "✅ 依赖安装完成"
echo ""

# Step 2: ESLint 检查
echo "🔍 运行 ESLint 检查..."
npm run lint:check
echo "✅ ESLint 检查通过"
echo ""

# Step 3: TypeScript 类型检查
echo "🔷 运行 TypeScript 类型检查..."
npx tsc --noEmit
echo "✅ TypeScript 类型检查通过"
echo ""

# Step 4: 检查 TODO/FIXME 注释
echo "📝 检查 TODO/FIXME 注释..."
if grep -r "TODO\|FIXME" src/ --exclude-dir=node_modules; then
  echo "❌ 发现 TODO/FIXME 注释，请在合并前解决"
  exit 1
else
  echo "✅ 未发现 TODO/FIXME 注释"
fi
echo ""

# Step 5: 运行测试
echo "🧪 运行测试套件..."
npm test
echo "✅ 所有测试通过"
echo ""

# Step 6: 构建项目
echo "🔨 构建项目..."
npm run build
echo "✅ 项目构建成功"
echo ""

# Step 7: 验证构建产物
echo "📋 验证构建产物..."
required_files=("dist/manifest.json" "dist/popup.html" "dist/popup.js" "dist/background.js" "dist/styles.css")

for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ 必需文件不存在: $file"
    exit 1
  fi
  echo "✅ $file"
done
echo "✅ 所有必需文件存在"
echo ""

# Step 8: 验证 manifest.json
echo "📄 验证 manifest.json..."
node -e "
  const manifest = require('./dist/manifest.json');
  if (!manifest.name || !manifest.version) {
    console.error('❌ 无效的 manifest.json');
    process.exit(1);
  }
  console.log('✅ Manifest 有效');
  console.log('  名称:', manifest.name);
  console.log('  版本:', manifest.version);
"
echo ""

# Step 9: 检查包大小
echo "📦 检查包大小..."
if command -v bc >/dev/null 2>&1; then
  BUNDLE_SIZE=$(du -sk dist | cut -f1)
  BUNDLE_SIZE_BYTES=$((BUNDLE_SIZE * 1024))
  MAX_SIZE=$((5 * 1024 * 1024))  # 5MB
  BUNDLE_SIZE_MB=$(echo "scale=2; $BUNDLE_SIZE_BYTES / 1024 / 1024" | bc)
  
  echo "包大小: ${BUNDLE_SIZE_MB}MB (${BUNDLE_SIZE_BYTES} bytes)"
  echo "最大限制: 5MB (${MAX_SIZE} bytes)"
  
  if [ $BUNDLE_SIZE_BYTES -gt $MAX_SIZE ]; then
    echo "❌ 包大小超出限制"
    exit 1
  else
    echo "✅ 包大小在限制范围内"
  fi
else
  echo "⚠️  bc 未安装，跳过包大小检查"
fi
echo ""

# Step 10: 安全审计
echo "🔒 运行安全审计..."
npm audit --audit-level moderate
echo "✅ 安全审计通过"
echo ""

# Step 11: 检查敏感数据
echo "🔐 检查敏感数据..."
if grep -r "password\|secret\|token\|api_key" src/ --exclude-dir=node_modules | grep -v ".d.ts"; then
  echo "❌ 在源代码中发现潜在的敏感数据"
  exit 1
else
  echo "✅ 未发现敏感数据"
fi
echo ""

echo "🎉 所有 CI/CD 检查通过！"
echo "========================================"
echo "✅ 依赖安装"
echo "✅ ESLint 检查"
echo "✅ TypeScript 类型检查"
echo "✅ TODO/FIXME 检查"
echo "✅ 测试套件"
echo "✅ 项目构建"
echo "✅ 构建产物验证"
echo "✅ Manifest 验证"
echo "✅ 包大小检查"
echo "✅ 安全审计"
echo "✅ 敏感数据检查"
echo ""
echo "🚀 项目已准备好部署！"
