import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { MENU_ITEMS } from './src/data/menu';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily if key exists
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// Menu endpoint
app.get('/api/menu', (req, res) => {
  res.json({ items: MENU_ITEMS });
});

// Heuristic fallback NLU parser for guaranteed responsiveness
function handleHeuristicNLU(message: string, currentCart: any[], checkoutStep?: string) {
  const text = message.toLowerCase().trim();

  // If in checkout flow
  if (checkoutStep === 'name') {
    return {
      reply: `Great to meet you, ${message.trim()}! 📍 Where should I deliver your order? (Enter your full delivery address)`,
      checkoutStep: 'address',
      actions: [],
      suggestedItemIds: [],
      quickReplies: [
        { label: '🏠 22 Baker Street, Apt 4B', actionText: '22 Baker Street, Apt 4B' },
        { label: '🏢 Tech Park, Building 3, Floor 5', actionText: 'Tech Park, Building 3, Floor 5' }
      ]
    };
  }

  if (checkoutStep === 'address') {
    return {
      reply: `Got it! Delivering to "${message.trim()}". 💳 And how would you like to pay?`,
      checkoutStep: 'payment',
      actions: [],
      suggestedItemIds: [],
      quickReplies: [
        { label: '💵 Cash on Delivery', actionText: 'Cash on Delivery' },
        { label: '📱 UPI', actionText: 'UPI' },
        { label: '💳 Card', actionText: 'Card' }
      ]
    };
  }

  if (checkoutStep === 'payment' || text.includes('cash on delivery') || text === 'upi' || text === 'card') {
    let method = 'Cash on Delivery';
    if (text.includes('upi')) method = 'UPI';
    if (text.includes('card')) method = 'Card';
    return {
      reply: `Payment method selected: ${method}! Everything looks delicious. Ready to place your order? 🩷`,
      checkoutStep: 'confirm',
      actions: [],
      suggestedItemIds: [],
      paymentMethod: method,
      quickReplies: [
        { label: '🩷 Place Order', actionText: 'Place Order' },
        { label: '✏️ Edit Order', actionText: 'Show my cart' }
      ]
    };
  }

  // Clear cart / changed my mind
  if (text.includes('changed my mind') || text.includes('clear cart') || text.includes('empty cart') || text.includes('cancel order')) {
    return {
      reply: "No worries at all! I've cleared your cart. What would you like to explore instead? 💜",
      actions: [{ type: 'CLEAR_CART' }],
      suggestedItemIds: ['item-1', 'item-13'],
      quickReplies: [
        { label: '🍛 I want Biryani', actionText: 'I want Biryani' },
        { label: '🍕 Show me Pizza', actionText: 'Show me Pizza' },
        { label: '🥗 Vegetarian food', actionText: 'Show vegetarian food' }
      ]
    };
  }

  // Checkout trigger
  if (text.includes('checkout') || text.includes('place order') || text.includes('proceed to checkout') || text.includes('order now') || text.includes('pay')) {
    if (!currentCart || currentCart.length === 0) {
      return {
        reply: "Your cart is currently empty! Add something delicious first like our Chicken Biryani or Margherita Pizza. What are you craving? 🍛",
        actions: [],
        suggestedItemIds: ['item-1', 'item-13', 'item-3'],
        quickReplies: [
          { label: '🍛 Chicken Biryani ₹180', actionText: 'I want 1 chicken biryani' },
          { label: '🍕 Margherita Pizza ₹220', actionText: 'Add Margherita Pizza' }
        ]
      };
    }
    const total = currentCart.reduce((sum, c) => sum + (c.item?.price || 0) * (c.quantity || 1), 0) + 30;
    return {
      reply: `Perfect! Your total with delivery is ₹${total}. Let's complete your order. What's your name? 👤`,
      checkoutStep: 'name',
      actions: [{ type: 'START_CHECKOUT' }],
      suggestedItemIds: [],
      quickReplies: [
        { label: '👤 John Doe', actionText: 'John Doe' },
        { label: '👤 Priya Sharma', actionText: 'Priya Sharma' }
      ]
    };
  }

  // Show cart
  if (text.includes('show my cart') || text.includes('what is in my cart') || text.includes('view cart') || text === 'cart') {
    if (!currentCart || currentCart.length === 0) {
      return {
        reply: "Your cart is currently empty! What would you like to add? 🛒",
        actions: [{ type: 'SHOW_CART' }],
        suggestedItemIds: ['item-1', 'item-17'],
        quickReplies: [
          { label: '🍛 I want Biryani', actionText: 'I want Biryani' },
          { label: '🍕 Show me Pizza', actionText: 'Show me Pizza' }
        ]
      };
    }
    const itemsSummary = currentCart.map(c => `${c.item.name} × ${c.quantity} (₹${c.item.price * c.quantity})`).join(', ');
    const sub = currentCart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
    return {
      reply: `Here's what you've got in your cart: ${itemsSummary}. Subtotal: ₹${sub}, Total with delivery: ₹${sub + 30}. Ready to checkout? 🩷`,
      actions: [{ type: 'SHOW_CART' }],
      suggestedItemIds: currentCart.map(c => c.item.id),
      quickReplies: [
        { label: '🩷 Proceed to Checkout', actionText: 'Checkout' },
        { label: '🥤 Add a Coke', actionText: 'Add a Coke' },
        { label: '🍰 Add Dessert', actionText: 'Show me desserts' }
      ]
    };
  }

  // Cheapest food
  if (text.includes('cheapest') || text.includes('lowest price') || text.includes('budget') || text.includes('least expensive')) {
    const cheap = [...MENU_ITEMS].sort((a, b) => a.price - b.price).slice(0, 4);
    return {
      reply: `Here are our most pocket-friendly bites! Butter Naan and Coke start at just ₹50, followed by Idli at ₹60 and Gulab Jamun at ₹70. 💰`,
      actions: [],
      suggestedItemIds: cheap.map(c => c.id),
      quickReplies: [
        { label: '🥞 2 Idlis ₹120', actionText: 'Give me 2 idlis' },
        { label: '🫓 2 Butter Naans ₹100', actionText: 'Add 2 butter naans' },
        { label: '🥤 Add a Coke ₹50', actionText: 'Add a Coke' }
      ]
    };
  }

  // Under ₹150 / Under ₹200
  const underPriceMatch = text.match(/under\s*₹?\s*(\d+)/i) || text.match(/less\s*than\s*₹?\s*(\d+)/i) || text.match(/below\s*₹?\s*(\d+)/i);
  if (underPriceMatch) {
    const maxP = parseInt(underPriceMatch[1], 10);
    const filtered = MENU_ITEMS.filter(item => item.price <= maxP);
    return {
      reply: `Found ${filtered.length} delicious options under ₹${maxP}! Check these top favorites out: 💜`,
      actions: [],
      suggestedItemIds: filtered.slice(0, 4).map(c => c.id),
      quickReplies: [
        { label: '🍛 Veg Biryani ₹140', actionText: 'I want 1 veg biryani' },
        { label: '🌯 Paneer Roll ₹130', actionText: 'Add Paneer Roll' },
        { label: '🍔 Veg Burger ₹120', actionText: 'Add Veg Burger' }
      ]
    };
  }

  // Vegetarian
  if (text.includes('vegetarian') || text.includes('veg food') || text.includes('only veg') || text.includes('pure veg')) {
    const vegItems = MENU_ITEMS.filter(item => item.vegetarian);
    return {
      reply: "Here is our 100% vegetarian selection! From rich Paneer Butter Masala to crispy Masala Dosa and Veg Biryani. 🥗",
      actions: [],
      suggestedItemIds: ['item-3', 'item-2', 'item-5', 'item-13'],
      quickReplies: [
        { label: '🍛 Veg Biryani ₹140', actionText: 'I want 1 veg biryani' },
        { label: '🧀 Paneer Butter Masala ₹160', actionText: 'Add Paneer Butter Masala' },
        { label: '🥞 Masala Dosa ₹90', actionText: 'Give me 1 masala dosa' }
      ]
    };
  }

  // Spicy food
  if (text.includes('spicy') || text.includes('hot') || text.includes('fiery')) {
    const spicyItems = MENU_ITEMS.filter(item => item.spicy);
    return {
      reply: "Craving that fiery kick? 🔥 These spicy favorites are packed with real chili and roasted spices:",
      actions: [],
      suggestedItemIds: spicyItems.slice(0, 4).map(c => c.id),
      quickReplies: [
        { label: '🍛 Chicken Biryani ₹180', actionText: 'I want 1 chicken biryani' },
        { label: '🍕 Chicken Pizza ₹280', actionText: 'Add Chicken Pizza' },
        { label: '🍜 Chicken Noodles ₹160', actionText: 'Add Chicken Noodles' }
      ]
    };
  }

  // For two people / combo
  if (text.includes('two people') || text.includes('for 2') || text.includes('couple') || text.includes('combo')) {
    return {
      reply: "For two people, I recommend 2 Biryanis (or 1 Biryani + 1 Pizza) paired with cold Cokes and warm Gulab Jamuns! 👫 Here are the essentials:",
      actions: [],
      suggestedItemIds: ['item-1', 'item-13', 'item-19', 'item-17'],
      quickReplies: [
        { label: '🍛 Add 2 Chicken Biryanis', actionText: 'I want 2 chicken biryanis' },
        { label: '🥤 Add 2 Cokes', actionText: 'Add 2 Cokes' },
        { label: '🩷 Checkout', actionText: 'Checkout' }
      ]
    };
  }

  // Dessert
  if (text.includes('dessert') || text.includes('sweet') || text.includes('gulab jamun') || text.includes('brownie')) {
    const desserts = MENU_ITEMS.filter(item => item.category === 'Dessert');
    return {
      reply: "Life is sweet! 🍰 Indulge in our melt-in-mouth warm Gulab Jamuns or rich Chocolate Brownie:",
      actions: [],
      suggestedItemIds: desserts.map(c => c.id),
      quickReplies: [
        { label: '🍯 Gulab Jamun ₹70', actionText: 'Add Gulab Jamun' },
        { label: '🍫 Chocolate Brownie ₹100', actionText: 'Add Chocolate Brownie' }
      ]
    };
  }

  // Drinks / Beverages
  if (text.includes('drink') || text.includes('beverage') || text.includes('juice') || text.includes('coke') && !text.includes('add') && !text.includes('remove')) {
    const drinks = MENU_ITEMS.filter(item => item.category === 'Beverages');
    return {
      reply: "Need a refreshing drink? 🥤 Chill out with an ice-cold Coke or zesty Fresh Lime Juice!",
      actions: [],
      suggestedItemIds: drinks.map(c => c.id),
      quickReplies: [
        { label: '🥤 Coke ₹50', actionText: 'Add one Coke' },
        { label: '🍋 Fresh Lime ₹70', actionText: 'Add Fresh Lime Juice' },
        { label: '❌ No thanks', actionText: 'No thanks' }
      ]
    };
  }

  // "No thanks"
  if (text === 'no thanks' || text === 'no' || text === 'nope') {
    return {
      reply: "All good! Your order is looking great. Would you like to proceed to checkout or add anything else? 💜",
      actions: [],
      suggestedItemIds: [],
      quickReplies: [
        { label: '🩷 Proceed to Checkout', actionText: 'Checkout' },
        { label: '🛒 View Cart', actionText: 'Show my cart' }
      ]
    };
  }

  // Remove item
  if (text.includes('remove') || text.includes('delete') || text.includes('minus') || text.includes('drop')) {
    let matchedItem = MENU_ITEMS.find(m => text.includes(m.name.toLowerCase()) || text.includes(m.tags?.[0] || ''));
    if (!matchedItem) {
      if (text.includes('biryani')) matchedItem = MENU_ITEMS[0];
      else if (text.includes('coke')) matchedItem = MENU_ITEMS[18];
      else if (text.includes('pizza')) matchedItem = MENU_ITEMS[12];
    }
    if (matchedItem) {
      return {
        reply: `Done! 🗑️ I've removed ${matchedItem.name} from your cart.`,
        actions: [{ type: 'REMOVE_ITEM', itemId: matchedItem.id, quantity: 1 }],
        suggestedItemIds: [matchedItem.id],
        quickReplies: [
          { label: '🛒 Show Cart', actionText: 'Show my cart' },
          { label: '🩷 Checkout', actionText: 'Checkout' }
        ]
      };
    }
  }

  // Modify quantity (e.g., "Make biryani quantity 4")
  const makeQtyMatch = text.match(/make\s+(.*?)\s+(?:quantity|qty)?\s*(\d+)/i) || text.match(/set\s+(.*?)\s+(?:quantity|qty)?\s*to\s*(\d+)/i);
  if (makeQtyMatch) {
    const itemNamePart = makeQtyMatch[1].trim();
    const qty = parseInt(makeQtyMatch[2], 10);
    const matchedItem = MENU_ITEMS.find(m => m.name.toLowerCase().includes(itemNamePart) || itemNamePart.includes(m.name.toLowerCase())) ||
      (itemNamePart.includes('biryani') ? MENU_ITEMS[0] : MENU_ITEMS[18]);

    return {
      reply: `Updated! ✍️ I've updated the quantity of ${matchedItem.name} to ${qty}.`,
      actions: [{ type: 'UPDATE_QUANTITY', itemId: matchedItem.id, quantity: qty }],
      suggestedItemIds: [matchedItem.id],
      quickReplies: [
        { label: '🥤 Add a Coke ₹50', actionText: 'Add a Coke' },
        { label: '🩷 Checkout', actionText: 'Checkout' }
      ]
    };
  }

  // Add Item / Ordering intent (e.g. "I want 2 chicken biryanis", "Give me 3 dosas", "Add a Coke")
  // Extract number (default 1)
  let quantity = 1;
  const wordToNum: Record<string, number> = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'a': 1, 'an': 1
  };
  const numMatch = text.match(/\b(\d+)\b/);
  if (numMatch) {
    quantity = parseInt(numMatch[1], 10);
  } else {
    for (const [w, n] of Object.entries(wordToNum)) {
      const reg = new RegExp(`\\b${w}\\b`, 'i');
      if (reg.test(text)) {
        quantity = n;
        break;
      }
    }
  }

  // Match menu item
  let foundItem = MENU_ITEMS.find(item => text.includes(item.name.toLowerCase()));
  if (!foundItem) {
    // Specific aliases
    if (text.includes('chicken biryani')) foundItem = MENU_ITEMS.find(i => i.name === 'Chicken Biryani');
    else if (text.includes('veg biryani')) foundItem = MENU_ITEMS.find(i => i.name === 'Veg Biryani');
    else if (text.includes('biryani')) foundItem = MENU_ITEMS.find(i => i.name === 'Chicken Biryani');
    else if (text.includes('dosa')) foundItem = MENU_ITEMS.find(i => i.name === 'Masala Dosa');
    else if (text.includes('idli')) foundItem = MENU_ITEMS.find(i => i.name === 'Idli');
    else if (text.includes('naan')) foundItem = MENU_ITEMS.find(i => i.name === 'Butter Naan');
    else if (text.includes('paneer butter') || text.includes('butter masala')) foundItem = MENU_ITEMS.find(i => i.name === 'Paneer Butter Masala');
    else if (text.includes('paneer roll')) foundItem = MENU_ITEMS.find(i => i.name === 'Paneer Roll');
    else if (text.includes('coke') || text.includes('cola')) foundItem = MENU_ITEMS.find(i => i.name === 'Coke');
    else if (text.includes('lime') || text.includes('lemon')) foundItem = MENU_ITEMS.find(i => i.name === 'Fresh Lime Juice');
    else if (text.includes('chicken pizza')) foundItem = MENU_ITEMS.find(i => i.name === 'Chicken Pizza');
    else if (text.includes('margherita') || text.includes('cheese pizza')) foundItem = MENU_ITEMS.find(i => i.name === 'Margherita Pizza');
    else if (text.includes('chicken burger')) foundItem = MENU_ITEMS.find(i => i.name === 'Chicken Burger');
    else if (text.includes('veg burger')) foundItem = MENU_ITEMS.find(i => i.name === 'Veg Burger');
    else if (text.includes('fries')) foundItem = MENU_ITEMS.find(i => i.name === 'French Fries');
    else if (text.includes('brownie')) foundItem = MENU_ITEMS.find(i => i.name === 'Chocolate Brownie');
    else if (text.includes('gulab jamun') || text.includes('jamun')) foundItem = MENU_ITEMS.find(i => i.name === 'Gulab Jamun');
    else if (text.includes('fried rice')) foundItem = text.includes('veg') ? MENU_ITEMS.find(i => i.name === 'Veg Fried Rice') : MENU_ITEMS.find(i => i.name === 'Chicken Fried Rice');
    else if (text.includes('noodles')) foundItem = text.includes('veg') ? MENU_ITEMS.find(i => i.name === 'Veg Noodles') : MENU_ITEMS.find(i => i.name === 'Chicken Noodles');
  }

  if (foundItem) {
    const isDrink = foundItem.category === 'Beverages';
    const isDessert = foundItem.category === 'Dessert';

    let drinkUpsell = !isDrink ? "Would you like something to drink? 🩷" : "Would you like something sweet to finish off? 🍰";
    let quicks = !isDrink ? [
      { label: '🥤 Coke ₹50', actionText: 'Add one Coke' },
      { label: '🍋 Fresh Lime ₹70', actionText: 'Add Fresh Lime Juice' },
      { label: '❌ No thanks', actionText: 'No thanks' }
    ] : [
      { label: '🍯 Gulab Jamun ₹70', actionText: 'Add Gulab Jamun' },
      { label: '🩷 Checkout', actionText: 'Checkout' }
    ];

    return {
      reply: `Absolutely! 🍛 I've added ${quantity} ${foundItem.name}${quantity > 1 ? 's' : ''} to your cart. ${drinkUpsell}`,
      actions: [{ type: 'ADD_ITEM', itemId: foundItem.id, quantity }],
      suggestedItemIds: [foundItem.id],
      quickReplies: quicks
    };
  }

  // If item doesn't exist on menu
  return {
    reply: "Sorry, we don't have that on our menu. Would you like me to suggest something similar? 💜 Here are some of our top rated dishes:",
    actions: [],
    suggestedItemIds: ['item-1', 'item-13', 'item-3', 'item-5'],
    quickReplies: [
      { label: '🍛 Chicken Biryani ₹180', actionText: 'I want 1 chicken biryani' },
      { label: '🍕 Margherita Pizza ₹220', actionText: 'Add Margherita Pizza' },
      { label: '🥗 Show vegetarian food', actionText: 'Show vegetarian food' }
    ]
  };
}

// Chat API Route
app.post('/api/chat', async (req, res) => {
  try {
    const { message, cart = [], checkoutStep = 'idle' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGenAI();

    // If Gemini key is available, attempt Gemini processing with structured output
    if (ai) {
      try {
        const menuContext = MENU_ITEMS.map(i => ({
          id: i.id,
          name: i.name,
          category: i.category,
          price: i.price,
          veg: i.vegetarian,
          spicy: i.spicy,
          desc: i.description
        }));

        const systemPrompt = `You are FoodBot, a friendly, fast, and conversational AI Food Ordering Assistant with a purple & pink aesthetic.
Personality:
- Friendly, Helpful, Fast, Conversational, Slightly playful ("Yay! 🎉 Your biryani is in the cart!", "Great choice! 💜", "Want something sweet after that? 🍰").
- Keep responses concise (1-3 sentences maximum).

CRITICAL STRICT RULES:
1. NEVER invent food items, prices, availability, or discounts. You can ONLY use the following 20 menu items:
${JSON.stringify(menuContext)}
2. If an item doesn't exist: "Sorry, we don't have that on our menu. Would you like me to suggest something similar?"
3. If an item is unavailable: "Sorry, that item is currently unavailable. Here are some alternatives."
4. Always parse user ordering intents accurately:
   - "I want 2 chicken biryanis" -> add item-1 with quantity 2
   - "Give me 3 dosas" -> add item-5 with quantity 3
   - "Add a Coke" -> add item-19 with quantity 1
   - "Remove one Coke" -> remove item-19
   - "Make biryani quantity 4" -> update item-1 quantity to 4
   - "Show my cart" -> summarize cart items and subtotal
   - "What's the cheapest food?" -> recommend Butter Naan (item-4) and Coke (item-19) at ₹50, Idli (item-6) at ₹60, Gulab Jamun (item-17) at ₹70
   - "Show vegetarian food" -> suggest vegetarian items
   - "I want something under ₹200" -> suggest items <= 200
   - "I want something spicy" -> suggest spicy items (item-1, item-2, item-9, item-14, item-16)
   - "I'm ordering for two people" -> recommend a 2-person combo (e.g. Biryanis + Starters + Drinks)
   - "I changed my mind" -> clear cart
   - "Checkout" -> start checkout flow: ask for name first, then delivery address, then payment method (Cash on Delivery, UPI, Card)
5. When recommending or modifying items, always include their exact 'id' in 'suggestedItemIds'.
6. Provide helpful quickReplies buttons.

Current Cart: ${JSON.stringify(cart)}
Current Checkout Step: ${checkoutStep}

Respond in strict JSON format:
{
  "reply": "Conversational reply with emojis",
  "actions": [
    { "type": "ADD_ITEM" | "REMOVE_ITEM" | "UPDATE_QUANTITY" | "CLEAR_CART" | "START_CHECKOUT" | "SHOW_CART", "itemId": "item-id", "quantity": 1 }
  ],
  "suggestedItemIds": ["item-id"],
  "quickReplies": [
    { "label": "Button text with emoji", "actionText": "Text to send when tapped" }
  ],
  "checkoutStep": "name" | "address" | "payment" | "confirm" | "none"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: message,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const textOutput = response.text;
        if (textOutput) {
          const parsed = JSON.parse(textOutput.trim());
          return res.json(parsed);
        }
      } catch (geminiError) {
        console.warn('Gemini call failed or timed out, falling back to local heuristic NLU:', geminiError);
      }
    }

    // Heuristic fallback NLU
    const fallbackResult = handleHeuristicNLU(message, cart, checkoutStep);
    return res.json(fallbackResult);
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FoodBot server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
