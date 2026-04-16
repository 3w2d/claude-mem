// POST /api/chat
// Proxies the AI Assistant to OpenAI. The API key stays on the server.
// Works as a Vercel/Netlify function (default export takes req/res) and is
// also wired into Vite's dev server via `vitePlugins.js`.

const SYSTEM_PROMPT = `أنت مساعد ذكي باللغة العربية اسمه "SmartFlow".
تساعد المستخدم في إدارة ملفاته ومواعيده ومهامه.
تجيب بلهجة ودودة ومختصرة. استخدم البيانات المرفقة في كل رد.
عند السؤال عن المواعيد أو المهام، اذكر العدد والتفاصيل المهمة فقط.
إذا كانت البيانات فارغة، اقترح على المستخدم إضافة عناصر جديدة.`;

export default async function chatHandler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }));
    return;
  }

  const body = await readJson(req);
  const { messages = [], context = null } = body || {};

  const contextBlock = context
    ? [
        { role: 'system', content: 'بيانات المستخدم الحالية (JSON):' },
        { role: 'system', content: JSON.stringify(context) },
      ]
    : [];

  const payload = {
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    temperature: 0.4,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...contextBlock, ...messages],
  };

  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await upstream.json();
    if (!upstream.ok) {
      res.statusCode = upstream.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: data?.error?.message || 'OpenAI request failed' }));
      return;
    }
    const text = data?.choices?.[0]?.message?.content?.trim() || '';
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ text }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: String(err?.message || err) }));
  }
}

function readJson(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}
