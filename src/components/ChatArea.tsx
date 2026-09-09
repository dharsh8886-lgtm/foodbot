import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Globe,
  Utensils,
  AlertCircle,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, FoodItem, CartItem, CheckoutStep } from '../types';
import { FoodCard } from './FoodCard';
import { CompactMenuList } from './CompactMenuList';
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  CONVERSATIONAL_RESPONSES
} from '../utils/multilingual';

interface ChatAreaProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  onAddToCart: (item: FoodItem, quantity: number) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  cartItems: CartItem[];
  favorites: FoodItem[];
  menuItems: FoodItem[];
  onToggleFavorite: (item: FoodItem) => void;
  onPlaceOrder: (details: { name: string; address: string; paymentMethod: 'Cash on Delivery' | 'UPI' | 'Card' }) => void;
  checkoutStep: CheckoutStep;
  setCheckoutStep: (step: CheckoutStep) => void;
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isTyping,
  onSendMessage,
  onClearChat,
  onAddToCart,
  onUpdateQuantity,
  cartItems,
  favorites,
  menuItems,
  onToggleFavorite,
  onPlaceOrder,
  checkoutStep,
  setCheckoutStep,
  selectedLanguage,
  onSelectLanguage
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(() => {
    try {
      return localStorage.getItem('foodbot_autospeak') === 'true';
    } catch {
      return false;
    }
  });
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const lastBotMessageIdRef = useRef<string | null>(null);
  const autoSpeakRef = useRef(autoSpeak);
  autoSpeakRef.current = autoSpeak;

  const currentLangMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];
  const langPack = CONVERSATIONAL_RESPONSES[selectedLanguage] || CONVERSATIONAL_RESPONSES.en;

  // Cart quantities map
  const cartQuantities = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of cartItems) {
      map[c.item.id] = c.quantity;
    }
    return map;
  }, [cartItems]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Persist Auto-Speak preference
  const toggleAutoSpeak = () => {
    setAutoSpeak((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('foodbot_autospeak', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Text to Speech (TTS) Output
  const handleSpeakMessage = (msgId: string, text: string, targetLanguage?: string) => {
    if (!('speechSynthesis' in window)) {
      setVoiceNotice("Speech synthesis isn't supported in this browser.");
      return;
    }

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text of emojis and special markdown characters for natural speech
    const cleanText = text
      .replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/gu, '')
      .replace(/[#*`_~]/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const langCode = targetLanguage || selectedLanguage;
    const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === langCode) || currentLangMeta;

    utterance.lang = langMeta.speechCode || 'en-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1.02;

    try {
      const voices = window.speechSynthesis.getVoices();
      // Try exact speechCode, then language prefix, then fallback to Indian English or default
      const matchedVoice =
        voices.find((v) => v.lang.toLowerCase() === (langMeta.speechCode || '').toLowerCase()) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(langCode.slice(0, 2).toLowerCase())) ||
        voices.find((v) => v.lang.toLowerCase().includes('in')) ||
        voices.find((v) => v.lang.toLowerCase().startsWith('en')) ||
        voices[0];

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    } catch {
      // Graceful fallback without crashing
    }

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Handle Auto Speak for new incoming bot messages
  useEffect(() => {
    if (!autoSpeak) return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.sender === 'bot' && lastMsg.id !== lastBotMessageIdRef.current) {
      lastBotMessageIdRef.current = lastMsg.id;
      // Slight delay so user sees message arrive before speaking
      const timer = setTimeout(() => {
        handleSpeakMessage(lastMsg.id, lastMsg.text, lastMsg.language);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [messages, autoSpeak]);

  // Handle Web Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = currentLangMeta.speechCode || 'ta-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice(null);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        if (currentText) {
          setInputText(currentText);
        }

        if (finalTranscript.trim()) {
          setIsListening(false);
          setTimeout(() => {
            onSendMessage(finalTranscript.trim());
            setInputText('');
          }, 300);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        const err = event.error;
        if (err === 'not-allowed' || err === 'permission-denied') {
          setVoiceNotice(
            'Microphone permission is blocked. Please allow microphone access in your browser settings.'
          );
        } else if (err === 'no-speech') {
          setVoiceNotice("I didn't hear anything. Please try again.");
        } else if (err === 'network') {
          setVoiceNotice('Network error with voice recognition. Please check your internet.');
        } else {
          setVoiceNotice("Sorry, I couldn't understand the voice input. Please try again.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      recognitionRef.current = null;
    }
  }, [onSendMessage, currentLangMeta.speechCode]);

  // Voice toggle
  const toggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceNotice(
        "Voice input isn't supported in this browser. You can continue using text chat."
      );
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = currentLangMeta.speechCode || 'ta-IN';
          recognitionRef.current.start();
          setIsListening(true);
          setVoiceNotice(null);
        }
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText.trim());
    setInputText('');
  };

  const getItemQuantityInCart = (itemId: string) => {
    return cartQuantities[itemId] || 0;
  };

  const isItemFavorite = (itemId: string) => {
    return favorites.some((f) => f.id === itemId);
  };

  return (
    <div
      id="main-chat-section"
      className="flex-1 flex flex-col h-full bg-[#FAF7FF] overflow-hidden relative"
    >
      {/* Voice notice / error banner */}
      <AnimatePresence>
        {voiceNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] bg-rose-600 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center justify-between text-xs font-semibold"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{voiceNotice}</span>
            </div>
            <button
              onClick={() => setVoiceNotice(null)}
              className="ml-2 px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded-lg text-white font-bold cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area Header */}
      <div className="bg-white/95 backdrop-blur-md px-3 sm:px-6 py-3 border-b border-purple-100 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center font-bold text-lg shadow-brand-sm">
            ✨🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base text-[#24152F] tracking-tight">
                FoodBot AI
              </h2>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-emerald-700">Online</span>
              </div>
            </div>
            <p className="text-xs text-[#24152F]/60 font-medium">
              Multilingual AI Assistant • English & Tanglish Ready
            </p>
          </div>
        </div>

        {/* Right Controls: Auto-Speak Toggle, Language Selector, Menu, Reset */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Auto Speak: ON / OFF Toggle */}
          <button
            type="button"
            onClick={toggleAutoSpeak}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              autoSpeak
                ? 'bg-purple-100 border-[#7C3AED] text-[#7C3AED]'
                : 'bg-white border-purple-200/80 text-[#24152F]/60 hover:text-[#7C3AED]'
            }`}
            title={autoSpeak ? 'Auto Speak is ON (Click to mute)' : 'Auto Speak is OFF (Click to enable)'}
          >
            {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">Auto Speak:</span>
            <span className="font-extrabold">{autoSpeak ? 'ON' : 'OFF'}</span>
          </button>

          {/* Quick Menu Button */}
          <button
            onClick={() => onSendMessage(selectedLanguage === 'ta-Latn' ? 'menu kaatu' : 'Show me the menu')}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7C3AED] text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="Browse all 20 menu items"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Menu</span>
          </button>

          {/* Multilingual Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-purple-200/80 text-xs font-bold text-[#24152F] hover:border-purple-300 shadow-2xs transition-all cursor-pointer"
              title="Select conversation language"
            >
              <Globe className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span className="hidden sm:inline">{currentLangMeta.nativeName}</span>
              <span className="sm:hidden">{currentLangMeta.code.toUpperCase()}</span>
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-2xl border border-purple-100 shadow-brand-md p-1.5 z-50">
                <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#7C3AED]/70">
                  Select Language
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelectLanguage(lang.code);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      selectedLanguage === lang.code
                        ? 'bg-purple-50 text-[#7C3AED]'
                        : 'text-[#24152F] hover:bg-purple-50/60'
                    }`}
                  >
                    <span>{lang.nativeName}</span>
                    <span className="text-[10px] text-[#24152F]/40 font-normal">
                      {lang.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset chat */}
          <button
            onClick={onClearChat}
            className="flex items-center gap-1 text-xs font-semibold text-[#7C3AED] hover:text-[#EC4899] hover:bg-purple-50 p-2 rounded-xl transition-colors cursor-pointer"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSpeaking = speakingMessageId === msg.id;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.18 }}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`flex items-start gap-2.5 max-w-[95%] sm:max-w-[85%] ${
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-brand-sm ${
                      isUser
                        ? 'bg-[#24152F] text-white'
                        : 'bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white'
                    }`}
                  >
                    {isUser ? '👤' : '✨'}
                  </div>

                  {/* Bubble Container */}
                  <div className="flex flex-col">
                    <div
                      className={`p-3.5 sm:p-4 rounded-3xl text-sm leading-relaxed relative group ${
                        isUser
                          ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white rounded-tr-none shadow-brand-sm'
                          : 'bg-white text-[#24152F] rounded-tl-none border border-purple-100 shadow-card'
                      }`}
                    >
                      {/* Text */}
                      <div className="whitespace-pre-line font-medium text-[13.5px] sm:text-sm">
                        {msg.text}
                      </div>

                      {/* TTS Speaker Icon for Bot messages */}
                      {!isUser && (
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-purple-50 text-[11px] text-[#24152F]/50">
                          <button
                            type="button"
                            onClick={() => handleSpeakMessage(msg.id, msg.text, msg.language)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                              isSpeaking
                                ? 'bg-pink-100 text-[#EC4899] font-bold'
                                : 'hover:bg-purple-50 hover:text-[#7C3AED]'
                            }`}
                            title={isSpeaking ? 'Stop speaking' : 'Listen to response (TTS)'}
                          >
                            {isSpeaking ? (
                              <>
                                <VolumeX className="w-3 h-3 text-[#EC4899]" />
                                <span className="text-[10px]">Speaking...</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3 text-purple-400" />
                                <span className="text-[10px]">Listen</span>
                              </>
                            )}
                          </button>

                          <span className="text-[10px] text-purple-300">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* COMPACT MENU LIST (When user asks for menu or filters) */}
                    {msg.showMenu && (
                      <div className="w-full mt-2">
                        <CompactMenuList
                          items={menuItems}
                          cartQuantities={cartQuantities}
                          onAddToCart={onAddToCart}
                          onUpdateQuantity={onUpdateQuantity}
                          initialCategory={msg.menuCategory || 'All'}
                          initialVegFilter={msg.filterVeg ? 'veg' : 'all'}
                          initialMaxPrice={msg.maxPrice}
                        />
                      </div>
                    )}

                    {/* Recommended Food Cards Carousel/Grid */}
                    {!msg.showMenu && msg.recommendedItems && msg.recommendedItems.length > 0 && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                        {msg.recommendedItems.map((item) => (
                          <FoodCard
                            key={item.id}
                            item={item}
                            quantityInCart={getItemQuantityInCart(item.id)}
                            onAddToCart={(qty) => onAddToCart(item, qty)}
                            onUpdateQuantity={(qty) => onUpdateQuantity(item.id, qty)}
                            isFavorite={isItemFavorite(item.id)}
                            onToggleFavorite={() => onToggleFavorite(item)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Order Confirmation Card */}
                    {msg.orderConfirmation && (
                      <div className="mt-3 p-4 bg-white rounded-2xl border border-purple-200/80 shadow-brand-md">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-purple-100">
                          <div>
                            <span className="text-xs font-extrabold text-[#7C3AED]">
                              Order #{msg.orderConfirmation.id}
                            </span>
                            <div className="text-[11px] text-[#24152F]/60">
                              Estimated Delivery: {msg.orderConfirmation.estimatedDelivery}
                            </div>
                          </div>
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
                            {msg.orderConfirmation.status}
                          </span>
                        </div>

                        {/* Items list */}
                        <div className="space-y-1.5 py-2 border-t border-b border-purple-100 text-xs">
                          {msg.orderConfirmation.items.map((item) => (
                            <div
                              key={item.item.id}
                              className="flex justify-between items-center text-[#24152F]"
                            >
                              <span>
                                {item.item.name} × {item.quantity}
                              </span>
                              <span className="font-bold text-[#7C3AED]">
                                ₹{item.item.price * item.quantity}
                              </span>
                            </div>
                          ))}
                          <div className="flex justify-between items-center text-[#24152F]/60 text-[11px]">
                            <span>Delivery</span>
                            <span>₹{msg.orderConfirmation.deliveryFee}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm font-extrabold pt-1 text-[#24152F]">
                            <span>Total</span>
                            <span className="text-[#7C3AED]">₹{msg.orderConfirmation.total}</span>
                          </div>
                        </div>

                        {/* Delivery address & payment method */}
                        <div className="pt-2 text-xs text-[#24152F]/70 flex flex-col gap-0.5">
                          <span>📍 <b>Address:</b> {msg.orderConfirmation.deliveryAddress}</span>
                          <span>💳 <b>Payment:</b> {msg.orderConfirmation.paymentMethod}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Replies Action Buttons */}
                {!isUser && msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 ml-10 max-w-[90%]">
                    {msg.quickReplies.map((reply, ridx) => (
                      <button
                        key={ridx}
                        onClick={() => onSendMessage(reply.actionText)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-purple-200/90 text-xs font-bold text-[#7C3AED] shadow-2xs hover:bg-gradient-to-r hover:from-[#7C3AED] hover:to-[#EC4899] hover:text-white hover:border-transparent transition-all active:scale-95 cursor-pointer"
                      >
                        {reply.icon && <span>{reply.icon}</span>}
                        <span>{reply.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* AI Typing Indicator with Purple-Pink Gradient */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center text-xs shadow-brand-sm flex-shrink-0">
                ✨🤖
              </div>
              <div className="p-3 rounded-2xl bg-white border border-purple-100 shadow-card flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full bg-[#7C3AED] animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-[#EC4899] animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-[#7C3AED] animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
                <span className="text-xs font-semibold text-[#24152F]/60 ml-1.5">
                  FoodBot is thinking...
                </span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating Bottom Input Area with Voice and Send */}
      <div className="p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-purple-100/90 z-20">
        {/* Listening Active Banner */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-3xl mx-auto mb-2 px-3 py-2 bg-gradient-to-r from-rose-500 to-[#EC4899] text-white rounded-xl flex items-center justify-between text-xs font-bold shadow-md"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                <span>🔴 Listening... (Speak in English, Tamil, Tanglish...)</span>
              </div>
              <button
                type="button"
                onClick={toggleVoiceInput}
                className="px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs cursor-pointer"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form
          onSubmit={handleFormSubmit}
          className="max-w-3xl mx-auto flex items-center gap-2 bg-[#FAF7FF] border border-purple-200/90 rounded-2xl p-1.5 shadow-sm focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-purple-200 transition-all"
        >
          {/* Microphone Voice Button */}
          <button
            type="button"
            id="btn-voice-input"
            onClick={toggleVoiceInput}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md ring-2 ring-rose-300'
                : 'text-[#7C3AED] hover:bg-purple-100/60'
            }`}
            title={
              isListening
                ? `Listening in ${currentLangMeta.name}... Speak now!`
                : `Tap to speak in ${currentLangMeta.name}`
            }
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text input */}
          <input
            id="chat-input-field"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? `Listening in ${currentLangMeta.name}... Speak your cravings!`
                : `Talk naturally: e.g. "Hi", "menu kaatu", "enaku 2 chicken biryani venum"...`
            }
            className="flex-1 bg-transparent text-sm text-[#24152F] placeholder-[#24152F]/45 px-2 py-2 focus:outline-none font-medium"
          />

          {/* Send gradient button */}
          <button
            type="submit"
            id="btn-send-message"
            disabled={!inputText.trim() && !isListening}
            className="p-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 active:scale-95 shadow-brand-sm transition-all cursor-pointer flex items-center justify-center"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
