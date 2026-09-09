import React from 'react';
import { Package, RotateCw, Clock, CheckCircle2, ChevronRight, ShoppingBag } from 'lucide-react';
import { Order, CartItem } from '../types';

interface OrdersViewProps {
  orders: Order[];
  onOrderAgain: (order: Order) => void;
  onNavigateToChat: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onOrderAgain,
  onNavigateToChat
}) => {
  return (
    <div id="orders-page" className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-4xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-6 border-b border-purple-100 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-[#24152F] tracking-tight flex items-center gap-2">
            <span>Your Orders</span>
            <span>📦</span>
          </h2>
          <p className="text-xs text-[#24152F]/60 mt-1">
            Track active deliveries and re-order your favorite meals in one tap.
          </p>
        </div>

        <button
          onClick={onNavigateToChat}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 text-[#7C3AED] hover:bg-purple-100 font-bold text-xs transition-colors cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>New Order</span>
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-purple-100/90 shadow-card p-8">
          <div className="w-16 h-16 rounded-3xl bg-purple-50 text-[#7C3AED] flex items-center justify-center text-3xl mx-auto mb-3">
            📦
          </div>
          <h3 className="font-bold text-lg text-[#24152F] mb-1">No orders yet</h3>
          <p className="text-xs text-[#24152F]/60 max-w-xs mx-auto mb-5 leading-relaxed">
            Ready to taste something extraordinary? Chat with FoodBot to place your first food order!
          </p>
          <button
            onClick={onNavigateToChat}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold text-xs shadow-brand-sm hover:opacity-95 transition-all"
          >
            Start Chatting with FoodBot ✨
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-5 border border-purple-100 shadow-card hover:shadow-brand-sm transition-all"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-purple-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    FB
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#24152F]">
                        Order #{order.id}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {order.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#24152F]/55 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {order.date}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[#24152F]/50 block font-bold uppercase">
                    Total Amount
                  </span>
                  <span className="text-lg font-extrabold text-[#7C3AED]">
                    ₹{order.total}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="py-4 space-y-2">
                {order.items.map((cartItem) => (
                  <div
                    key={cartItem.item.id}
                    className="flex items-center justify-between text-xs text-[#24152F]"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={cartItem.item.image}
                        alt={cartItem.item.name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <span className="font-semibold text-[#24152F]">
                        {cartItem.item.name}{' '}
                        <span className="text-[#7C3AED] font-bold">
                          × {cartItem.quantity}
                        </span>
                      </span>
                    </div>
                    <span className="font-bold text-[#24152F]/80">
                      ₹{cartItem.item.price * cartItem.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Delivery Details & Reorder Button */}
              <div className="pt-3.5 border-t border-purple-50 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-[#24152F]/65">
                  <span className="font-semibold text-[#24152F]">Delivering to:</span>{' '}
                  {order.deliveryAddress} • {order.paymentMethod}
                </div>

                <button
                  onClick={() => onOrderAgain(order)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold text-xs shadow-brand-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Order Again</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
