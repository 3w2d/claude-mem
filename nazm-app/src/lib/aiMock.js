// Mock AI assistant: pattern-matches user questions against FIELD_STATS
// to produce realistic-looking "conflict detection" and summaries.
// Replace this module with a real LLM call later; the interface is stable.

import { FIELD_STATS, AI_MESSAGE } from '../config.js';

const intents = [
  { key: 'conflicts', ar: /تداخل|تعارض|جدول|مواعيد/i, en: /conflict|overlap|schedul/i },
  { key: 'claims',    ar: /مطالب|مال/i,               en: /claim|financial/i },
  { key: 'offices',   ar: /مكاتب|مكتب/i,              en: /office/i },
  { key: 'staff',     ar: /موظف|فريق/i,               en: /staff|team|employee/i },
  { key: 'summary',   ar: /ملخص|حالة|وضع/i,           en: /summary|status|overview/i },
];

function detectIntent(text, isRtl) {
  const list = intents.map((i) => ({ key: i.key, rx: isRtl ? i.ar : i.en }));
  const hit = list.find((i) => i.rx.test(text));
  return hit?.key || 'default';
}

function stat(key) {
  return FIELD_STATS.find((s) => s.key === key)?.value ?? 0;
}

export function respond(userText, { isRtl = true } = {}) {
  const intent = detectIntent(userText || '', isRtl);

  if (intent === 'conflicts') {
    return isRtl
      ? `رصدت 3 تعارضات محتملة في مواعيد الصيانة عبر ${stat('offices')} مكتباً. أقترح إعادة توزيع الفرق لتقليل زمن التنقل بنسبة ~18%.`
      : `I detected 3 potential maintenance scheduling conflicts across ${stat('offices')} offices. I suggest rebalancing teams to cut travel time by ~18%.`;
  }
  if (intent === 'claims') {
    return isRtl
      ? `لديك ${stat('claims')} مطالبة مالية نشطة. 12 منها تحتاج موافقتك خلال الـ 48 ساعة القادمة.`
      : `You have ${stat('claims')} active financial claims. 12 need your approval in the next 48h.`;
  }
  if (intent === 'offices') {
    return isRtl
      ? `${stat('offices')} مكتباً ميدانياً تحت إشرافك. أعلى كثافة مهام في منطقة مكة (صناعية).`
      : `${stat('offices')} field offices under your supervision. Highest task density in Makkah industrial zone.`;
  }
  if (intent === 'staff') {
    return isRtl
      ? `${stat('staff')} موظفاً موزعون على الفرق الميدانية. معدل الإنتاجية الأسبوعي 94%.`
      : `${stat('staff')} staff across field teams. Weekly productivity rate 94%.`;
  }
  if (intent === 'summary') {
    return isRtl ? AI_MESSAGE.ar : AI_MESSAGE.en;
  }
  return isRtl
    ? 'اسألني عن المطالبات، المكاتب، الموظفين، أو التعارضات في الجدول.'
    : 'Ask me about claims, offices, staff, or scheduling conflicts.';
}

// Kept promise-shaped so UIs can wire a spinner that matches future LLM latency.
export function ask(userText, opts) {
  return new Promise((resolve) => {
    const delay = 350 + Math.random() * 450;
    setTimeout(() => resolve(respond(userText, opts)), delay);
  });
}
