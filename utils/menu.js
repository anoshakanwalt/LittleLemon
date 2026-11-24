// Shared menu helpers: categories, diet/allergen filters, budget meal suggestions.

export const COURSE_ORDER = ['starters', 'mains', 'desserts', 'drinks'];

export const CATEGORY_INFO = {
  starters: {
    title: 'Starters',
    emoji: '🥗',
    color: '#E4EDE0',
    story:
      'Every Little Lemon meal begins the way a Chicago summer evening does: slowly, with something to share. Our starters come straight from the Mediterranean table: bright, fresh and made for passing around.',
  },
  mains: {
    title: 'Mains',
    emoji: '🍽️',
    color: '#F6E7C1',
    story:
      'The heart of the kitchen. Recipes from Greece and Italy, grilled, simmered and finished with a modern twist and plenty of lemon.',
  },
  desserts: {
    title: 'Desserts',
    emoji: '🍰',
    color: '#F8DDD3',
    story: 'A little sweetness to finish: honey, chocolate and, of course, at least one lemon.',
  },
  drinks: {
    title: 'Drinks',
    emoji: '🥤',
    color: '#D9E8EE',
    story: 'Squeezed, brewed and chilled to order. Nothing here comes from a bottle if we can help it.',
  },
};

export const DIET_OPTIONS = [
  { key: 'vegetarian', label: 'Vegetarian' },
  { key: 'vegan', label: 'Vegan' },
];

export const AVOID_OPTIONS = [
  { key: 'gluten', label: 'Gluten' },
  { key: 'dairy', label: 'Dairy' },
  { key: 'eggs', label: 'Eggs' },
  { key: 'nuts', label: 'Nuts' },
  { key: 'fish', label: 'Fish' },
  { key: 'sesame', label: 'Sesame' },
];

export const EMPTY_PREFS = { diets: [], avoid: [] };

// A dish matches if it satisfies every selected diet and contains none of the avoided allergens.
export const matchesPrefs = (item, prefs) =>
  prefs.diets.every((d) => item.diet.includes(d)) && !prefs.avoid.some((a) => item.allergens.includes(a));

export const tagsFor = (item) => {
  const tags = [];
  if (item.diet.includes('vegan')) tags.push('Vegan');
  else if (item.diet.includes('vegetarian')) tags.push('Vegetarian');
  if (!item.allergens.includes('gluten')) tags.push('Gluten-free');
  return tags;
};

export const containsText = (item) =>
  item.allergens.length ? `Contains: ${item.allergens.join(', ')}` : 'No common allergens listed';

// Budget mode: one main + optional starter / dessert / drink that fit within `perPerson`.
// Prefers fuller meals, then the ones closest to the budget, one suggestion per main.
export function suggestMeals(menu, perPerson, max = 3) {
  const by = (c) => menu.filter((i) => i.category === c);
  const starters = [null, ...by('starters')];
  const mains = by('mains');
  const desserts = [null, ...by('desserts')];
  const drinks = [null, ...by('drinks')];

  const combos = [];
  for (const m of mains) {
    for (const s of starters) {
      for (const d of desserts) {
        for (const k of drinks) {
          const items = [s, m, d, k].filter(Boolean);
          const total = items.reduce((n, i) => n + Number(i.price), 0);
          if (total <= perPerson) combos.push({ items, total, courses: items.length });
        }
      }
    }
  }
  combos.sort((a, b) => b.courses - a.courses || b.total - a.total);

  const seen = new Set();
  const out = [];
  for (const c of combos) {
    const main = c.items.find((i) => i.category === 'mains').name;
    if (seen.has(main)) continue;
    seen.add(main);
    out.push(c);
    if (out.length >= max) break;
  }
  return out;
}

export const cheapestMain = (menu) => {
  const prices = menu.filter((i) => i.category === 'mains').map((i) => Number(i.price));
  return prices.length ? Math.min(...prices) : null;
};
