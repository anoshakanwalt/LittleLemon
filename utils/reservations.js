// Date/time helpers and demo availability for table reservations.

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const SLOTS = [];
for (let h = 12; h <= 21; h++) {
  SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

export const toKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const fromKey = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const nextDays = (n = 14) => {
  const out = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    out.push({
      key: toKey(d),
      weekday: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : WEEKDAYS[d.getDay()],
      day: d.getDate(),
      month: MONTHS[d.getMonth()],
    });
  }
  return out;
};

export const formatDate = (key) => {
  const d = fromKey(key);
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
};

export const formatTime = (t) => {
  const [h, m] = t.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
};

export const isPast = (dateKey, time, now = new Date()) => {
  const [h, m] = time.split(':').map(Number);
  const d = fromKey(dateKey);
  d.setHours(h, m, 0, 0);
  return d.getTime() <= now.getTime();
};

// Demo availability: a stable pseudo-random ~1 in 5 slots shows as "fully booked".
export const isFullyBooked = (dateKey, time) => {
  const s = `${dateKey}${time}`;
  let sum = 0;
  for (let i = 0; i < s.length; i++) sum += s.charCodeAt(i) * (i + 1);
  return sum % 5 === 0;
};

export const sortReservations = (list) =>
  [...list].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
