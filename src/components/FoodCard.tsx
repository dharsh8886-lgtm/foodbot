import React, { useState } from 'react';
import { Star, Clock, Plus, Minus, Heart, Check, Flame } from 'lucide-react';
import { FoodItem } from '../types';

interface FoodCardProps {
  item: FoodItem;
  quantityInCart: number;
  onAddToCart: (item: FoodItem, quantity: number) => void;
  isFavorite: boolean;
  onToggleFavorite: (item: FoodItem) => void;
  compact?: boolean;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  item,
  quantityInCart,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
  compact = false
}) => {
  const [localQty, setLocalQty] = useState(quantityInCart > 0 ? quantityInCart : 1);
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalQty(prev => prev + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalQty(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(item, localQty);
    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 1400);
  };

  return (
    <div
      id={`food-card-${item.id}`}
      className="group bg-white rounded-3xl p-3.5 border border-purple-100/90 shadow-card hover:shadow-brand-sm transition-all duration-200 flex flex-col justify-between overflow-hidden"
    >
      {/* Top Image Section */}
      <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden bg-purple-50">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Veg / Non-Veg Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              item.vegetarian ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-rose-500 ring-2 ring-rose-200'
            }`}
          />
          <span className="text-[11px] font-bold tracking-tight text-[#24152F]">
            {item.vegetarian ? 'Veg' : 'Non-Veg'}
          </span>
        </div>

        {/* Spicy / Popular pill */}
        {item.spicy && (
          <div className="absolute top-3 right-12 bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
            <Flame className="w-3 h-3" /> Spicy
          </div>
        )}

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 ${
            isFavorite
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-white/80 text-gray-400 hover:text-rose-500 hover:bg-white'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
        </button>
      </div>

      {/* Info Section */}
      <div className="pt-3 pb-2">
        <div className="flex items-start justify-between gap-1">
          <h4 className="font-bold text-base sm:text-lg text-[#24152F] group-hover:text-[#7C3AED] transition-colors leading-snug">
            {item.name}
          </h4>
        </div>

        <p className="text-xs text-[#24152F]/70 line-clamp-2 mt-1 leading-relaxed">
          {item.description}
        </p>

        {/* Rating and Time */}
        <div className="flex items-center gap-3 mt-2.5 text-xs text-[#24152F]/75 font-semibold">
          <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            {item.rating}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
            <Clock className="w-3.5 h-3.5" />
            {item.preparation_time}
          </span>
        </div>
      </div>

      {/* Price & Cart Actions */}
      <div className="pt-3 border-t border-purple-50 flex items-center justify-between gap-2 mt-auto">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-[#24152F]/50">Price</span>
          <span className="text-lg font-extrabold text-[#7C3AED]">
            ₹{item.price}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quantity Stepper */}
          <div className="flex items-center bg-[#FAF7FF] border border-purple-200/70 rounded-xl px-1 py-0.5">
            <button
              onClick={handleDecrement}
              className="p-1 text-[#24152F]/70 hover:text-[#7C3AED] hover:bg-purple-100/60 rounded-lg transition-colors"
              title="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center text-xs font-bold text-[#24152F]">
              {localQty}
            </span>
            <button
              onClick={handleIncrement}
              className="p-1 text-[#24152F]/70 hover:text-[#7C3AED] hover:bg-purple-100/60 rounded-lg transition-colors"
              title="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          {item.available === false ? (
            <button
              disabled
              className="px-3 py-2 rounded-xl text-xs font-bold text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
            >
              Unavailable
            </button>
          ) : (
            <button
              onClick={handleAdd}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-brand-sm active:scale-95 cursor-pointer ${
                isAddedRecently
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-95'
              }`}
            >
              {isAddedRecently ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <span>🩷</span>
                  <span>Add</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
