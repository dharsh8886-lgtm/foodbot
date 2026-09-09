import React, { useState, useMemo } from 'react';
import { FoodItem } from '../types';
import { MENU_CATEGORIES } from '../data/menu';
import { Star, Clock, Plus, Minus, Search, AlertCircle } from 'lucide-react';

interface CompactMenuListProps {
  items: FoodItem[];
  cartQuantities: Record<string, number>;
  onAddToCart: (item: FoodItem, quantity?: number) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  initialCategory?: string;
  initialVegFilter?: 'all' | 'veg' | 'non-veg';
  initialMaxPrice?: number;
  maxHeight?: string;
  showHeader?: boolean;
}

export const CompactMenuList: React.FC<CompactMenuListProps> = ({
  items,
  cartQuantities,
  onAddToCart,
  onUpdateQuantity,
  initialCategory = 'All',
  initialVegFilter = 'all',
  initialMaxPrice,
  maxHeight = 'max-h-[460px]',
  showHeader = true
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'non-veg'>(initialVegFilter);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category match
      if (selectedCategory !== 'All' && item.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Veg filter
      if (vegFilter === 'veg' && !item.vegetarian) return false;
      if (vegFilter === 'non-veg' && item.vegetarian) return false;

      // Price limit
      if (initialMaxPrice && item.price > initialMaxPrice) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesTags) return false;
      }

      return true;
    });
  }, [items, selectedCategory, vegFilter, searchQuery, initialMaxPrice]);

  return (
    <div className="w-full bg-white rounded-3xl border border-purple-100 shadow-card overflow-hidden my-3">
      {showHeader && (
        <div className="p-4 bg-gradient-to-r from-purple-50/90 to-pink-50/70 border-b border-purple-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center text-sm shadow-sm">
                📜
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-[#24152F]">
                  FoodBot Official Menu
                </h3>
                <p className="text-[11px] text-[#24152F]/60 font-medium">
                  20 handcrafted dishes & drinks • Order directly
                </p>
              </div>
            </div>

            {/* Veg / Non-Veg Quick Switcher */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-purple-100 shadow-2xs">
              <button
                type="button"
                onClick={() => setVegFilter('all')}
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  vegFilter === 'all'
                    ? 'bg-[#7C3AED] text-white'
                    : 'text-[#24152F]/70 hover:text-[#7C3AED]'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setVegFilter('veg')}
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  vegFilter === 'veg'
                    ? 'bg-emerald-600 text-white'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Veg
              </button>
              <button
                type="button"
                onClick={() => setVegFilter('non-veg')}
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  vegFilter === 'non-veg'
                    ? 'bg-rose-600 text-white'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                Non-Veg
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes, biryani, noodles, drinks..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-purple-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-[#24152F]"
            />
          </div>

          {/* Category Tabs: All | Indian | Chinese | Burgers | Pizza | Snacks | Desserts | Beverages */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {MENU_CATEGORIES.map((cat) => {
              const count =
                cat === 'All'
                  ? items.length
                  : items.filter((i) => i.category.toLowerCase() === cat.toLowerCase()).length;
              const isActive = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white shadow-brand-sm scale-102'
                      : 'bg-white text-[#24152F]/80 border border-purple-100 hover:border-purple-300 hover:text-[#7C3AED]'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/25 text-white' : 'bg-purple-50 text-[#7C3AED]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Compact Vertical List (NOT A GRID) */}
      <div className={`overflow-y-auto divide-y divide-purple-50 ${maxHeight}`}>
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#24152F]/60">
            No items matched your filters in the 20-item menu.
          </div>
        ) : (
          filteredItems.map((item) => {
            const qty = cartQuantities[item.id] || 0;
            const isAvailable = item.available !== false;

            return (
              <div
                key={item.id}
                className={`p-3 sm:p-3.5 flex items-center justify-between gap-3 transition-colors ${
                  isAvailable ? 'hover:bg-purple-50/40 bg-white' : 'bg-gray-50/70 opacity-75'
                }`}
              >
                {/* LEFT: Small Image (64x64 or 72x72) with Veg/Non-veg indicator */}
                <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex-shrink-0 rounded-2xl overflow-hidden border border-purple-100 shadow-2xs">
                  <img
                    src={item.image}
                    alt={item.name}
                    className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${
                      !isAvailable ? 'grayscale-50' : ''
                    }`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  {/* Veg / Non-Veg Dot Indicator */}
                  <div
                    className="absolute top-1 left-1 w-4 h-4 bg-white/95 rounded border flex items-center justify-center shadow-2xs backdrop-blur-xs"
                    style={{ borderColor: item.vegetarian ? '#059669' : '#DC2626' }}
                    title={item.vegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.vegetarian ? '#059669' : '#DC2626' }}
                    />
                  </div>

                  {item.spicy && (
                    <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-red-600/90 text-white rounded text-[9px] font-black leading-none">
                      🔥
                    </span>
                  )}
                </div>

                {/* MIDDLE: Name, Description, Rating, Prep Time */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-extrabold text-[#24152F] leading-tight truncate">
                      {item.name}
                    </h4>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-50 text-[#7C3AED] border border-purple-100">
                      {item.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#24152F]/70 line-clamp-1 mt-0.5">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                    <span className="flex items-center gap-0.5 font-bold text-amber-500">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{item.rating}</span>
                    </span>
                    <span className="text-[#24152F]/40">•</span>
                    <span className="flex items-center gap-1 font-medium text-[#24152F]/60">
                      <Clock className="w-3 h-3 text-purple-400" />
                      <span>{item.preparation_time}</span>
                    </span>
                    {!isAvailable && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        <AlertCircle className="w-2.5 h-2.5" />
                        Currently Unavailable
                      </span>
                    )}
                  </div>
                </div>

                {/* RIGHT: Price & Quantity Controls */}
                <div className="flex flex-col items-end justify-center gap-2 flex-shrink-0">
                  <span className="text-base font-extrabold text-[#7C3AED] tracking-tight">
                    ₹{item.price}
                  </span>

                  {/* Quantity or Add Button */}
                  {!isAvailable ? (
                    <button
                      type="button"
                      disabled
                      className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-400 text-xs font-bold cursor-not-allowed border border-gray-200"
                    >
                      Unavailable
                    </button>
                  ) : qty > 0 ? (
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white p-1 rounded-xl shadow-brand-sm">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, qty - 1)}
                        className="w-6 h-6 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3 text-white" />
                      </button>
                      <span className="font-extrabold text-xs px-1 min-w-[16px] text-center">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => onAddToCart(item, 1)}
                        className="w-6 h-6 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onAddToCart(item, 1)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-gradient-to-r hover:from-[#7C3AED] hover:to-[#EC4899] text-[#7C3AED] hover:text-white border border-purple-200 hover:border-transparent text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
