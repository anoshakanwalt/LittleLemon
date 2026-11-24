// Local dish photos bundled with the app (work offline, no external links).
// To add a photo: put it in assets/menu/ and add a line below with the exact dish name from menu.json.
const LOCAL = {
  'Grilled Fish': require('../assets/menu/grilled-fish.jpg'),
  'Saganaki': require('../assets/menu/saganaki.jpg'),
  'Dolmades': require('../assets/menu/dolmades.jpg'),
  'Fava Dip & Warm Pita': require('../assets/menu/fava-pita.jpg'),
  'Lamb Souvlaki': require('../assets/menu/lamb-souvlaki.jpg'),
  'Lemon Herb Chicken': require('../assets/menu/lemon-herb-chicken.jpg'),
  'Gigantes Plaka': require('../assets/menu/gigantes-plaka.jpg'),
  'Honey & Nut Yogurt': require('../assets/menu/honey-nut-yogurt.jpg'),
  'Lemon Dessert': require('../assets/menu/lemon-dessert.jpg'),
  'Mushroom Risotto': require('../assets/menu/mushroom-risotto.jpg'),
  'Cappuccino': require('../assets/menu/cappuccino.jpg'),
  'Sparkling Limonata': require('../assets/menu/sparkling-limonata.jpg'),
  'Peach Iced Tea': require('../assets/menu/peach-iced-tea.jpg'),
  'Fresh Lemonade': require('../assets/menu/fresh-lemonade.jpg'),
  'Chocolate Mousse Cake': require('../assets/menu/chocolate-mousse-cake.jpg'),
};

// Local photo first, then a remote URL from menu.json if there is one, otherwise null (emoji placeholder).
export const imageSourceFor = (item) => LOCAL[item.name] || (item.image ? { uri: item.image } : null);
