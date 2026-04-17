import { PublicClientApplication } from '@azure/msal-browser';
import { getRuntimeConfig } from './runtimeConfig.js';

export const GRAPH_SCOPES = ['User.Read', 'Calendars.Read', 'Files.Read'];

let _client = null;
let _builtFor = '';
let _initPromise = null;

function build() {
  const cfg = getRuntimeConfig();
  if (!cfg.azureClientId) {
    _client = null;
    _builtFor = '';
    _initPromise = null;
    return null;
  }
  const tenant = cfg.azureTenantId || 'common';
  const redirect =
    cfg.azureRedirectUri ||
    (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '');
  const fingerprint = `${cfg.azureClientId}|${tenant}|${redirect}`;
  if (_client && _builtFor === fingerprint) return _client;
  _builtFor = fingerprint;
  _initPromise = null;
  _client = new PublicClientApplication({
    auth: { clientId: cfg.azureClientId, authority: `https://login.microsoftonline.com/${tenant}`, redirectUri: redirect },
    cache: { cacheLocation: 'localStorage' },
  });
  return _client;
}

export function hasAzure() {
  return Boolean(getRuntimeConfig().azureClientId);
}

export function initMsal() {
  const c = build();
  if (!c) return Promise.resolve();
  if (!_initPromise) _initPromise = c.initialize().then(() => c.handleRedirectPromise());
  return _initPromise;
}

export function getActiveAccount() {
  const c = build();
  if (!c) return null;
  const active = c.getActiveAccount();
  if (active) return active;
  const all = c.getAllAccounts();
  if (all.length > 0) {
    c.setActiveAccount(all[0]);
    return all[0];
  }
  return null;
}

export async function login() {
  const c = build();
  if (!c) throw new Error('Azure AD is not configured');
  await initMsal();
  const result = await c.loginPopup({ scopes: GRAPH_SCOPES, prompt: 'select_account' });
  if (result?.account) c.setActiveAccount(result.account);
  return result?.account || null;
}

export async function logout() {
  const c = build();
  if (!c) return;
  await initMsal();
  const account = getActiveAccount();
  await c.logoutPopup({ account });
}

export async function getAccessToken() {
  const c = build();
  if (!c) throw new Error('Azure AD is not configured');
  await initMsal();
  const account = getActiveAccount();
  if (!account) throw new Error('No active account — call login() first');
  try {
    const res = await c.acquireTokenSilent({ scopes: GRAPH_SCOPES, account });
    return res.accessToken;
  } catch {
    const res = await c.acquireTokenPopup({ scopes: GRAPH_SCOPES, account });
    return res.accessToken;
  }
}
