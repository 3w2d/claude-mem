const KEY = 'smartflow-v3:runtime-config';

const ENV_DEFAULTS = {
  azureClientId:    import.meta.env.VITE_AZURE_CLIENT_ID || '',
  azureTenantId:    import.meta.env.VITE_AZURE_TENANT_ID || 'common',
  azureRedirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || '',
  supabaseUrl:      import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey:  import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  openaiApiKey:     '',
  openaiModel:      'gpt-4o-mini',
};

const listeners = new Set();

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function getRuntimeConfig() {
  return { ...ENV_DEFAULTS, ...readSaved() };
}

export function saveRuntimeConfig(partial) {
  const next = { ...readSaved(), ...partial };
  localStorage.setItem(KEY, JSON.stringify(next));
  for (const fn of listeners) fn(getRuntimeConfig());
  return getRuntimeConfig();
}

export function clearRuntimeConfig() {
  localStorage.removeItem(KEY);
  for (const fn of listeners) fn(getRuntimeConfig());
}

export function onConfigChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
