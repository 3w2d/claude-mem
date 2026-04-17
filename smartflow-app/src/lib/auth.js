import { getSupabase, hasSupabase } from './supabase.js';

const listeners = new Set();
let _currentUser = null;
let _subscribed = false;

export function hasAuth() {
  return hasSupabase();
}

export function getCurrentUser() {
  return _currentUser;
}

export function onAuthChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  for (const fn of listeners) fn(_currentUser);
}

export async function initAuth() {
  const sb = getSupabase();
  if (!sb) {
    if (_currentUser !== null) { _currentUser = null; notify(); }
    return null;
  }
  try {
    const { data: { session } } = await sb.auth.getSession();
    _currentUser = session?.user || null;
    if (!_subscribed) {
      sb.auth.onAuthStateChange((_evt, sess) => {
        _currentUser = sess?.user || null;
        notify();
      });
      _subscribed = true;
    }
    notify();
    return _currentUser;
  } catch (err) {
    console.warn('Auth init failed:', err);
    return null;
  }
}

export async function signInWithGoogle() {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase not configured');
  const redirect = window.location.origin + window.location.pathname;
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: redirect },
  });
  if (error) throw error;
}

export async function signOut() {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.auth.signOut();
  } finally {
    _currentUser = null;
    notify();
  }
}

export function getUserDisplay(user) {
  if (!user) return null;
  const meta = user.user_metadata || {};
  return {
    name: meta.full_name || meta.name || user.email?.split('@')[0] || 'مستخدم',
    email: user.email || '',
    avatar: meta.avatar_url || meta.picture || null,
    provider: user.app_metadata?.provider || 'email',
  };
}
