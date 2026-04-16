import React, { useState } from 'react';
import { T } from '../lib/theme.js';
import Card from '../components/Card.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { I, extIcon } from '../components/Icons.jsx';

export default function FilesPage({ files, setFiles }) {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newExt, setNewExt] = useState('docx');
  const [confirmDel, setConfirmDel] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  const tabs = [
    { id: 'all',     label: 'الكل' },
    { id: 'docs',    label: 'مستندات' },
    { id: 'sheets',  label: 'جداول' },
    { id: 'emails',  label: 'رسائل' },
    { id: 'starred', label: 'مميزة' },
  ];

  const filtered = files.filter((f) => {
    if (tab === 'starred') return f.starred;
    if (tab !== 'all' && f.category !== tab) return false;
    if (search && !f.name.includes(search)) return false;
    return true;
  });

  const addFile = () => {
    if (!newName.trim()) return;
    const category = ['xlsx', 'csv'].includes(newExt)
      ? 'sheets'
      : ['msg'].includes(newExt)
      ? 'emails'
      : 'docs';
    setFiles((prev) => [
      {
        id: 'f' + Date.now(),
        name: newName.trim(),
        ext: newExt,
        size: '0 KB',
        date: 'الآن',
        category,
        starred: false,
        aiNote: null,
        notes: '',
      },
      ...prev,
    ]);
    setNewName('');
    setShowAdd(false);
  };

  const saveEdit = (id) => {
    if (!editName.trim()) {
      setEditId(null);
      return;
    }
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, name: editName.trim() } : f)));
    setEditId(null);
  };

  return (
    <div style={{ direction: 'rtl' }}>
      {confirmDel && (
        <ConfirmDialog
          message={`هل تبي تحذف "${confirmDel.name}"؟`}
          onConfirm={() => {
            setFiles((prev) => prev.filter((f) => f.id !== confirmDel.id));
            setConfirmDel(null);
          }}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      <div style={{ marginBottom: 16, paddingTop: 8 }}>
        <h2 style={{ fontFamily: T.font, fontSize: 24, fontWeight: 700, color: T.text, margin: 0 }}>الملفات</h2>
        <p style={{ fontFamily: T.font, color: T.textMuted, fontSize: 13, marginTop: 4 }}>{files.length} ملف</p>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 14,
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: '10px 14px',
        }}
      >
        <span style={{ color: T.textMuted }}>{I.search}</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث في ملفاتك..."
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: T.text,
            fontFamily: T.font,
            fontSize: 14,
            direction: 'rtl',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              fontFamily: T.font,
              padding: '7px 16px',
              borderRadius: 20,
              border: 'none',
              fontSize: 13,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              background:
                tab === t.id ? `linear-gradient(135deg, ${T.primary}, ${T.accent1})` : T.surface,
              color: tab === t.id ? '#fff' : T.textMuted,
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {showAdd ? (
        <Card style={{ marginBottom: 14, borderRadius: T.radiusSm }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addFile()}
            placeholder="اسم الملف..."
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
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {['docx', 'xlsx', 'pptx', 'msg'].map((e) => (
              <button
                key={e}
                onClick={() => setNewExt(e)}
                style={{
                  fontFamily: T.fontEn,
                  padding: '5px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  border: `1px solid ${newExt === e ? T.primary : T.border}`,
                  cursor: 'pointer',
                  background: newExt === e ? T.primaryBg : T.surface,
                  color: newExt === e ? T.primary : T.textMuted,
                }}
              >
                .{e}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={addFile}
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
          <span style={{ fontFamily: T.font, color: T.primary, fontSize: 14 }}>إضافة ملف</span>
        </Card>
      )}

      {filtered.map((f) => (
        <Card
          key={f.id}
          style={{
            marginBottom: 8,
            padding: '12px 14px',
            borderRadius: T.radiusSm,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: T.surface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: T.textMuted,
              flexShrink: 0,
            }}
          >
            {extIcon(f.ext)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {editId === f.id ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveEdit(f.id)}
                onBlur={() => saveEdit(f.id)}
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
              <div
                style={{
                  fontFamily: T.font,
                  color: T.text,
                  fontSize: 14,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {f.name}
                <span style={{ color: T.textDim }}>.{f.ext}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <span style={{ fontFamily: T.font, color: T.textDim, fontSize: 11 }}>
                {f.size} · {f.date}
              </span>
              {f.aiNote && (
                <span
                  style={{
                    fontFamily: T.font,
                    fontSize: 10,
                    color: T.primary,
                    background: T.primaryBg,
                    padding: '1px 6px',
                    borderRadius: 4,
                  }}
                >
                  {f.aiNote}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFiles((prev) => prev.map((x) => (x.id === f.id ? { ...x, starred: !x.starred } : x)));
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              {I.star(f.starred)}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditId(f.id);
                setEditName(f.name);
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: T.textMuted }}
            >
              {I.edit}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDel(f);
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: T.textMuted }}
            >
              {I.trash}
            </button>
          </div>
        </Card>
      ))}

      {filtered.length === 0 && (
        <p style={{ fontFamily: T.font, color: T.textMuted, textAlign: 'center', padding: 32, fontSize: 13 }}>
          ما فيه ملفات مطابقة
        </p>
      )}
      <div style={{ height: 90 }} />
    </div>
  );
}
