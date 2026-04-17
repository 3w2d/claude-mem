import { getLang, WEEKDAYS, MONTHS } from './i18n.js';

export const WEEKDAYS_AR = WEEKDAYS.ar;
export const MONTHS_AR = MONTHS.ar;

export const TODAY = new Date();
export const TODAY_DAY = TODAY.getDate();

export function getTodayLabel() {
  const lang = getLang();
  const wd = WEEKDAYS[lang][TODAY.getDay()];
  const mo = MONTHS[lang][TODAY.getMonth()];
  return lang === 'ar' ? `${wd} ${TODAY_DAY} ${mo}` : `${wd}, ${mo} ${TODAY_DAY}`;
}

export const todayLabel = getTodayLabel();

export function buildWeek() {
  const lang = getLang();
  const weekdays = WEEKDAYS[lang];
  const dow = TODAY.getDay();
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(TODAY);
    d.setDate(TODAY_DAY - dow + i);
    week.push({ name: weekdays[d.getDay()], num: d.getDate(), full: d });
  }
  return week;
}

export const WEEK = buildWeek();
