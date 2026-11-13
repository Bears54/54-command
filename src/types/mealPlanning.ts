export interface MacroNutrients {
  calories: number;
  protein: number; // g
  carbs: number; // g
  fat: number; // g
}

export interface MealSlotItem {
  id: string;
  name: string;
  macros: MacroNutrients;
  serving?: string;
}

export interface DayMealPlan {
  dayName: string;
  dateStr: string;
  breakfast: MealSlotItem[];
  lunch: MealSlotItem[];
  dinner: MealSlotItem[];
  snacks: MealSlotItem[];
}

export interface FavoriteFoodItem {
  id: string;
  name: string;
  category: 'High Protein' | 'Lunches & Bowls' | 'Dinners' | 'Wholesome Snacks' | 'Smoothies & Breakfast';
  serving: string;
  macros: MacroNutrients;
}

export type InventoryLocation = 
  | 'kitchen-fridge'
  | 'kitchen-freezer'
  | 'garage-fridge'
  | 'garage-freezer'
  | 'garage-full-freezer'
  | 'behind-the-bar'
  | 'pantry';

export interface FoodInventoryItem {
  id: string;
  name: string;
  location: InventoryLocation;
  category: string;
  quantity: number;
  unit: string;
  expirationDate?: string;
  notes?: string;
}

export interface GroceryListItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  checked: boolean;
  sourceLocation?: string;
}

export interface RecipeCardItem {
  id: string;
  title: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  imageSrc?: string;
  category: string;
  macros: MacroNutrients;
  ingredients: string[];
  steps: string[];
  notes?: string;
  isFavorite: boolean;
}
