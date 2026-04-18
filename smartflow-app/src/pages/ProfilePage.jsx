import React, { useState } from 'react';
import { T } from '../lib/theme.js';
import Card from '../components/Card.jsx';
import { I } from '../components/Icons.jsx';
import { hasAuth, signInWithGoogle, signOut, getUserDisplay } from '../lib/auth.js';
import { useT } from '../lib/i18n.js';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M12 11v3.2h4.5c-.2 1.2-1.4 3.5-4.5 3.5-2.7 0-4.9-2.2-4.9-5s2.2-5 4.9-5c1.5 0 2.6.6 3.2 1.2l2.2-2.1C16 5.5 14.2 4.7 12 4.7c-4.1 0-7.4 3.3-7.4 7.4s3.3 7.4 7.4 7.4c4.3 0 7.1-3 7.1-7.2 0-.5-.1-.9-.1-1.3H12z" />
    </svg>
  );
}

export default function ProfilePage({ user, setPage, files, events, tasks, msAccount, onMsLogout }) {
  const { t, dir } = useT();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const display = getUserDisplay(user);
  const pendingTasks = tasks.filter((x) => !x.done).length;
  const completedTasks = tasks.filter((x) => x.done).length;
  const supabaseReady = hasAuth();

  const handleGoogle = async () => {
    setErr('');
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setErr(e.message || t('profile.signInError'));
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setBusy(true);
    try {
      await signOut();
    } finally {
      setBusy(false);
    }
  };

  const handleExport = () => {
    const data = { files, events, tasks, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartflow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statItem = (val, label, color) => (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontFamily: T.fontEn, fontSize: 22, fontWeight: 800, color }}>{val}</div>
      <div style={{ fontFamily: T.font, fontSize: 11, color: T.textMuted, marginTop: 2 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ direction: dir, paddingBottom: 100 }}>
      <div style={{ marginBottom: 16, paddingTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontFamily: T.font, fontSize: 24, fontWeight: 700, color: T.text, margin: 0 }}>{t('profile.title')}</h2>
        <button
          onClick={() => setPage('home')}
          style={{ background: 'none', border: 'none', color: T.primary, fontFamily: T.font, fontSize: 13, cursor: 'pointer' }}
        >
          {t('common.back')}
        </button>
      </div>

      <Card style={{ padding: 20, marginBottom: 14, borderRadius: T.radiusSm, textAlign: 'center' }}>
        {display ? (
          <>
            {display.avatar ? (
              <img
                src={display.avatar}
                alt=""
                style={{ width: 80, height: 80, borderRadius: '50%', marginBottom: 10, border: `2px solid ${T.primary}` }}
              />
            ) : (
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  margin: '0 auto 10px',
                  background: `linear-gradient(135deg, ${T.primary}, ${T.accent1})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontFamily: T.font,
                  fontSize: 32,
                  fontWeight: 700,
                }}
              >
                {display.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ fontFamily: T.font, fontSize: 18, fontWeight: 700, color: T.text }}>{display.name}</div>
            <div style={{ fontFamily: T.fontEn, fontSize: 12, color: T.textMuted, marginTop: 2 }}>{display.email}</div>
            <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, background: T.primaryBg, padding: '3px 10px', borderRadius: 8 }}>
              <span style={{ fontFamily: T.font, fontSize: 11, color: T.primary }}>
                {t('profile.signedVia', { provider: display.provider === 'google' ? 'Google' : display.provider })}
              </span>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                margin: '0 auto 10px',
                background: T.surface,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: T.textMuted,
                fontSize: 40,
              }}
            >
              👤
            </div>
            <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 600, color: T.text }}>{t('profile.guest')}</div>
            <div style={{ fontFamily: T.font, fontSize: 12, color: T.textMuted, marginTop: 4 }}>
              {t('profile.guestHint')}
            </div>
          </>
        )}
      </Card>

      <Card style={{ padding: 16, marginBottom: 14, borderRadius: T.radiusSm }}>
        <div style={{ fontFamily: T.font, fontSize: 13, color: T.textMuted, marginBottom: 12 }}>{t('profile.stats')}</div>
        <div style={{ display: 'flex' }}>
          {statItem(files.length, t('profile.stat.files'), T.primary)}
          {statItem(events.length, t('profile.stat.events'), T.accent1)}
          {statItem(pendingTasks, t('profile.stat.pending'), T.accent2)}
          {statItem(completedTasks, t('profile.stat.done'), T.accent3)}
        </div>
      </Card>

      {!display && (
        <Card style={{ padding: 16, marginBottom: 14, borderRadius: T.radiusSm }}>
          <div style={{ fontFamily: T.font, fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 10 }}>{t('profile.signIn')}</div>
          {supabaseReady ? (
            <>
              <button
                onClick={handleGoogle}
                disabled={busy}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 12,
                  background: '#fff',
                  color: '#1f2937',
                  border: 'none',
                  fontFamily: T.font,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: busy ? 'not-allowed' : 'pointer',
                  opacity: busy ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
              >
                <GoogleIcon />
                <span>{t('profile.signInGoogle')}</span>
              </button>
              {err && (
                <div style={{ fontFamily: T.font, fontSize: 11, color: T.danger, marginTop: 8, lineHeight: 1.6 }}>
                  {err}
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ fontFamily: T.font, fontSize: 12, color: T.textMuted, lineHeight: 1.7, marginBottom: 10 }}>
                {t('profile.supabaseHint')}
              </div>
              <button
                onClick={() => setPage('settings')}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${T.primary}, ${T.accent1})`,
                  color: '#fff',
                  border: 'none',
                  fontFamily: T.font,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {t('profile.configSb')}
              </button>
            </>
          )}
        </Card>
      )}

      {msAccount && (
        <Card style={{ padding: 16, marginBottom: 14, borderRadius: T.radiusSm }}>
          <div style={{ fontFamily: T.font, fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 4 }}>
            Microsoft 365
          </div>
          <div style={{ fontFamily: T.fontEn, fontSize: 12, color: T.textMuted, marginBottom: 10 }}>
            {msAccount.username}
          </div>
          <button
            onClick={onMsLogout}
            style={{
              background: 'none',
              color: T.danger,
              border: `1px solid ${T.danger}40`,
              borderRadius: 8,
              padding: '6px 12px',
              fontFamily: T.font,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {t('profile.msDisconnect')}
          </button>
        </Card>
      )}

      <Card style={{ padding: 16, marginBottom: 14, borderRadius: T.radiusSm }}>
        <button
          onClick={() => setPage('settings')}
          style={{
            width: '100%',
            padding: '11px',
            borderRadius: 10,
            background: T.surface,
            color: T.text,
            border: `1px solid ${T.border}`,
            fontFamily: T.font,
            fontSize: 13,
            cursor: 'pointer',
            marginBottom: 8,
          }}
        >
          {t('profile.settings')}
        </button>
        <button
          onClick={handleExport}
          style={{
            width: '100%',
            padding: '11px',
            borderRadius: 10,
            background: T.surface,
            color: T.text,
            border: `1px solid ${T.border}`,
            fontFamily: T.font,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {t('profile.export')}
        </button>
      </Card>

      {display && (
        <button
          onClick={handleSignOut}
          disabled={busy}
          style={{
            width: '100%',
            padding: '13px',
            borderRadius: 12,
            background: 'transparent',
            color: T.danger,
            border: `1px solid ${T.danger}40`,
            fontFamily: T.font,
            fontSize: 14,
            fontWeight: 600,
            cursor: busy ? 'not-allowed' : 'pointer',
            opacity: busy ? 0.6 : 1,
          }}
        >
          {t('profile.signOut')}
        </button>
      )}
    </div>
  );
}
