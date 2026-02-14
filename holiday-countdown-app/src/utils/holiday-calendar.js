const DAY_MS = 24 * 60 * 60 * 1000;

const HOLIDAY_PALETTE = {
  '元旦节': ['#22c55e', '#38bdf8'],
  '春节': ['#ef4444', '#f59e0b'],
  '清明节': ['#14b8a6', '#84cc16'],
  '劳动节': ['#f97316', '#fb7185'],
  '端午节': ['#06b6d4', '#0ea5e9'],
  '中秋节': ['#6366f1', '#a78bfa'],
  '国庆节': ['#dc2626', '#f97316']
};

function pad2(value) {
  return String(value).padStart(2, '0');
}

function toDateKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function qingmingDay(year) {
  if (year < 2000 || year > 2099) return 4;
  const c = 4.81;
  return Math.floor((year % 100) * 0.2422 + c) - Math.floor((year % 100 - 1) / 4);
}

function getLunarFestivalDate(year, monthName, dayNum) {
  try {
    const lunarFormatter = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', {
      month: 'long',
      day: 'numeric'
    });
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    for (let d = new Date(start); d <= end; d = new Date(d.getTime() + DAY_MS)) {
      const parts = lunarFormatter.formatToParts(d);
      const lunarMonth = parts.find((part) => part.type === 'month')?.value;
      const lunarDay = Number(parts.find((part) => part.type === 'day')?.value || 0);
      if (lunarMonth === monthName && lunarDay === dayNum) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
      }
    }
  } catch (e) {
    return null;
  }
  return null;
}

export function parseDateKey(dateKey) {
  const [y, m, d] = String(dateKey).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function daysBetween(from, to) {
  const diff = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.round(diff / DAY_MS);
}

export function formatHolidayDate(dateObj) {
  const y = dateObj.getFullYear();
  const m = pad2(dateObj.getMonth() + 1);
  const d = pad2(dateObj.getDate());
  return `${y}-${m}-${d}`;
}

export function normalizeHolidayName(name = '') {
  const cleaned = String(name)
    .replace(/（[^）]*）/g, '')
    .replace(/\([^)]*\)/g, '')
    .trim();

  if (cleaned.includes('元旦')) return '元旦节';
  if (cleaned.includes('春节')) return '春节';
  if (cleaned.includes('清明')) return '清明节';
  if (cleaned.includes('劳动')) return '劳动节';
  if (cleaned.includes('端午')) return '端午节';
  if (cleaned.includes('中秋')) return '中秋节';
  if (cleaned.includes('国庆')) return '国庆节';
  return cleaned || '节假日';
}

export function getHolidayTheme(name) {
  return HOLIDAY_PALETTE[normalizeHolidayName(name)] || ['#0ea5e9', '#6366f1'];
}

export function getHolidaySubtitle(holiday) {
  if (!holiday) return '暂无节日数据';
  if (holiday.isToday) return `今天是${holiday.name}`;
  return `距离${holiday.name}还有`;
}

export function resolveTrueFestivalDate(name, baseDate = new Date(), fallbackDate = null) {
  const normalized = normalizeHolidayName(name);
  const base = startOfDay(baseDate);
  const y1 = base.getFullYear();
  const y2 = y1 + 1;

  const pick = (d1, d2) => {
    const c1 = d1 && d1 >= base ? d1 : null;
    const c2 = d2 && d2 >= base ? d2 : null;
    if (c1 && c2) return c1 <= c2 ? c1 : c2;
    return c1 || c2 || null;
  };

  switch (normalized) {
    case '元旦节':
      return pick(new Date(y1, 0, 1), new Date(y2, 0, 1)) || fallbackDate;
    case '劳动节':
      return pick(new Date(y1, 4, 1), new Date(y2, 4, 1)) || fallbackDate;
    case '国庆节':
      return pick(new Date(y1, 9, 1), new Date(y2, 9, 1)) || fallbackDate;
    case '清明节':
      return pick(new Date(y1, 3, qingmingDay(y1)), new Date(y2, 3, qingmingDay(y2))) || fallbackDate;
    case '春节':
      return pick(getLunarFestivalDate(y1, '正月', 1), getLunarFestivalDate(y2, '正月', 1)) || fallbackDate;
    case '端午节':
      return pick(getLunarFestivalDate(y1, '五月', 5), getLunarFestivalDate(y2, '五月', 5)) || fallbackDate;
    case '中秋节':
      return pick(getLunarFestivalDate(y1, '八月', 15), getLunarFestivalDate(y2, '八月', 15)) || fallbackDate;
    default:
      return fallbackDate || null;
  }
}

function enrichHoliday(rawHoliday, baseDate) {
  if (!rawHoliday?.date) return null;
  const dateObj = parseDateKey(rawHoliday.date);
  const normalizedName = normalizeHolidayName(rawHoliday.name);
  const daysLeft = typeof rawHoliday.rest === 'number' ? rawHoliday.rest : daysBetween(baseDate, dateObj);
  return {
    ...rawHoliday,
    normalizedName,
    daysLeft,
    isToday: daysLeft === 0,
    dateObj,
    theme: getHolidayTheme(normalizedName),
    typeName: rawHoliday.name || normalizedName,
    lunar: rawHoliday.cnLunar || ''
  };
}

export function parseNextHolidayResponse(payload, baseDate = new Date()) {
  const body = payload?.data || payload || {};
  if (body.code !== 0) {
    throw new Error('节假日接口返回异常');
  }

  const today = toDateKey(baseDate);
  const nextHoliday = enrichHoliday(body.holiday, baseDate);
  const workday = body.workday ? enrichHoliday(body.workday, baseDate) : null;

  if (!nextHoliday) {
    throw new Error('未获取到下一个节假日');
  }

  return {
    today,
    next: nextHoliday,
    workday,
    list: []
  };
}

export function parseYearHolidayResponse(payload, baseDate = new Date()) {
  const body = payload?.data || payload || {};
  if (body.code !== 0) {
    throw new Error('节假日年度接口返回异常');
  }

  const holidayObj = body.holiday || {};
  return Object.values(holidayObj)
    .map((entry) => enrichHoliday(entry, baseDate))
    .filter(Boolean)
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
}

export function mergeUpcomingList(baseDate, listA = [], listB = [], limit = 8) {
  const now = startOfDay(baseDate);
  const merged = [...listA, ...listB]
    .filter((item) => item && item.dateObj >= now)
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  const seen = new Set();
  const unique = [];
  for (const item of merged) {
    const key = `${item.date}-${item.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
    if (unique.length >= limit) break;
  }
  return unique;
}
