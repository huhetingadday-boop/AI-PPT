export const config = { maxDuration: 60 };

const buildPrompt = (outline, style, templateInfo, originalContent) => `# 角色
你是PPT内容深度优化师。你的任务是将大纲中的每个页面内容进一步丰富和优化，使其达到专业演示文稿的水准。

# 大纲
${JSON.stringify(outline)}

# 场景：${style}
${templateInfo ? `# 模板：${templateInfo}` : ''}
${originalContent ? `\n# 用户原始材料（用于补充细节）\n"""${originalContent.substring(0, 3000)}"""` : ''}

# 优化要求

## 核心原则：内容密度提升
你需要将每个bullet从"标题级"提升为"演讲级"，让演讲者看到内容就能直接讲述。

## 具体要求
1. **每个bullet的冒号后必须有至少20字的实质内容**
   - 包含具体数据、百分比、案例名称、方法步骤
   - 不能出现"等"、"比如"等模糊表述后面没有具体内容的情况
2. **保留原始材料中的关键数据和专有术语**
3. **每个content页保持3-4个bullets**，不要过多
4. **保持JSON结构和theme配色完全不变**，只优化文字内容

## 优化示例
原始："Scaling Law：智力与训练资源的关系"
优化后："Scaling Law：智力程度与训练算力、数据量与推理算力的对数函数关系。投入规模决定智能上限，当前GPT-4训练成本超1亿美元，推理成本以每年40%速度下降"

原始："前置洞察：产品前置调研方法"
优化后："前置洞察（WorkFlow 01-03）：从产品愿景出发，结合行业趋势分析，进行系统性前置调研。调研维度包括公司战略对齐、行业竞品Benchmarking、核心数据分析（DAU/留存/转化漏斗）以及用户洞察（深访+问卷+行为日志）"

## 输出
先用150字说明优化策略，然后输出优化后的完整JSON（\`\`\`json\`\`\`包裹）。
JSON格式保持不变：{"title":"...","style":"${style}","audience":"...","theme":{...},"slides":[...]}`;

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
    const { outline, style, templateInfo, originalContent } = req.body || {};
    if (!outline) return res.status(400).json({ error: 'Missing outline' });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);
    let response;
    try {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: buildPrompt(outline, style || '商业演讲', templateInfo || '', originalContent || '') }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 16384 } }),
      });
    } catch (e) { clearTimeout(timeout); return res.status(200).json({ success: true, thinking: 'API响应较慢，已使用原始大纲。', pptData: outline }); }
    clearTimeout(timeout);
    const rawBody = await response.text();
    const data = safeParse(rawBody);
    if (!data || data.error) return res.status(200).json({ success: true, thinking: '已使用原始大纲。', pptData: outline });
    const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
    if (!text) return res.status(200).json({ success: true, thinking: '已使用原始大纲。', pptData: outline });
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    let thinking = text, pptData = null;
    if (jsonMatch) { thinking = text.substring(0, text.indexOf('```json')).trim(); pptData = safeParse(jsonMatch[1]); }
    if (!pptData) { const fb = text.match(/\{[\s\S]*\}/); if (fb) { if (!jsonMatch) thinking = text.substring(0, text.indexOf(fb[0])).trim(); pptData = safeParse(fb[0]); } }
    if (!pptData) pptData = outline;
    return res.status(200).json({ success: true, thinking: thinking || '优化完成。', pptData });
  } catch (error) {
    const o = req.body?.outline;
    if (o) return res.status(200).json({ success: true, thinking: '已使用原始大纲。', pptData: o });
    return res.status(500).json({ error: error.message });
  }
}
