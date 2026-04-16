export const aiEnabled =
  import.meta.env.VITE_AI_ENABLED === 'true' || import.meta.env.VITE_AI_ENABLED === '1';

// Calls the server-side OpenAI proxy at /api/chat.
// Throws on non-OK responses so the caller can fall back to local matching.
export async function chatCompletion({ messages, context }) {
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
