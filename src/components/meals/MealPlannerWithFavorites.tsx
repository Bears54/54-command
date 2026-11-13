import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  UtensilsCrossed,
  Apple,
} from 'lucide-react';
import {
  DayMealPlan,
  FavoriteFoodItem,
  MealSlotItem,
  MacroNutrients,
} from '../../types/mealPlanning';

interface MealPlannerWithFavoritesProps {
  dayPlans: DayMealPlan[];
  onUpdateDayPlans: (newPlans: DayMealPlan[]) => void;
  favorites: FavoriteFoodItem[];
  onAddFavorite: (fav: Omit<FavoriteFoodItem, 'id'>) => void;
  onDeleteFavorite: (id: string) => void;
  celebrate: () => void;
}

type MealSlotType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export const MealPlannerWithFavorites: React.FC<MealPlannerWithFavoritesProps> = ({
  dayPlans,
  onUpdateDayPlans,
  favorites,
  onAddFavorite,
  onDeleteFavorite,
  celebrate,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [favCategoryFilter, setFavCategoryFilter] = useState<string>('All');
  const [favSearchQuery, setFavSearchQuery] = useState('');

  const [quickAddTargetDay, setQuickAddTargetDay] = useState<number>(0);
  const [quickAddTargetSlot, setQuickAddTargetSlot] = useState<MealSlotType>('lunch');

  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
  const [modalDayIndex, setModalDayIndex] = useState<number>(0);
  const [modalSlot, setModalSlot] = useState<MealSlotType>('breakfast');
  const [customMealName, setCustomMealName] = useState('');
  const [customServing, setCustomServing] = useState('1 Serving');
  const [customCalories, setCustomCalories] = useState<number>(350);
  const [customProtein, setCustomProtein] = useState<number>(30);
  const [customCarbs, setCustomCarbs] = useState<number>(25);
  const [customFat, setCustomFat] = useState<number>(10);

  const [isAddFavModalOpen, setIsAddFavModalOpen] = useState(false);
  const [newFavName, setNewFavName] = useState('');
  const [newFavCategory, setNewFavCategory] = useState<FavoriteFoodItem['category']>('High Protein');
  const [newFavServing, setNewFavServing] = useState('1 Serving');
  const [newFavCalories, setNewFavCalories] = useState<number>(300);
  const [newFavProtein, setNewFavProtein] = useState<number>(25);
  const [newFavCarbs, setNewFavCarbs] = useState<number>(20);
  const [newFavFat, setNewFavFat] = useState<number>(8);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const calculateDayMacros = (day: DayMealPlan): MacroNutrients => {
    const allItems = [...day.breakfast, ...day.lunch, ...day.dinner, ...day.snacks];
    return allItems.reduce(
      (acc, item) => ({
        calories: acc.calories + (item.macros.calories || 0),
        protein: acc.protein + (item.macros.protein || 0),
        carbs: acc.carbs + (item.macros.carbs || 0),
        fat: acc.fat + (item.macros.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const handleAddFavoriteToDay = (fav: FavoriteFoodItem, dayIdx: number, slot: MealSlotType) => {
    const updated = [...dayPlans];
    const targetDay = { ...updated[dayIdx] };
    const newItem: MealSlotItem = {
      id: `slot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: fav.name,
      macros: { ...fav.macros },
      serving: fav.serving,
    };

    targetDay[slot] = [...targetDay[slot], newItem];
    updated[dayIdx] = targetDay;
    onUpdateDayPlans(updated);
    celebrate();
    showToast(`Added "${fav.name}" to ${targetDay.dayName} (${slot})`);
  };

  const handleDeleteSlotItem = (dayIdx: number, slot: MealSlotType, itemId: string) => {
    const updated = [...dayPlans];
    const targetDay = { ...updated[dayIdx] };
    targetDay[slot] = targetDay[slot].filter(item => item.id !== itemId);
    updated[dayIdx] = targetDay;
    onUpdateDayPlans(updated);
  };

  const handleSaveCustomMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMealName.trim()) return;

    const updated = [...dayPlans];
    const targetDay = { ...updated[modalDayIndex] };
    const newItem: MealSlotItem = {
      id: `slot-${Date.now()}`,
      name: customMealName.trim(),
      serving: customServing.trim() || '1 Serving',
      macros: {
        calories: Number(customCalories) || 0,
        protein: Number(customProtein) || 0,
        carbs: Number(customCarbs) || 0,
        fat: Number(customFat) || 0,
      },
    };

    targetDay[modalSlot] = [...targetDay[modalSlot], newItem];
    updated[modalDayIndex] = targetDay;
    onUpdateDayPlans(updated);
    celebrate();
    setIsAddMealModalOpen(false);
    setCustomMealName('');
    showToast(`Added to ${targetDay.dayName} ${modalSlot}!`);
  };

  const handleSaveNewFavorite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFavName.trim()) return;

    onAddFavorite({
      name: newFavName.trim(),
      category: newFavCategory,
      serving: newFavServing.trim() || '1 Serving',
      macros: {
        calories: Number(newFavCalories) || 0,
        protein: Number(newFavProtein) || 0,
        carbs: Number(newFavCarbs) || 0,
        fat: Number(newFavFat) || 0,
      },
    });

    celebrate();
    setIsAddFavModalOpen(false);
    setNewFavName('');
    showToast(`Saved "${newFavName}" to Favorite Foods!`);
  };

  const filteredFavorites = favorites.filter(fav => {
    const matchesCategory = favCategoryFilter === 'All' || fav.category === favCategoryFilter;
    const matchesSearch = fav.name.toLowerCase().includes(favSearchQuery.toLowerCase()) ||
      fav.serving.toLowerCase().includes(favSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoriesList = ['All', 'High Protein', 'Lunches & Bowls', 'Dinners', 'Wholesome Snacks', 'Smoothies & Breakfast'];

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1c0f19] text-[#2d1b28] dark:text-[#efd0e5] text-xs font-semibold shadow-[0_0_24px_rgba(190,127,171,0.45)] border border-[#be7fab] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner with Quick Favorites Drawer */}
      <div className="hud-panel hud-corners washi-tape-top p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#e6c3db] dark:bg-[#be7fab]/20 text-[#2d1b28] dark:text-[#daabcb] border border-[#d29ec2] dark:border-[#be7fab]/45">
                <UtensilsCrossed className="w-4 h-4" />
              </span>
              <h2 className="font-display text-lg font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                Weekly Meal Planner &amp; Macro Breakdown
              </h2>
            </div>
            <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/75 mt-1">
              Organize breakfasts, lunches, dinners, and snacks. Calories and P/C/F macros recalculate dynamically.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                isDrawerOpen
                  ? 'bg-[#be7fab] text-[#120a10] border-[#be7fab] shadow-[0_0_15px_rgba(190,127,171,0.4)]'
                  : 'bg-[#efd0e5]/65 dark:bg-[#241420] text-[#2d1b28] dark:text-[#efd0e5] border-[#d29ec2] dark:border-[#be7fab]/45 hover:border-[#be7fab]'
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              <span>{isDrawerOpen ? 'Hide Favorite Foods' : 'Show Favorite Foods'}</span>
              {isDrawerOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Favorite Foods Quick Drawer */}
        {isDrawerOpen && (
          <div className="mt-5 pt-4 border-t border-[#d29ec2]/60 dark:border-[#be7fab]/25 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-wide uppercase font-mono">
                  Quick-Add Favorite Foods ({favorites.length})
                </span>
                <span className="text-[11px] text-[#2d1b28]/70 dark:text-[#e6c3db]/70">
                  Select target day &amp; slot, then tap &quot;+ Add&quot;
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={quickAddTargetDay}
                  onChange={(e) => setQuickAddTargetDay(Number(e.target.value))}
                  aria-label="Select target day for favorite food"
                  className="px-2.5 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5] font-medium focus:ring-1 focus:ring-[#be7fab]"
                >
                  {dayPlans.map((d, idx) => (
                    <option key={d.dayName} value={idx}>
                      {d.dayName} ({d.dateStr})
                    </option>
                  ))}
                </select>

                <select
                  value={quickAddTargetSlot}
                  onChange={(e) => setQuickAddTargetSlot(e.target.value as MealSlotType)}
                  aria-label="Select target meal slot"
                  className="px-2.5 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5] font-medium focus:ring-1 focus:ring-[#be7fab]"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snacks">Snacks</option>
                </select>

                <button
                  onClick={() => setIsAddFavModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#be7fab] text-[#120a10] hover:bg-[#d29ec2] rounded-lg transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Favorite Food</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                {categoriesList.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFavCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      favCategoryFilter === cat
                        ? 'bg-[#be7fab] text-[#120a10]'
                        : 'bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28]/75 dark:text-[#e6c3db]/75 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/30'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#be7fab] dark:text-[#daabcb]/60" />
                <input
                  type="text"
                  placeholder="Filter favorites..."
                  value={favSearchQuery}
                  onChange={(e) => setFavSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#e6c3db]/40 focus:outline-none focus:ring-1 focus:ring-[#be7fab]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 max-h-64 overflow-y-auto pr-1">
              {filteredFavorites.map(fav => (
                <div
                  key={fav.id}
                  className="p-3 bg-[#e6c3db]/45 dark:bg-[#241420]/90 rounded-xl border border-[#d29ec2] dark:border-[#d29ec2]/30 hover:border-[#be7fab] transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-[10px] font-bold text-[#be7fab] dark:text-[#daabcb] uppercase tracking-wider block font-mono">
                        {fav.category}
                      </span>
                      <button
                        onClick={() => onDeleteFavorite(fav.id)}
                        className="opacity-0 group-hover:opacity-100 text-[#2d1b28]/45 dark:text-[#e6c3db]/45 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] p-0.5 transition-opacity"
                        title="Delete from favorites"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] mt-1 line-clamp-2 leading-tight">
                      {fav.name}
                    </h4>
                    <p className="text-[11px] text-[#2d1b28]/70 dark:text-[#e6c3db]/70 mt-0.5">{fav.serving}</p>

                    <div className="mt-2 text-[10px] text-[#2d1b28]/80 dark:text-[#e6c3db] font-mono tabular-nums bg-white/80 dark:bg-[#120a10]/80 p-1.5 rounded-lg border border-[#d29ec2]/70 dark:border-[#be7fab]/25 flex items-center justify-between">
                      <span className="font-bold text-[#2d1b28] dark:text-[#efd0e5]">{fav.macros.calories} cal</span>
                      <span>P:{fav.macros.protein}</span>
                      <span>C:{fav.macros.carbs}</span>
                      <span>F:{fav.macros.fat}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddFavoriteToDay(fav, quickAddTargetDay, quickAddTargetSlot)}
                    className="mt-2.5 w-full py-1.5 px-2 bg-[#e6c3db] dark:bg-[#be7fab]/20 hover:bg-[#be7fab] text-[#2d1b28] dark:text-[#efd0e5] hover:text-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add to {dayPlans[quickAddTargetDay]?.dayName.split(' ')[0]}</span>
                  </button>
                </div>
              ))}

              {filteredFavorites.length === 0 && (
                <div className="col-span-full py-6 text-center text-xs text-[#2d1b28]/65 dark:text-[#e6c3db]/65 bg-[#e6c3db]/35 dark:bg-[#120a10]/50 rounded-xl border border-dashed border-[#d29ec2] dark:border-[#be7fab]/35">
                  No favorite foods match your filter. Tap &quot;+ New Favorite Food&quot; to add one!
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 7-Day Weekly Meal Schedule */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
            <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
              7-Day Meal Schedule &amp; Auto Macro Totals
            </h3>
          </div>
          <span className="text-xs text-[#2d1b28]/70 dark:text-[#e6c3db]/70">
            Click &quot;+ Add&quot; on any slot to log food or use the Favorites Drawer
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {dayPlans.map((day, dayIdx) => {
            const isToday = day.dayName.toLowerCase().includes('today');
            const dayMacros = calculateDayMacros(day);
            const calGoal = 2150;
            const proteinGoal = 150;
            const calPercent = Math.min(100, Math.round((dayMacros.calories / calGoal) * 100));
            const proteinPercent = Math.min(100, Math.round((dayMacros.protein / proteinGoal) * 100));

            return (
              <div
                key={day.dayName}
                className={`hud-panel hud-corners p-4 flex flex-col justify-between transition-all ${
                  isToday
                    ? 'ring-2 ring-[#be7fab] shadow-[0_0_24px_rgba(190,127,171,0.28)]'
                    : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isToday ? 'text-[#2d1b28] dark:text-[#efd0e5]' : 'text-[#2d1b28]/85 dark:text-[#e6c3db]'}`}>
                          {day.dayName}
                        </span>
                        {isToday && (
                          <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-[#be7fab] text-[#120a10]">
                            TODAY
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#2d1b28]/60 dark:text-[#e6c3db]/60 font-mono block">{day.dateStr}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold font-mono tabular-nums text-[#2d1b28] dark:text-[#efd0e5] block">
                        {dayMacros.calories} kcal
                      </span>
                      <span className="text-[10px] text-[#be7fab] dark:text-[#daabcb] font-mono tabular-nums font-semibold">
                        {dayMacros.protein}g protein
                      </span>
                    </div>
                  </div>

                  {/* Day Macro Progress Mini-Bars */}
                  <div className="mt-2.5 pb-2.5 border-b border-[#d29ec2]/50 dark:border-[#be7fab]/20 space-y-1.5">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-[#2d1b28]/75 dark:text-[#e6c3db]/75 font-mono tabular-nums mb-0.5">
                        <span>Calories ({calPercent}%)</span>
                        <span>{dayMacros.calories} / {calGoal}</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#e6c3db] dark:bg-[#120a10] rounded-full overflow-hidden border border-[#d29ec2] dark:border-[#be7fab]/20">
                        <div
                          className="h-full bg-linear-to-r from-[#be7fab] to-[#daabcb] dark:to-[#efd0e5] rounded-full transition-all duration-300"
                          style={{ width: `${calPercent}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[10px] text-[#2d1b28]/75 dark:text-[#e6c3db]/75 font-mono tabular-nums mb-0.5">
                        <span>Protein ({proteinPercent}%)</span>
                        <span>{dayMacros.protein}g / {proteinGoal}g</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#e6c3db] dark:bg-[#120a10] rounded-full overflow-hidden border border-[#d29ec2] dark:border-[#be7fab]/20">
                        <div
                          className="h-full bg-linear-to-r from-[#be7fab] dark:from-[#d29ec2] to-[#daabcb] rounded-full transition-all duration-300"
                          style={{ width: `${proteinPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#2d1b28]/65 dark:text-[#e6c3db]/65 font-mono tabular-nums pt-0.5">
                      <span>Carbs: {dayMacros.carbs}g</span>
                      <span>Fat: {dayMacros.fat}g</span>
                    </div>
                  </div>

                  {/* Meal Slots */}
                  <div className="mt-3 space-y-3">
                    {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealSlotType[]).map(slot => {
                      const items = day[slot];
                      const slotTitle = slot.charAt(0).toUpperCase() + slot.slice(1);

                      return (
                        <div key={slot} className="text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-[#be7fab] dark:text-[#daabcb] uppercase tracking-wide font-mono">
                              {slotTitle}
                            </span>
                            <button
                              onClick={() => {
                                setModalDayIndex(dayIdx);
                                setModalSlot(slot);
                                setIsAddMealModalOpen(true);
                              }}
                              className="text-[10px] text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] font-semibold flex items-center gap-0.5"
                            >
                              <Plus className="w-2.5 h-2.5" />
                              <span>Add</span>
                            </button>
                          </div>

                          {items.length > 0 ? (
                            <div className="space-y-1.5">
                              {items.map(item => (
                                <div
                                  key={item.id}
                                  className="p-2 rounded-lg bg-[#e6c3db]/45 dark:bg-[#241420]/90 border border-[#d29ec2] dark:border-[#d29ec2]/30 hover:border-[#be7fab] transition-all flex items-start justify-between gap-1 group"
                                >
                                  <div className="min-w-0">
                                    <div className="font-semibold text-[#2d1b28] dark:text-[#efd0e5] text-[11px] leading-snug line-clamp-2">
                                      {item.name}
                                    </div>
                                    <div className="text-[10px] text-[#2d1b28]/75 dark:text-[#e6c3db]/75 font-mono tabular-nums mt-0.5 flex flex-wrap gap-x-2">
                                      <span>{item.macros.calories} kcal</span>
                                      <span>P:{item.macros.protein}g</span>
                                      <span>C:{item.macros.carbs}g</span>
                                      <span>F:{item.macros.fat}g</span>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => handleDeleteSlotItem(dayIdx, slot, item.id)}
                                    className="opacity-0 group-hover:opacity-100 text-[#2d1b28]/45 dark:text-[#e6c3db]/45 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] p-1 transition-opacity shrink-0"
                                    title="Remove item"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setModalDayIndex(dayIdx);
                                setModalSlot(slot);
                                setIsAddMealModalOpen(true);
                              }}
                              className="w-full py-1.5 px-2 text-[10px] text-[#2d1b28]/55 dark:text-[#e6c3db]/55 border border-dashed border-[#d29ec2] dark:border-[#be7fab]/35 hover:border-[#be7fab] rounded-lg text-left hover:text-[#2d1b28] dark:hover:text-[#efd0e5] transition-colors"
                            >
                              + Plan {slotTitle}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-[#d29ec2]/60 dark:border-[#be7fab]/25 flex items-center justify-between text-[11px]">
                  <span className="text-[#2d1b28]/65 dark:text-[#e6c3db]/65 font-mono tabular-nums">
                    {day.breakfast.length + day.lunch.length + day.dinner.length + day.snacks.length} logged
                  </span>
                  <button
                    onClick={() => {
                      setQuickAddTargetDay(dayIdx);
                      setIsDrawerOpen(true);
                    }}
                    className="font-semibold text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:underline"
                  >
                    Quick-Add Favorites →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Add Custom Meal to Slot */}
      {isAddMealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-black/75 backdrop-blur-xs">
          <div className="hud-panel hud-corners w-full max-w-md p-5 bg-white dark:bg-[#1c0f19] border-[#be7fab] shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2] dark:border-[#be7fab]/30">
              <div>
                <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                  Add Meal to {dayPlans[modalDayIndex]?.dayName}
                </h3>
                <span className="text-xs text-[#2d1b28]/70 dark:text-[#e6c3db]/75 capitalize font-mono">
                  Slot: {modalSlot} · {dayPlans[modalDayIndex]?.dateStr}
                </span>
              </div>
              <button
                onClick={() => setIsAddMealModalOpen(false)}
                className="text-[#be7fab] dark:text-[#e6c3db]/70 hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomMeal} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Food or Recipe Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grass-Fed Bison Burger w/ Sweet Potato"
                  value={customMealName}
                  onChange={(e) => setCustomMealName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5] focus:ring-1 focus:ring-[#be7fab]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Serving Size
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 Burger + 1 Cup Fries"
                  value={customServing}
                  onChange={(e) => setCustomServing(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5]"
                />
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-[#be7fab] dark:text-[#daabcb] mb-0.5 font-mono">Calories</label>
                  <input
                    type="number"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-md font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#be7fab] dark:text-[#daabcb] mb-0.5 font-mono">Protein (g)</label>
                  <input
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-md font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#be7fab] dark:text-[#daabcb] mb-0.5 font-mono">Carbs (g)</label>
                  <input
                    type="number"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-md font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#be7fab] dark:text-[#daabcb] mb-0.5 font-mono">Fat (g)</label>
                  <input
                    type="number"
                    value={customFat}
                    onChange={(e) => setCustomFat(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-md font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                    min="0"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#d29ec2]/60 dark:border-[#be7fab]/25">
                <button
                  type="button"
                  onClick={() => setIsAddMealModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-[#2d1b28]/70 dark:text-[#e6c3db]/75 hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-lg"
                >
                  Add Meal Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Favorite Food */}
      {isAddFavModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-black/75 backdrop-blur-xs">
          <div className="hud-panel hud-corners w-full max-w-md p-5 bg-white dark:bg-[#1c0f19] border-[#be7fab] shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2] dark:border-[#be7fab]/30">
              <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                Add to Favorite Foods Library
              </h3>
              <button
                onClick={() => setIsAddFavModalOpen(false)}
                className="text-[#be7fab] dark:text-[#e6c3db]/70 hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewFavorite} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Food Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Seared Ahi Tuna Bowl"
                  value={newFavName}
                  onChange={(e) => setNewFavName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5] focus:ring-1 focus:ring-[#be7fab]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Category
                  </label>
                  <select
                    value={newFavCategory}
                    onChange={(e) => setNewFavCategory(e.target.value as FavoriteFoodItem['category'])}
                    className="w-full px-2 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5]"
                  >
                    <option value="High Protein">High Protein</option>
                    <option value="Lunches & Bowls">Lunches &amp; Bowls</option>
                    <option value="Dinners">Dinners</option>
                    <option value="Wholesome Snacks">Wholesome Snacks</option>
                    <option value="Smoothies & Breakfast">Smoothies &amp; Breakfast</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Serving Size
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 6 oz portion"
                    value={newFavServing}
                    onChange={(e) => setNewFavServing(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-[#be7fab] dark:text-[#daabcb] mb-0.5 font-mono">Calories</label>
                  <input
                    type="number"
                    value={newFavCalories}
                    onChange={(e) => setNewFavCalories(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-md font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#be7fab] dark:text-[#daabcb] mb-0.5 font-mono">Protein (g)</label>
                  <input
                    type="number"
                    value={newFavProtein}
                    onChange={(e) => setNewFavProtein(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-md font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#be7fab] dark:text-[#daabcb] mb-0.5 font-mono">Carbs (g)</label>
                  <input
                    type="number"
                    value={newFavCarbs}
                    onChange={(e) => setNewFavCarbs(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-md font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#be7fab] dark:text-[#daabcb] mb-0.5 font-mono">Fat (g)</label>
                  <input
                    type="number"
                    value={newFavFat}
                    onChange={(e) => setNewFavFat(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-md font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                    min="0"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#d29ec2]/60 dark:border-[#be7fab]/25">
                <button
                  type="button"
                  onClick={() => setIsAddFavModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-[#2d1b28]/70 dark:text-[#e6c3db]/75 hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-lg"
                >
                  Save Favorite Food
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
