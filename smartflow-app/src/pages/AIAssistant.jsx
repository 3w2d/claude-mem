import React, { useEffect, useRef, useState } from 'react';
import { C, T } from '../lib/theme.js';
import { I } from '../components/Icons.jsx';
import { aiAvailable, chatCompletion } from '../lib/ai.js';
import { localResponse, buildContext } from '../lib/localMatcher.js';
import { useT } from '../lib/i18n.js';

export default function AIAssistant({ files, events, tasks, selectedDay, aiHistory, setAiHistory }) {
  const { t, dir } = useT();
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [remoteBroken, setRemoteBroken] = useState(false);
  const chatEnd = useRef(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiHistory, typing]);

  const quickActions = [t('ai.quick.today'), t('ai.quick.urgent'), t('ai.quick.email')];

  const aiEnabled = aiAvailable();

  const getResponse = async (msg) => {
    const context = buildContext({ files, events, tasks, selectedDay });
    if (aiEnabled && !remoteBroken) {
      try {
        const history = aiHistory
          .filter((m) => m.role === 'user' || m.role === 'ai')
          .slice(-8)
          .map((m) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }));
        const text = await chatCompletion({
          messages: [...history, { role: 'user', content: msg }],
          context,
        });
        if (text) return text;
      } catch (err) {
        console.warn('AI proxy failed, falling back to local matcher:', err);
        setRemoteBroken(true);
      }
    }
    return localResponse(msg, { files, events, tasks, selectedDay });
  };

  const handleSend = async (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    const newMsgs = [...aiHistory, { role: 'user', text: msg.trim() }];
    setAiHistory(newMsgs);
    setInput('');
    setTyping(true);
    const reply = await getResponse(msg);
    setAiHistory([...newMsgs, { role: 'ai', text: reply }]);
    setTyping(false);
  };

  const modeLabel = !aiEnabled
    ? t('ai.mode.offline')
    : remoteBroken
    ? t('ai.mode.fallback')
    : t('ai.mode.online');

  return (
    <div style={{ direction: dir, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 110px)' }}>
      <div style={{ marginBottom: 12, paddingTop: 8 }}>
        <h2 style={{ fontFamily: T.font, fontSize: 24, fontWeight: 700, color: T.text, margin: 0 }}>{t('ai.title')}</h2>
        <p style={{ fontFamily: T.font, color: T.textMuted, fontSize: 12, marginTop: 4 }}>
          {modeLabel}
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
              border: `1px solid ${T.border}`,
              fontSize: 12,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              background: T.surface,
              color: C.ink700,
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
                    ? C.terra500
                    : T.surface,
                fontFamily: T.font,
                color: m.role === 'user' ? C.paper : C.ink900,
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
          onKeyDown={(e) => e.key === 'Enter' && !typing && handleSend()}
          placeholder={t('ai.placeholder')}
          style={{
            flex: 1,
            padding: '13px 16px',
            borderRadius: 14,
            border: `1px solid ${T.border}`,
            background: T.surface,
            color: T.text,
            fontSize: 14,
            fontFamily: T.font,
            direction: dir,
            outline: 'none',
          }}
        />
        <button
          onClick={() => !typing && handleSend()}
          disabled={typing}
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${T.primary}, ${T.accent1})`,
            color: '#fff',
            border: 'none',
            cursor: typing ? 'not-allowed' : 'pointer',
            opacity: typing ? 0.6 : 1,
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
