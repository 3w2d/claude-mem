import React, { useState } from 'react';
import { T } from '../lib/theme.js';
import Card from '../components/Card.jsx';
import { getRuntimeConfig, saveRuntimeConfig } from '../lib/runtimeConfig.js';

export default function SettingsPage({ onSaved, setPage }) {
  const initial = getRuntimeConfig();
  const [cfg, setCfg] = useState(initial);
  const [saved, setSaved] = useState(false);

  const update = (k, v) => {
    setSaved(false);
    setCfg((c) => ({ ...c, [k]: v }));
  };

  const handleSave = () => {
    saveRuntimeConfig({
      azureClientId: cfg.azureClientId.trim(),
      azureTenantId: cfg.azureTenantId.trim() || 'common',
      azureRedirectUri: cfg.azureRedirectUri.trim(),
      supabaseUrl: cfg.supabaseUrl.trim(),
      supabaseAnonKey: cfg.supabaseAnonKey.trim(),
      openaiApiKey: cfg.openaiApiKey.trim(),
      openaiModel: cfg.openaiModel.trim() || 'gpt-4o-mini',
    });
    setSaved(true);
    onSaved?.();
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: `1px solid ${T.border}`,
    background: T.surface,
    color: T.text,
    fontFamily: T.fontEn,
    fontSize: 12,
    direction: 'ltr',
    textAlign: 'left',
    outline: 'none',
    marginTop: 4,
  };
  const labelStyle = { fontFamily: T.font, fontSize: 12, color: T.textMuted, display: 'block', marginBottom: 2 };
  const sectionTitle = { fontFamily: T.font, fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 8 };
  const fieldGap = { marginBottom: 12 };
  const helpTextStyle = { fontFamily: T.font, fontSize: 11, color: T.textMuted, lineHeight: 1.7, marginTop: 6 };

  const redirectExample = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';

  return (
    <div style={{ direction: 'rtl', paddingBottom: 100 }}>
      <div style={{ marginBottom: 16, paddingTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontFamily: T.font, fontSize: 24, fontWeight: 700, color: T.text, margin: 0 }}>الإعدادات</h2>
          <p style={{ fontFamily: T.font, color: T.textMuted, fontSize: 13, marginTop: 4 }}>
            ربط الخدمات الخارجية. كل المفاتيح تُحفظ في جهازك فقط.
          </p>
        </div>
        <button
          onClick={() => setPage('home')}
          style={{ background: 'none', border: 'none', color: T.primary, fontFamily: T.font, fontSize: 13, cursor: 'pointer' }}
        >
          رجوع
        </button>
      </div>

      <Card style={{ padding: 16, marginBottom: 14, borderRadius: T.radiusSm }}>
        <div style={sectionTitle}>Microsoft 365 (Outlook / Excel / Word)</div>

        <div style={fieldGap}>
          <label style={labelStyle}>Application (client) ID</label>
          <input style={inputStyle} value={cfg.azureClientId} onChange={(e) => update('azureClientId', e.target.value)} placeholder="00000000-0000-0000-0000-000000000000" />
        </div>

        <div style={fieldGap}>
          <label style={labelStyle}>Directory (tenant) ID — اتركه common لو شخصي</label>
          <input style={inputStyle} value={cfg.azureTenantId} onChange={(e) => update('azureTenantId', e.target.value)} placeholder="common" />
        </div>

        <div style={fieldGap}>
          <label style={labelStyle}>Redirect URI (اختياري — افتراضي عنوان الصفحة الحالية)</label>
          <input style={inputStyle} value={cfg.azureRedirectUri} onChange={(e) => update('azureRedirectUri', e.target.value)} placeholder={redirectExample} />
        </div>

        <div style={helpTextStyle}>
          سجّل تطبيق SPA في{' '}
          <a href="https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade" target="_blank" rel="noopener noreferrer" style={{ color: T.primary }}>
            Azure Portal
          </a>
          ، وأضف صلاحيات Microsoft Graph: <span style={{ fontFamily: T.fontEn }}>User.Read, Calendars.Read, Files.Read</span>،
          ثم انسخ الـ Client ID هنا. أضف Redirect URI:
          <div style={{ fontFamily: T.fontEn, direction: 'ltr', textAlign: 'left', background: T.surface, padding: '4px 8px', borderRadius: 6, marginTop: 4, fontSize: 11 }}>
            {redirectExample}
          </div>
        </div>
      </Card>

      <Card style={{ padding: 16, marginBottom: 14, borderRadius: T.radiusSm }}>
        <div style={sectionTitle}>Supabase (مزامنة سحابية)</div>

        <div style={fieldGap}>
          <label style={labelStyle}>Project URL</label>
          <input style={inputStyle} value={cfg.supabaseUrl} onChange={(e) => update('supabaseUrl', e.target.value)} placeholder="https://xxx.supabase.co" />
        </div>

        <div style={fieldGap}>
          <label style={labelStyle}>anon public key</label>
          <input style={inputStyle} value={cfg.supabaseAnonKey} onChange={(e) => update('supabaseAnonKey', e.target.value)} placeholder="eyJhbGciOi..." />
        </div>

        <div style={helpTextStyle}>
          أنشئ مشروع مجاني في{' '}
          <a href="https://supabase.com/dashboard/projects" target="_blank" rel="noopener noreferrer" style={{ color: T.primary }}>
            Supabase
          </a>
          ، شغّل ملف <span style={{ fontFamily: T.fontEn }}>supabase/schema.sql</span> في الـ SQL Editor، ثم انسخ القيم من Project Settings → API.
          <br />
          <br />
          لتفعيل <b>تسجيل الدخول بـ Google</b>: في Supabase Dashboard → Authentication → Providers → فعّل Google. تحتاج Client ID + Secret من{' '}
          <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" style={{ color: T.primary }}>
            Google Cloud Console
          </a>
          .
        </div>
      </Card>

      <Card style={{ padding: 16, marginBottom: 14, borderRadius: T.radiusSm }}>
        <div style={sectionTitle}>OpenAI (المساعد الذكي)</div>

        <div style={fieldGap}>
          <label style={labelStyle}>API Key</label>
          <input style={inputStyle} type="password" value={cfg.openaiApiKey} onChange={(e) => update('openaiApiKey', e.target.value)} placeholder="sk-..." />
        </div>

        <div style={fieldGap}>
          <label style={labelStyle}>Model</label>
          <input style={inputStyle} value={cfg.openaiModel} onChange={(e) => update('openaiModel', e.target.value)} placeholder="gpt-4o-mini" />
        </div>

        <div style={helpTextStyle}>
          احصل على مفتاح من{' '}
          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: T.primary }}>
            OpenAI Platform
          </a>
          .
          <br />
          <span style={{ color: T.warning || '#f59e0b' }}>تنبيه:</span> المفتاح يُخزّن في متصفحك ويُرسل من جهازك مباشرة لـ OpenAI. لا تشاركه ولا تستخدمه على جهاز عام.
        </div>
      </Card>

      <button
        onClick={handleSave}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 12,
          background: `linear-gradient(135deg, ${T.primary}, ${T.accent1})`,
          color: '#fff',
          border: 'none',
          fontFamily: T.font,
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        {saved ? 'تم الحفظ ✓' : 'حفظ الإعدادات'}
      </button>
    </div>
  );
}
