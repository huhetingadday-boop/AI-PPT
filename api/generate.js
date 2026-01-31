// Vercel Serverless Function - 代理 Anthropic API 请求
// API Key 安全存储在环境变量中

export const config = {
  runtime: 'edge',
};

const SYSTEM_PROMPT = `你是一个专业的 PPT 结构设计师。用户会告诉你他们想要的 PPT 主题和要求，你需要生成一个结构化的 PPT 大纲。

请严格按照以下 JSON 格式输出，不要添加任何其他文字：

{
  "title": "PPT 标题",
  "audience": "目标受众",
  "theme": {
    "primary": "#1a1a2e",
    "accent": "#4361ee",
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
6. 根据用户指定的页数来控制 slides 数量`;

export default async function handler(request) {
  // 只允许 POST 请求
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 获取环境变量中的 API Key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API Key not configured' }), {
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

    // 调用 Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 提取并解析 JSON
    if (data.content && data.content[0] && data.content[0].text) {
      const text = data.content[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const pptData = JSON.parse(jsonMatch[0]);
        return new Response(JSON.stringify({ success: true, data: pptData }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Failed to parse AI response' }), {
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
