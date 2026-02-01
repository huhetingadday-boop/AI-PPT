// Node.js Serverless Function — 超时 60s
export const config = {
  maxDuration: 60,
};

const KNOWLEDGE_BASE = `
述职汇报：总-分-总结构，第一人称，正式专业，重视数据图表。
商业演讲：痛点-方案-优势-案例的故事线，"我们/您"，简洁有力，一页一重点。
投融资路演：经典十页法则（概述、痛点、方案、模式、市场、竞争、优势、团队、财务、融资），12-15页，短句关键词。
培训课件：导入-展开-小结循环，第二人称/祈使句，图文并茂，要点式列举。
学术汇报：标题→背景→方法→结果→结论→致谢，浅色背景深色文字，图表为重心，专业严谨。
项目总结：背景目标→过程产出→结果绩效→经验教训，正式客观，图表呈现数据。
竞聘演讲：个人简介→岗位理解→优势劣势→工作设想，第一人称，激情自信，用数据说话。`;

const buildPrompt = (style, content, urls, userPrompt) => `你是PPT内容战略家。根据用户材料和场景生成PPT大纲。

场景知识库：
${KNOWLEDGE_BASE}

用户选择的场景：【${style}】
${content ? `用户材料：\n${content}\n` : ''}
${urls ? `参考链接：${urls}\n` : ''}
${userPrompt ? `额外需求：${userPrompt}\n` : ''}

任务：
1. 先用200字分析：场景特点、提取的关键信息、结构规划、语言和视觉风格建议
2. 然后输出JSON大纲（用\`\`\`json\`\`\`包裹）

JSON格式：
\`\`\`json
{
  "title": "PPT标题",
  "style": "${style}",
  "audience": "目标受众",
  "theme": { "primary": "#1e293b", "accent": "#3b82f6", "background": "#ffffff" },
  "slides": [
    { "type": "title", "headline": "主标题", "subheadline": "副标题" },
    { "type": "agenda", "headline": "议程", "bullets": ["项1", "项2"] },
    { "type": "content", "headline": "标题", "bullets": ["要点1", "要点2", "要点3"] },
    { "type": "data", "headline": "数据", "metrics": [{"label":"指标","value":"数值","description":"说明"}] },
    { "type": "timeline", "headline": "时间线", "items": [{"phase":"阶段","title":"标题","description":"描述"}] },
    { "type": "two-column", "headline": "对比", "leftTitle":"左", "leftBullets":["左1"], "rightTitle":"右", "rightBullets":["右1"] },
    { "type": "closing", "headline": "结束", "subheadline": "号召", "bullets": ["下一步"] }
  ]
}
\`\`\`

type可选：title, agenda, content, data, timeline, two-column, closing
严格遵守【${style}】的结构和风格。8-15页，每页3-5条bullets。`;

const safeParse = (str) => {
  try { return JSON.parse(str); } catch { return null; }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API Key not configured' });

  try {
    const { prompt, style, content, urls } = req.body || {};
    const fullPrompt = buildPrompt(style || '商业演讲', content || '', urls || '', prompt || '');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);

    let response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 8192,
            },
          }),
        }
      );
    } catch (e) {
      clearTimeout(timeout);
      if (e.name === 'AbortError') {
        return res.status(504).json({ error: 'AI 生成超时，请简化输入后重试' });
      }
      throw e;
    }
    clearTimeout(timeout);

    const rawBody = await response.text();
    const data = safeParse(rawBody);

    if (!data) {
      console.error('Gemini non-JSON:', rawBody.substring(0, 300));
      return res.status(502).json({ error: 'Gemini API 返回异常，请重试' });
    }

    if (data.error) {
      return res.status(400).json({ error: data.error.message || 'Gemini API 错误' });
    }

    const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
    if (!text) {
      return res.status(500).json({ error: 'AI 返回空内容，请重试' });
    }

    const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    let thinking = text;
    let outline = null;

    if (jsonBlockMatch) {
      thinking = text.substring(0, text.indexOf('```json')).trim();
      outline = safeParse(jsonBlockMatch[1]);
    }
    if (!outline) {
      const fb = text.match(/\{[\s\S]*\}/);
      if (fb) {
        if (!jsonBlockMatch) thinking = text.substring(0, text.indexOf(fb[0])).trim();
        outline = safeParse(fb[0]);
      }
    }

    if (!outline) {
      return res.status(500).json({ error: 'AI 未生成有效大纲，请重试' });
    }

    return res.status(200).json({ success: true, thinking: thinking || '分析完成。', outline });

  } catch (error) {
    console.error('generate-outline error:', error);
    return res.status(500).json({ error: error.message || '服务器错误' });
  }
}
