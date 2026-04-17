import { createClient } from '@supabase/supabase-js';
import { getRuntimeConfig } from './runtimeConfig.js';

let _client = null;
let _builtFor = '';

function build() {
  const { supabaseUrl, supabaseAnonKey } = getRuntimeConfig();
  if (!supabaseUrl || !supabaseAnonKey) {
    _client = null;
    _builtFor = '';
    return null;
  }
  const fingerprint = `${supabaseUrl}|${supabaseAnonKey}`;
  if (_client && _builtFor === fingerprint) return _client;
  _builtFor = fingerprint;
  _client = createClient(supabaseUrl, supabaseAnonKey);
  return _client;
}

export function hasSupabase() {
  const cfg = getRuntimeConfig();
  return Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey);
}

export function getSupabase() {
  return build();
}

const DEVICE_KEY = 'smartflow-v3:device-id';

export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = (crypto.randomUUID?.() ?? `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}
