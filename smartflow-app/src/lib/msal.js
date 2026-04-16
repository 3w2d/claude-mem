import { PublicClientApplication } from '@azure/msal-browser';

const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID || 'common';
const redirectUri =
  import.meta.env.VITE_AZURE_REDIRECT_URI ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');

export const hasAzure = Boolean(clientId);
export const GRAPH_SCOPES = ['User.Read', 'Calendars.Read', 'Files.Read'];

export const msal = hasAzure
  ? new PublicClientApplication({
      auth: { clientId, authority: `https://login.microsoftonline.com/${tenantId}`, redirectUri },
      cache: { cacheLocation: 'localStorage' },
    })
  : null;

let initPromise = null;
export function initMsal() {
  if (!msal) return Promise.resolve();
  if (!initPromise) initPromise = msal.initialize().then(() => msal.handleRedirectPromise());
  return initPromise;
}

export function getActiveAccount() {
  if (!msal) return null;
  const active = msal.getActiveAccount();
  if (active) return active;
  const all = msal.getAllAccounts();
  if (all.length > 0) {
    msal.setActiveAccount(all[0]);
    return all[0];
  }
  return null;
}

export async function login() {
  if (!msal) throw new Error('Azure AD is not configured');
  await initMsal();
  const result = await msal.loginPopup({ scopes: GRAPH_SCOPES, prompt: 'select_account' });
  if (result?.account) msal.setActiveAccount(result.account);
  return result?.account || null;
}

export async function logout() {
  if (!msal) return;
  await initMsal();
  const account = getActiveAccount();
  await msal.logoutPopup({ account });
}

export async function getAccessToken() {
  if (!msal) throw new Error('Azure AD is not configured');
  await initMsal();
  const account = getActiveAccount();
  if (!account) throw new Error('No active account — call login() first');
  try {
    const res = await msal.acquireTokenSilent({ scopes: GRAPH_SCOPES, account });
    return res.accessToken;
  } catch {
    const res = await msal.acquireTokenPopup({ scopes: GRAPH_SCOPES, account });
    return res.accessToken;
  }
}
