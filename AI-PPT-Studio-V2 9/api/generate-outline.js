export const config = { maxDuration: 60 };

const KNOWLEDGE = `述职汇报:总-分-总,第一人称,数据图表。商业演讲:痛点-方案-优势-案例,故事线。投融资路演:经典十页法则,12-15页。培训课件:导入-展开-小结,互动式。学术汇报:背景-方法-结果-结论,严谨。项目总结:背景-过程-结果-改进,客观。竞聘演讲:个人简介-岗位理解-优势-工作设想。`;

const buildPrompt = (style, content, urls, userPrompt, templateInfo) => `你是PPT内容战略家。根据用户材料和场景生成PPT大纲。

场景知识库：${KNOWLEDGE}

用户选择的场景：【${style}】
${templateInfo ? `用户上传了PPT模板：${templateInfo}\n请确保大纲结构与用户模板匹配（如有封面模板则第一页为封面，有尾页模板则最后一页为结束页）。\n` : ''}
${content ? `用户材料：\n${content}\n` : ''}
${urls ? `参考链接：${urls}\n` : ''}
${userPrompt ? `额外需求：${userPrompt}\n` : ''}

任务：
1. 先用200字分析思路
2. 输出JSON大纲（\`\`\`json\`\`\`包裹）

JSON格式：
{"title":"标题","style":"${style}","audience":"受众","theme":{"primary":"#e2e8f0","accent":"#22d3ee","background":"#0c1222"},"slides":[{"type":"title","headline":"标题","subheadline":"副标题"},{"type":"content","headline":"标题","bullets":["要点1: 详细说明","要点2: 详细说明","要点3: 详细说明"]},{"type":"data","headline":"标题","metrics":[{"label":"指标","value":"数值","description":"说明"}]},{"type":"closing","headline":"结束","subheadline":"","bullets":["下一步"]}]}
type可选:title,agenda,content,data,timeline,two-column,closing
要求：每个content页的bullets必须采用"标题: 详细说明"格式（用中文冒号），每页3-4条。总共8-15页。
严格遵守【${style}】的结构和风格。`;

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
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: fullPrompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 8192 } }),
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
