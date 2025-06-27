# Easy Todo Chrome Extension - 贡献指南

## 🤝 如何贡献

感谢您对 Easy Todo 项目的关注！欢迎任何形式的贡献。

## 📋 开发环境设置

### 前置要求

- Node.js 16+
- npm 或 yarn
- Chrome 浏览器 88+

### 快速开始

#### 1. **克隆项目**

```bash
git clone https://github.com/0x-hewm/easy-todo.git
cd easy-todo
```

#### 2. **安装依赖**

```bash
npm install
```

#### 3. **启动开发模式**

```bash
npm run dev
```

#### 4. **在Chrome中加载扩展**

- 打开 Chrome 浏览器
- 访问 `chrome://extensions/`
- 开启"开发者模式"
- 点击"加载已解压的扩展程序"
- 选择项目的 `dist` 目录

## 🔧 开发流程

### 分支管理

- `main` - 主分支，稳定版本
- `develop` - 开发分支，用于集成新功能
- `feature/*` - 功能分支
- `bugfix/*` - 修复分支
- `hotfix/*` - 紧急修复分支

### 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```shell
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Type 类型

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式化（不影响功能）
- `refactor`: 重构代码
- `test`: 添加测试
- `chore`: 构建过程或辅助工具的变动

#### 示例

```bash
feat(tasks): 添加任务拖拽排序功能
fix(notifications): 修复提醒时间计算错误
docs(readme): 更新安装说明
```

### Pull Request 流程

1. **Fork 项目**
2. **创建功能分支**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **提交更改**

   ```bash
   git add .
   git commit -m "feat: 添加新功能描述"
   ```

4. **推送分支**

   ```bash
   git push origin feature/your-feature-name
   ```

5. **创建 Pull Request**
   - 描述清楚更改内容
   - 关联相关 Issue
   - 添加截图（如有UI变更）

## 🧪 测试

### 手动测试

运行完整的测试用例：

```bash
# 参考 doc/测试用例.md
```

### 自动化测试

```bash
npm run test
```

## 📝 代码规范

### TypeScript

- 使用严格模式
- 为所有函数和变量添加类型注解
- 避免使用 `any` 类型

### 文件组织

- 组件放在 `src/components/`
- 服务放在 `src/services/`
- 工具函数放在 `src/utils/`
- 类型定义放在 `src/types/`

### 命名规范

- 文件名：PascalCase（组件）或 camelCase（其他）
- 类名：PascalCase
- 函数和变量：camelCase
- 常量：UPPER_SNAKE_CASE

## 🐛 报告问题

### Issue 模板

请使用提供的 Issue 模板：

- Bug 报告
- 功能请求
- 文档问题

### Bug 报告应包含

1. 问题描述
2. 重现步骤
3. 预期行为
4. 实际行为
5. 环境信息（操作系统、Chrome版本等）
6. 相关截图或日志

## 🎨 设计指南

### UI 原则

- 简洁明了
- 一致性
- 可访问性
- 响应式设计

### 主题系统

- 支持多主题切换
- 使用 CSS 变量
- 遵循 Material Design 指导原则

## 📚 文档

### 更新文档

- 新功能需要更新相关文档
- API 变更需要更新开发指南
- 重大变更需要更新 CHANGELOG

### 文档类型

- 用户文档：README.md
- 开发文档：doc/开发指南.md
- API 文档：代码注释
- 设计文档：doc/*-design.md

## 🚀 发布流程

### 版本号规则

遵循 [Semantic Versioning](https://semver.org/)：

- `MAJOR.MINOR.PATCH`
- `1.0.0` - 稳定版本
- `1.1.0` - 新功能
- `1.0.1` - 修复版本

### 发布步骤

1. 更新版本号
2. 更新 CHANGELOG
3. 创建 Release Tag
4. 构建发布包
5. 发布到 Chrome Web Store

## 💡 开发提示

### 调试技巧

1. **Background Script**
   - 在扩展管理页面点击"背景页"
   - 使用 Chrome DevTools 调试

2. **Popup Page**
   - 右键点击扩展图标，选择"审查弹出内容"
   - 使用 Chrome DevTools 调试

3. **存储调试**
   - DevTools > Application > Storage > Extension Storage

### 性能优化

- 减少不必要的重渲染
- 使用防抖处理频繁事件
- 优化图片和静态资源

### 安全考虑

- 验证用户输入
- 使用内容安全策略
- 避免 XSS 攻击

## 📜 许可证

本项目采用 [LICENSE] 许可证。
