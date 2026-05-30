export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const body = await request.json();
  const model = body.model || '';

  let apiUrl, apiKey;
  if (model.includes('deepseek')) {
    apiUrl = 'https://api.deepseek.com/chat/completions';
    apiKey = env.DEEPSEEK_API_KEY;
  } else {
    apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    apiKey = env.ZHIPU_API_KEY;
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return new Response(response.body, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
