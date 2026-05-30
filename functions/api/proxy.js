export async function onRequest(context) {
  const body = await context.request.json();
  const isDeepseek = (body.model || '').includes('deepseek');
  
  const res = await fetch(isDeepseek ? 'https://api.deepseek.com/chat/completions' : 'https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${isDeepseek ? context.env.DEEPSEEK_API_KEY : context.env.ZHIPU_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  return new Response(res.body, {
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' }
  });
}
