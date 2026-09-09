import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LiveCart } from './components/LiveCart';
import { ChatArea } from './components/ChatArea';
import { OrdersView } from './components/OrdersView';
import { FavoritesView } from './components/FavoritesView';
import { SettingsView } from './components/SettingsView';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { MENU_ITEMS, findItemByName } from './data/menu';
import { ActiveTab, CartItem, ChatMessage, FoodItem, Order, CheckoutStep } from './types';
import { MessageSquare, ShoppingCart, Package, Heart, Settings, User } from 'lucide-react';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    sender: 'bot',
    text: "Hey! 👋 I'm FoodBot. What are you craving today? 💜\nTell me what you want and I'll handle the rest.",
    timestamp: Date.now(),
    quickReplies: [
      { label: '🍛 I want Biryani', actionText: 'I want Biryani' },
      { label: '🍕 Show me Pizza', actionText: 'Show me Pizza' },
      { label: '🥗 Vegetarian food', actionText: 'Show vegetarian food' },
      { label: '💰 Under ₹150', actionText: 'Show me items under ₹150' },
      { label: '🔥 Something spicy', actionText: 'I want something spicy' },
      { label: '🍰 Dessert', actionText: 'Show me desserts' }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('foodbot_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('foodbot_orders');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback sample order for immediate rich preview
    }
    return [
      {
        id: 'FB202609091234',
        date: 'Today at 01:45 PM',
        items: [
          { item: MENU_ITEMS[0], quantity: 2 }, // Chicken Biryani
          { item: MENU_ITEMS[18], quantity: 1 } // Coke
        ],
        subtotal: 410,
        deliveryFee: 30,
        total: 440,
        customerName: 'Guest Foodie',
        deliveryAddress: '22 Baker Street, Apt 4B',
        paymentMethod: 'Cash on Delivery',
        status: 'Preparing',
        estimatedDelivery: '25–35 minutes',
        createdAt: Date.now() - 600000
      }
    ];
  });

  const [favorites, setFavorites] = useState<FoodItem[]>(() => {
    try {
      const saved = localStorage.getItem('foodbot_favorites');
      return saved ? JSON.parse(saved) : [MENU_ITEMS[0], MENU_ITEMS[12], MENU_ITEMS[16]];
    } catch {
      return [MENU_ITEMS[0], MENU_ITEMS[12], MENU_ITEMS[16]];
    }
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('foodbot_chat');
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });

  const [isTyping, setIsTyping] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('idle');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('foodbot_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Failed to save cart:', e);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('foodbot_orders', JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed to save orders:', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('foodbot_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.warn('Failed to save favorites:', e);
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem('foodbot_chat', JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat:', e);
    }
  }, [messages]);

  // Cart operations
  const handleAddToCart = (item: FoodItem, quantity: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + quantity } : c
        );
      }
      return [...prev, { item, quantity }];
    });

    // Provide friendly in-chat acknowledgement
    const drinkPicks = [
      { label: '🥤 Coke ₹50', actionText: 'Add one Coke' },
      { label: '🍋 Fresh Lime ₹70', actionText: 'Add Fresh Lime Juice' },
      { label: '🩷 Checkout', actionText: 'Checkout' }
    ];

    setMessages((prev) => [
      ...prev,
      {
        id: `ack-${Date.now()}`,
        sender: 'bot',
        text: `Yay! 🎉 Added ${quantity} ${item.name}${quantity > 1 ? 's' : ''} to your cart! Would you like something to drink? 🩷`,
        timestamp: Date.now(),
        recommendedItems: [item],
        quickReplies: item.category === 'Beverages' ? [{ label: '🩷 Checkout', actionText: 'Checkout' }] : drinkPicks
      }
    ]);
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((c) => (c.item.id === itemId ? { ...c, quantity } : c))
    );
  };

  const handleRemoveItem = (itemId: string) => {
    const itemToRemove = cartItems.find((c) => c.item.id === itemId);
    setCartItems((prev) => prev.filter((c) => c.item.id !== itemId));

    if (itemToRemove) {
      setMessages((prev) => [
        ...prev,
        {
          id: `remove-${Date.now()}`,
          sender: 'bot',
          text: `Removed ${itemToRemove.item.name} from your cart. 🗑️`,
          timestamp: Date.now(),
          quickReplies: [
            { label: '🛒 Show Cart', actionText: 'Show my cart' },
            { label: '🩷 Checkout', actionText: 'Checkout' }
          ]
        }
      ]);
    }
  };

  const handleClearCart = () => {
    setCartItems([]);
    setMessages((prev) => [
      ...prev,
      {
        id: `clear-${Date.now()}`,
        sender: 'bot',
        text: "I've cleared your cart. What else would you like to explore? 💜",
        timestamp: Date.now(),
        quickReplies: [
          { label: '🍛 I want Biryani', actionText: 'I want Biryani' },
          { label: '🍕 Show me Pizza', actionText: 'Show me Pizza' }
        ]
      }
    ]);
  };

  // Favorites toggle
  const handleToggleFavorite = (item: FoodItem) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === item.id);
      if (exists) {
        return prev.filter((f) => f.id !== item.id);
      }
      return [...prev, item];
    });
  };

  // Conversational checkout trigger
  const handleProceedToCheckout = () => {
    setActiveTab('chat');
    setIsMobileCartOpen(false);

    if (cartItems.length === 0) {
      setMessages((prev) => [
        ...prev,
        {
          id: `empty-checkout-${Date.now()}`,
          sender: 'bot',
          text: "Your cart is currently empty! Add something delicious first. What are you craving? 🍛",
          timestamp: Date.now(),
          quickReplies: [
            { label: '🍛 Chicken Biryani ₹180', actionText: 'I want 1 chicken biryani' },
            { label: '🍕 Margherita Pizza ₹220', actionText: 'Add Margherita Pizza' }
          ]
        }
      ]);
      return;
    }

    const sub = cartItems.reduce((acc, c) => acc + c.item.price * c.quantity, 0);
    const total = sub + 30;

    setCheckoutStep('name');
    setMessages((prev) => [
      ...prev,
      {
        id: `checkout-start-${Date.now()}`,
        sender: 'bot',
        text: `Perfect! Your total is ₹${total} (Subtotal ₹${sub} + Delivery ₹30). Let's complete your order! 🩷\nWhat's your name?`,
        timestamp: Date.now(),
        checkoutStep: 'name',
        quickReplies: [
          { label: '👤 Guest Foodie', actionText: 'Guest Foodie' },
          { label: '👤 Priya Sharma', actionText: 'Priya Sharma' }
        ]
      }
    ]);
  };

  // Place Order finalization
  const handlePlaceOrder = ({
    name,
    address,
    paymentMethod
  }: {
    name: string;
    address: string;
    paymentMethod: 'Cash on Delivery' | 'UPI' | 'Card';
  }) => {
    const subtotal = cartItems.reduce((acc, c) => acc + c.item.price * c.quantity, 0);
    const deliveryFee = 30;
    const total = subtotal + deliveryFee;
    const orderId = `FB20260909${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: orderId,
      date: 'Just now',
      items: [...cartItems],
      subtotal,
      deliveryFee,
      total,
      customerName: name,
      deliveryAddress: address,
      paymentMethod,
      status: 'Confirmed',
      estimatedDelivery: '25–35 minutes',
      createdAt: Date.now()
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    setCheckoutStep('idle');
    setConfirmedOrder(newOrder);

    // Add comprehensive order confirmation card directly to the conversation
    setMessages((prev) => [
      ...prev,
      {
        id: `order-placed-${Date.now()}`,
        sender: 'bot',
        text: `🎉 Order Confirmed! "Your food is being prepared."\nOrder ID: ${orderId}\nTotal: ₹${total} via ${paymentMethod}.\nEstimated delivery in 25–35 minutes.`,
        timestamp: Date.now(),
        orderConfirmation: newOrder,
        quickReplies: [
          { label: '📦 Track Orders', actionText: 'Show past orders' },
          { label: '💬 Order More Food', actionText: 'What else do you have?' }
        ]
      }
    ]);
  };

  // Re-order previous order
  const handleOrderAgain = (order: Order) => {
    setCartItems(order.items);
    setActiveTab('chat');
    setMessages((prev) => [
      ...prev,
      {
        id: `reorder-${Date.now()}`,
        sender: 'bot',
        text: `Great choice! 💜 I've added all items from order #${order.id} back to your cart! Ready to checkout? 🩷`,
        timestamp: Date.now(),
        quickReplies: [
          { label: '🩷 Proceed to Checkout', actionText: 'Checkout' },
          { label: '🛒 View Cart', actionText: 'Show my cart' }
        ]
      }
    ]);
  };

  // Send message through Server API with Gemini & fallback
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Append user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          cart: cartItems,
          checkoutStep
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      // Execute returned actions
      if (data.actions && Array.isArray(data.actions)) {
        for (const action of data.actions) {
          if (action.type === 'ADD_ITEM' && action.itemId) {
            const item = MENU_ITEMS.find((m) => m.id === action.itemId);
            if (item) {
              const qty = action.quantity || 1;
              setCartItems((prev) => {
                const existing = prev.find((c) => c.item.id === item.id);
                if (existing) {
                  return prev.map((c) =>
                    c.item.id === item.id
                      ? { ...c, quantity: c.quantity + qty }
                      : c
                  );
                }
                return [...prev, { item, quantity: qty }];
              });
            }
          } else if (action.type === 'REMOVE_ITEM' && action.itemId) {
            setCartItems((prev) => prev.filter((c) => c.item.id !== action.itemId));
          } else if (action.type === 'UPDATE_QUANTITY' && action.itemId) {
            const qty = action.quantity;
            if (qty <= 0) {
              setCartItems((prev) => prev.filter((c) => c.item.id !== action.itemId));
            } else {
              setCartItems((prev) =>
                prev.map((c) =>
                  c.item.id === action.itemId ? { ...c, quantity: qty } : c
                )
              );
            }
          } else if (action.type === 'CLEAR_CART') {
            setCartItems([]);
          } else if (action.type === 'START_CHECKOUT') {
            setCheckoutStep('name');
          }
        }
      }

      // Update checkout step if indicated
      if (data.checkoutStep && data.checkoutStep !== 'none') {
        setCheckoutStep(data.checkoutStep);
      }

      // If user confirms placement in checkout step
      if (
        (text.toLowerCase() === 'place order' || text.toLowerCase().includes('place order')) &&
        (checkoutStep === 'confirm' || data.checkoutStep === 'confirm')
      ) {
        handlePlaceOrder({
          name: 'Guest Foodie',
          address: '22 Baker Street, Apt 4B',
          paymentMethod: 'Cash on Delivery'
        });
        setIsTyping(false);
        return;
      }

      // Resolve recommended items
      let recommended: FoodItem[] = [];
      if (data.suggestedItemIds && Array.isArray(data.suggestedItemIds)) {
        recommended = data.suggestedItemIds
          .map((id: string) => MENU_ITEMS.find((m) => m.id === id))
          .filter(Boolean) as FoodItem[];
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || 'Great choice! 💜 Anything else I can get for you?',
        timestamp: Date.now(),
        recommendedItems: recommended,
        quickReplies: data.quickReplies || [],
        checkoutStep: data.checkoutStep && data.checkoutStep !== 'none' ? data.checkoutStep : undefined
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Failed to communicate with FoodBot server:', err);
      // Resilient fallback reply
      setMessages((prev) => [
        ...prev,
        {
          id: `fallback-${Date.now()}`,
          sender: 'bot',
          text: "I'm right here! 💜 Our Chicken Biryani, Margherita Pizza, and Fresh Lime Juice are trending right now. What would you like to try?",
          timestamp: Date.now(),
          recommendedItems: [MENU_ITEMS[0], MENU_ITEMS[12]],
          quickReplies: [
            { label: '🍛 1 Chicken Biryani ₹180', actionText: 'I want 1 chicken biryani' },
            { label: '🍕 1 Margherita Pizza ₹220', actionText: 'Add Margherita Pizza' }
          ]
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
    setCheckoutStep('idle');
  };

  const handleClearAllData = () => {
    setCartItems([]);
    setOrders([]);
    setFavorites([]);
    setMessages(INITIAL_MESSAGES);
    localStorage.clear();
    setActiveTab('chat');
  };

  return (
    <div
      id="foodbot-root-app"
      className="flex flex-col h-screen w-screen bg-[#FAF7FF] text-[#24152F] overflow-hidden select-none"
    >
      {/* Top Header */}
      <Header
        cartItems={cartItems}
        orders={orders}
        onOpenCartMobile={() => setIsMobileCartOpen(true)}
        onSelectTab={setActiveTab}
        activeTab={activeTab}
      />

      {/* Main Layout Body: 3-Column on Desktop */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Column 1: Slim Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          cartItems={cartItems}
          ordersCount={orders.length}
          favoritesCount={favorites.length}
        />

        {/* Column 2: Center Main View (Chatbot is the Main Hero) */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {activeTab === 'chat' && (
            <ChatArea
              messages={messages}
              isTyping={isTyping}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
              onAddToCart={handleAddToCart}
              cartItems={cartItems}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onPlaceOrder={handlePlaceOrder}
              checkoutStep={checkoutStep}
              setCheckoutStep={setCheckoutStep}
            />
          )}

          {activeTab === 'cart' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-2xl mx-auto w-full">
              <LiveCart
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onClearCart={handleClearCart}
                onProceedToCheckout={handleProceedToCheckout}
              />
            </div>
          )}

          {activeTab === 'orders' && (
            <OrdersView
              orders={orders}
              onOrderAgain={handleOrderAgain}
              onNavigateToChat={() => setActiveTab('chat')}
            />
          )}

          {activeTab === 'favorites' && (
            <FavoritesView
              favorites={favorites}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
              getItemQuantityInCart={(id) => {
                const f = cartItems.find((c) => c.item.id === id);
                return f ? f.quantity : 0;
              }}
              onNavigateToChat={() => setActiveTab('chat')}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              onClearAllData={handleClearAllData}
              onNavigateToChat={() => setActiveTab('chat')}
            />
          )}
        </main>

        {/* Column 3: Live Cart Right Column (Desktop Persistent) */}
        <LiveCart
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onProceedToCheckout={handleProceedToCheckout}
        />
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden bg-white/95 backdrop-blur-md border-t border-purple-100 flex items-center justify-around py-2 px-3 z-30 shadow-lg"
      >
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'chat'
              ? 'text-[#7C3AED] scale-105'
              : 'text-[#24152F]/60 hover:text-[#7C3AED]'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Chat</span>
        </button>

        <button
          onClick={() => setIsMobileCartOpen(true)}
          className="relative flex flex-col items-center gap-1 p-1.5 rounded-xl text-xs font-bold text-[#24152F]/60 hover:text-[#7C3AED] transition-all"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Cart</span>
          {cartItems.length > 0 && (
            <span className="absolute top-0.5 right-1.5 bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'orders'
              ? 'text-[#7C3AED] scale-105'
              : 'text-[#24152F]/60 hover:text-[#7C3AED]'
          }`}
        >
          <Package className="w-5 h-5" />
          <span>Orders</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'settings'
              ? 'text-[#7C3AED] scale-105'
              : 'text-[#24152F]/60 hover:text-[#7C3AED]'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </button>
      </nav>

      {/* Mobile Cart Drawer Overlay */}
      {isMobileCartOpen && (
        <LiveCart
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onProceedToCheckout={handleProceedToCheckout}
          isMobileDrawer={true}
          onCloseMobileDrawer={() => setIsMobileCartOpen(false)}
        />
      )}

      {/* Order Confirmation Celebratory Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onViewOrders={() => {
          setConfirmedOrder(null);
          setActiveTab('orders');
        }}
        onContinueChat={() => {
          setConfirmedOrder(null);
          setActiveTab('chat');
        }}
      />
    </div>
  );
}
