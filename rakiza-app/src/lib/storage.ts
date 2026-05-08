import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Project, ThemeMode } from '../types';

const KEY_PROJECTS_PRIMARY = 'rk:projects:v2';
const KEY_PROJECTS_BACKUP  = 'rk:projects:backup';
const KEY_THEME            = 'rk:theme';
const KEY_PAGE             = 'rk:page';

let writeTimer: ReturnType<typeof setTimeout> | null = null;
let pending: Project[] | null = null;

export async function loadProjects(): Promise<Project[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_PROJECTS_PRIMARY);
    if (raw) return JSON.parse(raw);
  } catch {}
  try {
    const raw = await AsyncStorage.getItem(KEY_PROJECTS_BACKUP);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveProjects(projects: Project[]) {
  pending = projects;
  if (writeTimer) return;
  writeTimer = setTimeout(async () => {
    const v = pending!; pending = null; writeTimer = null;
    try {
      const raw = JSON.stringify(v);
      await AsyncStorage.setItem(KEY_PROJECTS_PRIMARY, raw);
      await AsyncStorage.setItem(KEY_PROJECTS_BACKUP, raw);
    } catch {}
  }, 150);
}

export async function loadTheme(): Promise<ThemeMode> {
  try {
    const v = await AsyncStorage.getItem(KEY_THEME);
    if (v === 'light' || v === 'dark') return v;
  } catch {}
  return 'dark';
}
export async function saveTheme(t: ThemeMode) {
  try { await AsyncStorage.setItem(KEY_THEME, t); } catch {}
}

export async function loadPage(): Promise<string> {
  try { return (await AsyncStorage.getItem(KEY_PAGE)) ?? 'landing'; } catch { return 'landing'; }
}
export async function savePage(p: string) {
  try { await AsyncStorage.setItem(KEY_PAGE, p); } catch {}
}
