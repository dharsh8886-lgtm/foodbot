import React, { useEffect } from 'react';
import { CheckCircle2, Clock, MapPin, X, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Order } from '../types';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
  onViewOrders: () => void;
  onContinueChat: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onViewOrders,
  onContinueChat
}) => {
  if (!order) return null;

  return (
    <div
      id="order-confirmation-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-100 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#FAF7FF] text-[#24152F]/70 hover:bg-purple-100 hover:text-[#7C3AED] transition-colors cursor-pointer"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration Header */}
        <div className="text-center pb-5 border-b border-purple-100">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.4 }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center text-4xl mx-auto mb-3 shadow-brand-md"
          >
            🎉
          </motion.div>
          <h2 className="text-2xl font-extrabold text-[#24152F] tracking-tight">
            Order Confirmed!
          </h2>
          <p className="text-sm font-semibold bg-gradient-to-r from-[#7C3AED] to-[#EC4899] bg-clip-text text-transparent mt-1">
            &quot;Your food is being prepared.&quot;
          </p>
        </div>

        {/* Order ID & Timing Bar */}
        <div className="my-5 p-4 rounded-2xl bg-[#FAF7FF] border border-purple-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#24152F]/50 block uppercase">
              Order ID
            </span>
            <span className="text-sm font-extrabold text-[#7C3AED]">
              {order.id}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-[#24152F]/50 block uppercase">
              Estimated Delivery
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end">
              <Clock className="w-3.5 h-3.5" />
              {order.estimatedDelivery}
            </span>
          </div>
        </div>

        {/* Order Progress Indicator */}
        <div className="mb-6">
          <span className="text-xs font-bold text-[#24152F]/70 block mb-3">
            Live Order Status
          </span>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center text-xs font-extrabold shadow-sm">
                ✓
              </div>
              <span className="text-xs font-bold text-[#7C3AED] mt-1.5">Confirmed</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-xs font-extrabold shadow-sm animate-pulse">
                ●
              </div>
              <span className="text-xs font-bold text-[#24152F] mt-1.5">Preparing</span>
            </div>

            <div className="flex flex-col items-center opacity-40">
              <div className="w-8 h-8 rounded-full border-2 border-purple-300 text-purple-400 flex items-center justify-center text-xs">
                ○
              </div>
              <span className="text-xs font-medium text-[#24152F] mt-1.5">Out for Delivery</span>
            </div>

            <div className="flex flex-col items-center opacity-40">
              <div className="w-8 h-8 rounded-full border-2 border-purple-300 text-purple-400 flex items-center justify-center text-xs">
                ○
              </div>
              <span className="text-xs font-medium text-[#24152F] mt-1.5">Delivered</span>
            </div>
          </div>
        </div>

        {/* Itemized Receipt */}
        <div className="space-y-2 py-3 border-t border-purple-100 text-xs">
          <span className="text-[11px] font-bold text-[#24152F]/50 block uppercase mb-1">
            Receipt Summary
          </span>
          {order.items.map((ci) => (
            <div key={ci.item.id} className="flex justify-between items-center text-[#24152F]">
              <span className="font-semibold">
                {ci.item.name} × {ci.quantity}
              </span>
              <span className="font-bold text-[#7C3AED]">
                ₹{ci.item.price * ci.quantity}
              </span>
            </div>
          ))}

          <div className="flex justify-between items-center text-[#24152F]/60 text-[11px] pt-1">
            <span>Delivery Fee</span>
            <span>₹{order.deliveryFee}</span>
          </div>

          <div className="flex justify-between items-center text-base font-extrabold pt-2 border-t border-dashed border-purple-200 text-[#24152F]">
            <span>Total Paid ({order.paymentMethod})</span>
            <span className="text-[#7C3AED]">₹{order.total}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-5 flex gap-3">
          <button
            onClick={onContinueChat}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold text-xs shadow-brand-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Chat with FoodBot</span>
          </button>
          <button
            onClick={onViewOrders}
            className="py-3 px-4 rounded-2xl bg-purple-50 text-[#7C3AED] font-bold text-xs hover:bg-purple-100 transition-colors cursor-pointer"
          >
            Track in Orders
          </button>
        </div>
      </motion.div>
    </div>
  );
};
