// Rule-based "What should I eat?" helper (no API needed).
// Answers: a mood and an appetite -> up to 3 suggested mini-meals from the (already filtered) menu.

export const MOODS = [
  { key: 'light', label: 'Light & fresh', emoji: '🥗', reason: "Fresh, bright flavours that won't weigh you down." },
  { key: 'hearty', label: 'Hearty & comforting', emoji: '🍝', reason: 'Warm, filling dishes made for comfort.' },
  { key: 'sweet', label: 'Something sweet', emoji: '🍰', reason: "Dessert is the plan. We won't tell anyone." },
  { key: 'surprise', label: 'Surprise me', emoji: '🎲', reason: 'A random pick from the menu, no judgement.' },
];

export const APPETITES = [
  { key: 'little', label: 'Just a bite' },
  { key: 'normal', label: 'Regular appetite' },
  { key: 'very', label: 'Very hungry' },
];

const COURSES = {
  little: (mood) => (mood === 'sweet' ? ['desserts', 'drinks'] : ['starters', 'drinks']),
  normal: (mood) => (mood === 'sweet' ? ['mains', 'desserts'] : ['mains', 'drinks']),
  very: () => ['starters', 'mains', 'desserts', 'drinks'],
};

// Which dish "vibe" we prefer for each course, given the mood.
const wantedVibe = (course, mood) => {
  if (mood === 'surprise') return null;
  if (course === 'drinks') return mood === 'hearty' ? 'warm' : 'refreshing';
  if (course === 'desserts') return 'sweet';
  return mood === 'hearty' ? 'hearty' : 'light'; // starters + mains
};

const shuffle = (arr, rng) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export function recommend(menu, { mood, appetite }, count = 3, rng = Math.random) {
  const courses = COURSES[appetite](mood);

  // For each course: dishes matching the mood first (shuffled), then the rest (shuffled).
  const ranked = {};
  courses.forEach((c) => {
    const all = menu.filter((i) => i.category === c);
    const vibe = wantedVibe(c, mood);
    const match = vibe ? all.filter((i) => (i.vibe || []).includes(vibe)) : [];
    const rest = all.filter((i) => !match.includes(i));
    ranked[c] = [...shuffle(match, rng), ...shuffle(rest, rng)];
  });

  const plans = [];
  for (let n = 0; n < count; n++) {
    const items = courses.map((c) => (ranked[c].length ? ranked[c][n % ranked[c].length] : null)).filter(Boolean);
    if (!items.length) break;
    const key = items.map((i) => i.name).join('|');
    if (plans.some((p) => p.key === key)) continue;
    plans.push({ key, items, total: items.reduce((s, i) => s + Number(i.price), 0) });
  }
  return plans;
}
