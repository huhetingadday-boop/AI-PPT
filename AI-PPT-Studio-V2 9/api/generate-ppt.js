export const config = { maxDuration: 60 };

const buildPrompt = (outline, style, templateInfo) => `你是PPT内容优化师。基于以下大纲优化内容。

大纲：${JSON.stringify(outline)}
场景：${style}
${templateInfo ? `模板信息：${templateInfo}\n` : ''}

任务：先用150字说明优化思路，然后输出优化后的完整JSON（用\`\`\`json\`\`\`包裹）。
要求：保持结构不变，丰富内容，每个content页的bullets必须采用"标题: 详细说明"格式（中文冒号），根据场景调整语言风格，保持配色不变。每页bullets控制在3-4条。
JSON格式：{"title":"...","style":"${style}","audience":"...","theme":{...},"slides":[...]}`;

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
    const { outline, style, templateInfo } = req.body || {};
    if (!outline) return res.status(400).json({ error: 'Missing outline' });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);
    let response;
    try {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: buildPrompt(outline, style || '商业演讲', templateInfo || '') }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 4096 } }),
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
