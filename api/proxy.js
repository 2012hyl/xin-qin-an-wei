export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  const { model, messages, temperature, max_tokens, stream } = req.body;

  let apiUrl, apiKey;
  if (model && model.includes('deepseek')) {
    apiUrl = 'https://api.deepseek.com/chat/completions';
    apiKey = process.env.DEEPSEEK_API_KEY;
  } else {
    apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    apiKey = process.env.ZHIPU_API_KEY;
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key not configured' });
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens, stream }),
      signal: AbortSignal.timeout(25000),
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');

    if (stream) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value));
      }
      res.end();
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch (error) {
    return res.status(500).json({ error: 'AI 响应超时，请稍后重试' });
  }
}
