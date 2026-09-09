import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  CreditCard,
  MapPin,
  User,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, FoodItem, Order, CartItem, CheckoutStep } from '../types';
import { QUICK_SUGGESTIONS } from '../data/menu';
import { FoodCard } from './FoodCard';

interface ChatAreaProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  onAddToCart: (item: FoodItem, quantity: number) => void;
  cartItems: CartItem[];
  favorites: FoodItem[];
  onToggleFavorite: (item: FoodItem) => void;
  onPlaceOrder: (details: { name: string; address: string; paymentMethod: 'Cash on Delivery' | 'UPI' | 'Card' }) => void;
  checkoutStep: CheckoutStep;
  setCheckoutStep: (step: CheckoutStep) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isTyping,
  onSendMessage,
  onClearChat,
  onAddToCart,
  cartItems,
  favorites,
  onToggleFavorite,
  onPlaceOrder,
  checkoutStep,
  setCheckoutStep
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<'Cash on Delivery' | 'UPI' | 'Card'>('Cash on Delivery');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom when messages update or typing occurs
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        // Automatically send voice query for snappy conversational assistant feel
        setTimeout(() => {
          onSendMessage(transcript);
          setInputText('');
        }, 300);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onSendMessage]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice dictation is supported in modern browsers (Chrome, Edge, Safari). You can type directly!');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
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
    const found = cartItems.find(c => c.item.id === itemId);
    return found ? found.quantity : 0;
  };

  const isItemFavorite = (itemId: string) => {
    return favorites.some(f => f.id === itemId);
  };

  return (
    <div
      id="main-chat-section"
      className="flex-1 flex flex-col h-full bg-[#FAF7FF] overflow-hidden relative"
    >
      {/* Chat Area Header */}
      <div className="bg-white/95 backdrop-blur-md px-6 py-3.5 border-b border-purple-100 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center font-bold text-lg shadow-brand-sm">
            ✨🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base text-[#24152F] tracking-tight">
                FoodBot AI Assistant
              </h2>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-emerald-700">Online</span>
              </div>
            </div>
            <p className="text-xs text-[#24152F]/60">
              Personal Food Sommelier & Instant Ordering
            </p>
          </div>
        </div>

        <button
          onClick={onClearChat}
          className="flex items-center gap-1 text-xs font-semibold text-[#7C3AED] hover:text-[#EC4899] hover:bg-purple-50 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
          title="Reset conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Main Welcome Hero Message */}
        <div className="max-w-2xl mx-auto text-center pt-2 pb-4 select-none">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white text-3xl mb-3 shadow-brand-md">
            ✨🤖
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#24152F] tracking-tight">
            Hey! 👋 I&apos;m FoodBot.
          </h1>
          <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#EC4899] bg-clip-text text-transparent mt-1">
            What are you craving today?
          </p>
          <p className="text-sm text-[#24152F]/65 mt-1 font-medium">
            Tell me what you want and I&apos;ll handle the rest.
          </p>

          {/* Quick Suggestions Pill Buttons */}
          <div className="mt-5">
            <div className="flex items-center justify-center gap-1 text-xs font-bold text-[#7C3AED] uppercase tracking-wider mb-2.5">
              <span>💜 Quick picks</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {QUICK_SUGGESTIONS.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(sug.query)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-purple-100/90 text-xs font-bold text-[#24152F] shadow-sm hover:border-purple-300 hover:text-[#7C3AED] hover:shadow-brand-sm active:scale-95 transition-all cursor-pointer"
                >
                  <span className="text-sm">{sug.icon}</span>
                  <span>{sug.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className={`flex items-start gap-3 max-w-[90%] sm:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Sender Avatar */}
                  {!isUser ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center text-sm shadow-brand-sm flex-shrink-0 mt-0.5">
                      ✨🤖
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-[#7C3AED] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      👤
                    </div>
                  )}

                  {/* Bubble Content */}
                  <div
                    className={`p-4 rounded-3xl text-sm leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white rounded-tr-none shadow-brand-sm'
                        : 'bg-white text-[#24152F] rounded-tl-none border border-purple-100 shadow-card'
                    }`}
                  >
                    <p className="whitespace-pre-wrap font-medium">{msg.text}</p>

                    {/* Interactive Food Cards Grid */}
                    {msg.recommendedItems && msg.recommendedItems.length > 0 && (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {msg.recommendedItems.map((item) => (
                          <FoodCard
                            key={item.id}
                            item={item}
                            quantityInCart={getItemQuantityInCart(item.id)}
                            onAddToCart={onAddToCart}
                            isFavorite={isItemFavorite(item.id)}
                            onToggleFavorite={onToggleFavorite}
                          />
                        ))}
                      </div>
                    )}

                    {/* Conversational Checkout Step UI */}
                    {msg.checkoutStep === 'name' && (
                      <div className="mt-3 p-3 bg-[#FAF7FF] rounded-2xl border border-purple-100/90 space-y-2">
                        <label className="text-xs font-bold text-[#7C3AED] flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> Your Full Name:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. Priya Sharma"
                            value={checkoutName}
                            onChange={(e) => setCheckoutName(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                          />
                          <button
                            onClick={() => {
                              if (checkoutName.trim()) {
                                onSendMessage(checkoutName.trim());
                              }
                            }}
                            className="px-3 py-1.5 bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-95"
                          >
                            Next →
                          </button>
                        </div>
                      </div>
                    )}

                    {msg.checkoutStep === 'address' && (
                      <div className="mt-3 p-3 bg-[#FAF7FF] rounded-2xl border border-purple-100/90 space-y-2">
                        <label className="text-xs font-bold text-[#7C3AED] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> Delivery Address:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. Flat 302, Lotus Heights, Park Avenue"
                            value={checkoutAddress}
                            onChange={(e) => setCheckoutAddress(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                          />
                          <button
                            onClick={() => {
                              if (checkoutAddress.trim()) {
                                onSendMessage(checkoutAddress.trim());
                              }
                            }}
                            className="px-3 py-1.5 bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-95"
                          >
                            Next →
                          </button>
                        </div>
                      </div>
                    )}

                    {msg.checkoutStep === 'payment' && (
                      <div className="mt-3 p-3 bg-[#FAF7FF] rounded-2xl border border-purple-100/90 space-y-2.5">
                        <p className="text-xs font-bold text-[#7C3AED] flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5" /> Choose Payment Method:
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {(['Cash on Delivery', 'UPI', 'Card'] as const).map((method) => (
                            <button
                              key={method}
                              onClick={() => {
                                setSelectedPayment(method);
                                onSendMessage(method);
                              }}
                              className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                                selectedPayment === method
                                  ? 'bg-white border-[#7C3AED] text-[#7C3AED] shadow-sm ring-1 ring-[#7C3AED]'
                                  : 'bg-white border-purple-100 text-[#24152F] hover:bg-purple-50'
                              }`}
                            >
                              {method === 'Cash on Delivery' && '💵 COD'}
                              {method === 'UPI' && '📱 UPI'}
                              {method === 'Card' && '💳 Card'}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.checkoutStep === 'confirm' && (
                      <div className="mt-3 p-4 bg-white rounded-2xl border border-purple-200 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between pb-2 border-b border-purple-100">
                          <span className="text-xs font-bold text-[#24152F]">Order Summary</span>
                          <span className="text-xs font-extrabold text-[#7C3AED]">
                            ₹{cartItems.reduce((acc, c) => acc + c.item.price * c.quantity, 0) + 30}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs text-[#24152F]/80">
                          {cartItems.map(c => (
                            <div key={c.item.id} className="flex justify-between">
                              <span>{c.item.name} × {c.quantity}</span>
                              <span className="font-semibold">₹{c.item.price * c.quantity}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-[#24152F]/60">
                            <span>Delivery fee</span>
                            <span>₹30</span>
                          </div>
                        </div>

                        <div className="pt-2 flex gap-2">
                          <button
                            onClick={() => {
                              onPlaceOrder({
                                name: checkoutName || 'Valued Foodie',
                                address: checkoutAddress || '22 Baker Street, Apt 4B',
                                paymentMethod: selectedPayment
                              });
                            }}
                            className="flex-1 py-2.5 px-3 bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold text-xs rounded-xl shadow-brand-sm hover:opacity-95 cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>🩷 Place Order</span>
                          </button>
                          <button
                            onClick={() => onSendMessage('Show my cart')}
                            className="px-3 py-2 bg-purple-50 text-[#7C3AED] font-bold text-xs rounded-xl hover:bg-purple-100 cursor-pointer"
                          >
                            Edit Order
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Order Confirmation Card Inside Chat */}
                    {msg.orderConfirmation && (
                      <div className="mt-4 p-5 bg-gradient-to-br from-purple-50/80 via-white to-pink-50/80 rounded-3xl border border-purple-200 shadow-brand-sm text-left">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center text-2xl shadow-brand-sm">
                            🎉
                          </div>
                          <div>
                            <h3 className="font-extrabold text-lg text-[#24152F]">
                              Order Confirmed!
                            </h3>
                            <p className="text-xs text-[#24152F]/60 font-medium">
                              Your food is being prepared.
                            </p>
                          </div>
                        </div>

                        {/* Order ID & Estimated Delivery */}
                        <div className="p-3 bg-white rounded-2xl border border-purple-100 mb-3 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] text-[#24152F]/50 font-bold block uppercase">
                              Order ID
                            </span>
                            <span className="text-xs font-extrabold text-[#7C3AED]">
                              {msg.orderConfirmation.id}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-[#24152F]/50 font-bold block uppercase">
                              Estimated Delivery
                            </span>
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end">
                              <Clock className="w-3.5 h-3.5" />
                              {msg.orderConfirmation.estimatedDelivery}
                            </span>
                          </div>
                        </div>

                        {/* Items list */}
                        <div className="space-y-1.5 py-2 border-t border-b border-purple-100 text-xs">
                          {msg.orderConfirmation.items.map(item => (
                            <div key={item.item.id} className="flex justify-between items-center text-[#24152F]">
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

                        {/* Order Progress Steps */}
                        <div className="pt-4">
                          <span className="text-[11px] font-bold text-[#24152F]/60 block mb-2">
                            Order Progress:
                          </span>
                          <div className="grid grid-cols-4 gap-1 text-center">
                            <div className="flex flex-col items-center">
                              <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center text-xs font-bold">
                                ✓
                              </span>
                              <span className="text-[10px] font-bold text-[#7C3AED] mt-1">Confirmed</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="w-6 h-6 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-xs font-bold animate-pulse">
                                ●
                              </span>
                              <span className="text-[10px] font-bold text-[#24152F] mt-1">Preparing</span>
                            </div>
                            <div className="flex flex-col items-center opacity-40">
                              <span className="w-6 h-6 rounded-full border border-purple-300 text-purple-400 flex items-center justify-center text-xs">
                                ○
                              </span>
                              <span className="text-[10px] font-medium text-[#24152F] mt-1">On the way</span>
                            </div>
                            <div className="flex flex-col items-center opacity-40">
                              <span className="w-6 h-6 rounded-full border border-purple-300 text-purple-400 flex items-center justify-center text-xs">
                                ○
                              </span>
                              <span className="text-[10px] font-medium text-[#24152F] mt-1">Delivered</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Replies Action Buttons */}
                {!isUser && msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 ml-11 max-w-[85%]">
                    {msg.quickReplies.map((reply, ridx) => (
                      <button
                        key={ridx}
                        onClick={() => onSendMessage(reply.actionText)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-purple-200/90 text-xs font-bold text-[#7C3AED] shadow-sm hover:bg-gradient-to-r hover:from-[#7C3AED] hover:to-[#EC4899] hover:text-white hover:border-transparent transition-all active:scale-95 cursor-pointer"
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

          {/* AI Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center text-sm shadow-brand-sm flex-shrink-0">
                ✨🤖
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-purple-100 shadow-card flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#EC4899] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs font-semibold text-[#24152F]/60 ml-1.5">FoodBot is thinking...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating Bottom Input Area */}
      <div className="p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-purple-100/90 z-20">
        <form
          onSubmit={handleFormSubmit}
          className="max-w-3xl mx-auto flex items-center gap-2 bg-[#FAF7FF] border border-purple-200/90 rounded-2xl p-1.5 shadow-sm focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-purple-200 transition-all"
        >
          {/* Microphone button */}
          <button
            type="button"
            id="btn-voice-input"
            onClick={toggleVoiceInput}
            className={`p-2.5 rounded-xl transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md'
                : 'text-[#7C3AED] hover:bg-purple-100/60'
            }`}
            title={isListening ? 'Stop listening' : 'Speak to FoodBot'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text input */}
          <input
            id="chat-input-field"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? 'Listening... speak your cravings!' : 'What would you like? e.g. 2 chicken biryanis and a coke...'}
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
