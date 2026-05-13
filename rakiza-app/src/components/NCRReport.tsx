import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Share, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useTheme } from './ThemeProvider';
import { FONT, RADIUS, SP } from '../theme';
import { useAuth, specialtyLabel } from '../store/auth';

export interface NCRData {
  reportNumber: string;
  date: string;
  govEntity: string;
  contractor: string;
  supervisorName: string;
  supervisorId: string;
  description: string;
  codeReference: string;
  correctiveAction: string;
}

export function defaultNCR(opts?: Partial<NCRData>): NCRData {
  const nationalId = useAuth.getState().nationalId ?? '';
  const today = new Date().toLocaleDateString('en-CA');
  const serial = String(Math.floor(1000 + Math.random() * 9000));
  return {
    reportNumber:    `NCR-${today.replace(/-/g, '')}-${serial}`,
    date:            today,
    govEntity:       '',
    contractor:      '',
    supervisorName:  '',
    supervisorId:    nationalId,
    description:     '',
    codeReference:   '',
    correctiveAction:'',
    ...opts,
  };
}

const FIELDS: { key: keyof NCRData; label: string; lines?: number }[] = [
  { key: 'govEntity',        label: 'الجهة الحكومية المستفيدة' },
  { key: 'contractor',       label: 'الشركة المنفذة' },
  { key: 'reportNumber',     label: 'رقم التقرير' },
  { key: 'date',             label: 'التاريخ' },
  { key: 'supervisorName',   label: 'اسم المهندس المشرف' },
  { key: 'supervisorId',     label: 'رقم هوية المهندس (ID)' },
  { key: 'description',      label: 'وصف المشكلة الفنية', lines: 4 },
  { key: 'codeReference',    label: 'البند المطابق للكود الهندسي', lines: 2 },
  { key: 'correctiveAction', label: 'الإجراء التصحيحي', lines: 4 },
];

function buildHtml(d: NCRData, role: string): string {
  const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]!));
  const rows = FIELDS.map(f => `
    <tr>
      <th>${esc(f.label)}</th>
      <td>${esc(d[f.key] || '—').replace(/\n/g, '<br/>')}</td>
    </tr>`).join('');
  return `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"/>
<style>
  @page { size: A4; margin: 18mm; }
  body { font-family: -apple-system, 'Segoe UI', Tahoma, Arial; color: #1a1e23; }
  h1 { font-size: 22px; color: #9a7028; margin: 0 0 4px; }
  .sub { font-size: 12px; color: #64748b; margin-bottom: 18px; }
  .hr { height: 2px; background: linear-gradient(90deg, #e6b34a, #9a7028); margin-bottom: 18px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #cbcdd6; padding: 9px 12px; font-size: 12px; vertical-align: top; }
  th { width: 32%; background: #fdfaf2; color: #64748b; font-weight: 600; text-align: right; }
  td { color: #1a1e23; text-align: right; }
  .footer { margin-top: 22px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; }
</style></head><body>
  <h1>تقرير حالة عدم مطابقة (NCR)</h1>
  <div class="sub">SBC · ACI · صادر عن ${esc(role || 'المستخدم')}</div>
  <div class="hr"></div>
  <table>${rows}</table>
  <div class="footer">
    <span>رَكيزة — Engineering Suite</span>
    <span>${esc(new Date().toLocaleString('en-GB'))}</span>
  </div>
</body></html>`;
}

interface Props {
  initial?: Partial<NCRData>;
  onRemove?: () => void;
}

export function NCRReport({ initial, onRemove }: Props) {
  const { theme, fontsLoaded } = useTheme();
  const specialty = useAuth(s => s.specialty);
  const [data, setData] = useState<NCRData>(() => defaultNCR(initial));

  const set = <K extends keyof NCRData>(k: K, v: NCRData[K]) => setData(d => ({ ...d, [k]: v }));

  const summary = () => {
    const role = specialtyLabel(specialty);
    return [
      `تقرير NCR — ${data.reportNumber}`,
      `التاريخ: ${data.date}`,
      `الجهة: ${data.govEntity || '—'}`,
      `المنفذ: ${data.contractor || '—'}`,
      `المشرف: ${data.supervisorName || '—'} (ID: ${data.supervisorId || '—'})`,
      `الوصف: ${data.description || '—'}`,
      `الكود: ${data.codeReference || '—'}`,
      `الإجراء: ${data.correctiveAction || '—'}`,
      `صادر عن: ${role}`,
    ].join('\n');
  };

  const onShare = async () => {
    try {
      await Share.share({ message: summary(), title: data.reportNumber });
    } catch (e: any) {
      if (Platform.OS === 'web') window.alert(summary());
      else Alert.alert('تعذّر المشاركة', e?.message ?? '');
    }
  };

  const onExportPdf = async () => {
    try {
      const html = buildHtml(data, specialtyLabel(specialty));
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: data.reportNumber });
      } else if (Platform.OS === 'web') {
        // On web printToFileAsync returns a data URL — open in new tab
        if (typeof window !== 'undefined') window.open(uri, '_blank');
      }
    } catch (e: any) {
      const msg = 'تعذّر إنشاء PDF: ' + (e?.message ?? '');
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('خطأ', msg);
    }
  };

  return (
    <View style={[
      styles.card,
      { backgroundColor: theme.bg.card, borderColor: theme.border.gold },
    ]}>
      <View style={[styles.header, { borderBottomColor: theme.border.soft }]}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 11, color: theme.gold.base, letterSpacing: 1.2,
            textTransform: 'uppercase',
            fontFamily: fontsLoaded ? FONT.mono : undefined,
          }}>تقرير حالة عدم مطابقة</Text>
          <Text style={{
            fontSize: 16, fontWeight: '800', color: theme.text.primary, marginTop: 2,
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
          }}>NCR — {data.reportNumber}</Text>
        </View>
        {onRemove && (
          <Pressable onPress={onRemove} hitSlop={6} style={{ padding: 4 }}>
            <Ionicons name="close" size={18} color={theme.text.muted} />
          </Pressable>
        )}
      </View>

      <View style={styles.body}>
        {FIELDS.map(f => (
          <View key={f.key} style={{ marginBottom: SP[2] }}>
            <Text style={[styles.label, {
              color: theme.text.muted,
              fontFamily: fontsLoaded ? FONT.arabic : undefined,
            }]}>{f.label}</Text>
            <TextInput
              value={data[f.key]}
              onChangeText={v => set(f.key, v)}
              multiline={!!f.lines && f.lines > 1}
              numberOfLines={f.lines}
              placeholder={f.label}
              placeholderTextColor={theme.text.muted}
              style={[styles.input, {
                backgroundColor: theme.bg.input,
                borderColor: theme.border.soft,
                color: theme.text.primary,
                fontFamily: fontsLoaded
                  ? (f.key === 'supervisorId' || f.key === 'reportNumber' || f.key === 'date' ? FONT.mono : FONT.arabic)
                  : undefined,
                minHeight: f.lines && f.lines > 1 ? f.lines * 20 + 14 : 38,
                textAlignVertical: f.lines && f.lines > 1 ? 'top' : 'center',
              }]}
            />
          </View>
        ))}
      </View>

      <View style={[styles.actions, { borderTopColor: theme.border.soft }]}>
        <Pressable
          onPress={onShare}
          style={({ pressed }) => [
            styles.btnGhost,
            { borderColor: theme.border.soft, opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Ionicons name="share-social" size={16} color={theme.text.primary} />
          <Text style={{
            fontSize: 13, fontWeight: '600', color: theme.text.primary,
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
          }}>مشاركة</Text>
        </Pressable>
        <Pressable
          onPress={onExportPdf}
          style={({ pressed }) => [
            styles.btnPrimary,
            { backgroundColor: theme.gold.base, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Ionicons name="document-text" size={16} color={theme.text.inverse} />
          <Text style={{
            fontSize: 13, fontWeight: '700', color: theme.text.inverse,
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
          }}>تصدير PDF</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SP[3] },
  header: {
    flexDirection: 'row-reverse', alignItems: 'center',
    paddingHorizontal: SP[4], paddingVertical: SP[3],
    borderBottomWidth: 1,
  },
  body: { padding: SP[4] },
  label: { fontSize: 11, fontWeight: '600', marginBottom: 4, textAlign: 'right' },
  input: {
    paddingHorizontal: 10, paddingVertical: 8,
    borderWidth: 1, borderRadius: RADIUS.sm,
    fontSize: 13, textAlign: 'right',
  },
  actions: {
    flexDirection: 'row-reverse', gap: SP[2],
    paddingHorizontal: SP[4], paddingVertical: SP[3],
    borderTopWidth: 1,
  },
  btnGhost: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 6,
    paddingHorizontal: SP[3], paddingVertical: 8,
    borderRadius: RADIUS.md, borderWidth: 1,
  },
  btnPrimary: {
    flex: 1,
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingHorizontal: SP[3], paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
});
