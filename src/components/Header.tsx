import React, { useState } from 'react';
import { UtensilsCrossed, Bell, User, ShoppingBag, CheckCircle2, Clock } from 'lucide-react';
import { CartItem, Order } from '../types';

interface HeaderProps {
  cartItems: CartItem[];
  orders: Order[];
  onOpenCartMobile: () => void;
  onSelectTab: (tab: any) => void;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({
  cartItems,
  orders,
  onOpenCartMobile,
  onSelectTab,
  activeTab
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const latestOrder = orders.length > 0 ? orders[0] : null;

  return (
    <header
      id="app-header"
      className="bg-white/95 backdrop-blur-md border-b border-purple-100/80 sticky top-0 z-40 px-4 lg:px-8 py-3.5 flex items-center justify-between transition-all"
    >
      {/* Left: Brand Logo */}
      <div
        id="header-brand-logo"
        onClick={() => onSelectTab('chat')}
        className="flex items-center gap-2.5 cursor-pointer select-none group"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] flex items-center justify-center text-white shadow-brand-sm group-hover:scale-105 transition-transform">
          <UtensilsCrossed className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-[#7C3AED] to-[#EC4899] bg-clip-text text-transparent">
              FoodBot
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#F3E8FF] text-[#7C3AED]">
              AI Order
            </span>
          </div>
          <p className="text-[11px] text-[#24152F]/60 -mt-0.5 hidden sm:block">
            Chat • Pick • Savor
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Mobile Cart Trigger */}
        <button
          id="btn-mobile-cart"
          onClick={onOpenCartMobile}
          className="lg:hidden relative p-2.5 rounded-xl bg-[#FAF7FF] border border-purple-100 text-[#24152F] hover:bg-purple-50 transition-colors"
          title="Open Cart"
        >
          <ShoppingBag className="w-5 h-5 text-[#7C3AED]" />
          {totalQuantity > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
              {totalQuantity}
            </span>
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            id="btn-notifications"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2.5 rounded-xl bg-[#FAF7FF] border border-purple-100 text-[#24152F] hover:bg-purple-50 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-[#7C3AED]" />
            {latestOrder && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EC4899] animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-card border border-purple-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2.5 border-b border-purple-100/60 mb-3">
                <span className="font-bold text-sm text-[#24152F]">Notifications</span>
                <span className="text-[11px] text-[#7C3AED] font-semibold">Live updates</span>
              </div>
              {latestOrder ? (
                <div
                  onClick={() => {
                    onSelectTab('orders');
                    setShowNotifications(false);
                  }}
                  className="p-3 bg-[#FAF7FF] rounded-xl border border-purple-100 cursor-pointer hover:bg-purple-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#7C3AED] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Order #{latestOrder.id.slice(-6)}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold border border-emerald-200">
                      {latestOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#24152F]/80 line-clamp-1 font-medium">
                    {latestOrder.items.map(i => `${i.item.name} (${i.quantity})`).join(', ')}
                  </p>
                  <p className="text-[11px] text-[#24152F]/50 mt-1">
                    ETA: {latestOrder.estimatedDelivery} • Click to view tracker
                  </p>
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-[#24152F]/60">
                  <p className="text-2xl mb-1">🔔</p>
                  No active orders right now. Chat with FoodBot to order!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            id="btn-user-profile"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FAF7FF] border border-purple-100 hover:bg-purple-50 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-[#24152F] block leading-tight">
                Guest User
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-card border border-purple-100 p-2 z-50">
              <div className="px-3 py-2 border-b border-purple-100/60 mb-1">
                <p className="text-xs font-bold text-[#24152F]">Guest Foodie</p>
                <p className="text-[11px] text-[#24152F]/60">foodie@foodbot.ai</p>
              </div>
              <button
                onClick={() => {
                  onSelectTab('orders');
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-[#24152F] hover:bg-[#FAF7FF] rounded-lg transition-colors flex items-center justify-between"
              >
                <span>📦 My Orders</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-[#7C3AED] font-bold">
                  {orders.length}
                </span>
              </button>
              <button
                onClick={() => {
                  onSelectTab('favorites');
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-[#24152F] hover:bg-[#FAF7FF] rounded-lg transition-colors"
              >
                ❤️ Saved Favorites
              </button>
              <button
                onClick={() => {
                  onSelectTab('settings');
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-[#24152F] hover:bg-[#FAF7FF] rounded-lg transition-colors"
              >
                ⚙ Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
