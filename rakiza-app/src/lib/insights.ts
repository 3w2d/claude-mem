import type { Project, WorkLog } from '../types';
import { addDays, lastNDays, parseDayKey, startOfWeek, todayKey } from './date';

export interface RatePoint { label: string; value: number; }

export function weeklyRates(p: Project, logs: WorkLog[], weekStart: number): RatePoint[] {
  const now = todayKey();
  let cursor = startOfWeek(now, weekStart);
  const out: RatePoint[] = [];
  const set = new Set(logs.filter(l => l.projectId === p.id).map(l => l.day));
  for (let i = 0; i < 8; i++) {
    let due = 0, done = 0;
    for (let d = cursor; d <= addDays(cursor, 6); d = addDays(d, 1)) {
      if (parseDayKey(d).getTime() < p.createdAt - 86400000) continue;
      if (parseDayKey(d).getTime() > parseDayKey(now).getTime()) break;
      due++;
      if (set.has(d)) done++;
    }
    const dShort = (() => { const x = parseDayKey(cursor); return `${x.getDate()}/${x.getMonth()+1}`; })();
    out.unshift({ label: dShort, value: due ? done/due : 0 });
    cursor = addDays(cursor, -7);
  }
  return out;
}

export function medianHour(logs: WorkLog[], projectId: string): number | null {
  const hrs: number[] = [];
  for (const l of logs) if (l.projectId === projectId) hrs.push(new Date(l.at).getHours());
  if (hrs.length < 5) return null;
  hrs.sort((a,b)=>a-b);
  return hrs[Math.floor(hrs.length / 2)];
}

export interface HeatCell { day: string; done: boolean; }

export function heatmap(p: Project, logs: WorkLog[]): HeatCell[][] {
  const set = new Set(logs.filter(l => l.projectId === p.id).map(l => l.day));
  const today = todayKey();
  const cells: HeatCell[][] = [];
  for (let w = 11; w >= 0; w--) {
    const col: HeatCell[] = [];
    for (let d = 6; d >= 0; d--) {
      const day = addDays(today, -(w * 7 + d));
      col.push({ day, done: set.has(day) });
    }
    cells.push(col);
  }
  return cells;
}

export function aggregate(projects: Project[], logs: WorkLog[]) {
  const today = todayKey();
  const last7 = lastNDays(7);
  const last30 = lastNDays(30);
  let due7 = 0, done7 = 0, due30 = 0, done30 = 0;
  const dayDone = new Map<string, number>();
  const set = new Map<string, Set<string>>();
  for (const l of logs) {
    let s = set.get(l.projectId); if (!s) { s = new Set(); set.set(l.projectId, s); }
    s.add(l.day);
  }
  for (const p of projects) {
    if (p.archived) continue;
    const done = set.get(p.id) ?? new Set<string>();
    for (const d of last7) {
      if (parseDayKey(d).getTime() < p.createdAt - 86400000) continue;
      due7++;
      if (done.has(d)) { done7++; dayDone.set(d, (dayDone.get(d) ?? 0) + 1); }
      else dayDone.set(d, dayDone.get(d) ?? 0);
    }
    for (const d of last30) {
      if (parseDayKey(d).getTime() < p.createdAt - 86400000) continue;
      due30++;
      if (done.has(d)) done30++;
    }
  }
  return {
    rate7: due7 ? done7 / due7 : 0,
    rate30: due30 ? done30 / due30 : 0,
    todayDone: dayDone.get(today) ?? 0,
    perDay: last7.map(d => ({ day: d, done: dayDone.get(d) ?? 0 })),
  };
}
