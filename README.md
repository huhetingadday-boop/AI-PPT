# AI PPT Studio

> 🎯 从想法到演示文稿，一步到位

AI PPT Studio 是一个基于 Claude API 的智能 PPT 生成工具，能够根据你的需求描述，快速生成结构化、专业的演示文稿。

## ✨ 核心功能

- **🤖 AI 驱动生成**：描述你的 PPT 需求，AI 自动生成结构化大纲
- **🎨 实时 Canvas 预览**：类似 Gemini Canvas 的预览体验，左侧缩略图 + 右侧主视图
- **📥 一键导出 PPTX**：导出可编辑的 PowerPoint 文件，所有文本框均可编辑
- **⌨️ 键盘导航**：支持方向键快速切换 Slide

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 📋 支持的 Slide 类型

| 类型 | 说明 |
|------|------|
| `title` | 封面页（主标题 + 副标题）|
| `agenda` | 议程页（带编号的列表）|
| `content` | 内容页（标题 + 要点列表）|
| `two-column` | 双栏对比页 |
| `closing` | 结束页（行动号召）|

## 🔧 技术栈

- **React 18** - UI 框架
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **pptxgenjs** - PPTX 生成库
- **Claude API** - AI 内容生成

## 📝 使用说明

1. 输入你的 Anthropic API Key
2. 描述你的 PPT 需求（主题、受众、页数、风格等）
3. 点击「生成 PPT」，等待 AI 生成
4. 在 Canvas 中预览，使用方向键或点击缩略图切换
5. 点击「导出 PPTX」下载可编辑的 PowerPoint 文件

## 🎯 目标用户

- **P0**：职场高频做 PPT 的人（产品经理、销售、咨询、市场）
- **P1**：内容型创作者（课件、分享会）
- **P2**：教育与研究场景

## 📄 License

MIT
