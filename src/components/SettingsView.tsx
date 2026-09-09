import React, { useState } from 'react';
import { Settings, User, MapPin, Sparkles, Trash2, Check, Globe, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { FoodItem } from '../types';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../utils/multilingual';

interface SettingsViewProps {
  onClearAllData: () => void;
  onNavigateToChat: () => void;
  menuItems?: FoodItem[];
  onToggleAvailability?: (itemId: string) => void;
  selectedLanguage?: SupportedLanguage;
  onSelectLanguage?: (lang: SupportedLanguage) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onClearAllData,
  onNavigateToChat,
  menuItems = [],
  onToggleAvailability,
  selectedLanguage = 'en',
  onSelectLanguage
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

        {/* Language Selection */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-[#24152F] flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#7C3AED]" /> Assistant Language
          </h3>
          <p className="text-xs text-[#24152F]/60">
            Select your preferred language. FoodBot can also automatically detect when you type or speak in any of these languages!
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => onSelectLanguage && onSelectLanguage(lang.code)}
                className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer ${
                  selectedLanguage === lang.code
                    ? 'border-[#7C3AED] bg-[#F3E8FF] text-[#7C3AED] shadow-2xs'
                    : 'border-purple-100 bg-[#FAF7FF] text-[#24152F] hover:border-purple-200'
                }`}
              >
                <div className="text-sm">{lang.nativeName}</div>
                <div className="text-[11px] font-medium text-[#24152F]/50">{lang.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Menu Item Availability Manager (For Testing Availability Logic) */}
        {menuItems.length > 0 && onToggleAvailability && (
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#24152F] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" /> Item Availability Testing
              </h3>
              <span className="text-[11px] text-[#24152F]/50 font-medium">
                Toggle item stock status
              </span>
            </div>
            <p className="text-xs text-[#24152F]/60">
              Turn an item OFF to test FoodBot&apos;s availability logic! When an item is marked unavailable, FoodBot will refuse to add it to the cart and will suggest an available alternative from the menu.
            </p>

            <div className="max-h-60 overflow-y-auto divide-y divide-purple-50 pr-1">
              {menuItems.map((item) => (
                <div key={item.id} className="py-2 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.vegetarian ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <span className="font-bold text-[#24152F] truncate">{item.name}</span>
                    <span className="text-[10px] text-[#24152F]/50">₹{item.price}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleAvailability(item.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      item.available
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {item.available ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Available</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span>Unavailable</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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
