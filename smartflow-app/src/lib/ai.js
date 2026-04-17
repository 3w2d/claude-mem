import { getRuntimeConfig } from './runtimeConfig.js';

const SYSTEM_PROMPT = `أنت مساعد ذكي ودود اسمه SmartFlow. تساعد المستخدم في تنظيم ملفاته ومواعيده ومهامه.
اكتب بالعربية الفصحى البسيطة، وكن مختصراً ومباشراً. استخدم المعلومات في الـ context.`;

export function aiAvailable() {
  return Boolean(getRuntimeConfig().openaiApiKey);
}

export async function chatCompletion({ messages, context }) {
  const { openaiApiKey, openaiModel } = getRuntimeConfig();
  if (openaiApiKey) {
    return callOpenAIDirect({ apiKey: openaiApiKey, model: openaiModel || 'gpt-4o-mini', messages, context });
  }
  return callServerProxy({ messages, context });
}

async function callOpenAIDirect({ apiKey, model, messages, context }) {
  const sys = context ? `${SYSTEM_PROMPT}\n\nالسياق الحالي:\n${context}` : SYSTEM_PROMPT;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: sys }, ...messages],
      temperature: 0.4,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI request failed (${res.status})`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callServerProxy({ messages, context }) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `AI request failed (${res.status})`);
  }
  const data = await res.json();
  return data.text || '';
}
