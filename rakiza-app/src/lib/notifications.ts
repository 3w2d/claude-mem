import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Project, WorkLog, QuietWindow } from '../types';
import { medianHour } from './insights';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted || cur.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) return true;
  const r = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: false, allowProvisional: true },
  });
  return !!r.granted;
}

function inQuiet(hour: number, minute: number, windows: QuietWindow[]): boolean {
  const m = hour * 60 + minute;
  for (const w of windows) {
    if (w.startMinutes <= w.endMinutes) {
      if (m >= w.startMinutes && m < w.endMinutes) return true;
    } else if (m >= w.startMinutes || m < w.endMinutes) return true;
  }
  return false;
}

export function nextReminder(p: Project, logs: WorkLog[], windows: QuietWindow[]) {
  const candidates: { hour: number; minute: number }[] = [];
  if (p.reminders.length) candidates.push(...p.reminders);
  else if (p.smartReminders) {
    const m = medianHour(logs, p.id);
    candidates.push(m != null ? { hour: (m - 1 + 24) % 24, minute: 0 } : { hour: 9, minute: 0 });
  }
  for (const c of candidates) if (!inQuiet(c.hour, c.minute, windows)) return c;
  if (candidates.length && windows.length) {
    const w = windows[0];
    return { hour: Math.floor(w.endMinutes / 60), minute: w.endMinutes % 60 };
  }
  return null;
}

export async function rescheduleAll(projects: Project[], logs: WorkLog[], windows: QuietWindow[]) {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const p of projects) {
    if (p.archived) continue;
    if (!p.reminders.length && !p.smartReminders) continue;
    const t = nextReminder(p, logs, windows);
    if (!t) continue;
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: 'rakiza:' + p.id,
        content: {
          title: `${p.emoji} ${p.name}`,
          body: 'وقت التقدّم على مشروعك — حافظ على ستريكك',
          data: { projectId: p.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: t.hour,
          minute: t.minute,
        } as Notifications.DailyTriggerInput,
      });
    } catch {}
  }
}

export async function cancelProject(id: string) {
  if (Platform.OS === 'web') return;
  try { await Notifications.cancelScheduledNotificationAsync('rakiza:' + id); } catch {}
}
