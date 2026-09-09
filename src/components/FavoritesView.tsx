import React from 'react';
import { Heart, Plus, ShoppingBag } from 'lucide-react';
import { FoodItem } from '../types';
import { FoodCard } from './FoodCard';

interface FavoritesViewProps {
  favorites: FoodItem[];
  onAddToCart: (item: FoodItem, quantity: number) => void;
  onToggleFavorite: (item: FoodItem) => void;
  getItemQuantityInCart: (itemId: string) => number;
  onNavigateToChat: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  onAddToCart,
  onToggleFavorite,
  getItemQuantityInCart,
  onNavigateToChat
}) => {
  return (
    <div id="favorites-page" className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-purple-100 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-[#24152F] tracking-tight flex items-center gap-2">
            <span>Your Favorites</span>
            <span>❤️</span>
          </h2>
          <p className="text-xs text-[#24152F]/60 mt-1">
            Dishes you have loved. Quick add them to your cart or ask FoodBot for recommendations.
          </p>
        </div>

        <button
          onClick={onNavigateToChat}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 text-[#7C3AED] hover:bg-purple-100 font-bold text-xs transition-colors cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Ask FoodBot</span>
        </button>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-purple-100/90 shadow-card p-8">
          <div className="w-16 h-16 rounded-3xl bg-pink-50 text-[#EC4899] flex items-center justify-center text-3xl mx-auto mb-3">
            ❤️
          </div>
          <h3 className="font-bold text-lg text-[#24152F] mb-1">No favorites saved yet</h3>
          <p className="text-xs text-[#24152F]/60 max-w-xs mx-auto mb-5 leading-relaxed">
            Tap the heart icon on any food card in chat to save it here for quick access!
          </p>
          <button
            onClick={onNavigateToChat}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold text-xs shadow-brand-sm hover:opacity-95 transition-all"
          >
            Explore Menu in Chat ✨
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {favorites.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              quantityInCart={getItemQuantityInCart(item.id)}
              onAddToCart={onAddToCart}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};
