import React, { useState } from 'react';
import {
  UtensilsCrossed,
  ShoppingCart,
  BookOpen,
  Calendar,
  ChefHat,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';
import { MealPlannerWithFavorites } from '../meals/MealPlannerWithFavorites';
import { FoodInventoryView } from '../meals/FoodInventoryView';
import { RecipeBoxView } from '../meals/RecipeBoxView';
import { FavoriteFoodItem } from '../../types/mealPlanning';

type MealSubTab = 'planner' | 'inventory' | 'recipes';

export const MealPlanningPage: React.FC = () => {
  const {
    celebrate,
    activeMealsTab,
    setActiveMealsTab,
    dayPlans,
    setDayPlans,
    favoriteFoods,
    setFavoriteFoods,
    foodInventories,
    setFoodInventories,
    groceryList,
    setGroceryList,
    recipes,
    setRecipes,
  } = useBinder();

  const activeTab = activeMealsTab;
  const setActiveTab = setActiveMealsTab;

  const handleAddFavorite = (newFav: Omit<FavoriteFoodItem, 'id'>) => {
    const item: FavoriteFoodItem = {
      ...newFav,
      id: `fav-${Date.now()}`,
    };
    setFavoriteFoods(prev => [...prev, item]);
  };

  const handleDeleteFavorite = (id: string) => {
    setFavoriteFoods(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/30">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#be7fab]/20 text-[#be7fab] dark:text-[#daabcb] border border-[#be7fab]/50 shadow-[0_0_14px_rgba(190,127,171,0.3)]">
              <UtensilsCrossed className="w-5 h-5" />
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
              Meal Planning &amp; Kitchen Hub
            </h1>
          </div>
          <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/75 mt-1">
            Weekly meal schedule &amp; auto macros, 7 storage location inventories with 1-click grocery list, and tactile recipe index box
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold font-mono px-3.5 py-2 rounded-xl bg-white dark:bg-[#1c0f19] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/45 shadow-xs dark:shadow-[0_0_12px_rgba(190,127,171,0.2)]">
          <ChefHat className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
          <span>Macro Target: 2,150 kcal · 150g Protein</span>
        </div>
      </div>

      {/* HUD Sub-Navigation Ribbon */}
      <div className="hud-panel p-1.5">
        <nav className="flex items-center gap-1.5 text-xs font-semibold overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('planner')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'planner'
                ? 'bg-[#be7fab] text-[#120a10] font-bold shadow-[0_0_15px_rgba(190,127,171,0.45)]'
                : 'text-[#2d1b28]/80 dark:text-[#e6c3db]/80 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:bg-[#be7fab]/15'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Meal Planner &amp; Favorites ({dayPlans.length} Days)</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'bg-[#be7fab] text-[#120a10] font-bold shadow-[0_0_15px_rgba(190,127,171,0.45)]'
                : 'text-[#2d1b28]/80 dark:text-[#e6c3db]/80 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:bg-[#be7fab]/15'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Groceries &amp; Food Inventory ({groceryList.filter(g => !g.checked).length} List)</span>
          </button>

          <button
            onClick={() => setActiveTab('recipes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'recipes'
                ? 'bg-[#be7fab] text-[#120a10] font-bold shadow-[0_0_15px_rgba(190,127,171,0.45)]'
                : 'text-[#2d1b28]/80 dark:text-[#e6c3db]/80 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:bg-[#be7fab]/15'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Recipe Box ({recipes.length} Cards)</span>
          </button>
        </nav>
      </div>

      {/* Sub-Tab View Rendering */}
      {activeTab === 'planner' && (
        <MealPlannerWithFavorites
          dayPlans={dayPlans}
          onUpdateDayPlans={setDayPlans}
          favorites={favoriteFoods}
          onAddFavorite={handleAddFavorite}
          onDeleteFavorite={handleDeleteFavorite}
          celebrate={celebrate}
        />
      )}

      {activeTab === 'inventory' && (
        <FoodInventoryView
          inventoryItems={foodInventories}
          onUpdateInventory={setFoodInventories}
          groceryList={groceryList}
          onUpdateGroceryList={setGroceryList}
          celebrate={celebrate}
        />
      )}

      {activeTab === 'recipes' && (
        <RecipeBoxView
          recipes={recipes}
          onUpdateRecipes={setRecipes}
          celebrate={celebrate}
        />
      )}
    </div>
  );
};
