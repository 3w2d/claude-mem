import { getAccessToken, hasAzure } from './msal.js';

const GRAPH = 'https://graph.microsoft.com/v1.0';

async function graphFetch(path, init = {}) {
  const token = await getAccessToken();
  const res = await fetch(`${GRAPH}${path}`, {
    ...init,
    headers: { ...(init.headers || {}), Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Graph ${res.status}: ${await res.text()}`);
  return res.json();
}

export { hasAzure };

export async function getMe() {
  return graphFetch('/me');
}

// Returns events mapped to SmartFlow event shape for the next `days` days.
export async function getUpcomingEvents(days = 7) {
  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + days);
  const qs = new URLSearchParams({
    startDateTime: start.toISOString(),
    endDateTime: end.toISOString(),
    $top: '50',
    $orderby: 'start/dateTime',
  });
  const data = await graphFetch(`/me/calendarView?${qs.toString()}`);
  const palette = ['#6366f1', '#0ea5e9', '#f59e0b', '#10b981', '#a855f7'];
  return (data.value || []).map((e, i) => {
    const start = new Date(e.start.dateTime + 'Z');
    const endDt = new Date(e.end.dateTime + 'Z');
    const duration = Math.max(15, Math.round((endDt - start) / 60000));
    const hh = String(start.getHours()).padStart(2, '0');
    const mm = String(start.getMinutes()).padStart(2, '0');
    return {
      id: `graph-${e.id}`,
      title: e.subject || '(بدون عنوان)',
      time: `${hh}:${mm}`,
      duration,
      color: palette[i % palette.length],
      day: start.getDate(),
      source: 'Outlook',
      icon: '📅',
    };
  });
}

// Returns recent OneDrive/SharePoint files mapped to SmartFlow file shape.
export async function getRecentFiles(limit = 25) {
  const data = await graphFetch(`/me/drive/recent?$top=${limit}`);
  return (data.value || []).map((f) => {
    const ext = (f.name.split('.').pop() || '').toLowerCase();
    const category = ['xlsx', 'csv'].includes(ext)
      ? 'sheets'
      : ['msg', 'eml'].includes(ext)
      ? 'emails'
      : 'docs';
    return {
      id: `graph-${f.id}`,
      name: f.name.replace(/\.[^.]+$/, ''),
      ext,
      size: formatBytes(f.size || 0),
      date: formatDate(f.lastModifiedDateTime),
      category,
      starred: false,
      aiNote: null,
      notes: '',
      webUrl: f.webUrl,
    };
  });
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diffDays === 0) return 'اليوم';
  if (diffDays === 1) return 'أمس';
  if (diffDays < 7) return `قبل ${diffDays} أيام`;
  return d.toLocaleDateString('ar');
}
