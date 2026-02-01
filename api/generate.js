// Vercel Serverless Function - 使用 Google Gemini API（免费）
// 免费额度：每天 1500 次请求，足够 MVP 使用

export const config = {
  runtime: 'edge',
};

const SYSTEM_PROMPT = `你是一个专业的 PPT 结构设计师。用户会告诉你他们想要的 PPT 主题和要求，你需要生成一个结构化的 PPT 大纲。

请严格按照以下 JSON 格式输出，不要添加任何其他文字、不要添加 markdown 代码块标记：

{
  "title": "PPT 标题",
  "audience": "目标受众",
  "theme": {
    "primary": "#1e293b",
    "accent": "#3b82f6",
    "background": "#ffffff"
  },
  "slides": [
    {
      "type": "title",
      "headline": "主标题",
      "subheadline": "副标题"
    },
    {
      "type": "agenda",
      "headline": "议程标题",
      "bullets": ["议程项1", "议程项2", "议程项3"]
    },
    {
      "type": "content",
      "headline": "内容页标题",
      "bullets": ["要点1", "要点2", "要点3", "要点4"]
    },
    {
      "type": "two-column",
      "headline": "对比页标题",
      "leftTitle": "左列标题",
      "leftBullets": ["左1", "左2"],
      "rightTitle": "右列标题",
      "rightBullets": ["右1", "右2"]
    },
    {
      "type": "closing",
      "headline": "结束语",
      "subheadline": "行动号召",
      "bullets": ["下一步1", "下一步2"]
    }
  ]
}

slide type 可选值：title, agenda, content, two-column, closing

设计原则：
1. 第一页必须是 title 类型
2. 第二页建议是 agenda 类型（如果页数 >= 5）
3. 最后一页建议是 closing 类型
4. 每页 bullets 控制在 3-5 条
5. 内容要专业、有洞察、对目标受众有价值
6. 根据用户指定的页数来控制 slides 数量
7. 可以根据主题选择合适的配色方案`;

export default async function handler(request) {
  // CORS 处理
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 从环境变量获取 Gemini API Key
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Gemini API Key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid prompt' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 调用 Google Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${SYSTEM_PROMPT}\n\n用户需求：${prompt}` }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          }
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error('Gemini API Error:', data.error);
      return new Response(JSON.stringify({ error: data.error.message || 'Gemini API error' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 提取文本内容
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // 清理并解析 JSON
    let cleanText = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        const pptData = JSON.parse(jsonMatch[0]);
        return new Response(JSON.stringify({ success: true, data: pptData }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError, 'Text:', cleanText);
        return new Response(JSON.stringify({ error: 'Failed to parse response JSON' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ error: 'No valid JSON in response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
