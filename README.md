# Easy Todo Chrome Extension

一个简单高效的待办事项 Chrome 扩展。

## 功能特点

- 创建、编辑、删除待办事项
- 设置任务优先级
- 添加任务描述和截止日期
- 支持任务完成状态标记
- 任务过滤和搜索
- 支持中英文界面
- 任务提醒通知

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 打包
npm run package
```

## 安装扩展

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目的 `dist` 目录

## 技术栈

- TypeScript
- Web Components
- Chrome Extension APIs
- Webpack