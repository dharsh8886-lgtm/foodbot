export type SupportedLanguage = 'en' | 'ta' | 'ta-Latn' | 'hi' | 'te' | 'ml' | 'kn';

export interface LanguageMeta {
  code: SupportedLanguage | 'auto';
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'auto', name: 'Auto Detect', nativeName: '🌐 Auto', flag: '🌐', speechCode: 'ta-IN' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', speechCode: 'en-IN' },
  { code: 'ta-Latn', name: 'Tanglish', nativeName: 'Tanglish', flag: '🇮🇳', speechCode: 'ta-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', speechCode: 'ta-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳', speechCode: 'hi-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', speechCode: 'te-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', speechCode: 'ml-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', speechCode: 'kn-IN' },
];

// Detect language from text (strictly differentiating Tanglish 'ta-Latn' from English 'en' and Tamil script 'ta')
export function detectLanguage(text: string): SupportedLanguage {
  const trimmed = text.trim();
  if (!trimmed) return 'en';

  // 1. Unicode Script ranges
  // Tamil Script: \u0B80-\u0BFF
  if (/[\u0B80-\u0BFF]/.test(trimmed)) return 'ta';
  // Devanagari (Hindi): \u0900-\u097F
  if (/[\u0900-\u097F]/.test(trimmed)) return 'hi';
  // Telugu: \u0C00-\u0C7F
  if (/[\u0C00-\u0C7F]/.test(trimmed)) return 'te';
  // Malayalam: \u0D00-\u0D7F
  if (/[\u0D00-\u0D7F]/.test(trimmed)) return 'ml';
  // Kannada: \u0C80-\u0CFF
  if (/[\u0C80-\u0CFF]/.test(trimmed)) return 'kn';

  const lower = trimmed.toLowerCase();

  // 2. Tanglish Detection (Tamil in Latin/English letters)
  // Check for common Tanglish words and verb suffixes
  const tanglishMarkers = [
    'vanakkam',
    'enaku',
    'enakku',
    'venum',
    'venunga',
    'kudu',
    'kodu',
    'thaa',
    'thaanga',
    'pannu',
    'pannalama',
    'pannalam',
    'kaatu',
    'kaattu',
    'mattum',
    'kulla',
    'ulla',
    'irukku',
    'iruka',
    'pasikuthu',
    'sapadu',
    'sappadu',
    'rendu',
    'oru',
    'moonu',
    'naalu',
    'anju',
    'evlo',
    'ethana',
    'eduthu',
    'serthu',
    'nandri',
    'epadi',
    'eppadi',
    'aiyo',
    'koli',
    'romba',
    'podu',
    'vidu',
    'vendam',
    'paakanum',
    'parungalen'
  ];

  for (const marker of tanglishMarkers) {
    // Word boundary or substring check
    const regex = new RegExp(`\\b${marker}\\b`, 'i');
    if (regex.test(lower) || lower.includes(` ${marker}`) || lower.includes(`${marker} `)) {
      return 'ta-Latn';
    }
  }

  // Common Hindi romanized keywords
  if (
    lower.includes('namaste') ||
    lower.includes('kaise ho') ||
    lower.includes('shukriya') ||
    lower.includes('dhanyawad') ||
    lower.includes('chahiye') ||
    lower.includes('khana') ||
    lower.includes('dikhaiye')
  ) {
    return 'hi';
  }

  // Common Telugu romanized keywords
  if (
    lower.includes('namaskaram') ||
    lower.includes('ela unnaru') ||
    lower.includes('dhanyavadalu') ||
    lower.includes('kavali') ||
    lower.includes('chupinchu')
  ) {
    return 'te';
  }

  // Common Malayalam romanized keywords
  if (
    lower.includes('entha vishesham') ||
    lower.includes('nanni') ||
    lower.includes('venam') ||
    lower.includes('kanikku')
  ) {
    return 'ml';
  }

  // Common Kannada romanized keywords
  if (
    lower.includes('hegiddeera') ||
    lower.includes('dhanyavadagalu') ||
    lower.includes('beku') ||
    lower.includes('torisi')
  ) {
    return 'kn';
  }

  return 'en';
}

// Multilingual Number Extraction (supporting English, Tanglish, Tamil script, Hindi)
export function extractQuantity(text: string): number {
  const lower = text.toLowerCase().trim();

  // Direct digits
  const digitMatch = lower.match(/\b(\d+)\b/);
  if (digitMatch) {
    return parseInt(digitMatch[1], 10);
  }

  // Tanglish & Tamil script numbers
  if (/\b(oru|onnu|one|ஒரு|ஒன்று|ek)\b/i.test(lower)) return 1;
  if (/\b(rendu|erandu|two|இரண்டு|ரெண்டு|do)\b/i.test(lower)) return 2;
  if (/\b(moonu|three|மூன்று|teen)\b/i.test(lower)) return 3;
  if (/\b(naalu|four|நான்கு|chaar)\b/i.test(lower)) return 4;
  if (/\b(anju|aindhu|five|ஐந்து|paanch)\b/i.test(lower)) return 5;
  if (/\b(aaru|six|ஆறு)\b/i.test(lower)) return 6;

  return 1;
}

// Map Tamil, Tanglish, English terms to the EXACT 20 product IDs
export const FOOD_VOCABULARY_MAP: Record<string, string> = {
  // 1. Chicken Biryani
  'chicken biryani': 'item-1',
  'chicken biriyani': 'item-1',
  'chicken briyani': 'item-1',
  'biryani': 'item-1',
  'biriyani': 'item-1',
  'briyani': 'item-1',
  'சிக்கன் பிரியாணி': 'item-1',
  'பிரியாணி': 'item-1',

  // 2. Veg Biryani
  'veg biryani': 'item-2',
  'veg biriyani': 'item-2',
  'vegetable biryani': 'item-2',
  'வெஜ் பிரியாணி': 'item-2',
  'காய்கறி பிரியாணி': 'item-2',

  // 3. Paneer Butter Masala
  'paneer butter masala': 'item-3',
  'paneer masala': 'item-3',
  'paneer gravy': 'item-3',
  'paneer curry': 'item-3',
  'பன்னீர் பட்டர் மசாலா': 'item-3',
  'பன்னீர் மசாலா': 'item-3',

  // 4. Butter Naan
  'butter naan': 'item-4',
  'naan': 'item-4',
  'பட்டர் நான்': 'item-4',
  'நான்': 'item-4',

  // 5. Masala Dosa
  'masala dosa': 'item-5',
  'masala dosai': 'item-5',
  'dosa': 'item-5',
  'dosai': 'item-5',
  'மசாலா தோசை': 'item-5',
  'தோசை': 'item-5',

  // 6. Idli
  'idli': 'item-6',
  'idly': 'item-6',
  'இட்லி': 'item-6',

  // 7. Chicken Fried Rice
  'chicken fried rice': 'item-7',
  'chicken rice': 'item-7',
  'koli fried rice': 'item-7',
  'சிக்கன் ப்ரைட் ரைஸ்': 'item-7',

  // 8. Veg Fried Rice
  'veg fried rice': 'item-8',
  'vegetable fried rice': 'item-8',
  'veg rice': 'item-8',
  'வெஜ் ப்ரைட் ரைஸ்': 'item-8',

  // 9. Chicken Noodles
  'chicken noodles': 'item-9',
  'சிக்கன் நூடுல்ஸ்': 'item-9',

  // 10. Veg Noodles
  'veg noodles': 'item-10',
  'vegetable noodles': 'item-10',
  'hakka noodles': 'item-10',
  'வெஜ் நூடுல்ஸ்': 'item-10',

  // 11. Chicken Burger
  'chicken burger': 'item-11',
  'சிக்கன் பர்கர்': 'item-11',

  // 12. Veg Burger
  'veg burger': 'item-12',
  'crispy veg burger': 'item-12',
  'வெஜ் பர்கர்': 'item-12',

  // 13. Margherita Pizza
  'margherita pizza': 'item-13',
  'margherita': 'item-13',
  'cheese pizza': 'item-13',
  'veg pizza': 'item-13',
  'மார்கரிட்டா பீட்சா': 'item-13',

  // 14. Chicken Pizza
  'chicken pizza': 'item-14',
  'spicy chicken pizza': 'item-14',
  'சிக்கன் பீட்சா': 'item-14',

  // 15. French Fries
  'french fries': 'item-15',
  'fries': 'item-15',
  'பிரெஞ்ச் பிரைஸ்': 'item-15',

  // 16. Paneer Roll
  'paneer roll': 'item-16',
  'paneer tikka roll': 'item-16',
  'roll': 'item-16',
  'பன்னீர் ரோல்': 'item-16',

  // 17. Gulab Jamun
  'gulab jamun': 'item-17',
  'jamun': 'item-17',
  'குலாப் ஜாமூன்': 'item-17',
  'ஜாமூன்': 'item-17',

  // 18. Chocolate Brownie
  'chocolate brownie': 'item-18',
  'brownie': 'item-18',
  'சாக்லேட் பிரவுனி': 'item-18',

  // 19. Coke
  'coke': 'item-19',
  'coca cola': 'item-19',
  'cold drink': 'item-19',
  'கோக்': 'item-19',

  // 20. Fresh Lime Juice
  'fresh lime juice': 'item-20',
  'lime juice': 'item-20',
  'lemon juice': 'item-20',
  'elamichai juice': 'item-20',
  'பிரெஷ் லைம் ஜூஸ்': 'item-20',
  'எலுமிச்சை ஜூஸ்': 'item-20'
};

// Conversational and Action Responses per Language
export const CONVERSATIONAL_RESPONSES: Record<
  SupportedLanguage,
  {
    greeting: string;
    howAreYou: string;
    thankYou: string;
    whoAreYou: string;
    whatCanYouDo: string;
    hungry: string;
    bye: string;
    menuIntro: string;
    itemUnavailable: (itemName: string, altName?: string) => string;
    addedToCart: (qty: number, itemName: string) => string;
    removedFromCart: (itemName: string) => string;
    emptyCart: string;
    cartSummary: (summary: string, total: number) => string;
    clearedCart: string;
    quickReplies: {
      showMenu: string;
      biryani: string;
      pizza: string;
      vegFood: string;
      under150: string;
      checkout: string;
    };
  }
> = {
  en: {
    greeting:
      "Hi! 👋 Welcome to FoodBot! How can I help you today?",
    howAreYou:
      "I'm doing great! 😊 Ready to help you find something delicious. Would you like to see the menu?",
    thankYou:
      "You're very welcome! 😊 Let me know if you need anything else.",
    whoAreYou:
      "I'm FoodBot, your AI Food Ordering Assistant! 🤖💜 I can help you explore the menu, choose food, place an order, or answer questions.",
    whatCanYouDo:
      "Here's what I can do:\n📜 Show our full 20-item menu\n🔍 Search or filter by Indian, Chinese, Pizza, Veg & more\n🛒 Add, update & customize your cart\n💳 Conversational checkout & instant order tracking\n🗣️ Chat in 6 languages & Voice!",
    hungry:
      "Feeling hungry? 😋 Let me help you find something mouth-watering right away! Would you like to see the menu?",
    bye:
      "Goodbye! 👋 Have a delicious day ahead. Come back whenever you're hungry!",
    menuIntro:
      "Here is our complete 20-item menu! 📜 You can filter by category, check veg/non-veg, or add dishes directly.",
    itemUnavailable: (item, alt) =>
      alt
        ? `Sorry, ${item} is currently unavailable. Would you like ${alt} instead?`
        : `Sorry, ${item} is currently unavailable. Please pick another option from our menu.`,
    addedToCart: (qty, item) =>
      `Sure! ${qty} ${item}${qty > 1 ? 's have' : ' has'} been added to your cart. 🩷`,
    removedFromCart: (item) =>
      `Done! 🗑️ I've removed ${item} from your cart.`,
    emptyCart:
      "Your cart is currently empty! Add something delicious first. What are you craving? 🍛",
    cartSummary: (summary, total) =>
      `Here is what you have in your cart: ${summary}. Total with delivery: ₹${total}. Ready to checkout? 🩷`,
    clearedCart:
      "No worries! I've cleared your cart. What would you like to explore instead? 💜",
    quickReplies: {
      showMenu: "📜 Show Menu",
      biryani: "🍛 I want Biryani",
      pizza: "🍕 Show me Pizza",
      vegFood: "🥗 Vegetarian food",
      under150: "💰 Under ₹150",
      checkout: "🩷 Proceed to Checkout"
    }
  },

  // Tanglish (Tamil written in Latin letters)
  'ta-Latn': {
    greeting:
      "Vanakkam! 👋 Welcome to FoodBot! Eppadi help pannalaam?",
    howAreYou:
      "Naan romba nalla irukken! 😊 Ungalukku nalla saapadu eduthu thara ready-ah irukken. Menu kaatava?",
    thankYou:
      "Romba nandri! 😊 Vera edhavadhu venumaa sollu.",
    whoAreYou:
      "Naan dhaan FoodBot! 🤖💜 Unga personal AI food assistant. Menu paaka, food select panna, order podalam!",
    whatCanYouDo:
      "Ennala idhu ellam panna mudiyum:\n📜 Full 20-item menu kaatuvom\n🔍 Biryani, Chinese, Pizza, Veg items thedlaam\n🛒 Cart-la items add panni modify pannalam\n💳 Direct checkout & order tracking\n🗣️ Tanglish, Tamil & Voice support!",
    hungry:
      "Aiyo 😄! Appo nalla saapadu venum! Menu kaatava?",
    bye:
      "Poyi vaanga! 👋 Nalla saapdunga, epovavadhu pasicha FoodBot kitta vaanga!",
    menuIntro:
      "Idho namma 20 food items menu! 📜 Category filter pannunga illa direct-ah '+ Add' pannunga.",
    itemUnavailable: (item, alt) =>
      alt
        ? `Sorry pa, ${item} ippo unavailable-ah irukku. Badhila ${alt} try panreengala?`
        : `Sorry, ${item} ippo stock-la illa. Menu-la vera edhavadhu choose pannunga.`,
    addedToCart: (qty, item) =>
      `Sure! ${qty} ${item} cart-la add pannitten! Vera edhavadhu drink venuma? 🩷`,
    removedFromCart: (item) =>
      `Done! 🗑️ ${item}-ah cart-la irundhu remove panniyachu.`,
    emptyCart:
      "Cart ippo empty-ah irukku! First edhavadhu tasty food add pannunga. Enna saapda aasai? 🍛",
    cartSummary: (summary, total) =>
      `Unga cart-la irukradhu: ${summary}. Total amount: ₹${total}. Checkout pannalama? 🩷`,
    clearedCart:
      "Cart-ah clear pannitten! Vera enna food paakanum? 💜",
    quickReplies: {
      showMenu: "📜 Menu kaatu",
      biryani: "🍛 Biryani venum",
      pizza: "🍕 Pizza kaatu",
      vegFood: "🥗 Veg food mattum",
      under150: "💰 150 kulla",
      checkout: "🩷 Checkout pannalam"
    }
  },

  // Tamil Script
  ta: {
    greeting:
      "வணக்கம்! 👋 ஃபுட்பாட்டிற்கு (FoodBot) வரவேற்கிறேன்! நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
    howAreYou:
      "நான் நன்றாக இருக்கிறேன்! 😊 உங்களுக்கு சுவையான உணவைத் தேர்ந்தெடுக்க உதவத் தயார். மெனுவைக் காட்டவா?",
    thankYou:
      "மிக்க நன்றி! 😊 வேறு ஏதேனும் உதவி தேவைப்பட்டால் தயங்காமல் சொல்லுங்கள்.",
    whoAreYou:
      "நான் ஃபுட்பாட்! 🤖💜 உங்கள் AI உணவு உதவியாளர். மெனுவை ஆராயவும், உணவை தேர்ந்தெடுக்கவும், ஆர்டர் செய்யவும் உதவுகிறேன்.",
    whatCanYouDo:
      "நான் செய்யக்கூடியவை:\n📜 முழுமையான 20 உணவுப் பட்டியல் மெனு\n🔍 பிரியாணி, சைனீஸ், பீட்சா, சைவ உணவுகள்\n🛒 கார்ட்டில் உணவுகளை சேர்த்தல் & நீக்குதல்\n💳 எளிய ஆர்டர் & டிராக்கிங் வசதி\n🗣️ தமிழ் குரல் மற்றும் உரை ஆதரவு!",
    hungry:
      "ஐயோ பசிக்கிறதா! 😄 அப்படியென்றால் சுவையான உணவு வேண்டும்! மெனுவைக் காட்டவா?",
    bye:
      "போய் வாருங்கள்! 👋 நல் உணவு, நல் வாழ்வு! பசித்தால் எப்போது வேண்டுமானாலும் வாருங்கள்.",
    menuIntro:
      "இதோ நமது 20 உணவுப் பட்டியல்! 📜 வகைகளைத் தேர்ந்தெடுத்து நேரடியாக ஆர்டர் செய்யலாம்.",
    itemUnavailable: (item, alt) =>
      alt
        ? `மன்னிக்கவும், ${item} தற்போது கிடைக்கவில்லை. அதற்கு பதிலாக ${alt} விரும்புகிறீர்களா?`
        : `மன்னிக்கவும், ${item} தற்போது கிடைக்கவில்லை. மெனுவிலிருந்து வேறு உணவை தேர்ந்தெடுக்கலாம்.`,
    addedToCart: (qty, item) =>
      `நிச்சயமாக! ${qty} ${item} உங்கள் கார்ட்டில் சேர்க்கப்பட்டது! 🩷`,
    removedFromCart: (item) =>
      `${item} உங்கள் கார்ட்டிலிருந்து நீக்கப்பட்டது. 🗑️`,
    emptyCart:
      "உங்கள் கார்ட் காலியாக உள்ளது! சுவையான உணவை முதலில் சேர்க்கவும். என்ன சாப்பிட விரும்புகிறீர்கள்? 🍛",
    cartSummary: (summary, total) =>
      `உங்கள் கார்ட் விவரம்: ${summary}. டெலிவரியுடன் மொத்தம்: ₹${total}. ஆர்டர் செய்யலாமா? 🩷`,
    clearedCart:
      "கார்ட் அழிக்கப்பட்டது! வேறு என்ன உணவு பார்க்க விரும்புகிறீர்கள்? 💜",
    quickReplies: {
      showMenu: "📜 மெனுவைக் காட்டு",
      biryani: "🍛 பிரியாணி வேண்டும்",
      pizza: "🍕 பீட்சா காட்டு",
      vegFood: "🥗 சைவ உணவு மட்டும்",
      under150: "💰 ₹150க்குள்",
      checkout: "🩷 ஆர்டர் செய்ய வேண்டும்"
    }
  },

  hi: {
    greeting:
      "नमस्ते! 👋 FoodBot में आपका स्वागत है! आज मैं आपकी क्या मदद कर सकता हूँ?",
    howAreYou:
      "मैं बहुत बढ़िया हूँ! 😊 आपके लिए कुछ स्वादिष्ट ढूँढने के लिए तैयार। क्या आप मेन्यू देखना चाहेंगे?",
    thankYou:
      "आपका बहुत-बहुत स्वागत है! 😊 अगर आपको कुछ और चाहिए तो ज़रूर बताइए।",
    whoAreYou:
      "मैं FoodBot हूँ! 🤖💜 आपका दोस्ताना AI फ़ूड ऑर्डरिंग असिस्टेंट।",
    whatCanYouDo:
      "मैं आपके लिए ये सब कर सकता हूँ:\n📜 पूरा 20 आइटम्स का मेन्यू दिखाना\n🔍 बिरयानी, पिज़्ज़ा, शाकाहारी खाना खोजना\n🛒 कार्ट में सामान जोड़ना और बदलना\n💳 सीधा चेकआउट और ऑर्डर ट्रैकिंग!",
    hungry:
      "भूख लगी है? 😋 चलिए झटपट कुछ बहुत ही लज़ीज़ मंगवाते हैं! मेन्यू दिखाऊँ?",
    bye:
      "अलविदा! 👋 आपका दिन शुभ और स्वादिष्ट रहे! जब भी भूख लगे, वापस आइएगा।",
    menuIntro:
      "यह रहा हमारा पूरा 20 आइटम्स का मेन्यू! 📜 कैटेगरी चुनें या सीधे '+ Add' दबाएँ।",
    itemUnavailable: (item, alt) =>
      alt
        ? `माफ़ कीजिए, ${item} अभी उपलब्ध नहीं है। क्या आप ${alt} लेना चाहेंगे?`
        : `माफ़ कीजिए, ${item} अभी उपलब्ध नहीं है। कृपया मेन्यू से कोई अन्य आइटम चुनें।`,
    addedToCart: (qty, item) =>
      `ज़रूर! ${qty} ${item} कार्ट में जोड़ दिया गया है। 🩷`,
    removedFromCart: (item) =>
      `${item} को कार्ट से हटा दिया गया है। 🗑️`,
    emptyCart:
      "आपका कार्ट अभी खाली है! पहले कुछ स्वादिष्ट खाना जोड़ें। आपकी क्या खाने की इच्छा है? 🍛",
    cartSummary: (summary, total) =>
      `आपके कार्ट में: ${summary}। कुल: ₹${total}। क्या ऑर्डर पूरा करें? 🩷`,
    clearedCart:
      "कार्ट खाली कर दिया गया है! अब आप क्या देखना चाहेंगे? 💜",
    quickReplies: {
      showMenu: "📜 मेन्यू दिखाओ",
      biryani: "🍛 बिरयानी चाहिए",
      pizza: "🍕 पिज़्ज़ा दिखाओ",
      vegFood: "🥗 शाकाहारी खाना",
      under150: "💰 ₹150 से कम",
      checkout: "🩷 ऑर्डर करें"
    }
  },

  te: {
    greeting:
      "నమస్కారం! 👋 ఫుడ్‌బాట్‌కి (FoodBot) స్వాగతం! నేను మీకు ఎలా సహాయపడగలను?",
    howAreYou:
      "నేను చాలా బాగున్నాను! 😊 మీ కోసం రుచికరమైన ఆహారం సూచించడానికి సిద్ధంగా ఉన్నాను. మెనూ చూడాలనుకుంటున్నారా?",
    thankYou:
      "చాలా ధన్యవాదాలు! 😊 మీకు మరేదైనా కావాలంటే అడగండి.",
    whoAreYou:
      "నేను ఫుడ్‌బాట్! 🤖💜 మీ వ్యక్తిగత AI ఫుడ్ అసిస్టెంట్.",
    whatCanYouDo:
      "నేను 20 వంటకాల మెనూ చూపించగలను, కార్ట్‌కి జోడించగలను మరియు ఆర్డర్ చేయగలను!",
    hungry:
      "ఆకలిగా ఉందా? 😋 త్వరగా రుచికరమైన ఆహారాన్ని ఎంచుకోండి! మెనూ చూపించమంటారా?",
    bye:
      "వీడ్కోలు! 👋 ఆకలి వేసినప్పుడు తప్పకుండా రండి.",
    menuIntro:
      "ఇదిగోండి మన 20 వంటకాల మెనూ! 📜 మీకు నచ్చినదాన్ని ఎంచుకోండి.",
    itemUnavailable: (item, alt) =>
      alt
        ? `క్షమించండి, ${item} ప్రస్తుతం అందుబాటులో లేదు. దానికి బదులుగా ${alt} కావాలా?`
        : `క్షమించండి, ${item} ప్రస్తుతం అందుబాటులో లేదు.`,
    addedToCart: (qty, item) =>
      `తప్పకుండా! ${qty} ${item} కార్ట్‌కి జోడించబడింది! 🩷`,
    removedFromCart: (item) =>
      `${item} కార్ట్ నుండి తొలగించబడింది. 🗑️`,
    emptyCart:
      "మీ కార్ట్ ఖాళీగా ఉంది! ముందుగా ఏదైనా రుచికరమైనది ఎంచుకోండి. 🍛",
    cartSummary: (summary, total) =>
      `కార్ట్ వివరాలు: ${summary}. మొత్తం: ₹${total}. ఆర్డర్ చేయాలా? 🩷`,
    clearedCart:
      "కార్ట్ ఖాళీ చేయబడింది! వేరే ఏమి చూడాలనుకుంటున్నారు? 💜",
    quickReplies: {
      showMenu: "📜 మెనూ చూపించు",
      biryani: "🍛 బిర్యానీ కావాలి",
      pizza: "🍕 పిజ్జా చూపించు",
      vegFood: "🥗 శాకాహారం",
      under150: "💰 ₹150 లోపు",
      checkout: "🩷 ఆర్డర్ చేయండి"
    }
  },

  ml: {
    greeting:
      "നമസ്കാരം! 👋 FoodBot-ലേക്ക് സ്വാഗതം! എങ്ങനെ സഹായിക്കണം?",
    howAreYou:
      "സുഖമായിരിക്കുന്നു! 😊 നല്ല രുചിയുള്ള ഭക്ഷണം കണ്ടെത്താൻ തയ്യാറാണ്. മെനു കാണണോ?",
    thankYou:
      "സ്വാഗതം! 😊 എന്തെങ്കിലും ആവശ്യമുണ്ടെങ്കിൽ ചോദിക്കൂ.",
    whoAreYou:
      "ഞാൻ FoodBot! 🤖💜 നിങ്ങളുടെ സ്വന്തം AI ഫുഡ് അസിസ്റ്റന്റ്.",
    whatCanYouDo:
      "20 വിഭവങ്ങളുടെ മെനു കാണിക്കാനും, കാർട്ടിൽ ചേർക്കാനും ഓർഡർ ചെയ്യാനും സഹായിക്കാം!",
    hungry:
      "വിശക്കുന്നുണ്ടോ? 😋 നല്ല ചൂടൻ ഭക്ഷണം ഓർഡർ ചെയ്യാം! മെനു കാണിക്കണോ?",
    bye:
      "നന്ദി! വീണ്ടും കാണാം! 👋 വിശക്കുമ്പോൾ ഇങ്ങോട്ട് പോരൂ.",
    menuIntro:
      "ഇതാ ഞങ്ങളുടെ 20 വിഭവങ്ങളുടെ സമ്പൂർണ്ണ മെനു! 📜 ഇഷ്ടപ്പെട്ടത് തിരഞ്ഞെടുക്കൂ.",
    itemUnavailable: (item, alt) =>
      alt
        ? `ക്ഷമിക്കണം, ${item} ഇപ്പോൾ ലഭ്യമല്ല. പകരം ${alt} വേണമെന്നുണ്ടോ?`
        : `ക്ഷമിക്കണം, ${item} ഇപ്പോൾ ലഭ്യമല്ല.`,
    addedToCart: (qty, item) =>
      `തീർച്ചയായും! ${qty} ${item} കാർട്ടിൽ ചേർത്തു! 🩷`,
    removedFromCart: (item) =>
      `${item} കാർട്ടിൽ നിന്ന് നീക്കം ചെയ്തു. 🗑️`,
    emptyCart:
      "കാർട്ട് ശൂന്യമാണ്! ആദ്യം രുചിയുള്ള എന്തെങ്കിലും തിരഞ്ഞെടുക്കൂ. 🍛",
    cartSummary: (summary, total) =>
      `കാർട്ടിലുള്ളവ: ${summary}. ആകെ തുക: ₹${total}. ഓർഡർ ചെയ്യണോ? 🩷`,
    clearedCart:
      "കാർട്ട് ക്ലിയർ ചെയ്തു! ഇനി എന്താണ് കാണേണ്ടത്? 💜",
    quickReplies: {
      showMenu: "📜 മെനു കാണിക്കൂ",
      biryani: "🍛 ബിരിയാണി വേണം",
      pizza: "🍕 പിസ്സ കാണിക്കൂ",
      vegFood: "🥗 വെജിറ്റേറിയൻ",
      under150: "💰 ₹150 താഴെ",
      checkout: "🩷 ഓർഡർ ചെയ്യൂ"
    }
  },

  kn: {
    greeting:
      "ನಮಸ್ಕಾರ! 👋 FoodBot ಗೆ ಸುಸ್ವಾಗತ! ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
    howAreYou:
      "ನಾನು ತುಂಬಾ ಚೆನ್ನಾಗಿದ್ದೇನೆ! 😊 ನಿಮಗೆ ರುಚಿಕರವಾದ ಆಹಾರ ಸೂಚಿಸಲು ಸಿದ್ಧ. ಮೆನು ನೋಡಲು ಇಷ್ಟಪಡುತ್ತೀರಾ?",
    thankYou:
      "ತುಂಬಾ ಧನ್ಯವಾದಗಳು! 😊 ಬೇರೇನಾದರೂ ಬೇಕಾದರೆ ತಿಳಿಸಿ.",
    whoAreYou:
      "ನಾನು FoodBot! 🤖💜 ನಿಮ್ಮ ವೈಯಕ್ತಿಕ AI ಫುಡ್ ಅಸಿಸ್ಟೆಂಟ್.",
    whatCanYouDo:
      "20 ತಿನಿಸುಗಳ ಮೆನು ತೋರಿಸುವುದು, ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸುವುದು ಮತ್ತು ಆರ್డರ್ ಮಾಡುವುದು!",
    hungry:
      "ಹಸಿವಾಗಿದೆಯೇ? 😋 ಬಿಸಿಬಿಸಿ ರುಚಿಯಾದ ಊಟ ಆರ್ಡರ್ ಮಾಡೋಣ! ಮೆನು ತೋರಿಸಲೇ?",
    bye:
      "ಧನ್ಯವಾದಗಳು! 👋 ಹಸಿವಾದಾಗ ಮತ್ತೆ ಬನ್ನಿ.",
    menuIntro:
      "ಇಗೋ ನಮ್ಮ 20 ತಿನಿಸುಗಳ ಸಂಪೂರ್ಣ ಮೆನು! 📜 ನಿಮ್ಮಿಷ್ಟದ ತಿನಿಸು ಆಯ್ಕೆಮಾಡಿ.",
    itemUnavailable: (item, alt) =>
      alt
        ? `ಕ್ಷಮಿಸಿ, ${item} ಸದ್ಯಕ್ಕೆ ಲಭ್ಯವಿಲ್ಲ. ಬದಲಿಗೆ ${alt} ಬೇಕೇ?`
        : `ಕ್ಷಮಿಸಿ, ${item} ಸದ್ಯಕ್ಕೆ ಲಭ್ಯವಿಲ್ಲ.`,
    addedToCart: (qty, item) =>
      `ಖಂಡಿತ! ${qty} ${item} ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಲಾಗಿದೆ! 🩷`,
    removedFromCart: (item) =>
      `${item} ಅನ್ನು ಕಾರ್ಟ್‌ನಿಂದ ತೆಗೆದುಹಾಕಲಾಗಿದೆ. 🗑️`,
    emptyCart:
      "ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ! ಮೊದಲು ರುಚಿಯಾದ ತಿನಿಸು ಸೇರಿಸಿ. 🍛",
    cartSummary: (summary, total) =>
      `ನಿಮ್ಮ ಕಾರ್ಟ್: ${summary}. ಒಟ್ಟು: ₹${total}. ಆರ್ಡರ್ ಮಾಡೋಣವೇ? 🩷`,
    clearedCart:
      "ಕಾರ್ಟ್ ಖಾಲಿ ಮಾಡಲಾಗಿದೆ! ಇನ್ನೇನು ನೋಡಲು ಬಯಸುತ್ತೀರಿ? 💜",
    quickReplies: {
      showMenu: "📜 ಮೆನು ತೋರಿಸಿ",
      biryani: "🍛 ಬಿರಿಯಾನಿ ಬೇಕು",
      pizza: "🍕 ಪಿಜ್ಜಾ ತೋರಿಸಿ",
      vegFood: "🥗 ಸಸ್ಯಾಹಾರ",
      under150: "💰 ₹150 ಒಳಗೆ",
      checkout: "🩷 ಆರ್ಡರ್ ಮಾಡಿ"
    }
  }
};
