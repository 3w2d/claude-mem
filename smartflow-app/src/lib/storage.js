import { hasSupabase, getSupabase, getDeviceId } from './supabase.js';

export const STORAGE_KEYS = {
  FILES: 'smartflow-v3:files',
  EVENTS: 'smartflow-v3:events',
  TASKS: 'smartflow-v3:tasks',
  AI_HISTORY: 'smartflow-v3:ai-history',
  SETTINGS: 'smartflow-v3:settings',
};

const local = {
  async get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  async set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch {
      return false;
    }
  },
};

const remote = {
  async get(key) {
    const sb = getSupabase();
    if (!sb) return null;
    const deviceId = getDeviceId();
    const { data, error } = await sb
      .from('smartflow_state')
      .select('value')
      .eq('device_id', deviceId)
      .eq('key', key)
      .maybeSingle();
    if (error || !data) return null;
    return data.value;
  },
  async set(key, val) {
    const sb = getSupabase();
    if (!sb) return false;
    const deviceId = getDeviceId();
    const { error } = await sb
      .from('smartflow_state')
      .upsert({ device_id: deviceId, key, value: val }, { onConflict: 'device_id,key' });
    return !error;
  },
};

export const store = {
  async get(key) {
    if (hasSupabase()) {
      try {
        const v = await remote.get(key);
        if (v !== null) return v;
      } catch {
        /* fall through */
      }
    }
    return local.get(key);
  },
  async set(key, val) {
    const lok = await local.set(key, val);
    if (hasSupabase()) {
      try {
        await remote.set(key, val);
      } catch {
        /* swallow; local already succeeded */
      }
    }
    return lok;
  },
};
