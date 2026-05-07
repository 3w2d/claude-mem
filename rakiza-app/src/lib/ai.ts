// Anthropic client for the in-app AI architect.
// Calls api.anthropic.com directly from RN with the
// "anthropic-dangerous-direct-browser-access" override.

import type { Project } from '../types';
import { computeBoq } from './boq';

const API_URL = 'https://api.anthropic.com/v1/messages';

export const SYSTEM_PROMPT = `أنت مهندس معماري سعودي خبير ومستشار يعمل داخل تطبيق رَكيزة.

أنت لست مجرد منفّذ أوامر — أنت زميل يفكّر معي.
- حاور المستخدم. لو الطلب غامض اسأله سؤالاً واحداً مركزاً قبل التنفيذ.
- اقترح 2-3 بدائل مع سطر تبرير لكل خيار قبل تنفيذ تعديل كبير.
- ابحث في الإنترنت بأداة web_search عند الحاجة لأسعار، اشتراطات بلدية، اتجاهات تصميم.
- أعطِ سبباً قصيراً لكل قرار.
- حذّر إذا الطلب يخالف الكود السعودي للبناء.

نظام الإحداثيات:
- x: من الغرب (0) إلى الشرق (موجب) — متر
- y: من الجنوب (0) إلى الشمال (موجب) — متر

المعايير السعودية القياسية:
- مجلس رجال 4.5×6 (مدخل منفصل مفضّل)
- غرفة رئيسية 4×4 + حمام داخلي 2×2.5
- غرفة نوم عادية 3×3.5
- مطبخ رئيسي 4×3.75
- حمام 1.5×2
- ممر ≥ 1.2
- ارتفاع الدور: 3.3-3.8م
- ملحق خادمة 2.5×3 + حمامها

أسلوب الكلام: مختصر وعملي بالعربية الفصحى المبسّطة.`;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: any;
}

export const TOOLS = [
  { type: 'web_search_20250305', name: 'web_search', max_uses: 4 },
  { name: 'describe_project', description: 'يصف المشروع: عدد الأدوار وأبعادها وتعداد العناصر', input_schema: { type: 'object', properties: {} } },
  { name: 'add_wall', description: 'يضيف جداراً من (x1,y1) إلى (x2,y2)', input_schema: { type: 'object', properties: { x1:{type:'number'}, y1:{type:'number'}, x2:{type:'number'}, y2:{type:'number'}, floor:{type:'integer'} }, required:['x1','y1','x2','y2'] } },
  { name: 'add_column', description: 'عمود في (x,y) بحجم size (m)', input_schema: { type: 'object', properties: { x:{type:'number'}, y:{type:'number'}, size:{type:'number'}, floor:{type:'integer'} }, required:['x','y'] } },
  { name: 'add_door', description: 'باب على أقرب جدار للنقطة', input_schema: { type: 'object', properties: { x:{type:'number'}, y:{type:'number'}, width:{type:'number'}, floor:{type:'integer'} }, required:['x','y'] } },
  { name: 'add_window', description: 'شباك على أقرب جدار', input_schema: { type: 'object', properties: { x:{type:'number'}, y:{type:'number'}, width:{type:'number'}, floor:{type:'integer'} }, required:['x','y'] } },
  { name: 'delete_at', description: 'يحذف العنصر الأقرب لنقطة', input_schema: { type: 'object', properties: { x:{type:'number'}, y:{type:'number'}, floor:{type:'integer'} }, required:['x','y'] } },
  { name: 'add_floor', description: 'يضيف دوراً (نسخة من copy_from اختياري)', input_schema: { type: 'object', properties: { copy_from: { type:'integer' } } } },
  { name: 'set_floor_height', description: 'ارتفاع دور (2.5-5)', input_schema: { type: 'object', properties: { index:{type:'integer'}, height:{type:'number'} }, required:['height'] } },
  { name: 'clear_floor', description: 'يفرغ دوراً', input_schema: { type: 'object', properties: { index:{type:'integer'} } } },
  { name: 'compute_costs', description: 'يرجع الكميات والتكلفة الحالية', input_schema: { type: 'object', properties: {} } },
];

export async function callAnthropic(opts: {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  project?: Project;
  pricing?: any;
}) {
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': opts.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: 2048,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      tools: TOOLS,
      messages: opts.messages,
    }),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error('Anthropic ' + resp.status + ': ' + txt.slice(0, 200));
  }
  return resp.json();
}

export function snapshot(p: Project, pricing: any) {
  const boq = computeBoq(p, pricing);
  return {
    name: p.name,
    floors: p.floors.map((f, i) => ({
      index: i, name: f.name, height: f.height,
      walls: f.walls.length, columns: f.columns.length,
      doors: f.doors.length, windows: f.windows.length,
    })),
    boq: {
      total_concrete_m3: +boq.totalConcrete.toFixed(2),
      steel_tons: +boq.steel.toFixed(2),
      cost_sar: Math.round(boq.cost),
    },
  };
}
