import React from 'react';
import { MessageSquare, ShoppingCart, Package, Heart, Settings, Sparkles } from 'lucide-react';
import { ActiveTab, CartItem } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  cartItems: CartItem[];
  ordersCount: number;
  favoritesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  cartItems,
  ordersCount,
  favoritesCount
}) => {
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    {
      id: 'chat' as ActiveTab,
      label: 'Chat',
      icon: MessageSquare,
      badge: null,
      description: 'AI Food Assistant'
    },
    {
      id: 'cart' as ActiveTab,
      label: 'Cart',
      icon: ShoppingCart,
      badge: totalCartCount > 0 ? totalCartCount : null,
      description: 'Active Order'
    },
    {
      id: 'orders' as ActiveTab,
      label: 'Orders',
      icon: Package,
      badge: ordersCount > 0 ? ordersCount : null,
      description: 'Past History'
    },
    {
      id: 'favorites' as ActiveTab,
      label: 'Favorites',
      icon: Heart,
      badge: favoritesCount > 0 ? favoritesCount : null,
      description: 'Liked Dishes'
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Settings',
      icon: Settings,
      badge: null,
      description: 'Preferences'
    }
  ];

  return (
    <aside
      id="desktop-sidebar"
      className="hidden md:flex flex-col w-64 bg-white border-r border-purple-100/80 h-full p-5 select-none justify-between"
    >
      <div>
        {/* Logo Section */}
        <div
          id="sidebar-logo"
          onClick={() => onSelectTab('chat')}
          className="flex items-center gap-3 px-3 py-2.5 mb-6 cursor-pointer rounded-2xl hover:bg-purple-50/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] flex items-center justify-center text-white shadow-brand-sm">
            <span className="text-xl">💜</span>
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-[#7C3AED] to-[#EC4899] bg-clip-text text-transparent">
              FoodBot
            </h1>
            <span className="text-[11px] font-semibold text-[#24152F]/50 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#EC4899]" />
              AI Ordering
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white shadow-brand-sm scale-[1.02]'
                    : 'text-[#24152F]/80 hover:bg-[#FAF7FF] hover:text-[#7C3AED]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#7C3AED]'}`} />
                  <span className="tracking-wide">{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white text-[#7C3AED]'
                        : 'bg-[#F3E8FF] text-[#7C3AED]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick AI Tip Card */}
      <div className="p-4 rounded-2xl bg-[#FAF7FF] border border-purple-100/80">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-base">💡</span>
          <span className="text-xs font-bold text-[#7C3AED]">Natural Voice & Text</span>
        </div>
        <p className="text-[11px] leading-relaxed text-[#24152F]/70">
          Try saying: <span className="font-semibold text-[#7C3AED]">&quot;I want 2 chicken biryanis and a coke&quot;</span>
        </p>
      </div>
    </aside>
  );
};
