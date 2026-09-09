import React, { useState } from 'react';
import { Settings, User, MapPin, Sparkles, Trash2, Check } from 'lucide-react';

interface SettingsViewProps {
  onClearAllData: () => void;
  onNavigateToChat: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onClearAllData,
  onNavigateToChat
}) => {
  const [userName, setUserName] = useState('Guest Foodie');
  const [userAddress, setUserAddress] = useState('22 Baker Street, Apt 4B');
  const [dietaryPref, setDietaryPref] = useState<'all' | 'veg'>('all');
  const [spiceLevel, setSpiceLevel] = useState<'mild' | 'medium' | 'hot'>('medium');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div id="settings-page" className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="pb-6 border-b border-purple-100 mb-6">
        <h2 className="text-2xl font-extrabold text-[#24152F] tracking-tight flex items-center gap-2">
          <span>Preferences & Settings</span>
          <span>⚙</span>
        </h2>
        <p className="text-xs text-[#24152F]/60 mt-1">
          Customize your default delivery profile, dietary preferences, and FoodBot assistant rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Details */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-[#24152F] flex items-center gap-2">
            <User className="w-4 h-4 text-[#7C3AED]" /> Default Profile
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-[#24152F]/70 block mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#FAF7FF] border border-purple-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] font-medium text-[#24152F]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#24152F]/70 block mb-1">
                Default Delivery Address
              </label>
              <input
                type="text"
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#FAF7FF] border border-purple-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] font-medium text-[#24152F]"
              />
            </div>
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-[#24152F] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#EC4899]" /> Dietary & Taste Preferences
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-[#24152F]/70 block mb-1.5">
                Food Preference
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDietaryPref('all')}
                  className={`p-3 rounded-2xl border text-center font-bold transition-all ${
                    dietaryPref === 'all'
                      ? 'border-[#7C3AED] bg-[#F3E8FF] text-[#7C3AED]'
                      : 'border-purple-100 bg-[#FAF7FF] text-[#24152F]'
                  }`}
                >
                  🍗 All (Veg & Non-Veg)
                </button>
                <button
                  type="button"
                  onClick={() => setDietaryPref('veg')}
                  className={`p-3 rounded-2xl border text-center font-bold transition-all ${
                    dietaryPref === 'veg'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-purple-100 bg-[#FAF7FF] text-[#24152F]'
                  }`}
                >
                  🥗 100% Vegetarian Only
                </button>
              </div>
            </div>

            <div className="pt-2">
              <label className="font-semibold text-[#24152F]/70 block mb-1.5">
                Preferred Spice Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'mild', label: '🌿 Mild' },
                  { id: 'medium', label: '🌶️ Medium' },
                  { id: 'hot', label: '🔥 Extra Spicy' }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSpiceLevel(s.id as any)}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      spiceLevel === s.id
                        ? 'border-[#EC4899] bg-[#FCE7F3] text-[#EC4899]'
                        : 'border-purple-100 bg-[#FAF7FF] text-[#24152F]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold text-sm shadow-brand-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Preferences Saved!</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>

        {/* Reset / Clear Data */}
        <div className="pt-4 border-t border-purple-100 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-rose-600 block">Reset FoodBot Data</span>
            <span className="text-[#24152F]/50">Clear chat messages, cart, and orders history.</span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to clear your cart and conversation history?')) {
                onClearAllData();
              }
            }}
            className="px-3 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        </div>
      </form>
    </div>
  );
};
