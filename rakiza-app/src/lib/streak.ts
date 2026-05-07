import type { Project, WorkLog } from '../types';
import { addDays, lastNDays, parseDayKey, todayKey } from './date';

export interface StreakStats {
  current: number;
  longest: number;
  totalSessions: number;
  rate7: number;
  rate30: number;
  rateAll: number;
  lastWorked?: string;
}

// Streak: consecutive days with at least one log entry.
export function streakFor(p: Project, logs: WorkLog[]): StreakStats {
  const days = new Set<string>();
  let totalSessions = 0;
  let lastWorked: string | undefined;
  for (const l of logs) {
    if (l.projectId !== p.id) continue;
    days.add(l.day);
    totalSessions++;
    if (!lastWorked || l.day > lastWorked) lastWorked = l.day;
  }

  const today = todayKey();
  let current = 0;
  let day = today;
  let allowedSkipToday = !days.has(today);
  for (let i = 0; i < 365 * 5; i++) {
    if (parseDayKey(day).getTime() < p.createdAt - 86400000) break;
    if (days.has(day)) {
      current++;
    } else if (day === today && allowedSkipToday) {
      allowedSkipToday = false;
    } else {
      break;
    }
    day = addDays(day, -1);
  }

  // Longest run
  const sorted = [...days].sort();
  let longest = 0, run = 0, prev: string | null = null;
  for (const d of sorted) {
    if (prev && addDays(prev, 1) === d) run++;
    else run = 1;
    if (run > longest) longest = run;
    prev = d;
  }
  if (current > longest) longest = current;

  return {
    current,
    longest,
    totalSessions,
    rate7: rateOver(p, logs, 7),
    rate30: rateOver(p, logs, 30),
    rateAll: rateSince(p, logs),
    lastWorked,
  };
}

export function rateOver(p: Project, logs: WorkLog[], days: number): number {
  const last = lastNDays(days);
  const set = new Set(logs.filter(l => l.projectId === p.id).map(l => l.day));
  let due = 0, done = 0;
  for (const d of last) {
    if (parseDayKey(d).getTime() < p.createdAt - 86400000) continue;
    due++;
    if (set.has(d)) done++;
  }
  return due === 0 ? 0 : done / due;
}

export function rateSince(p: Project, logs: WorkLog[]): number {
  const today = parseDayKey(todayKey()).getTime();
  const days = Math.max(1, Math.floor((today - p.createdAt) / 86400000) + 1);
  return rateOver(p, logs, Math.min(days, 365));
}

export type Health = 'cold' | 'cool' | 'warm' | 'hot' | 'blazing';
export function streakHealth(s: StreakStats): Health {
  if (s.current >= 30) return 'blazing';
  if (s.current >= 14) return 'hot';
  if (s.current >= 7)  return 'warm';
  if (s.current >= 3)  return 'cool';
  return 'cold';
}

export function isLoggedToday(logs: WorkLog[], projectId: string): boolean {
  const t = todayKey();
  for (const l of logs) if (l.projectId === projectId && l.day === t) return true;
  return false;
}
