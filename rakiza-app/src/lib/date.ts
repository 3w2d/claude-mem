export type DayKey = string;

export function dayKey(d: Date | number = new Date()): DayKey {
  const date = typeof d === 'number' ? new Date(d) : d;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function parseDayKey(k: DayKey): Date {
  const [y,m,d] = k.split('-').map(Number);
  return new Date(y, m-1, d);
}
export function addDays(k: DayKey, n: number): DayKey {
  const d = parseDayKey(k); d.setDate(d.getDate()+n); return dayKey(d);
}
export function todayKey(): DayKey { return dayKey(); }
export function dayOfWeek(k: DayKey): number { return parseDayKey(k).getDay(); }
export function lastNDays(n: number): DayKey[] {
  const t = todayKey(); const out: DayKey[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(addDays(t, -i));
  return out;
}
export function startOfWeek(k: DayKey, weekStart: number): DayKey {
  const back = (dayOfWeek(k) - weekStart + 7) % 7;
  return addDays(k, -back);
}
export function shortDate(k: DayKey): string {
  const d = parseDayKey(k);
  return `${d.getDate()}/${d.getMonth()+1}`;
}
export function arabicDay(d: Date = new Date()): string {
  const days = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  return days[d.getDay()];
}
