import React, { useState } from 'react';
import { T, priorityColor, priorityLabel } from '../lib/theme.js';
import Card from '../components/Card.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { I } from '../components/Icons.jsx';

export default function TasksPage({ tasks, setTasks }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState('');
  const [newPrio, setNewPrio] = useState('medium');
  const [filter, setFilter] = useState('all');
  const [confirmDel, setConfirmDel] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');

  const toggle = (id) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const add = () => {
    if (!newText.trim()) return;
    setTasks((prev) => [
      { id: 't' + Date.now(), text: newText.trim(), done: false, priority: newPrio, notes: '' },
      ...prev,
    ]);
    setNewText('');
    setShowAdd(false);
  };

  const saveEdit = (id) => {
    if (!editText.trim()) {
      setEditId(null);
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, text: editText.trim() } : t)));
    setEditId(null);
  };

  const filtered =
    filter === 'all'
      ? tasks
      : filter === 'done'
      ? tasks.filter((t) => t.done)
      : tasks.filter((t) => !t.done);

  return (
    <div style={{ direction: 'rtl' }}>
      {confirmDel && (
        <ConfirmDialog
          message={`هل تبي تحذف "${confirmDel.text}"؟`}
          onConfirm={() => {
            setTasks((prev) => prev.filter((t) => t.id !== confirmDel.id));
            setConfirmDel(null);
          }}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      <div style={{ marginBottom: 16, paddingTop: 8 }}>
        <h2 style={{ fontFamily: T.font, fontSize: 24, fontWeight: 700, color: T.text, margin: 0 }}>المهام</h2>
        <p style={{ fontFamily: T.font, color: T.textMuted, fontSize: 13, marginTop: 4 }}>
          {tasks.filter((t) => !t.done).length} مهمة متبقية
        </p>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {[
          { id: 'all',     l: 'الكل' },
          { id: 'pending', l: 'متبقية' },
          { id: 'done',    l: 'مكتملة' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              fontFamily: T.font,
              padding: '7px 16px',
              borderRadius: 20,
              border: 'none',
              fontSize: 13,
              cursor: 'pointer',
              background:
                filter === f.id ? `linear-gradient(135deg, ${T.primary}, ${T.accent1})` : T.surface,
              color: filter === f.id ? '#fff' : T.textMuted,
            }}
          >
            {f.l}
          </button>
        ))}
      </div>

      {showAdd ? (
        <Card style={{ marginBottom: 14, borderRadius: T.radiusSm }}>
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="وصف المهمة..."
            autoFocus
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: '10px 12px',
              color: T.text,
              fontFamily: T.font,
              fontSize: 14,
              direction: 'rtl',
              outline: 'none',
              marginBottom: 10,
            }}
          />
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {['high', 'medium', 'low'].map((p) => (
              <button
                key={p}
                onClick={() => setNewPrio(p)}
                style={{
                  fontFamily: T.font,
                  padding: '5px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  border: `1px solid ${newPrio === p ? priorityColor[p] : T.border}`,
                  cursor: 'pointer',
                  background: newPrio === p ? `${priorityColor[p]}20` : T.surface,
                  color: newPrio === p ? priorityColor[p] : T.textMuted,
                }}
              >
                {priorityLabel[p]}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={add}
              style={{
                flex: 1,
                fontFamily: T.font,
                padding: 10,
                borderRadius: 10,
                border: 'none',
                background: `linear-gradient(135deg, ${T.primary}, ${T.accent1})`,
                color: '#fff',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              إضافة
            </button>
            <button
              onClick={() => setShowAdd(false)}
              style={{
                fontFamily: T.font,
                padding: '10px 20px',
                borderRadius: 10,
                border: 'none',
                background: T.surface,
                color: T.textMuted,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              إلغاء
            </button>
          </div>
        </Card>
      ) : (
        <Card
          onClick={() => setShowAdd(true)}
          style={{
            marginBottom: 14,
            borderRadius: T.radiusSm,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            justifyContent: 'center',
            border: `1px dashed ${T.primary}60`,
          }}
        >
          <span style={{ color: T.primary }}>{I.plus}</span>
          <span style={{ fontFamily: T.font, color: T.primary, fontSize: 14 }}>إضافة مهمة</span>
        </Card>
      )}

      {filtered.length === 0 ? (
        <p style={{ fontFamily: T.font, color: T.textMuted, textAlign: 'center', padding: 32, fontSize: 13 }}>
          {filter === 'done' ? 'ما فيه مهام مكتملة' : filter === 'pending' ? 'أضف أول مهمة' : 'لا توجد مهام بعد'}
        </p>
      ) : (
        filtered.map((t) => (
          <Card
            key={t.id}
            style={{
              marginBottom: 6,
              padding: '12px 14px',
              borderRadius: T.radiusSm,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <button
              onClick={() => toggle(t.id)}
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                border: `2px solid ${t.done ? T.accent3 : T.textDim}`,
                background: t.done ? `${T.accent3}20` : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                flexShrink: 0,
              }}
            >
              {t.done && I.check}
            </button>
            {editId === t.id ? (
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveEdit(t.id)}
                onBlur={() => saveEdit(t.id)}
                autoFocus
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${T.primary}`,
                  borderRadius: 8,
                  padding: '4px 8px',
                  color: T.text,
                  fontFamily: T.font,
                  fontSize: 14,
                  direction: 'rtl',
                  outline: 'none',
                }}
              />
            ) : (
              <span
                style={{
                  fontFamily: T.font,
                  color: T.text,
                  fontSize: 14,
                  flex: 1,
                  textDecoration: t.done ? 'line-through' : 'none',
                  opacity: t.done ? 0.5 : 1,
                }}
              >
                {t.text}
              </span>
            )}
            <span
              style={{
                fontFamily: T.font,
                fontSize: 10,
                color: priorityColor[t.priority],
                background: `${priorityColor[t.priority]}20`,
                padding: '2px 8px',
                borderRadius: 6,
              }}
            >
              {priorityLabel[t.priority]}
            </span>
            <button
              onClick={() => {
                setEditId(t.id);
                setEditText(t.text);
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: T.textMuted }}
            >
              {I.edit}
            </button>
            <button
              onClick={() => setConfirmDel(t)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: T.textMuted }}
            >
              {I.trash}
            </button>
          </Card>
        ))
      )}
      <div style={{ height: 90 }} />
    </div>
  );
}
