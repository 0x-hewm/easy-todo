# Easy Todo Chrome Extension

[![License](https://img.shields.io/badge/License-ISC-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-213%20passed-brightgreen.svg)](#测试)

一个基于 TypeScript 开发的简洁待办事项 Chrome 扩展，支持任务管理、标签分类、多语言和主题切换。

## ✨ 已实现功能

### 📝 任务管理

- ✅ **创建任务**：支持标题、描述、优先级、标签、截止日期设置
- ✏️ **编辑任务**：修改任务所有属性
- 🗑️ **删除任务**：单个删除或批量清理已完成任务
- ✔️ **状态切换**：标记完成/未完成状态

### 🏷️ 分类管理

- 🎯 **优先级**：高、中、低三级优先级设置
- 🏷️ **标签系统**：创建、编辑、删除自定义标签，支持颜色标记
- 📅 **截止日期**：设置到期时间，自动提醒
- 📝 **任务描述**：详细描述信息

### 🔍 查找过滤

- 🔍 **文本搜索**：在标题和描述中搜索关键词
- 🎛️ **状态过滤**：显示全部、活跃、已完成任务
- �️ **标签过滤**：按标签筛选任务
- 🎯 **优先级过滤**：按优先级筛选

### 📊 统计分析

- � **任务统计**：总数、完成数、完成率实时显示
- 📊 **分析视图**：任务趋势和分布分析
- 📝 **模板管理**：保存和使用任务模板

### 🎨 个性化

- 🌍 **多语言**：中文、英文界面切换
- 🎨 **主题系统**：内置多种主题，支持自定义主题编辑
- 🔔 **通知提醒**：任务到期通知（需要权限）
- ⚡ **键盘快捷键**：快速操作支持

### 💾 数据管理

- 💾 **数据备份**：导出所有数据到 JSON 文件
- 📥 **数据恢复**：从 JSON 文件导入数据
- 🔄 **本地存储**：使用 Chrome Storage API 持久化数据

## 🚀 安装使用

### 📦 本地安装开发版

1. 克隆项目到本地

   ```bash
   git clone https://github.com/0x-hewm/easy-todo.git
   cd easy-todo
   ```

2. 安装依赖并构建

   ```bash
   npm install
   npm run build
   ```

3. 加载到 Chrome
   - 打开 Chrome 浏览器，访问 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"，选择 `dist` 目录

### 🎯 基本使用

1. **添加任务**：点击扩展图标，在输入框中输入任务内容，回车或点击添加按钮
2. **设置属性**：点击任务进入编辑模式，设置优先级、标签、截止日期等
3. **管理任务**：使用顶部的状态、优先级、标签过滤器筛选任务
4. **搜索任务**：在搜索框中输入关键词搜索任务
5. **完成任务**：点击任务左侧的复选框标记完成状态

## 🛠️ 开发环境

### 环境要求

- Node.js >= 16.0
- npm >= 8.0  
- Chrome >= 88

### 开发命令

```bash
# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run dev

# 构建生产版本
npm run build

# 打包扩展
npm run package

# 运行测试
npm test

# 测试覆盖率
npm run test:coverage

# 代码检查
npm run lint

# 代码格式化
npm run format

# 类型检查
npm run type-check
```

### 项目结构

```tree
easy-todo/
├── src/                    # 源代码
│   ├── components/         # UI 组件
│   │   ├── TaskForm.ts     # 任务表单组件
│   │   ├── TaskItem.ts     # 任务项组件
│   │   ├── TaskList.ts     # 任务列表组件
│   │   ├── TaskStats.ts    # 统计组件
│   │   ├── TagManager.ts   # 标签管理组件
│   │   ├── ThemeSelector.ts # 主题选择器
│   │   └── ...             # 其他组件
│   ├── services/           # 业务服务
│   │   ├── TodoService.ts  # 任务服务
│   │   ├── TagService.ts   # 标签服务
│   │   ├── StorageService.ts # 存储服务
│   │   ├── NotificationService.ts # 通知服务
│   │   └── ...             # 其他服务
│   ├── types/              # 类型定义
│   │   └── index.ts        # 主要类型定义
│   ├── utils/              # 工具函数
│   │   ├── i18n.ts         # 国际化
│   │   ├── theme.ts        # 主题管理
│   │   ├── date.ts         # 日期工具
│   │   └── ...             # 其他工具
│   ├── assets/             # 静态资源
│   │   ├── i18n/           # 国际化文件
│   │   └── icons/          # 图标文件
│   ├── popup.ts            # 弹窗主文件
│   ├── background.ts       # 后台脚本
│   ├── popup.html          # 扩展界面
│   └── styles.css          # 样式文件
├── tests/                  # 测试文件
├── scripts/                # 构建脚本
├── dist/                   # 构建输出目录
└── doc/                    # 文档目录
```

## 🏗️ 技术架构

### 核心技术栈

- **TypeScript 5.3.3** - 类型安全的 JavaScript 超集
- **Webpack 5** - 模块打包和构建工具
- **Web Components** - 现代化组件开发
- **Chrome Extensions Manifest V3** - 最新扩展开发规范
- **Chrome Storage API** - 数据持久化
- **Jest** - 单元测试框架

### 架构设计

```text
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Popup UI      │    │   Services      │    │   Storage       │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ TaskList    │ │◄──►│ │ TodoService │ │◄──►│ │ Chrome      │ │
│ │ TaskForm    │ │    │ │ TagService  │ │    │ │ Storage API │ │
│ │ TaskStats   │ │    │ │ Storage...  │ │    │ │             │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 数据流

1. **用户交互** → UI 组件接收操作
2. **服务调用** → Service 层处理业务逻辑
3. **数据存储** → Chrome Storage API 持久化
4. **状态更新** → 更新 UI 显示最新状态

## 📊 测试

项目包含 213 个测试用例，涵盖所有核心功能：

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式运行测试
npm run test:watch
```

测试覆盖范围：

- ✅ TodoService - 任务 CRUD 操作
- ✅ TagService - 标签管理
- ✅ StorageService - 数据存储
- ✅ NotificationService - 通知功能
- ✅ AnalyticsService - 统计分析
- ✅ BackupService - 数据备份
- ✅ 工具函数 - 日期、国际化、主题等

## 📚 文档

- [API文档](doc/API文档.md) - 接口和数据结构说明
- [开发指南](doc/开发指南.md) - 详细开发指南
- [测试指南](doc/测试指南.md) - 测试用例和质量保证
- [部署指南](doc/部署指南.md) - 构建和发布流程
- [需求文档](doc/需求文档.md) - 功能需求和规划
- [文档索引](doc/INDEX.md) - 完整文档目录

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 参与方式

1. Fork 项目
2. 创建特性分支
3. 提交代码
4. 发起 Pull Request

请确保：

- 代码通过所有测试
- 遵循项目代码规范
- 添加必要的测试用例
- 更新相关文档

## 📄 许可证

本项目基于 [ISC License](LICENSE) 开源协议。

## 🔗 相关链接

- [项目仓库](https://github.com/0x-hewm/easy-todo)
- [问题反馈](https://github.com/0x-hewm/easy-todo/issues)
- [Chrome 扩展开发文档](https://developer.chrome.com/docs/extensions/)
