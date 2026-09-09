import React from 'react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles, X } from 'lucide-react';
import { CartItem } from '../types';

interface LiveCartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const LiveCart: React.FC<LiveCartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  isMobileDrawer = false,
  onCloseMobileDrawer
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
  const deliveryFee = items.length > 0 ? 30 : 0;
  const total = subtotal + deliveryFee;
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const content = (
    <div
      id="live-cart-container"
      className="flex flex-col h-full bg-white p-5 select-none"
    >
      {/* Cart Header */}
      <div className="flex items-center justify-between pb-4 border-b border-purple-100/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center font-bold">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#24152F] flex items-center gap-1.5">
              <span>Your Cart</span>
              <span className="text-base">🛒</span>
            </h3>
            <span className="text-[11px] font-semibold text-[#7C3AED]">
              {totalCount} {totalCount === 1 ? 'item' : 'items'} selected
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
              title="Clear all items"
            >
              Clear
            </button>
          )}

          {isMobileDrawer && onCloseMobileDrawer && (
            <button
              onClick={onCloseMobileDrawer}
              className="p-1.5 rounded-lg bg-purple-50 text-[#24152F] hover:bg-purple-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#24152F]/60">
            <div className="w-16 h-16 rounded-3xl bg-[#FAF7FF] border border-purple-100 flex items-center justify-center text-3xl mb-3 shadow-inner">
              🍛
            </div>
            <p className="font-bold text-sm text-[#24152F] mb-1">Your cart is empty</p>
            <p className="text-xs text-[#24152F]/60 max-w-[200px] leading-relaxed mb-4">
              Talk to FoodBot or choose a quick suggestion to add dishes!
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#7C3AED] bg-[#F3E8FF] px-3 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              Try: &quot;I want 2 biryanis&quot;
            </div>
          </div>
        ) : (
          items.map(({ item, quantity }) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-[#FAF7FF] border border-purple-100/70 hover:border-purple-200 transition-all"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 rounded-xl object-cover shadow-sm bg-purple-100 flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.vegetarian ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  <h4 className="font-bold text-xs text-[#24152F] truncate">
                    {item.name}
                  </h4>
                </div>
                <div className="text-[11px] text-[#24152F]/60 mt-0.5">
                  ₹{item.price} × {quantity} ={' '}
                  <span className="font-bold text-[#7C3AED]">
                    ₹{item.price * quantity}
                  </span>
                </div>
              </div>

              {/* Quantity Adjusters */}
              <div className="flex items-center gap-1 bg-white border border-purple-200/60 rounded-xl px-1 py-0.5 shadow-sm">
                <button
                  onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                  className="p-1 text-[#24152F]/70 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                  title="Decrease quantity"
                >
                  {quantity === 1 ? (
                    <Trash2 className="w-3 h-3 text-rose-500" />
                  ) : (
                    <Minus className="w-3 h-3" />
                  )}
                </button>
                <span className="w-5 text-center text-xs font-bold text-[#24152F]">
                  {quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                  className="p-1 text-[#24152F]/70 hover:text-[#7C3AED] hover:bg-purple-100/60 rounded-md transition-colors"
                  title="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bill Summary & Checkout */}
      {items.length > 0 && (
        <div className="pt-4 border-t border-purple-100 space-y-2.5">
          <div className="space-y-1.5 text-xs text-[#24152F]/75">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-[#24152F]">₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                Delivery Fee
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
                  Standard
                </span>
              </span>
              <span className="font-semibold text-[#24152F]">₹{deliveryFee}</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-purple-200">
            <div>
              <span className="text-xs font-bold text-[#24152F]">TOTAL</span>
              <span className="text-[10px] text-[#24152F]/50 block">Incl. taxes & delivery</span>
            </div>
            <span className="text-xl font-extrabold text-[#7C3AED]">
              ₹{total}
            </span>
          </div>

          <button
            id="btn-proceed-checkout"
            onClick={onProceedToCheckout}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold text-sm shadow-brand-md hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>🩷 Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );

  if (isMobileDrawer) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full sm:max-w-md max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          {content}
        </div>
      </div>
    );
  }

  return (
    <aside
      id="desktop-live-cart"
      className="hidden lg:flex flex-col w-80 xl:w-88 border-l border-purple-100/80 h-full shadow-sm bg-white"
    >
      {content}
    </aside>
  );
};
