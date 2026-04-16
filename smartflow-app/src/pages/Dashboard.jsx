import React from 'react';
import { T, priorityColor } from '../lib/theme.js';
import { todayLabel } from '../lib/date.js';
import Card from '../components/Card.jsx';
import { I } from '../components/Icons.jsx';

export default function Dashboard({
  files,
  events,
  tasks,
  setPage,
  selectedDay,
  msAccount,
  onMsLogin,
  onMsLogout,
  onMsSync,
  msConfigured,
}) {
  const todayEvents = events.filter((e) => e.day === selectedDay);
  const pendingTasks = tasks.filter((t) => !t.done);
  const highTasks = pendingTasks.filter((t) => t.priority === 'high');

  const stats = [
    { label: 'ملفات',        val: files.length,        color: T.primary },
    { label: 'مواعيد اليوم', val: todayEvents.length,  color: T.accent1 },
    { label: 'مهام متبقية',  val: pendingTasks.length, color: T.accent2 },
  ];

  const suggestions = [];
  if (highTasks.length > 0) {
    suggestions.push({ text: `عندك ${highTasks.length} مهام عاجلة: ${highTasks.map((t) => t.text).slice(0, 2).join('، ')}` });
  }
  if (todayEvents.length > 0) {
    const first = todayEvents.slice().sort((a, b) => a.time.localeCompare(b.time))[0];
    suggestions.push({ text: `عندك ${todayEvents.length} موعد اليوم — أقربهم "${first.title}" الساعة ${first.time}` });
  }
  if (todayEvents.length === 0) {
    suggestions.push({ text: 'ما عندك مواعيد اليوم — يوم فاضي للتركيز على المهام' });
  }
  const staleFiles = files.filter((f) => f.aiNote);
  if (staleFiles.length > 0) {
    suggestions.push({ text: `${staleFiles.length} ملفات تحتاج انتباهك` });
  }
  if (pendingTasks.length === 0) {
    suggestions.push({ text: 'كل مهامك مكتملة! ما شاء الله 👏' });
  }

  return (
    <div style={{ direction: 'rtl' }}>
      <div style={{ marginBottom: 20, paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontFamily: T.font, fontSize: 24, fontWeight: 700, color: T.text, margin: 0 }}>
            أهلاً بك
          </h2>
          <p style={{ fontFamily: T.font, color: T.textMuted, fontSize: 13, marginTop: 4 }}>
            {todayLabel}
          </p>
        </div>
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setPage('tasks')}>
          <svg width="22" height="22" fill="none" stroke={T.textMuted} strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          {highTasks.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: T.danger,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                color: '#fff',
                fontWeight: 700,
                fontFamily: T.fontEn,
              }}
            >
              {highTasks.length}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {stats.map((s, i) => (
          <Card
            key={i}
            onClick={() => setPage(i === 0 ? 'files' : i === 1 ? 'schedule' : 'tasks')}
            style={{ flex: 1, padding: '14px 10px', textAlign: 'center', borderRadius: T.radiusSm }}
          >
            <div style={{ fontFamily: T.fontEn, fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontFamily: T.font, fontSize: 11, color: T.textMuted, marginTop: 2 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ color: T.primary }}>{I.ai}</span>
          <span style={{ fontFamily: T.font, color: T.text, fontSize: 15, fontWeight: 600 }}>
            اقتراحات ذكية
          </span>
        </div>
        {suggestions.map((s, i) => (
          <Card key={i} style={{ marginBottom: 8, padding: '12px 14px', borderRadius: T.radiusSm }}>
            <p style={{ fontFamily: T.font, color: 'rgba(255,255,255,0.75)', fontSize: 13, margin: 0, lineHeight: 1.7 }}>
              {s.text}
            </p>
          </Card>
        ))}
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: T.font, color: T.text, fontSize: 15, fontWeight: 600 }}>المهام العاجلة</span>
          <button
            onClick={() => setPage('tasks')}
            style={{ background: 'none', border: 'none', color: T.primary, fontFamily: T.font, fontSize: 12, cursor: 'pointer' }}
          >
            عرض الكل
          </button>
        </div>
        {pendingTasks.length === 0 ? (
          <p style={{ fontFamily: T.font, color: T.textMuted, textAlign: 'center', padding: 20, fontSize: 13 }}>
            لا توجد مهام متبقية 🎉
          </p>
        ) : (
          pendingTasks.slice(0, 3).map((t) => (
            <Card key={t.id} style={{ marginBottom: 6, padding: '12px 14px', borderRadius: T.radiusSm, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: priorityColor[t.priority] }} />
              <span style={{ fontFamily: T.font, color: T.text, fontSize: 13, flex: 1 }}>{t.text}</span>
              <span style={{ fontFamily: T.font, fontSize: 10, color: priorityColor[t.priority], background: `${priorityColor[t.priority]}20`, padding: '2px 8px', borderRadius: 6 }}>
                {t.priority === 'high' ? 'عاجل' : t.priority === 'medium' ? 'متوسط' : 'عادي'}
              </span>
            </Card>
          ))
        )}
      </div>

      <div style={{ marginBottom: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: T.font, color: T.text, fontSize: 15, fontWeight: 600 }}>
            حالة الاتصال
          </span>
          {msConfigured && (
            msAccount ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={onMsSync}
                  style={{ background: T.primaryBg, color: T.primary, border: 'none', borderRadius: 8, padding: '5px 10px', fontFamily: T.font, fontSize: 11, cursor: 'pointer' }}
                >
                  مزامنة
                </button>
                <button
                  onClick={onMsLogout}
                  style={{ background: 'none', color: T.textMuted, border: 'none', fontFamily: T.font, fontSize: 11, cursor: 'pointer' }}
                >
                  خروج
                </button>
              </div>
            ) : (
              <button
                onClick={onMsLogin}
                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent1})`, color: '#fff', border: 'none', borderRadius: 8, padding: '5px 12px', fontFamily: T.font, fontSize: 11, cursor: 'pointer' }}
              >
                ربط Microsoft 365
              </button>
            )
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { icon: I.outlook, name: 'Outlook' },
            { icon: I.excel,   name: 'Excel' },
            { icon: I.word,    name: 'Word' },
          ].map((s, i) => {
            const connected = Boolean(msAccount);
            return (
              <Card key={i} style={{ flex: 1, padding: 12, textAlign: 'center', borderRadius: T.radiusSm }}>
                <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'center', opacity: connected ? 1 : 0.5 }}>{s.icon}</div>
                <div style={{ fontFamily: T.fontEn, color: T.text, fontSize: 12, fontWeight: 500 }}>{s.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginTop: 4 }}>
                  {connected && I.check}
                  <span style={{ fontFamily: T.font, color: connected ? T.accent3 : T.textMuted, fontSize: 10 }}>
                    {connected ? 'متصل' : msConfigured ? 'غير متصل' : 'غير مُهيّأ'}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
