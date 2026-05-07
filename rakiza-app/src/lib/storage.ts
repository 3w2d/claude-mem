// Resilient persistence: AsyncStorage primary + secondary backup, schema-versioned.
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppState } from '../types';
import { SCHEMA_VERSION, DEFAULT_SETTINGS, DEFAULT_PRICING } from '../types';

const KEY_PRIMARY = 'rakiza:state:v1';
const KEY_BACKUP  = 'rakiza:state:backup';

export const EMPTY_STATE: AppState = {
  projects: [],
  logs: [],
  settings: DEFAULT_SETTINGS,
  schemaVersion: SCHEMA_VERSION,
};

let writeTimer: ReturnType<typeof setTimeout> | null = null;
let pending: AppState | null = null;

export async function loadState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(KEY_PRIMARY);
    if (raw) return migrate(JSON.parse(raw));
  } catch {}
  try {
    const raw = await AsyncStorage.getItem(KEY_BACKUP);
    if (raw) return migrate(JSON.parse(raw));
  } catch {}
  return EMPTY_STATE;
}

export function persistState(s: AppState) {
  pending = s;
  if (writeTimer) return;
  writeTimer = setTimeout(async () => {
    const v = pending!;
    pending = null;
    writeTimer = null;
    try {
      const raw = JSON.stringify(v);
      await AsyncStorage.setItem(KEY_PRIMARY, raw);
      await AsyncStorage.setItem(KEY_BACKUP, raw);
    } catch {}
  }, 150);
}

export async function flushPending() {
  if (!pending) return;
  if (writeTimer) { clearTimeout(writeTimer); writeTimer = null; }
  const v = pending; pending = null;
  try {
    const raw = JSON.stringify(v);
    await AsyncStorage.setItem(KEY_PRIMARY, raw);
    await AsyncStorage.setItem(KEY_BACKUP, raw);
  } catch {}
}

function migrate(s: any): AppState {
  if (!s || typeof s !== 'object') return EMPTY_STATE;
  if (!Array.isArray(s.projects) || !Array.isArray(s.logs)) return EMPTY_STATE;
  return {
    projects: s.projects,
    logs: s.logs,
    settings: {
      ...DEFAULT_SETTINGS,
      ...(s.settings || {}),
      pricing: { ...DEFAULT_PRICING, ...((s.settings || {}).pricing || {}) },
    },
    schemaVersion: SCHEMA_VERSION,
  };
}

export async function clearAll() {
  await AsyncStorage.multiRemove([KEY_PRIMARY, KEY_BACKUP]);
}
