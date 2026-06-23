const STATUS_META = {
  uploaded:          { label: 'הועלה',            tone: 'pending', group: 'waiting' },
  missing_details:   { label: 'חסר מידע',         tone: 'pending', group: 'waiting' },
  payment_required:  { label: 'נדרש תשלום',       tone: 'rejected', group: 'paymentRequired' },
  analyzing:         { label: 'בניתוח',            tone: 'active',  group: 'inProgress' },
  manual_review:     { label: 'נדרש מעבר ידני',   tone: 'active',  group: 'inProgress' },
  analyzed:          { label: 'הושלמה בדיקה',     tone: 'done',    group: 'done' },
  closed:            { label: 'נסגר',              tone: 'done',    group: 'done' },
  rejected:          { label: 'נדחה',              tone: 'rejected', group: 'rejected' },
  failed:            { label: 'הבדיקה נכשלה',     tone: 'rejected', group: 'rejected' },
};

export function getStatusMeta(status) {
  return STATUS_META[status] || { label: status || 'לא ידוע', tone: 'neutral', group: 'other' };
}

export function getStatusLabel(status) {
  return getStatusMeta(status).label;
}

export function getStatusTone(status) {
  return getStatusMeta(status).tone;
}

export function buildReportStats(reportCases) {
  const counters = { total: reportCases.length, waiting: 0, inProgress: 0, done: 0, rejected: 0 };

  reportCases.forEach((reportCase) => {
    const { group } = getStatusMeta(reportCase.status);
    if (group === 'waiting') counters.waiting += 1;
    else if (group === 'inProgress') counters.inProgress += 1;
    else if (group === 'done') counters.done += 1;
    else if (group === 'rejected') counters.rejected += 1;
  });

  return counters;
}

export const reportStatusOptions = [
  { value: '', label: 'כל הסטטוסים' },
  { value: 'uploaded', label: 'הועלה' },
  { value: 'missing_details', label: 'חסר מידע' },
  { value: 'payment_required', label: 'נדרש תשלום' },
  { value: 'analyzing', label: 'בניתוח' },
  { value: 'manual_review', label: 'נדרש מעבר ידני' },
  { value: 'analyzed', label: 'הושלמה בדיקה' },
  { value: 'closed', label: 'נסגר' },
  { value: 'failed', label: 'נכשל' },
];

export function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('he-IL', { dateStyle: 'medium' }).format(new Date(value));
}

export function buildStatusTimeline(status) {
  const { group } = getStatusMeta(status);

  if (group === 'rejected') {
    return [
      { key: 'uploaded', label: 'הדוח הועלה', description: 'הקובץ נשמר בהצלחה במערכת.', state: 'complete' },
      { key: 'rejected', label: 'נדחה', description: 'הבדיקה הסתיימה ללא אישור ערעור.', state: 'current' },
    ];
  }

  if (group === 'paymentRequired') {
    return [
      { key: 'uploaded', label: 'הדוח נפתח', description: 'הדוח נפתח במערכת.', state: 'complete' },
      { key: 'payment_required', label: 'נדרש תשלום', description: 'הניתוח החינמי הראשון נוצל — יש להשלים תשלום של ₪30 כדי להמשיך.', state: 'current' },
    ];
  }

  const steps = [
    { key: 'uploaded', label: 'הדוח הועלה', description: 'הקובץ נשמר בהצלחה במערכת.' },
    { key: 'inProgress', label: 'בבדיקה', description: 'המערכת בוחנת את הפרטים שחולצו מהדוח.' },
    { key: 'done', label: 'הושלם', description: 'הבדיקה הסתיימה והתוצאה מוכנה לצפייה.' },
  ];

  const groupOrder = ['waiting', 'inProgress', 'done'];
  const currentIndex = Math.max(groupOrder.indexOf(group), 0);

  return steps.map((step, index) => ({
    ...step,
    state: index < currentIndex ? 'complete' : index === currentIndex ? 'current' : 'upcoming',
  }));
}

export function mapReportCaseToCaseItem(reportCase) {
  return {
    id: reportCase.id,
    title: reportCase.report_type || 'דוח תנועה',
    type: reportCase.report_type || 'דוח תנועה',
    authority: reportCase.authority || 'לא זוהה עדיין',
    date: formatDate(reportCase.created_at),
    amount: null,
    statusRaw: reportCase.status,
    status: getStatusLabel(reportCase.status),
    chance: reportCase.appeal_chance ?? null,
    risk: reportCase.risk_level,
  };
}
