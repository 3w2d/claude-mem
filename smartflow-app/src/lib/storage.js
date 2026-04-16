export const STORAGE_KEYS = {
  FILES: 'smartflow-v3:files',
  EVENTS: 'smartflow-v3:events',
  TASKS: 'smartflow-v3:tasks',
  AI_HISTORY: 'smartflow-v3:ai-history',
  SETTINGS: 'smartflow-v3:settings',
};

export const store = {
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
