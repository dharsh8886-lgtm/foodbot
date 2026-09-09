import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { MENU_ITEMS, findItemByName, MENU_CATEGORIES } from './src/data/menu';
import {
  detectLanguage,
  extractQuantity,
  FOOD_VOCABULARY_MAP,
  CONVERSATIONAL_RESPONSES,
  SupportedLanguage
} from './src/utils/multilingual';

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
  res.json({ items: MENU_ITEMS, categories: MENU_CATEGORIES });
});

// Helper to find item using vocabulary map, Tamil script, Tanglish, and exact names
function resolveItemFromQuery(query: string) {
  const lower = query.toLowerCase().trim();

  // Sort keys by descending length so multi-word keys match first (e.g. "veg biryani" before "biryani")
  const sortedKeys = Object.keys(FOOD_VOCABULARY_MAP).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (lower.includes(key.toLowerCase())) {
      const id = FOOD_VOCABULARY_MAP[key];
      const item = MENU_ITEMS.find((m) => m.id === id);
      if (item) return item;
    }
  }

  return findItemByName(query);
}

// Comprehensive Heuristic NLU with Intent-Based Routing, Tanglish, and Multilingual Support
function handleHeuristicNLU(
  message: string,
  currentCart: any[],
  checkoutStep?: string,
  clientLang?: string,
  unavailableItemIds: string[] = []
) {
  const text = message.toLowerCase().trim();

  // Determine language (respect Tanglish 'ta-Latn', Tamil 'ta', etc.)
  const detected = detectLanguage(message);
  const lang: SupportedLanguage =
    clientLang && clientLang !== 'auto' && detected === 'en'
      ? (clientLang as SupportedLanguage)
      : detected;

  const langPack = CONVERSATIONAL_RESPONSES[lang] || CONVERSATIONAL_RESPONSES.en;

  // 1. ACTIVE CHECKOUT FLOW
  if (checkoutStep === 'name') {
    return {
      intent: 'CHECKOUT',
      reply:
        lang === 'ta-Latn'
          ? `Super, ${message.trim()}! 📍 Enga deliver pannanum? Unga address type pannunga.`
          : lang === 'ta'
          ? `மகிழ்ச்சி, ${message.trim()}! 📍 எங்கு டெலிவரி செய்ய வேண்டும்? முகவரியை உள்ளிடவும்.`
          : `Great to meet you, ${message.trim()}! 📍 Where should I deliver your order? (Enter your delivery address)`,
      checkoutStep: 'address',
      actions: [],
      suggestedItemIds: [],
      showMenu: false,
      language: lang,
      quickReplies: [
        { label: '🏠 22 Baker Street, Apt 4B', actionText: '22 Baker Street, Apt 4B' },
        { label: '🏢 Tech Park, Building 3', actionText: 'Tech Park, Building 3' }
      ]
    };
  }

  if (checkoutStep === 'address') {
    return {
      intent: 'CHECKOUT',
      reply:
        lang === 'ta-Latn'
          ? `Got it! "${message.trim()}"-ku deliver panrom. 💳 Eppadi pay panna poreenga?`
          : lang === 'ta'
          ? `முகவரி பெறப்பட்டது: "${message.trim()}". 💳 எவ்வாறு பணம் செலுத்த விரும்புகிறீர்கள்?`
          : `Got it! Delivering to "${message.trim()}". 💳 And how would you like to pay?`,
      checkoutStep: 'payment',
      actions: [],
      suggestedItemIds: [],
      showMenu: false,
      language: lang,
      quickReplies: [
        { label: '💵 Cash on Delivery', actionText: 'Cash on Delivery' },
        { label: '📱 UPI', actionText: 'UPI' },
        { label: '💳 Card', actionText: 'Card' }
      ]
    };
  }

  if (
    checkoutStep === 'payment' ||
    text === 'cash on delivery' ||
    text === 'upi' ||
    text === 'card' ||
    text.includes('cod')
  ) {
    let method = 'Cash on Delivery';
    if (text.includes('upi')) method = 'UPI';
    if (text.includes('card')) method = 'Card';
    return {
      intent: 'CHECKOUT',
      reply:
        lang === 'ta-Latn'
          ? `Payment method selected: ${method}! Ellam ready. Order place pannalama? 🩷`
          : lang === 'ta'
          ? `பணம் செலுத்தும் முறை: ${method}! ஆர்டரை உறுதி செய்யலாமா? 🩷`
          : `Payment method selected: ${method}! Everything looks delicious. Ready to place your order? 🩷`,
      checkoutStep: 'confirm',
      actions: [],
      suggestedItemIds: [],
      showMenu: false,
      paymentMethod: method,
      language: lang,
      quickReplies: [
        { label: '🩷 Place Order', actionText: 'Place Order' },
        { label: '✏️ Edit Order', actionText: 'Show my cart' }
      ]
    };
  }

  // 2. HUNGER / CONVERSATIONAL EXPRESSIONS (TEST 2: "enaku pasikuthu", "enaku romba pasikuthu")
  // Do NOT treat this as an exact food command or randomly add food!
  if (
    text.includes('pasikuthu') ||
    text.includes('pasikudhu') ||
    text.includes('pasi') ||
    text.includes('hungry') ||
    text.includes('starving') ||
    text.includes('bhook') ||
    text.includes('bhookh') ||
    text.includes('பசிக்கிறது')
  ) {
    return {
      intent: 'GENERAL_CONVERSATION',
      reply: langPack.hungry,
      showMenu: false,
      actions: [],
      suggestedItemIds: [],
      language: lang,
      quickReplies: [
        { label: langPack.quickReplies.showMenu, actionText: lang === 'ta-Latn' ? 'menu kaatu' : lang === 'ta' ? 'மெனுவைக் காட்டு' : 'Show me the menu' },
        { label: langPack.quickReplies.biryani, actionText: lang === 'ta-Latn' ? 'enaku chicken biryani venum' : 'I want Biryani' },
        { label: langPack.quickReplies.pizza, actionText: lang === 'ta-Latn' ? 'pizza kaatu' : 'Show me Pizza' }
      ]
    };
  }

  // 3. NORMAL CONVERSATION & GREETINGS (TEST 1: "Hi", "vanakkam", "வணக்கம்", "namaste")
  // Do NOT immediately show food or the menu!
  const isGreeting =
    /^(hi|hello|hey|heyy|hiya|hola|namaste|namaskar|vanakkam|vanakam|namaskaram|good\s+morning|good\s+afternoon|good\s+evening|yo|sup)\b/i.test(
      text
    ) ||
    text === 'வணக்கம்' ||
    text === 'नमस्ते' ||
    text === 'నమస్కారం' ||
    text === 'നമസ്കാരം' ||
    text === 'ನಮಸ್ಕಾರ';

  if (
    isGreeting &&
    !text.includes('biryani') &&
    !text.includes('menu') &&
    !text.includes('food') &&
    !text.includes('order') &&
    !text.includes('coke')
  ) {
    return {
      intent: 'GREETING',
      reply: langPack.greeting,
      showMenu: false,
      actions: [],
      suggestedItemIds: [],
      language: lang,
      quickReplies: [
        { label: langPack.quickReplies.showMenu, actionText: lang === 'ta-Latn' ? 'menu kaatu' : lang === 'ta' ? 'மெனுவைக் காட்டு' : 'Show me the menu' },
        { label: '💡 What can you do?', actionText: 'What can you do?' },
        { label: langPack.quickReplies.biryani, actionText: lang === 'ta-Latn' ? 'enaku chicken biryani venum' : 'I want Biryani' }
      ]
    };
  }

  // Small talk: How are you?
  if (
    text.includes('how are you') ||
    text.includes("how're you") ||
    text.includes('how r u') ||
    text.includes('kaise ho') ||
    text.includes('epadi irukinga') ||
    text.includes('eppadi irukkeenga') ||
    text.includes('ela unnaru') ||
    text.includes('entha vishesham') ||
    text.includes('hegiddeera')
  ) {
    return {
      intent: 'GENERAL_CONVERSATION',
      reply: langPack.howAreYou,
      showMenu: false,
      actions: [],
      suggestedItemIds: [],
      language: lang,
      quickReplies: [
        { label: langPack.quickReplies.showMenu, actionText: lang === 'ta-Latn' ? 'menu kaatu' : 'Show me the menu' },
        { label: langPack.quickReplies.biryani, actionText: lang === 'ta-Latn' ? 'enaku chicken biryani venum' : 'I want Biryani' }
      ]
    };
  }

  // Small talk: Thank you (TEST 9: "thank you", "nandri")
  if (
    text.includes('thank you') ||
    text.includes('thanks') ||
    text.includes('thx') ||
    text.includes('shukriya') ||
    text.includes('dhanyawad') ||
    text.includes('nandri') ||
    text.includes('dhanyavadalu') ||
    text.includes('nanni') ||
    text.includes('dhanyavadagalu') ||
    text === 'நன்றி' ||
    text === 'धन्यवाद' ||
    text === 'ధన్యవాదాలు' ||
    text === 'നന്ദി' ||
    text === 'ಧನ್ಯವಾದಗಳು'
  ) {
    return {
      intent: 'GENERAL_CONVERSATION',
      reply: langPack.thankYou,
      showMenu: false,
      actions: [],
      suggestedItemIds: [],
      language: lang,
      quickReplies: [
        { label: langPack.quickReplies.showMenu, actionText: lang === 'ta-Latn' ? 'menu kaatu' : 'Show me the menu' },
        { label: langPack.quickReplies.checkout, actionText: lang === 'ta-Latn' ? 'checkout pannalam' : 'Checkout' }
      ]
    };
  }

  // Small talk: Who are you?
  if (
    text.includes('who are you') ||
    text.includes('what are you') ||
    text.includes('what is your name') ||
    text.includes('who made you') ||
    text.includes('koun ho') ||
    text.includes('yaar nee')
  ) {
    return {
      intent: 'GENERAL_CONVERSATION',
      reply: langPack.whoAreYou,
      showMenu: false,
      actions: [],
      suggestedItemIds: [],
      language: lang,
      quickReplies: [
        { label: langPack.quickReplies.showMenu, actionText: lang === 'ta-Latn' ? 'menu kaatu' : 'Show me the menu' },
        { label: '💡 What can you do?', actionText: 'What can you do?' }
      ]
    };
  }

  // Small talk: What can you do? / Help
  if (
    text.includes('what can you do') ||
    text.includes('features') ||
    text.includes('what do you do') ||
    text.includes('capabilities') ||
    text === 'help' ||
    text.includes('how to use') ||
    text.includes('enna panna mudiyum')
  ) {
    return {
      intent: 'HELP',
      reply: langPack.whatCanYouDo,
      showMenu: false,
      actions: [],
      suggestedItemIds: [],
      language: lang,
      quickReplies: [
        { label: langPack.quickReplies.showMenu, actionText: lang === 'ta-Latn' ? 'menu kaatu' : 'Show me the menu' },
        { label: langPack.quickReplies.biryani, actionText: lang === 'ta-Latn' ? 'enaku chicken biryani venum' : 'I want Biryani' },
        { label: langPack.quickReplies.under150, actionText: lang === 'ta-Latn' ? '150 kulla' : 'Show me items under ₹150' },
        { label: langPack.quickReplies.vegFood, actionText: lang === 'ta-Latn' ? 'veg food mattum' : 'Show vegetarian food' }
      ]
    };
  }

  // Bye / Goodbye
  if (
    text.includes('bye') ||
    text.includes('goodbye') ||
    text.includes('see you') ||
    text.includes('cya') ||
    text.includes('varen') ||
    text.includes('poyitu varen')
  ) {
    return {
      intent: 'GENERAL_CONVERSATION',
      reply: langPack.bye,
      showMenu: false,
      actions: [],
      suggestedItemIds: [],
      language: lang,
      quickReplies: [{ label: '👋 Hi again!', actionText: 'Hi' }]
    };
  }

  // 4. VEGETARIAN ONLY FILTER (TEST 6: "veg food mattum kaatu", "சைவ உணவு மட்டும் காட்டு", "veg mattum")
  if (
    (text.includes('veg') || text.includes('vegetarian') || text.includes('சைவ')) &&
    (text.includes('mattum') ||
      text.includes('only') ||
      text.includes('மட்டும்') ||
      text.includes('food mattum') ||
      text.includes('sivappu illa') ||
      text === 'veg' ||
      text === 'pure veg')
  ) {
    const vegItems = MENU_ITEMS.filter((i) => i.vegetarian && i.available);
    return {
      intent: 'FILTER_VEG',
      reply:
        lang === 'ta-Latn'
          ? "Idho namma available vegetarian dishes! 🥗 Paneer Butter Masala, Veg Biryani, Masala Dosa, Idli, Veg Burger..."
          : lang === 'ta'
          ? "இதோ நமது 100% சைவ உணவுப் பட்டியல்! 🥗 பன்னீர் பட்டர் மசாலா, வெஜ் பிரியாணி, மசாலா தோசை..."
          : "Here is our 100% vegetarian selection! 🥗 From Paneer Butter Masala to Veg Biryani and crispy Dosas:",
      showMenu: true,
      filterVeg: true,
      menuCategory: 'All',
      actions: [],
      suggestedItemIds: vegItems.map((i) => i.id),
      language: lang,
      quickReplies: [
        { label: '🍛 Veg Biryani ₹140', actionText: lang === 'ta-Latn' ? 'enaku 1 veg biryani venum' : 'I want 1 veg biryani' },
        { label: '🧀 Paneer Butter Masala ₹160', actionText: 'Add Paneer Butter Masala' },
        { label: '🥞 Masala Dosa ₹90', actionText: 'Add Masala Dosa' }
      ]
    };
  }

  // 5. PRICE FILTER (TEST 7: "150 kulla enna irukku?", "150 rupees kulla enna irukku?", "under 150")
  const kullaPriceMatch =
    text.match(/(\d+)\s*(?:rupees|rs)?\s*(?:kulla|ulla|க்குள்ள|க்குள்)/i) ||
    text.match(/under\s*₹?\s*(\d+)/i) ||
    text.match(/below\s*₹?\s*(\d+)/i) ||
    text.match(/less\s*than\s*₹?\s*(\d+)/i);

  if (kullaPriceMatch) {
    const maxP = parseInt(kullaPriceMatch[1], 10);
    const underItems = MENU_ITEMS.filter((i) => i.price <= maxP && i.available);
    return {
      intent: 'FILTER_PRICE',
      reply:
        lang === 'ta-Latn'
          ? `₹${maxP} kulla ${underItems.length} tasty items irukku! 💰 Veg Biryani (₹140), Veg Burger (₹120), French Fries (₹100), Masala Dosa (₹90)...`
          : lang === 'ta'
          ? `₹${maxP}க்குள் ${underItems.length} சிறந்த உணவுகள் உள்ளன! 💰`
          : `Found ${underItems.length} delicious options under ₹${maxP}! 💰`,
      showMenu: true,
      maxPrice: maxP,
      menuCategory: 'All',
      actions: [],
      suggestedItemIds: underItems.slice(0, 6).map((i) => i.id),
      language: lang,
      quickReplies: [
        { label: '🍛 Veg Biryani ₹140', actionText: 'Add Veg Biryani' },
        { label: '🍔 Veg Burger ₹120', actionText: 'Add Veg Burger' },
        { label: '🍟 French Fries ₹100', actionText: 'Add French Fries' }
      ]
    };
  }

  // 6. MENU REQUEST (TEST 3: "menu kaatu", "show menu", "menu kudu", "menu show pannu", "what food do you have?", "enna food irukku?", "enna saapadu irukku?")
  if (
    text === 'menu' ||
    text === 'menu kaatu' ||
    text.includes('menu kaatu') ||
    text.includes('menu kudu') ||
    text.includes('menu show') ||
    text.includes('show menu') ||
    text.includes('see menu') ||
    text.includes('view menu') ||
    text.includes('what food do you have') ||
    text.includes('what food') ||
    text.includes('enna food irukku') ||
    text.includes('enna saapadu irukku') ||
    text.includes('food list') ||
    text.includes('all items') ||
    text === 'மெனு' ||
    text === 'மேனு' ||
    text.includes('மெனுவைக் காட்டு') ||
    text.includes('மெனு காட்டு') ||
    text.includes('मेन्यू दिखाओ') ||
    text.includes('మెనూ చూపించు') ||
    text.includes('ಮೆನು ತೋರಿಸಿ')
  ) {
    return {
      intent: 'MENU_REQUEST',
      reply: langPack.menuIntro,
      showMenu: true,
      menuCategory: 'All',
      actions: [],
      suggestedItemIds: [],
      language: lang,
      quickReplies: [
        { label: '🇮🇳 Indian (6)', actionText: 'Show Indian food' },
        { label: '🥢 Chinese (4)', actionText: 'Show Chinese food' },
        { label: '🍕 Pizzas (2)', actionText: 'Show me Pizza' },
        { label: '🥗 Veg Only', actionText: lang === 'ta-Latn' ? 'veg food mattum kaatu' : 'Show vegetarian food' },
        { label: '💰 Under ₹150', actionText: lang === 'ta-Latn' ? '150 kulla enna irukku?' : 'Show me items under ₹150' }
      ]
    };
  }

  // 7. REMOVE ITEM FROM CART (e.g. "coke remove pannu", "coke eduthu vidu", "remove chicken biryani")
  if (
    text.includes('remove') ||
    text.includes('delete') ||
    text.includes('eduthu vidu') ||
    text.includes('eduthuvidu') ||
    text.includes('edunga') ||
    text.includes('vendam') ||
    text.includes('நீக்கவும்') ||
    text.includes('எடுத்துவிடு') ||
    text.includes('hatao')
  ) {
    const itemToRemove = resolveItemFromQuery(text);
    if (itemToRemove) {
      return {
        intent: 'REMOVE_FROM_CART',
        reply: langPack.removedFromCart(itemToRemove.name),
        actions: [{ type: 'REMOVE_ITEM', itemId: itemToRemove.id, quantity: 1 }],
        suggestedItemIds: [itemToRemove.id],
        showMenu: false,
        language: lang,
        quickReplies: [
          { label: '🛒 Show Cart', actionText: lang === 'ta-Latn' ? 'cart kaatu' : 'Show my cart' },
          { label: langPack.quickReplies.checkout, actionText: lang === 'ta-Latn' ? 'checkout pannalam' : 'Checkout' }
        ]
      };
    }
  }

  // 8. CLEAR CART
  if (
    text.includes('clear cart') ||
    text.includes('empty cart') ||
    text.includes('cart clear') ||
    text.includes('cancel order')
  ) {
    return {
      intent: 'CLEAR_CART',
      reply: langPack.clearedCart,
      actions: [{ type: 'CLEAR_CART' }],
      suggestedItemIds: [],
      showMenu: false,
      language: lang,
      quickReplies: [
        { label: langPack.quickReplies.showMenu, actionText: lang === 'ta-Latn' ? 'menu kaatu' : 'Show me the menu' },
        { label: langPack.quickReplies.biryani, actionText: lang === 'ta-Latn' ? 'enaku chicken biryani venum' : 'I want Biryani' }
      ]
    };
  }

  // 9. SHOW CART
  if (
    text.includes('show cart') ||
    text.includes('view cart') ||
    text.includes('what is in my cart') ||
    text.includes('check cart') ||
    text.includes('cart kaatu') ||
    text.includes('கார்ட்டைக் காட்டு') ||
    text === 'cart'
  ) {
    if (!currentCart || currentCart.length === 0) {
      return {
        intent: 'SHOW_CART',
        reply: langPack.emptyCart,
        actions: [{ type: 'SHOW_CART' }],
        suggestedItemIds: [],
        showMenu: false,
        language: lang,
        quickReplies: [
          { label: langPack.quickReplies.showMenu, actionText: lang === 'ta-Latn' ? 'menu kaatu' : 'Show me the menu' },
          { label: langPack.quickReplies.biryani, actionText: lang === 'ta-Latn' ? 'enaku chicken biryani venum' : 'I want Biryani' }
        ]
      };
    }
    const summary = currentCart.map((c) => `${c.item.name} × ${c.quantity}`).join(', ');
    const sub = currentCart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
    const total = sub + 30;
    return {
      intent: 'SHOW_CART',
      reply: langPack.cartSummary(summary, total),
      actions: [{ type: 'SHOW_CART' }],
      suggestedItemIds: currentCart.map((c) => c.item.id),
      showMenu: false,
      language: lang,
      quickReplies: [
        { label: langPack.quickReplies.checkout, actionText: lang === 'ta-Latn' ? 'checkout pannalam' : 'Checkout' },
        { label: '🥤 Add Coke ₹50', actionText: lang === 'ta-Latn' ? 'oru coke add pannu' : 'Add a Coke' },
        { label: langPack.quickReplies.showMenu, actionText: lang === 'ta-Latn' ? 'menu kaatu' : 'Show me the menu' }
      ]
    };
  }

  // 10. CHECKOUT TRIGGER ("checkout", "checkout pannalam", "checkout pannalama", "ஆர்டர் செய்ய வேண்டும்", "order podu")
  if (
    text.includes('checkout') ||
    text.includes('place order') ||
    text.includes('buy now') ||
    text.includes('order podu') ||
    text.includes('order pannu') ||
    text.includes('order செய்ய') ||
    text.includes('ஆர்டர்')
  ) {
    if (!currentCart || currentCart.length === 0) {
      return {
        intent: 'CHECKOUT',
        reply: langPack.emptyCart,
        actions: [],
        suggestedItemIds: [],
        showMenu: false,
        language: lang,
        quickReplies: [
          { label: langPack.quickReplies.showMenu, actionText: lang === 'ta-Latn' ? 'menu kaatu' : 'Show me the menu' },
          { label: langPack.quickReplies.biryani, actionText: lang === 'ta-Latn' ? 'enaku chicken biryani venum' : 'I want Biryani' }
        ]
      };
    }
    const total =
      currentCart.reduce((sum, c) => sum + (c.item?.price || 0) * (c.quantity || 1), 0) + 30;
    return {
      intent: 'CHECKOUT',
      reply:
        lang === 'ta-Latn'
          ? `Super! Delivery serthu total ₹${total}. Order finish pannalaam! Unga name enna? 👤`
          : lang === 'ta'
          ? `மொத்த தொகை ₹${total}. ஆர்டர் செய்ய உங்கள் பெயர் என்ன? 👤`
          : `Perfect! Your total with delivery is ₹${total}. Let's complete your order. What's your name? 👤`,
      checkoutStep: 'name',
      actions: [{ type: 'START_CHECKOUT' }],
      suggestedItemIds: [],
      showMenu: false,
      language: lang,
      quickReplies: [
        { label: '👤 Guest Foodie', actionText: 'Guest Foodie' },
        { label: '👤 Priya Sharma', actionText: 'Priya Sharma' }
      ]
    };
  }

  // 11. ADD TO CART / ORDER INTENTS (TEST 4: "enaku 2 chicken biryani venum", "rendu chicken biryani kudu", TEST 5: "oru coke add pannu", "biryani 3 venum")
  // Check if text indicates a food request or contains any of the 20 food items
  const resolvedItem = resolveItemFromQuery(text);

  if (resolvedItem) {
    const qty = extractQuantity(text);

    // CRITICAL: Availability Check!
    const isItemAvailable = resolvedItem.available && !unavailableItemIds.includes(resolvedItem.id);
    if (!isItemAvailable) {
      const alt =
        MENU_ITEMS.find(
          (m) =>
            m.category === resolvedItem.category &&
            m.id !== resolvedItem.id &&
            m.available &&
            !unavailableItemIds.includes(m.id)
        ) ||
        MENU_ITEMS.find(
          (m) =>
            m.vegetarian === resolvedItem.vegetarian &&
            m.id !== resolvedItem.id &&
            m.available &&
            !unavailableItemIds.includes(m.id)
        );

      return {
        intent: 'ADD_TO_CART',
        reply: langPack.itemUnavailable(resolvedItem.name, alt?.name),
        showMenu: false,
        actions: [],
        suggestedItemIds: alt ? [alt.id] : [],
        language: lang,
        quickReplies: alt
          ? [
              { label: `+ Add ${alt.name} ₹${alt.price}`, actionText: `Add ${alt.name}` },
              { label: langPack.quickReplies.showMenu, actionText: lang === 'ta-Latn' ? 'menu kaatu' : 'Show me the menu' }
            ]
          : [{ label: langPack.quickReplies.showMenu, actionText: lang === 'ta-Latn' ? 'menu kaatu' : 'Show me the menu' }]
      };
    }

    // Item is available! Add to cart with requested quantity
    const isDrink = resolvedItem.category === 'Beverages';
    const isDessert = resolvedItem.category === 'Desserts';

    const drinkUpsell =
      lang === 'ta-Latn'
        ? !isDrink && !isDessert ? "Vera edhavadhu drink venuma? 🩷" : "Checkout pannalama? 🩷"
        : lang === 'ta'
        ? !isDrink && !isDessert ? "குடிக்க ஏதாவது குளிர்பானம் வேண்டுமா? 🩷" : "ஆர்டர் செய்யலாமா? 🩷"
        : !isDrink && !isDessert ? "Would you like something to drink? 🩷" : "Ready to checkout? 🩷";

    const quicks = !isDrink
      ? [
          { label: '🥤 Coke ₹50', actionText: lang === 'ta-Latn' ? 'oru coke add pannu' : 'Add a Coke' },
          { label: '🍋 Fresh Lime ₹70', actionText: 'Add Fresh Lime Juice' },
          { label: langPack.quickReplies.checkout, actionText: lang === 'ta-Latn' ? 'checkout pannalam' : 'Checkout' }
        ]
      : [
          { label: '🍯 Gulab Jamun ₹70', actionText: 'Add Gulab Jamun' },
          { label: langPack.quickReplies.checkout, actionText: lang === 'ta-Latn' ? 'checkout pannalam' : 'Checkout' }
        ];

    return {
      intent: 'ADD_TO_CART',
      reply:
        lang === 'ta-Latn'
          ? `Sure! ${qty} ${resolvedItem.name}${qty > 1 ? 's' : ''} cart-la add pannitten! ${drinkUpsell}`
          : lang === 'ta'
          ? `நிச்சயமாக! ${qty} ${resolvedItem.name} கார்ட்டில் சேர்க்கப்பட்டது! ${drinkUpsell}`
          : `Sure! ${qty} ${resolvedItem.name}${qty > 1 ? 's have' : ' has'} been added to your cart. ${drinkUpsell}`,
      actions: [{ type: 'ADD_ITEM', itemId: resolvedItem.id, quantity: qty }],
      suggestedItemIds: [resolvedItem.id],
      showMenu: false,
      language: lang,
      quickReplies: quicks
    };
  }

  // 12. CATEGORY FILTERS (Indian, Chinese, Burgers, Pizza, Snacks, Desserts, Beverages)
  if (text.includes('indian')) {
    const items = MENU_ITEMS.filter((i) => i.category === 'Indian' && i.available);
    return {
      intent: 'FILTER_CATEGORY',
      reply: "Here is our authentic Indian selection! 🍛 From royal Dum Biryanis to Paneer Butter Masala and crispy Dosas:",
      showMenu: true,
      menuCategory: 'Indian',
      actions: [],
      suggestedItemIds: items.map((i) => i.id),
      language: lang,
      quickReplies: [
        { label: '🍛 Chicken Biryani ₹180', actionText: 'I want 1 chicken biryani' },
        { label: '🥞 Masala Dosa ₹90', actionText: 'Add Masala Dosa' },
        { label: '🫓 Butter Naan ₹50', actionText: 'Add Butter Naan' }
      ]
    };
  }

  if (text.includes('chinese')) {
    const items = MENU_ITEMS.filter((i) => i.category === 'Chinese' && i.available);
    return {
      intent: 'FILTER_CATEGORY',
      reply: "Here are our wok-tossed Chinese favorites! 🥢 Wok-charred Fried Rice and spicy Schezwan Hakka Noodles:",
      showMenu: true,
      menuCategory: 'Chinese',
      actions: [],
      suggestedItemIds: items.map((i) => i.id),
      language: lang,
      quickReplies: [
        { label: '🍗 Chicken Fried Rice ₹170', actionText: 'Add Chicken Fried Rice' },
        { label: '🍜 Veg Noodles ₹120', actionText: 'Add Veg Noodles' }
      ]
    };
  }

  if (text.includes('burger')) {
    const items = MENU_ITEMS.filter((i) => i.category === 'Burgers' && i.available);
    return {
      intent: 'FILTER_CATEGORY',
      reply: "Juicy handcrafted burgers! 🍔 Served on toasted sesame buns with melted cheese and zesty sauces:",
      showMenu: true,
      menuCategory: 'Burgers',
      actions: [],
      suggestedItemIds: items.map((i) => i.id),
      language: lang,
      quickReplies: [
        { label: '🍗 Chicken Burger ₹150', actionText: 'Add Chicken Burger' },
        { label: '🍔 Veg Burger ₹120', actionText: 'Add Veg Burger' }
      ]
    };
  }

  if (text.includes('pizza')) {
    const items = MENU_ITEMS.filter((i) => i.category === 'Pizza' && i.available);
    return {
      intent: 'FILTER_CATEGORY',
      reply: "Stone-baked artisanal pizzas! 🍕 Crispy crust, San Marzano sauce, and melted mozzarella:",
      showMenu: true,
      menuCategory: 'Pizza',
      actions: [],
      suggestedItemIds: items.map((i) => i.id),
      language: lang,
      quickReplies: [
        { label: '🍕 Margherita Pizza ₹220', actionText: 'Add Margherita Pizza' },
        { label: '🍗 Chicken Pizza ₹280', actionText: 'Add Chicken Pizza' }
      ]
    };
  }

  // 13. REQUEST FOR UNRECOGNIZED / UNKNOWN FOOD (Strict 20-Item Menu Control)
  const outsideFoods = ['sushi', 'pasta', 'taco', 'shawarma', 'soup', 'salad', 'momos', 'curry', 'steak', 'sandwich', 'ice cream', 'roti', 'paratha', 'paneer tikka', 'kebab', 'mutton', 'fish'];
  if (outsideFoods.some((kw) => text.includes(kw))) {
    return {
      intent: 'SEARCH_FOOD',
      reply:
        lang === 'ta-Latn'
          ? "Sorry pa, adhu namma menu-la illa. Namma kitchen-la 20 special signature dishes mattum dhaan specialize panrom! Biryani, Pizza, Noodles explore pannalaama? 💜"
          : lang === 'ta'
          ? "மன்னிக்கவும், அது நமது மெனுவில் இல்லை. எங்களிடம் உள்ள 20 சிறப்பு உணவுகளில் இருந்து தேர்ந்தெடுக்கவும். 💜"
          : "Sorry, we don't have that on our menu. We specialize in our 20 signature dishes! Would you like me to suggest something similar from our menu? 💜",
      showMenu: true,
      menuCategory: 'All',
      actions: [],
      suggestedItemIds: ['item-1', 'item-13', 'item-3'],
      language: lang,
      quickReplies: [
        { label: langPack.quickReplies.showMenu, actionText: lang === 'ta-Latn' ? 'menu kaatu' : 'Show me the menu' },
        { label: langPack.quickReplies.biryani, actionText: lang === 'ta-Latn' ? 'enaku chicken biryani venum' : 'I want Biryani' }
      ]
    };
  }

  // Default conversational fallback
  return {
    intent: 'GENERAL_CONVERSATION',
    reply: langPack.greeting,
    showMenu: false,
    actions: [],
    suggestedItemIds: [],
    language: lang,
    quickReplies: [
      { label: langPack.quickReplies.showMenu, actionText: lang === 'ta-Latn' ? 'menu kaatu' : 'Show me the menu' },
      { label: langPack.quickReplies.biryani, actionText: lang === 'ta-Latn' ? 'enaku chicken biryani venum' : 'I want Biryani' },
      { label: langPack.quickReplies.vegFood, actionText: lang === 'ta-Latn' ? 'veg food mattum kaatu' : 'Show vegetarian food' },
      { label: langPack.quickReplies.under150, actionText: lang === 'ta-Latn' ? '150 kulla enna irukku?' : 'Show me items under ₹150' }
    ]
  };
}

// Chat API Route
app.post('/api/chat', async (req, res) => {
  try {
    const {
      message,
      cart = [],
      checkoutStep = 'idle',
      language = 'auto',
      unavailableItemIds = []
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGenAI();

    // If Gemini key is available, attempt Gemini processing with structured schema
    if (ai) {
      try {
        const menuContext = MENU_ITEMS.map((i) => ({
          id: i.id,
          name: i.name,
          category: i.category,
          price: i.price,
          veg: i.vegetarian,
          spicy: i.spicy,
          available: i.available && !unavailableItemIds.includes(i.id),
          desc: i.description
        }));

        const systemPrompt = `You are FoodBot, a friendly and accurate AI Food Ordering Assistant with a purple & pink aesthetic.
Personality:
- Friendly, Helpful, Conversational, Natural ("Yay! 🎉", "Sure! 🩷").
- Keep responses concise (1-2 sentences).

MULTILINGUAL & TANGLISH:
- Understand English, Tamil script ('ta'), Tanglish ('ta-Latn' - Tamil written in Latin letters, e.g. "vanakkam", "enaku chicken biryani venum", "rendu biryani kudu", "oru coke add pannu", "coke remove pannu", "menu kaatu", "veg food mattum kaatu", "150 kulla enna irukku?", "enaku pasikuthu"), Hindi ('hi'), Telugu ('te'), Malayalam ('ml'), Kannada ('kn').
- If user uses Tanglish, classify language as "ta-Latn" and respond naturally in Tanglish!
- If user says "vanakkam", reply: "Vanakkam! 👋 Welcome to FoodBot! Eppadi help pannalaam?"
- If user expresses hunger (e.g. "enaku pasikuthu", "enaku romba pasikuthu", "I'm hungry"), respond conversationally: "Aiyo 😄! Appo nalla saapadu venum! Menu kaatava?" DO NOT treat this as a food command or add food!
- If user says "menu kaatu", "show menu", "menu kudu", set "showMenu": true and intent: "MENU_REQUEST".
- If user says "veg food mattum kaatu", set "showMenu": true, "filterVeg": true, intent: "FILTER_VEG".
- If user says "150 kulla enna irukku?", set "showMenu": true, "maxPrice": 150, intent: "FILTER_PRICE".
- If user says "Hi", "Hello", "How are you", "Thank you", respond conversationally. DO NOT show the menu!

STRICT 20 PRODUCTS ONLY:
${JSON.stringify(menuContext)}
Never invent food items or prices.
Availability check: If item has "available": false, DO NOT add it. Instead apologize and recommend an available alternative.

Current Cart: ${JSON.stringify(cart)}
Current Checkout Step: ${checkoutStep}
Client Language: ${language}

Respond in strict JSON:
{
  "intent": "GREETING" | "GENERAL_CONVERSATION" | "MENU_REQUEST" | "SEARCH_FOOD" | "FILTER_CATEGORY" | "FILTER_PRICE" | "FILTER_VEG" | "CHECK_AVAILABILITY" | "ADD_TO_CART" | "REMOVE_FROM_CART" | "UPDATE_QUANTITY" | "SHOW_CART" | "CHECKOUT" | "ORDER_STATUS" | "HELP",
  "reply": "Conversational reply in detected language",
  "language": "en" | "ta" | "ta-Latn" | "hi" | "te" | "ml" | "kn",
  "showMenu": boolean,
  "filterVeg": boolean,
  "maxPrice": number,
  "menuCategory": "All" | "Indian" | "Chinese" | "Burgers" | "Pizza" | "Snacks" | "Desserts" | "Beverages",
  "actions": [
    { "type": "ADD_ITEM" | "REMOVE_ITEM" | "UPDATE_QUANTITY" | "CLEAR_CART" | "START_CHECKOUT" | "SHOW_CART", "itemId": "item-id", "quantity": 1 }
  ],
  "suggestedItemIds": ["item-id"],
  "quickReplies": [
    { "label": "Button text", "actionText": "Text to send" }
  ],
  "checkoutStep": "name" | "address" | "payment" | "confirm" | "none"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: message,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const textOutput = response.text;
        if (textOutput) {
          const parsed = JSON.parse(textOutput.trim());
          return res.json(parsed);
        }
      } catch (geminiError) {
        console.warn('Gemini call failed, falling back to heuristic NLU:', geminiError);
      }
    }

    // Heuristic fallback NLU (deterministic, instant, handles all Tanglish, Tamil, English, and commands)
    const fallbackResult = handleHeuristicNLU(
      message,
      cart,
      checkoutStep,
      language,
      unavailableItemIds
    );
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
