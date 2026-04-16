import React, { useEffect, useRef, useState } from 'react';
import { T } from '../lib/theme.js';
import { I } from '../components/Icons.jsx';

export default function AIAssistant({ files, events, tasks, selectedDay, aiHistory, setAiHistory }) {
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatEnd = useRef(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiHistory, typing]);

  const quickActions = ['وش مواعيدي اليوم؟', 'وش المهام العاجلة؟', 'ساعدني أكتب إيميل'];

  const getAIResponse = (msg) => {
    const m = msg.toLowerCase();
    const pendingTasks = tasks.filter((t) => !t.done);
    const highTasks = pendingTasks.filter((t) => t.priority === 'high');
    const todayEvents = events.filter((e) => e.day === selectedDay);

    if (m.includes('ملف') || m.includes('لخص') || m.includes('حالة')) {
      const starred = files.filter((f) => f.starred);
      const withNotes = files.filter((f) => f.aiNote);
      return (
        `📁 عندك ${files.length} ملف:\n` +
        `• ${starred.length} ملفات مميزة${starred.length ? ` (${starred.map((f) => f.name).slice(0, 3).join('، ')})` : ''}\n` +
        `• ${withNotes.length} ملفات تحتاج مراجعة`
      );
    }

    if (m.includes('موعد') || m.includes('جدول') || m.includes('مواعيد') || m.includes('اليوم')) {
      if (todayEvents.length === 0) return '📅 ما عندك مواعيد اليوم — يوم فاضي تقدر تركز على مهامك ✨';
      const sorted = todayEvents.slice().sort((a, b) => a.time.localeCompare(b.time));
      return (
        `📅 مواعيدك اليوم (${todayEvents.length}):\n` +
        sorted.map((e) => `• ${e.time} — ${e.title} (${e.duration} دقيقة)`).join('\n')
      );
    }

    if (m.includes('مهم') || m.includes('عاجل') || m.includes('مهام') || m.includes('مهمة')) {
      if (pendingTasks.length === 0) return '✅ كل مهامك مكتملة. استمر، ما شاء الله!';
      let resp = `📝 عندك ${pendingTasks.length} مهمة متبقية:\n`;
      if (highTasks.length > 0) resp += `\n🔴 عاجل (${highTasks.length}):\n${highTasks.map((t) => `• ${t.text}`).join('\n')}`;
      const medTasks = pendingTasks.filter((t) => t.priority === 'medium');
      if (medTasks.length > 0) resp += `\n\n🟡 متوسط (${medTasks.length}):\n${medTasks.map((t) => `• ${t.text}`).join('\n')}`;
      const lowTasks = pendingTasks.filter((t) => t.priority === 'low');
      if (lowTasks.length > 0) resp += `\n\n🟢 عادي (${lowTasks.length}):\n${lowTasks.map((t) => `• ${t.text}`).join('\n')}`;
      return resp;
    }

    if (m.includes('إيميل') || m.includes('ايميل') || m.includes('رسال') || m.includes('بريد')) {
      return 'أكيد! عطني التفاصيل:\n\nلمن الرسالة؟\nوش الموضوع؟\nرسمية ولا ودية؟';
    }

    if (m.includes('شكر') || m.includes('ممتاز') || m.includes('حلو') || m.includes('يعطيك')) {
      return 'العفو! دايم حاضر لك. فيه شيء ثاني أساعدك فيه؟';
    }

    if (m.includes('مرحب') || m.includes('هلا') || m.includes('السلام')) {
      return (
        `أهلاً وسهلاً! 👋\n\n` +
        `عندك اليوم:\n` +
        `• ${todayEvents.length} مواعيد\n` +
        `• ${pendingTasks.length} مهام متبقية`
      );
    }

    return (
      `فهمت طلبك 🤔\n\n` +
      `حالياً عندك:\n` +
      `• ${files.length} ملف\n` +
      `• ${todayEvents.length} موعد اليوم\n` +
      `• ${pendingTasks.length} مهمة متبقية\n\n` +
      `جرب تسأل عن ملفاتك، مواعيدك، أو مهامك.`
    );
  };

  const handleSend = (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    const newMsgs = [...aiHistory, { role: 'user', text: msg.trim() }];
    setAiHistory(newMsgs);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setAiHistory([...newMsgs, { role: 'ai', text: getAIResponse(msg) }]);
      setTyping(false);
    }, 600 + Math.random() * 500);
  };

  return (
    <div style={{ direction: 'rtl', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 110px)' }}>
      <div style={{ marginBottom: 12, paddingTop: 8 }}>
        <h2 style={{ fontFamily: T.font, fontSize: 24, fontWeight: 700, color: T.text, margin: 0 }}>المساعد الذكي</h2>
        <p style={{ fontFamily: T.font, color: T.textMuted, fontSize: 13, marginTop: 4 }}>
          اسألني عن ملفاتك، مواعيدك، أو مهامك
        </p>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
        {quickActions.map((a, i) => (
          <button
            key={i}
            onClick={() => handleSend(a)}
            style={{
              fontFamily: T.font,
              padding: '7px 12px',
              borderRadius: 10,
              border: 'none',
              fontSize: 12,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              background: T.surface,
              color: 'rgba(255,255,255,0.65)',
              transition: 'all 0.2s',
            }}
          >
            {a}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
        {aiHistory.map((m, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: m.role === 'user' ? 'flex-start' : 'flex-end',
              marginBottom: 8,
            }}
          >
            <div
              style={{
                maxWidth: '82%',
                padding: '11px 14px',
                borderRadius: m.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                background:
                  m.role === 'user'
                    ? `linear-gradient(135deg, ${T.primary}, #4f46e5)`
                    : T.surface,
                fontFamily: T.font,
                color: 'rgba(255,255,255,0.9)',
                fontSize: 14,
                lineHeight: 1.7,
                border: m.role === 'ai' ? `1px solid ${T.border}` : 'none',
                whiteSpace: 'pre-wrap',
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <div
              style={{
                padding: '11px 18px',
                borderRadius: '4px 14px 14px 14px',
                background: T.surface,
                border: `1px solid ${T.border}`,
              }}
            >
              <div style={{ display: 'flex', gap: 4 }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: T.textMuted,
                      animation: `bounce 1.4s ease-in-out ${i * 0.15}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={chatEnd} />
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 0', marginBottom: 80 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="اكتب رسالتك..."
          style={{
            flex: 1,
            padding: '13px 16px',
            borderRadius: 14,
            border: `1px solid ${T.border}`,
            background: T.surface,
            color: T.text,
            fontSize: 14,
            fontFamily: T.font,
            direction: 'rtl',
            outline: 'none',
          }}
        />
        <button
          onClick={() => handleSend()}
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${T.primary}, ${T.accent1})`,
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ transform: 'scaleX(-1)' }}>{I.send}</div>
        </button>
      </div>
      <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }`}</style>
    </div>
  );
}
