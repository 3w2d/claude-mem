// Keyword-based Arabic fallback used when the OpenAI proxy is disabled
// or unreachable. Mirrors the behavior of the V3 prototype.

export function localResponse(msg, { files, events, tasks, selectedDay }) {
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
}

export function buildContext({ files, events, tasks, selectedDay }) {
  const todayEvents = events.filter((e) => e.day === selectedDay);
  return {
    files: files.map((f) => ({ name: f.name, ext: f.ext, starred: f.starred, aiNote: f.aiNote })),
    eventsToday: todayEvents.map((e) => ({ time: e.time, title: e.title, duration: e.duration })),
    eventsUpcoming: events.length,
    tasks: tasks.map((t) => ({ text: t.text, done: t.done, priority: t.priority })),
    selectedDay,
  };
}
