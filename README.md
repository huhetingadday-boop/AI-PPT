# AI PPT Studio V2

> 🎯 智能演示文稿工作台 - 材料理解 → 大纲编辑 → PPT 生成 → 导出

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/huhetingadday-boop/AI-PPT-Studio&env=GEMINI_API_KEY&envDescription=Google%20Gemini%20API%20Key&envLink=https://aistudio.google.com/app/apikey)

## V2 新特性

- 🎭 **7 种 PPT 场景**：述职汇报、商业演讲、投融资路演、培训课件、学术汇报、项目总结、竞聘演讲
- 🧠 **AI 思考过程可视化**：左侧面板实时展示 AI 的分析和决策过程
- ✏️ **大纲可编辑**：右侧面板展示结构化大纲，支持增删改查
- 📊 **新增 Slide 类型**：数据指标页、时间线页
- 🔄 **两阶段工作流**：先生成大纲（可编辑）→ 再生成最终 PPT

## 工作流程

```
1. 选择场景 + 输入材料 + 参考链接
          ↓
2. AI 分析（左侧思考过程）→ 生成大纲（右侧可编辑）
          ↓
3. 用户确认/修改大纲
          ↓
4. AI 优化生成（左侧过程）→ PPT 预览（右侧）
          ↓
5. 导出 PPTX
```

## 部署

1. 获取 [Gemini API Key](https://aistudio.google.com/app/apikey)（免费）
2. 点击上方 Deploy 按钮
3. 填入 `GEMINI_API_KEY`
4. 完成

## 本地开发

```bash
npm install
cp .env.example .env.local  # 填入 GEMINI_API_KEY
vercel dev
```

## License

MIT
