export const config = { runtime: 'edge' };

const buildPrompt = (outline, style) => `
你是一个顶级PPT内容优化师。用户已经确认了以下PPT大纲，请基于这份大纲进行内容扩展和优化。

## 用户确认的大纲
\`\`\`json
${JSON.stringify(outline, null, 2)}
\`\`\`

## PPT场景：${style}

## 你的任务

### 第一步：输出优化思路
请详细说明你对每一页的优化思路：
1. 你将如何丰富每页的内容
2. 哪些要点需要展开或补充数据
3. 语言风格如何调整以更贴合【${style}】场景
4. 视觉呈现上有什么建议

### 第二步：输出优化后的完整PPT
在优化思路之后，输出完整的JSON。你必须：
- 保持用户确认的整体结构不变
- 丰富和优化每页的标题和内容
- 确保每个bullet更加具体、有数据支撑
- 根据场景调整语言风格
- 保持主题配色方案不变

输出JSON格式（用\`\`\`json\`\`\`包裹）：
{
  "title": "PPT主标题",
  "style": "${style}",
  "audience": "目标受众",
  "theme": { "primary": "...", "accent": "...", "background": "..." },
  "slides": [
    // 与大纲相同的slide结构，但内容更丰富
    // type可选: title, agenda, content, data, timeline, two-column, closing
  ]
}
`;

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API Key not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { outline, style } = await request.json();
    if (!outline) {
      return new Response(JSON.stringify({ error: 'Missing outline' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const fullPrompt = buildPrompt(outline, style || '商业演讲');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
        }),
      }
    );

    const data = await response.json();
    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';

    const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    let thinking = text;
    let pptData = null;

    // 安全解析 JSON 的辅助函数
    const safeParse = (str) => {
      try { return JSON.parse(str); } catch (e) { return null; }
    };

    if (jsonBlockMatch) {
      thinking = text.substring(0, text.indexOf('```json')).trim();
      pptData = safeParse(jsonBlockMatch[1]);
      if (!pptData) {
        const fallback = text.match(/\{[\s\S]*\}/);
        if (fallback) pptData = safeParse(fallback[0]);
      }
    } else {
      const fallback = text.match(/\{[\s\S]*\}/);
      if (fallback) {
        thinking = text.substring(0, text.indexOf(fallback[0])).trim();
        pptData = safeParse(fallback[0]);
      }
    }

    // Fallback: if no enriched version, use the original outline
    if (!pptData) pptData = outline;

    return new Response(JSON.stringify({ success: true, thinking, pptData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
