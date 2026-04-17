import React, { useState } from 'react';
import { T } from '../lib/theme.js';
import { buildWeek, TODAY_DAY, TODAY } from '../lib/date.js';
import Card from '../components/Card.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { I } from '../components/Icons.jsx';
import { useT, MONTHS } from '../lib/i18n.js';

export default function SchedulePage({ events, setEvents, selectedDay, setSelectedDay }) {
  const { t, lang, dir } = useT();
  const WEEK = buildWeek();
  const MONTHS_L = MONTHS[lang];
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('10:00');
  const [newDuration, setNewDuration] = useState('60');
  const [confirmDel, setConfirmDel] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const dayEvents = events
    .filter((e) => e.day === selectedDay)
    .sort((a, b) => a.time.localeCompare(b.time));

  const colors = [T.primary, T.accent1, T.accent2, T.accent3, '#a855f7'];

  const addEvent = () => {
    if (!newTitle.trim()) return;
    setEvents((prev) => [
      ...prev,
      {
        id: 'e' + Date.now(),
        title: newTitle.trim(),
        time: newTime,
        duration: parseInt(newDuration) || 60,
        color: colors[Math.floor(Math.random() * colors.length)],
        day: selectedDay,
        source: t('sched.source.manual'),
        icon: '📌',
      },
    ]);
    setNewTitle('');
    setShowAdd(false);
  };

  const saveEdit = (id) => {
    if (!editTitle.trim()) {
      setEditId(null);
      return;
    }
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, title: editTitle.trim() } : e)));
    setEditId(null);
  };

  return (
    <div style={{ direction: dir }}>
      {confirmDel && (
        <ConfirmDialog
          message={t('sched.confirmDelete', { name: confirmDel.title })}
          onConfirm={() => {
            setEvents((prev) => prev.filter((e) => e.id !== confirmDel.id));
            setConfirmDel(null);
          }}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      <div style={{ marginBottom: 16, paddingTop: 8 }}>
        <h2 style={{ fontFamily: T.font, fontSize: 24, fontWeight: 700, color: T.text, margin: 0 }}>{t('sched.title')}</h2>
        <p style={{ fontFamily: T.font, color: T.textMuted, fontSize: 13, marginTop: 4 }}>
          {MONTHS_L[TODAY.getMonth()]} {TODAY.getFullYear()}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 18, justifyContent: 'center' }}>
        {WEEK.map((d) => {
          const hasEvents = events.filter((e) => e.day === d.num).length > 0;
          const isSelected = selectedDay === d.num;
          const isToday = d.num === TODAY_DAY;
          return (
            <div
              key={d.num}
              onClick={() => setSelectedDay(d.num)}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '8px 2px',
                borderRadius: 12,
                cursor: 'pointer',
                position: 'relative',
                background: isSelected ? `linear-gradient(135deg, ${T.primary}, ${T.accent1})` : 'transparent',
                transition: 'all 0.2s',
                border: isToday && !isSelected ? `1px solid ${T.accent1}80` : '1px solid transparent',
              }}
            >
              <div style={{ fontFamily: T.font, fontSize: 10, color: isSelected ? 'rgba(255,255,255,0.8)' : T.textMuted, marginBottom: 2 }}>
                {d.name}
              </div>
              <div
                style={{
                  fontFamily: T.fontEn,
                  fontSize: 17,
                  fontWeight: 700,
                  color: isSelected ? '#fff' : isToday ? T.accent1 : T.text,
                }}
              >
                {d.num}
              </div>
              {hasEvents && !isSelected && (
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: T.accent1,
                    margin: '3px auto 0',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {showAdd ? (
        <Card style={{ marginBottom: 14, borderRadius: T.radiusSm }}>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addEvent()}
            placeholder={t('sched.title.placeholder')}
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
              direction: dir,
              outline: 'none',
              marginBottom: 10,
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                padding: '10px 12px',
                color: T.text,
                fontFamily: T.fontEn,
                fontSize: 14,
                outline: 'none',
              }}
            />
            <select
              value={newDuration}
              onChange={(e) => setNewDuration(e.target.value)}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                padding: '10px 12px',
                color: T.text,
                fontFamily: T.font,
                fontSize: 13,
                outline: 'none',
                colorScheme: 'dark',
              }}
            >
              <option value="15">{t('sched.duration.15')}</option>
              <option value="30">{t('sched.duration.30')}</option>
              <option value="60">{t('sched.duration.60')}</option>
              <option value="90">{t('sched.duration.90')}</option>
              <option value="120">{t('sched.duration.120')}</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={addEvent}
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
              {t('common.add')}
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
              {t('common.cancel')}
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
          <span style={{ fontFamily: T.font, color: T.primary, fontSize: 14 }}>{t('sched.add')}</span>
        </Card>
      )}

      <span style={{ fontFamily: T.font, color: T.text, fontSize: 15, fontWeight: 600, display: 'block', marginBottom: 10 }}>
        {t('sched.dayEvents', { day: selectedDay, month: MONTHS_L[TODAY.getMonth()] })}
      </span>

      {dayEvents.length === 0 ? (
        <p style={{ fontFamily: T.font, color: T.textMuted, textAlign: 'center', padding: 32, fontSize: 13 }}>
          {t('sched.none')}
        </p>
      ) : (
        dayEvents.map((e) => (
          <Card
            key={e.id}
            style={{
              marginBottom: 8,
              padding: 14,
              borderRadius: T.radiusSm,
              borderRight: `3px solid ${e.color}`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{ fontFamily: T.fontEn, fontSize: 14, fontWeight: 600, color: e.color, minWidth: 48 }}>
              {e.time}
            </div>
            <div style={{ flex: 1 }}>
              {editId === e.id ? (
                <input
                  value={editTitle}
                  onChange={(ev) => setEditTitle(ev.target.value)}
                  onKeyDown={(ev) => ev.key === 'Enter' && saveEdit(e.id)}
                  onBlur={() => saveEdit(e.id)}
                  autoFocus
                  style={{
                    width: '100%',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16 }}>{e.icon}</span>
                  <span style={{ fontFamily: T.font, color: T.text, fontSize: 14, fontWeight: 600 }}>
                    {e.title}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <span style={{ fontFamily: T.font, color: T.textDim, fontSize: 11 }}>{e.duration} دقيقة</span>
                <span
                  style={{
                    fontFamily: T.fontEn,
                    fontSize: 10,
                    color: T.textMuted,
                    background: T.surface,
                    padding: '1px 6px',
                    borderRadius: 4,
                  }}
                >
                  {e.source}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 2 }}>
              <button
                onClick={() => {
                  setEditId(e.id);
                  setEditTitle(e.title);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: T.textMuted }}
              >
                {I.edit}
              </button>
              <button
                onClick={() => setConfirmDel(e)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: T.textMuted }}
              >
                {I.trash}
              </button>
            </div>
          </Card>
        ))
      )}
      <div style={{ height: 90 }} />
    </div>
  );
}
