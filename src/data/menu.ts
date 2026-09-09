import { FoodItem } from '../types';

export const MENU_CATEGORIES = [
  'All',
  'Indian',
  'Chinese',
  'Burgers',
  'Pizza',
  'Snacks',
  'Desserts',
  'Beverages'
] as const;

export type MenuCategory = typeof MENU_CATEGORIES[number];

export const MENU_ITEMS: FoodItem[] = [
  {
    id: 'item-1',
    name: 'Chicken Biryani',
    category: 'Indian',
    description: 'Authentic royal spiced basmati rice layered with tender marinated chicken and fragrant saffron aroma.',
    price: 180,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    vegetarian: false,
    rating: 4.7,
    preparation_time: '25 min',
    available: true,
    spicy: true,
    popular: true,
    tags: ['biryani', 'chicken', 'rice', 'spicy', 'non-veg', 'indian', 'popular']
  },
  {
    id: 'item-2',
    name: 'Veg Biryani',
    category: 'Indian',
    description: 'Fragrant basmati rice slow-cooked with fresh garden vegetables, paneer cubes, and aromatic whole spices.',
    price: 140,
    image: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&w=800&q=80',
    vegetarian: true,
    rating: 4.5,
    preparation_time: '20 min',
    available: true,
    spicy: true,
    popular: true,
    tags: ['biryani', 'veg', 'rice', 'spicy', 'vegetarian', 'indian']
  },
  {
    id: 'item-3',
    name: 'Paneer Butter Masala',
    category: 'Indian',
    description: 'Soft cottage cheese cubes simmered in a luscious, velvety tomato-butter gravy with aromatic fenugreek.',
    price: 160,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
    vegetarian: true,
    rating: 4.8,
    preparation_time: '20 min',
    available: true,
    spicy: false,
    popular: true,
    tags: ['paneer', 'curry', 'gravy', 'butter', 'vegetarian', 'indian']
  },
  {
    id: 'item-4',
    name: 'Butter Naan',
    category: 'Indian',
    description: 'Crisp yet fluffy tandoor-baked Indian flatbread brushed generously with creamy golden salted butter.',
    price: 50,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    vegetarian: true,
    rating: 4.6,
    preparation_time: '10 min',
    available: true,
    spicy: false,
    popular: true,
    tags: ['naan', 'bread', 'roti', 'butter', 'vegetarian', 'cheap', 'side', 'indian']
  },
  {
    id: 'item-5',
    name: 'Masala Dosa',
    category: 'Indian',
    description: 'Crispy golden fermented crepe stuffed with savory spiced potato filling, served with coconut chutney and sambar.',
    price: 90,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    vegetarian: true,
    rating: 4.7,
    preparation_time: '15 min',
    available: true,
    spicy: false,
    popular: true,
    tags: ['dosa', 'south indian', 'breakfast', 'vegetarian', 'crispy', 'under 100', 'indian']
  },
  {
    id: 'item-6',
    name: 'Idli',
    category: 'Indian',
    description: 'Steamed, pillowy-soft rice cakes (set of 3) served steaming hot with spiced lentil sambar and fresh chutney.',
    price: 60,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    vegetarian: true,
    rating: 4.4,
    preparation_time: '10 min',
    available: true,
    spicy: false,
    tags: ['idli', 'south indian', 'healthy', 'vegetarian', 'breakfast', 'cheap', 'indian']
  },
  {
    id: 'item-7',
    name: 'Chicken Fried Rice',
    category: 'Chinese',
    description: 'Wok-tossed long-grain rice with crispy shredded chicken, spring onions, eggs, and authentic soy aromatics.',
    price: 170,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
    vegetarian: false,
    rating: 4.6,
    preparation_time: '20 min',
    available: true,
    spicy: true,
    tags: ['chicken', 'fried rice', 'rice', 'chinese', 'non-veg']
  },
  {
    id: 'item-8',
    name: 'Veg Fried Rice',
    category: 'Chinese',
    description: 'Classic wok-charred rice tossed with fine diced carrots, beans, bell peppers, garlic, and scallions.',
    price: 130,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    vegetarian: true,
    rating: 4.3,
    preparation_time: '15 min',
    available: true,
    spicy: false,
    tags: ['veg', 'fried rice', 'rice', 'chinese', 'vegetarian']
  },
  {
    id: 'item-9',
    name: 'Chicken Noodles',
    category: 'Chinese',
    description: 'Hakka noodles stir-fried with juicy chicken slivers, crunchy shredded cabbage, and spicy schezwan sauce.',
    price: 160,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    vegetarian: false,
    rating: 4.5,
    preparation_time: '20 min',
    available: true,
    spicy: true,
    tags: ['chicken', 'noodles', 'hakka', 'schezwan', 'non-veg', 'spicy', 'chinese']
  },
  {
    id: 'item-10',
    name: 'Veg Noodles',
    category: 'Chinese',
    description: 'Savory stir-fried noodles loaded with crunchy vegetables, hints of dark soy, pepper, and garlic oil.',
    price: 120,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
    vegetarian: true,
    rating: 4.2,
    preparation_time: '15 min',
    available: true,
    spicy: false,
    tags: ['veg', 'noodles', 'hakka', 'chinese', 'vegetarian']
  },
  {
    id: 'item-11',
    name: 'Chicken Burger',
    category: 'Burgers',
    description: 'Golden crispy chicken breast patty topped with melted cheese slice, crisp iceberg lettuce, and chipotle mayo.',
    price: 150,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    vegetarian: false,
    rating: 4.6,
    preparation_time: '15 min',
    available: true,
    spicy: false,
    popular: true,
    tags: ['burger', 'chicken', 'fast food', 'non-veg', 'burgers']
  },
  {
    id: 'item-12',
    name: 'Veg Burger',
    category: 'Burgers',
    description: 'Hearty spiced herb-potato patty with fresh tomato slices, crunchy onions, and zesty secret burger sauce.',
    price: 120,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    vegetarian: true,
    rating: 4.3,
    preparation_time: '15 min',
    available: true,
    spicy: false,
    tags: ['burger', 'veg', 'fast food', 'vegetarian', 'burgers']
  },
  {
    id: 'item-13',
    name: 'Margherita Pizza',
    category: 'Pizza',
    description: 'Stone-baked thin crust pizza with San Marzano tomato sauce, generous mozzarella, and fragrant fresh basil.',
    price: 220,
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
    vegetarian: true,
    rating: 4.8,
    preparation_time: '25 min',
    available: true,
    spicy: false,
    popular: true,
    tags: ['pizza', 'cheese', 'margherita', 'vegetarian', 'italian']
  },
  {
    id: 'item-14',
    name: 'Chicken Pizza',
    category: 'Pizza',
    description: 'Loaded with smoked barbecue chicken chunks, fiery jalapenos, red peppers, and gooey melted mozzarella.',
    price: 280,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    vegetarian: false,
    rating: 4.7,
    preparation_time: '25 min',
    available: true,
    spicy: true,
    popular: true,
    tags: ['pizza', 'chicken', 'bbq', 'non-veg', 'spicy']
  },
  {
    id: 'item-15',
    name: 'French Fries',
    category: 'Snacks',
    description: 'Crispy golden potato fries lightly dusted with sea salt and served with creamy spiced dipping mayo.',
    price: 100,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
    vegetarian: true,
    rating: 4.5,
    preparation_time: '10 min',
    available: true,
    spicy: false,
    tags: ['fries', 'sides', 'snack', 'vegetarian', 'finger food', 'fast food']
  },
  {
    id: 'item-16',
    name: 'Paneer Roll',
    category: 'Snacks',
    description: 'Char-grilled tikka paneer rolled in a soft flaky paratha with mint-coriander chutney and pickled onion rings.',
    price: 130,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    vegetarian: true,
    rating: 4.6,
    preparation_time: '15 min',
    available: true,
    spicy: true,
    tags: ['roll', 'kathi roll', 'paneer', 'tikka', 'wrap', 'vegetarian', 'snack']
  },
  {
    id: 'item-17',
    name: 'Gulab Jamun',
    category: 'Desserts',
    description: 'Two warm, melt-in-mouth milk dumplings steeped in fragrant saffron, cardamom, and rose water syrup.',
    price: 70,
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
    vegetarian: true,
    rating: 4.9,
    preparation_time: '5 min',
    available: true,
    spicy: false,
    popular: true,
    tags: ['dessert', 'desserts', 'sweet', 'gulab jamun', 'mithai', 'vegetarian', 'cheap']
  },
  {
    id: 'item-18',
    name: 'Chocolate Brownie',
    category: 'Desserts',
    description: 'Decadent fudgy dark chocolate walnut brownie, warm and rich with molten chocolate drizzle.',
    price: 100,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    vegetarian: true,
    rating: 4.8,
    preparation_time: '5 min',
    available: true,
    spicy: false,
    tags: ['brownie', 'dessert', 'desserts', 'chocolate', 'sweet', 'bakery', 'vegetarian']
  },
  {
    id: 'item-19',
    name: 'Coke',
    category: 'Beverages',
    description: 'Chilled 330ml can of classic Coca-Cola served ice-cold for the ultimate refreshing fizz.',
    price: 50,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    vegetarian: true,
    rating: 4.8,
    preparation_time: '2 min',
    available: true,
    spicy: false,
    popular: true,
    tags: ['coke', 'drink', 'beverage', 'beverages', 'cold drink', 'soda', 'cheap']
  },
  {
    id: 'item-20',
    name: 'Fresh Lime Juice',
    category: 'Beverages',
    description: 'Freshly squeezed zesty lime juice with a hint of rock salt, mint sprigs, and chilled sparkling water.',
    price: 70,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    vegetarian: true,
    rating: 4.7,
    preparation_time: '5 min',
    available: true,
    spicy: false,
    tags: ['lime juice', 'juice', 'beverage', 'beverages', 'healthy', 'drink', 'fresh']
  }
];

export const QUICK_SUGGESTIONS = [
  { label: 'Show Menu', query: 'Show me the menu', icon: '📜' },
  { label: 'I want Biryani', query: 'I want Biryani', icon: '🍛' },
  { label: 'Show me Pizza', query: 'Show me Pizza', icon: '🍕' },
  { label: 'Vegetarian food', query: 'Show vegetarian food', icon: '🥗' },
  { label: 'Under ₹150', query: 'Show me items under ₹150', icon: '💰' },
  { label: 'Something spicy', query: 'I want something spicy', icon: '🔥' },
  { label: 'Desserts', query: 'Show me desserts', icon: '🍰' },
  { label: 'Beverages', query: 'Show me drinks', icon: '🥤' }
];

export function findItemByName(name: string): FoodItem | undefined {
  const clean = name.toLowerCase().trim();
  return MENU_ITEMS.find((item) => {
    const itemClean = item.name.toLowerCase();
    return (
      itemClean === clean ||
      itemClean.includes(clean) ||
      clean.includes(itemClean) ||
      (clean.includes('biryani') && itemClean.includes('biryani')) ||
      (clean.includes('dosa') && itemClean.includes('dosa')) ||
      (clean.includes('idli') && itemClean.includes('idli')) ||
      (clean.includes('coke') && itemClean.includes('coke')) ||
      (clean.includes('lime') && itemClean.includes('lime')) ||
      (clean.includes('naan') && itemClean.includes('naan')) ||
      (clean.includes('paneer') && itemClean.includes('paneer')) ||
      (clean.includes('pizza') && itemClean.includes('pizza')) ||
      (clean.includes('burger') && itemClean.includes('burger')) ||
      (clean.includes('brownie') && itemClean.includes('brownie')) ||
      (clean.includes('fries') && itemClean.includes('fries')) ||
      (clean.includes('noodles') && itemClean.includes('noodles')) ||
      (clean.includes('fried rice') && itemClean.includes('fried rice')) ||
      (clean.includes('gulab jamun') && itemClean.includes('gulab jamun'))
    );
  });
}
