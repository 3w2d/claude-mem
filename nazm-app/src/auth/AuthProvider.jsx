import React, { useEffect, useMemo, useState } from 'react';
import { PublicClientApplication, EventType, InteractionStatus } from '@azure/msal-browser';
import { MsalProvider, useMsal, useIsAuthenticated } from '@azure/msal-react';
import { msalConfig, loginRequest, isAuthConfigured } from './msalConfig.js';

const pca = new PublicClientApplication(msalConfig);

pca.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload?.account) {
    pca.setActiveAccount(event.payload.account);
  }
});

export function AuthProvider({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    pca.initialize().then(() => {
      const accounts = pca.getAllAccounts();
      if (accounts.length > 0 && !pca.getActiveAccount()) {
        pca.setActiveAccount(accounts[0]);
      }
      setReady(true);
    });
  }, []);

  if (!ready) return null;
  return <MsalProvider instance={pca}>{children}</MsalProvider>;
}

// Dev fallback: when VITE_AZURE_CLIENT_ID isn't set, we simulate auth locally
// so the UI still works end-to-end without an Azure registration.
const DEV_AUTH_KEY = 'nazm.devAuth';

export function useAuth() {
  const { instance, inProgress, accounts } = useMsal();
  const isMsalAuthed = useIsAuthenticated();
  const [devAuthed, setDevAuthed] = useState(() =>
    typeof window !== 'undefined' ? sessionStorage.getItem(DEV_AUTH_KEY) === '1' : false,
  );

  const busy = inProgress !== InteractionStatus.None;
  const account = accounts[0];

  const signIn = async () => {
    if (!isAuthConfigured) {
      sessionStorage.setItem(DEV_AUTH_KEY, '1');
      setDevAuthed(true);
      return { dev: true };
    }
    return instance.loginPopup(loginRequest).catch((err) => {
      console.error('MSAL loginPopup failed', err);
      throw err;
    });
  };

  const signOut = async () => {
    if (!isAuthConfigured) {
      sessionStorage.removeItem(DEV_AUTH_KEY);
      setDevAuthed(false);
      return;
    }
    const active = instance.getActiveAccount();
    return instance.logoutPopup({ account: active }).catch((err) => {
      console.error('MSAL logoutPopup failed', err);
    });
  };

  const isAuthenticated = isAuthConfigured ? isMsalAuthed : devAuthed;
  const profile = useMemo(() => {
    if (isAuthConfigured && account) {
      return {
        name: account.name || account.username,
        email: account.username,
        source: 'entra',
      };
    }
    if (devAuthed) {
      return { name: 'عوض الصمداني', email: 'awadh@nazm.local', source: 'dev' };
    }
    return null;
  }, [account, devAuthed]);

  return { isAuthenticated, isAuthConfigured, busy, profile, signIn, signOut };
}
