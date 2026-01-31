# AI PPT Studio

> 🎯 从想法到演示文稿，一步到位

AI PPT Studio 是一个基于 Claude API 的智能 PPT 生成工具，能够根据你的需求描述，快速生成结构化、专业的演示文稿。

![Demo](https://img.shields.io/badge/Demo-Live-green) ![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ 核心功能

- **🤖 AI 驱动生成**：描述你的 PPT 需求，AI 自动生成结构化大纲
- **🎨 实时 Canvas 预览**：左侧缩略图 + 右侧主视图，支持键盘导航
- **📥 一键导出 PPTX**：导出可编辑的 PowerPoint 文件
- **🔒 安全架构**：API Key 存储在服务端，前端无需暴露敏感信息

## 🚀 快速部署到 Vercel

### 方式一：一键部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/huhetingadday-boop/AI-PPT-Studio&env=ANTHROPIC_API_KEY&envDescription=Anthropic%20API%20Key%20from%20console.anthropic.com)

点击上方按钮，然后：
1. 授权 Vercel 访问你的 GitHub
2. 在环境变量设置中填入 `ANTHROPIC_API_KEY`
3. 点击 Deploy，等待部署完成

### 方式二：手动部署

1. **Fork 或 Clone 本仓库**

```bash
git clone https://github.com/huhetingadday-boop/AI-PPT-Studio.git
cd AI-PPT-Studio
```

2. **安装 Vercel CLI 并登录**

```bash
npm i -g vercel
vercel login
```

3. **设置环境变量并部署**

```bash
# 设置 API Key（会提示输入）
vercel env add ANTHROPIC_API_KEY

# 部署
vercel --prod
```

## 🔧 本地开发

```bash
# 安装依赖
npm install

# 创建 .env.local 文件
cp .env.example .env.local
# 编辑 .env.local，填入你的 ANTHROPIC_API_KEY

# 启动开发服务器
npm run dev
```

> ⚠️ 本地开发需要安装 [Vercel CLI](https://vercel.com/docs/cli) 来运行 Serverless Functions：
> ```bash
> vercel dev
> ```

## 📋 支持的 Slide 类型

| 类型 | 说明 |
|------|------|
| `title` | 封面页（主标题 + 副标题）|
| `agenda` | 议程页（带编号的列表）|
| `content` | 内容页（标题 + 要点列表）|
| `two-column` | 双栏对比页 |
| `closing` | 结束页（行动号召）|

## 🏗 项目结构

```
AI-PPT-Studio/
├── api/
│   └── generate.js      # Vercel Serverless Function (处理 AI 请求)
├── src/
│   ├── App.jsx          # 主应用组件
│   ├── main.jsx         # 入口文件
│   └── index.css        # 样式文件
├── public/
├── index.html
├── package.json
├── vite.config.js
├── vercel.json          # Vercel 配置
└── .env.example         # 环境变量示例
```

## 🔐 安全说明

- API Key 通过 Vercel 环境变量存储，仅服务端可访问
- 前端不会暴露任何敏感信息
- 所有 AI 请求通过 `/api/generate` 端点代理

## 🎯 目标用户

- **P0**：职场高频做 PPT 的人（产品经理、销售、咨询、市场）
- **P1**：内容型创作者（课件、分享会）
- **P2**：教育与研究场景

## 📝 获取 API Key

1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 注册/登录账号
3. 在 API Keys 页面创建新的 Key
4. 复制 Key 并配置到 Vercel 环境变量

## 📄 License

MIT
