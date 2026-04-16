export const WEEKDAYS_AR = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
export const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

export const TODAY = new Date();
export const TODAY_DAY = TODAY.getDate();

export const todayLabel = `${WEEKDAYS_AR[TODAY.getDay()]} ${TODAY_DAY} ${MONTHS_AR[TODAY.getMonth()]}`;

export const buildWeek = () => {
  const dow = TODAY.getDay();
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(TODAY);
    d.setDate(TODAY_DAY - dow + i);
    week.push({ name: WEEKDAYS_AR[d.getDay()], num: d.getDate(), full: d });
  }
  return week;
};

export const WEEK = buildWeek();
