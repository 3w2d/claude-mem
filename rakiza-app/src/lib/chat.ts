// Streaming chat client for Gemini + OpenRouter (OpenAI-compatible).
// Uses XMLHttpRequest with progress events on native, ReadableStream on web.

import type { ProviderId } from './providers';

export type Role = 'user' | 'assistant' | 'system';

export interface ImagePart {
  kind: 'image';
  mime: string;
  base64: string;
}
export interface TextPart {
  kind: 'text';
  text: string;
}
export type ContentPart = TextPart | ImagePart;

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  parts?: ContentPart[];   // optional rich content
  at: number;
  tokensIn?: number;
  tokensOut?: number;
  error?: string;
}

export interface StreamCallbacks {
  onDelta: (text: string) => void;
  onDone: (final: { text: string; usage?: { input: number; output: number } }) => void;
  onError: (msg: string) => void;
}

export interface ChatRequest {
  provider: ProviderId;
  apiKey: string;
  model: string;
  system?: string;
  messages: ChatMessage[];
  signal?: AbortSignal;
}

// ── Public entry ────────────────────────────────────────────
export async function streamChat(req: ChatRequest, cb: StreamCallbacks) {
  try {
    if (!req.apiKey) {
      cb.onError('لم يتم إدخال مفتاح API. افتح الإعدادات وأضف المفتاح أولاً.');
      return;
    }
    if (req.provider === 'gemini') return await streamGemini(req, cb);
    return await streamOpenAICompat(req, cb);
  } catch (e: any) {
    cb.onError(humanError(e?.message || String(e)));
  }
}

// ── Gemini ──────────────────────────────────────────────────
async function streamGemini(req: ChatRequest, cb: StreamCallbacks) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(req.model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(req.apiKey)}`;

  const contents: any[] = [];
  for (const m of req.messages) {
    if (m.role === 'system') continue;
    const role = m.role === 'assistant' ? 'model' : 'user';
    const parts: any[] = [];
    if (m.parts && m.parts.length) {
      for (const p of m.parts) {
        if (p.kind === 'text') parts.push({ text: p.text });
        else parts.push({ inline_data: { mime_type: p.mime, data: p.base64 } });
      }
    } else if (m.content) {
      parts.push({ text: m.content });
    }
    if (parts.length) contents.push({ role, parts });
  }

  const body: any = { contents };
  if (req.system) body.systemInstruction = { parts: [{ text: req.system }] };

  let collected = '';
  let usage: { input: number; output: number } | undefined;

  await streamSse(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: req.signal,
    onEvent: (raw) => {
      // Gemini SSE emits JSON lines under "data:".
      let evt: any;
      try { evt = JSON.parse(raw); } catch { return; }
      if (evt.error) {
        cb.onError(humanError(evt.error.message || JSON.stringify(evt.error)));
        return;
      }
      const candidate = evt?.candidates?.[0];
      const piece = candidate?.content?.parts?.map((p: any) => p.text ?? '').join('') ?? '';
      if (piece) {
        collected += piece;
        cb.onDelta(piece);
      }
      if (evt?.usageMetadata) {
        usage = {
          input: evt.usageMetadata.promptTokenCount ?? 0,
          output: evt.usageMetadata.candidatesTokenCount ?? 0,
        };
      }
    },
  });
  cb.onDone({ text: collected, usage });
}

// ── OpenAI-compatible (OpenRouter) ──────────────────────────
async function streamOpenAICompat(req: ChatRequest, cb: StreamCallbacks) {
  const url = 'https://openrouter.ai/api/v1/chat/completions';
  const messages: any[] = [];
  if (req.system) messages.push({ role: 'system', content: req.system });
  for (const m of req.messages) {
    if (m.parts && m.parts.length) {
      const content: any[] = m.parts.map(p => p.kind === 'text'
        ? { type: 'text', text: p.text }
        : { type: 'image_url', image_url: { url: `data:${p.mime};base64,${p.base64}` } }
      );
      messages.push({ role: m.role, content });
    } else {
      messages.push({ role: m.role, content: m.content });
    }
  }

  let collected = '';
  let usage: { input: number; output: number } | undefined;

  await streamSse(url, {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${req.apiKey}`,
      'content-type': 'application/json',
      'HTTP-Referer': 'https://rakiza.app',
      'X-Title': 'Rakiza',
    },
    body: JSON.stringify({ model: req.model, messages, stream: true, usage: { include: true } }),
    signal: req.signal,
    onEvent: (raw) => {
      if (raw === '[DONE]') return;
      let evt: any;
      try { evt = JSON.parse(raw); } catch { return; }
      if (evt.error) {
        cb.onError(humanError(evt.error.message || JSON.stringify(evt.error)));
        return;
      }
      const piece = evt?.choices?.[0]?.delta?.content ?? '';
      if (piece) {
        collected += piece;
        cb.onDelta(piece);
      }
      if (evt?.usage) {
        usage = { input: evt.usage.prompt_tokens ?? 0, output: evt.usage.completion_tokens ?? 0 };
      }
    },
  });
  cb.onDone({ text: collected, usage });
}

// ── SSE pump (works in both web fetch and RN XHR) ───────────
interface SseOpts {
  method: string;
  headers: Record<string, string>;
  body: string;
  signal?: AbortSignal;
  onEvent: (data: string) => void;
}
async function streamSse(url: string, o: SseOpts): Promise<void> {
  // Try web ReadableStream first.
  if (typeof Response !== 'undefined' && (Response as any).prototype.body) {
    try {
      const resp = await fetch(url, {
        method: o.method, headers: o.headers, body: o.body, signal: o.signal,
      });
      if (!resp.ok) {
        const txt = await resp.text().catch(() => '');
        throw new Error(`HTTP ${resp.status}: ${txt.slice(0, 300)}`);
      }
      const reader = resp.body?.getReader();
      if (!reader) throw new Error('no reader');
      const dec = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += dec.decode(value, { stream: true });
        buffer = drainSse(buffer, o.onEvent);
      }
      drainSse(buffer + '\n\n', o.onEvent);
      return;
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      // fall through to XHR
    }
  }
  // RN fallback: XMLHttpRequest with onprogress.
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let lastIdx = 0;
    let buffer = '';
    xhr.open(o.method, url, true);
    Object.entries(o.headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.onprogress = () => {
      if (xhr.status >= 400) return;
      const chunk = xhr.responseText.slice(lastIdx);
      lastIdx = xhr.responseText.length;
      buffer += chunk;
      buffer = drainSse(buffer, o.onEvent);
    };
    xhr.onerror = () => reject(new Error('network error'));
    xhr.ontimeout = () => reject(new Error('timeout'));
    xhr.onload = () => {
      if (xhr.status >= 400) {
        reject(new Error(`HTTP ${xhr.status}: ${xhr.responseText.slice(0, 300)}`));
      } else {
        const chunk = xhr.responseText.slice(lastIdx);
        buffer += chunk;
        drainSse(buffer + '\n\n', o.onEvent);
        resolve();
      }
    };
    if (o.signal) {
      o.signal.addEventListener('abort', () => { try { xhr.abort(); } catch {} resolve(); });
    }
    xhr.send(o.body);
  });
}

// Pull complete "data: ...\n\n" events out of the buffer.
// Returns the unconsumed remainder.
function drainSse(buf: string, emit: (data: string) => void): string {
  const out: string[] = [];
  let rest = buf;
  while (true) {
    const idx = rest.indexOf('\n\n');
    if (idx < 0) break;
    const evt = rest.slice(0, idx);
    rest = rest.slice(idx + 2);
    const lines = evt.split(/\r?\n/);
    let data = '';
    for (const line of lines) {
      if (line.startsWith('data:')) {
        data += line.slice(5).trimStart() + '\n';
      }
    }
    data = data.replace(/\n$/, '');
    if (data) out.push(data);
  }
  for (const d of out) emit(d);
  return rest;
}

// ── Map technical errors to human messages ──────────────────
function humanError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('401') || m.includes('unauthorized') || m.includes('api key not valid')) {
    return 'مفتاح API غير صالح. تأكّد من نسخه كاملاً وحاول مجدداً.';
  }
  if (m.includes('403')) return 'الموديل غير مفعَّل لمفتاحك أو منطقتك. جرّب موديلاً آخر.';
  if (m.includes('429') || m.includes('rate')) return 'تجاوزت الحد المجاني المسموح. انتظر دقيقة وحاول مرة أخرى، أو قلّل عدد الطلبات.';
  if (m.includes('400') && m.includes('image')) return 'الموديل لا يدعم الصور. جرّب موديلاً يدعم Vision.';
  if (m.includes('overloaded') || m.includes('503')) return 'الخادم مزدحم حالياً. أعد المحاولة بعد لحظة.';
  if (m.includes('network') || m.includes('failed to fetch')) return 'لا يوجد اتصال بالإنترنت أو الخدمة غير متاحة.';
  if (m.includes('safety') || m.includes('blocked')) return 'حُجِب الرد بسبب سياسات الأمان للمزوّد. أعد صياغة الطلب.';
  if (m.length > 200) return msg.slice(0, 200) + '…';
  return msg;
}

// Rough token estimator (1 token ≈ 4 chars for English, ~2 for Arabic).
export function estimateTokens(text: string): number {
  if (!text) return 0;
  const arabicChars = (text.match(/[؀-ۿ]/g) ?? []).length;
  const otherChars = text.length - arabicChars;
  return Math.ceil(arabicChars / 2 + otherChars / 4);
}
