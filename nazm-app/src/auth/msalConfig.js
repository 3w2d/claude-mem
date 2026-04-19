// MSAL config for Microsoft Entra (Azure AD) SPA login.
// Fill in tenant/client IDs via GitHub Actions secrets → Vite env vars.
import { LogLevel } from '@azure/msal-browser';

const clientId = import.meta.env.VITE_AZURE_CLIENT_ID || '';
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID || 'common';

// Redirect URI must match what you register in Azure Portal → App registration → Authentication.
// On GitHub Pages: https://3w2d.github.io/claude-mem/app/
// Locally: http://localhost:5173/
const redirectUri =
  typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname.replace(/index\.html$/, '')}`
    : '/';

export const isAuthConfigured = Boolean(clientId);

export const msalConfig = {
  auth: {
    clientId: clientId || '00000000-0000-0000-0000-000000000000',
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        if (level === LogLevel.Error) console.error(message);
      },
    },
  },
};

export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
};
