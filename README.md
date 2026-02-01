# AI PPT Studio

> 🎯 免费 AI PPT 生成器 - 从想法到演示文稿，一步到位

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/huhetingadday-boop/AI-PPT-Studio&env=GEMINI_API_KEY&envDescription=Google%20Gemini%20API%20Key%20(免费)&envLink=https://aistudio.google.com/app/apikey)

## ✨ 特性

- 🆓 **完全免费** - 使用 Google Gemini API 免费额度
- 🤖 **AI 智能生成** - 描述需求，自动生成专业 PPT 结构
- 🎨 **实时预览** - Canvas 风格预览，支持键盘导航
- 📥 **一键导出** - 导出可编辑的 PPTX 文件
- 🚀 **一键部署** - 点击上方按钮即可部署

---

## 🚀 5 分钟部署教程

### 第一步：获取免费 Gemini API Key（2分钟）

1. 打开 [Google AI Studio](https://aistudio.google.com/app/apikey)

2. 用 Google 账号登录

3. 点击 **「Create API Key」**

4. 选择 **「Create API key in new project」**

5. 复制生成的 API Key（格式：`AIzaSy...`）

> 💡 **免费额度**：每天 1500 次请求，足够日常使用！

### 第二步：部署到 Vercel（3分钟）

**方式一：一键部署（推荐）**

1. 点击上方的 [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/huhetingadday-boop/AI-PPT-Studio&env=GEMINI_API_KEY&envDescription=Google%20Gemini%20API%20Key%20(免费)&envLink=https://aistudio.google.com/app/apikey) 按钮

2. 用 GitHub 账号登录 Vercel

3. 在 **Environment Variables** 中填入：
   - Name: `GEMINI_API_KEY`
   - Value: 粘贴你的 API Key

4. 点击 **Deploy**

5. 等待 1-2 分钟，获得你的专属地址！

**方式二：手动部署**

```bash
# 1. 克隆项目
git clone https://github.com/huhetingadday-boop/AI-PPT-Studio.git
cd AI-PPT-Studio

# 2. 安装 Vercel CLI
npm i -g vercel

# 3. 登录并部署
vercel login
vercel env add GEMINI_API_KEY  # 输入你的 API Key
vercel --prod
```

---

## 📖 使用方法

1. 打开部署好的网站
2. 输入 PPT 需求，例如：
   - "帮我做一份 8 页的 AI 企业落地 PPT，面向 CTO"
   - "创建产品发布会 PPT，面向投资人，强调市场机会"
3. 点击「生成 PPT」
4. 预览满意后，点击「导出 PPTX」

---

## 🔧 本地开发

```bash
# 安装依赖
npm install

# 创建环境变量
cp .env.example .env.local
# 编辑 .env.local，填入 GEMINI_API_KEY

# 启动开发服务器（需要 Vercel CLI）
vercel dev
```

---

## 📁 项目结构

```
AI-PPT-Studio/
├── api/
│   └── generate.js      # Vercel Serverless Function
├── src/
│   ├── App.jsx          # 主应用
│   ├── main.jsx         # 入口
│   └── index.css        # 样式
├── public/
│   └── favicon.svg      # 图标
├── index.html
├── package.json
├── vercel.json
└── README.md
```

---

## ❓ 常见问题

**Q: API Key 会被泄露吗？**

A: 不会。API Key 存储在 Vercel 服务端环境变量中，前端无法访问。

**Q: 免费额度够用吗？**

A: 每天 1500 次请求，生成 150+ 份 PPT 完全足够。

**Q: 为什么选择 Gemini 而不是其他模型？**

A: Gemini 免费额度最慷慨，质量也很好，无需信用卡即可使用。

---

## 📄 License

MIT

---

## 🙏 致谢

- [Google Gemini](https://ai.google.dev/) - 免费 AI API
- [pptxgenjs](https://github.com/gitbrent/PptxGenJS) - PPTX 生成库
- [Vercel](https://vercel.com/) - 免费部署平台
