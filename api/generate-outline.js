export const config = { maxDuration: 60 };

const STYLE_GUIDES = {
  '述职汇报': '结构：总-分-总。第一人称。重点展示业绩数据(同比/环比)、项目成果、团队贡献、改进措施。要有具体量化指标。',
  '商业演讲': '结构：痛点→方案→优势→案例→CTA。故事线驱动，有行业数据支撑，突出差异化竞争力和客户价值。',
  '投融资路演': '经典十页法则：问题→方案→市场→商业模式→竞争→团队→财务→融资需求。数据密集，用指标说话。',
  '培训课件': '结构：导入→知识点展开→案例→练习→小结。强调方法论框架、工作流程图、对比分析表。需要可操作的实战内容。',
  '学术汇报': '结构：背景→研究问题→方法→结果→讨论→结论。严谨逻辑，引用数据，图表说话。',
  '项目总结': '结构：项目背景→目标→执行过程→关键里程碑→成果→问题复盘→改进方向。时间线+数据+教训。',
  '竞聘演讲': '结构：个人简介→岗位理解→核心优势→工作设想→承诺。突出能力匹配度和实际案例。',
};

const buildPrompt = (style, content, urls, userPrompt, templateInfo) => `# 角色
你是顶级PPT内容架构师。你的唯一任务是：将用户提供的原始材料深度提炼，提取核心观点、数据和方法论，生成一份内容丰富、结构清晰的演示文稿大纲。

# 核心能力
1. 深度分析：从原始材料中识别关键论点、数据指标、因果关系、方法论框架
2. 结构化表达：将提炼内容组织成有逻辑层次的演示框架
3. 内容丰富化：每个要点都有具体数据支撑、案例说明或方法论描述，绝不是空洞标题

# 场景
【${style}】
${STYLE_GUIDES[style] || '确保内容专业、结构清晰、数据充实。'}
${templateInfo ? `\n# 模板\n${templateInfo}\n如有封面模板第一页为封面，有尾页模板最后一页为结束页。` : ''}

# 用户原始材料
${content ? `"""
${content}
"""` : '（未提供原始材料，请基于场景生成专业内容框架）'}
${urls ? `\n# 参考链接\n${urls}` : ''}
${userPrompt ? `\n# 额外需求\n${userPrompt}` : ''}

# 任务

## 第一步：材料深度分析（输出300字分析过程）
分析维度：
- 核心主题和关键论点（3-5个）
- 关键数据和指标（所有可量化信息）
- 方法论和框架（理论模型、工作流程）
- 案例和论据
- 逻辑关系（递进、并列、因果）

## 第二步：生成PPT大纲JSON

### ⚠️ 内容丰富度要求（最关键的要求）

1. **每个bullet必须是实质性内容**，格式："核心观点：具体展开说明（含数据/案例/方法）"
2. **展开说明必须至少20个字**，包含具体数据点、方法步骤、案例描述或因果分析
3. **直接引用原始材料中的关键信息**：数字、百分比、专有名词、方法论名称必须保留
4. 每页3-4个bullets，总共10-15页

### 好与差的对比

❌ "市场规模：市场规模较大"
✅ "市场规模：全球AI市场2024年达5,000亿美元，年复合增长率37.3%，企业级应用占比62%，预计2027年突破1.3万亿美元"

❌ "产品策略：采用供需匹配框架"
✅ "供需匹配框架：通过离线模拟和在线AB验证，随机Drop m%内容产量观测消费端影响，量化内容弹性供给曲线。实验表明产量提升30%时CTR提升20%，呈边际递减趋势"

❌ "工作方法：假设驱动方法论"
✅ "业务假设驱动（微观）：「事实输入→构建假设→假设验证→行为反馈→迭代认知」五步循环。前置洞察阶段涵盖产品愿景、行业趋势、产品前置调研（公司战略+行业竞品+数据分析+用户洞察）"

### JSON格式（用\`\`\`json\`\`\`包裹）
{
  "title": "演示文稿标题",
  "style": "${style}",
  "audience": "目标受众",
  "theme": {"primary": "#e2e8f0", "accent": "#22d3ee", "background": "#0c1222"},
  "slides": [
    {"type": "title", "headline": "大标题", "subheadline": "副标题"},
    {"type": "agenda", "headline": "目录", "bullets": ["章节1：描述", ...]},
    {"type": "content", "headline": "页面标题", "bullets": ["核心观点：至少20字的具体展开说明", ...]},
    {"type": "data", "headline": "数据概览", "metrics": [{"label": "指标名", "value": "数值", "description": "含义"}]},
    {"type": "two-column", "headline": "对比标题", "leftTitle": "左栏", "leftBullets": [...], "rightTitle": "右栏", "rightBullets": [...]},
    {"type": "timeline", "headline": "时间线", "items": [{"phase": "阶段", "title": "内容"}]},
    {"type": "closing", "headline": "结束", "subheadline": "", "bullets": ["下一步行动"]}
  ]
}

type可选：title, agenda, content, data, timeline, two-column, closing`;

const safeParse = (s) => { try { return JSON.parse(s); } catch { return null; } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API Key not configured' });

  try {
    const { prompt, style, content, urls, templateInfo } = req.body || {};
    const fullPrompt = buildPrompt(style || '商业演讲', content || '', urls || '', prompt || '', templateInfo || '');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);
    let response;
    try {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: fullPrompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 16384 } }),
      });
    } catch (e) { clearTimeout(timeout); if (e.name === 'AbortError') return res.status(504).json({ error: 'AI生成超时，请简化输入后重试' }); throw e; }
    clearTimeout(timeout);
    const rawBody = await response.text();
    const data = safeParse(rawBody);
    if (!data) return res.status(502).json({ error: 'Gemini API返回异常，请重试' });
    if (data.error) return res.status(400).json({ error: data.error.message || 'Gemini API错误' });
    const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
    if (!text) return res.status(500).json({ error: 'AI返回空内容，请重试' });
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    let thinking = text, outline = null;
    if (jsonMatch) { thinking = text.substring(0, text.indexOf('```json')).trim(); outline = safeParse(jsonMatch[1]); }
    if (!outline) { const fb = text.match(/\{[\s\S]*\}/); if (fb) { if (!jsonMatch) thinking = text.substring(0, text.indexOf(fb[0])).trim(); outline = safeParse(fb[0]); } }
    if (!outline) return res.status(500).json({ error: 'AI未生成有效大纲，请重试' });
    return res.status(200).json({ success: true, thinking: thinking || '分析完成。', outline });
  } catch (error) { return res.status(500).json({ error: error.message || '服务器错误' }); }
}
