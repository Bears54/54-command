import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AppleHealthData,
  BillItem,
  CleaningChore,
  CloudBackupMeta,
  ContactItem,
  CustomPage,
  DocumentItem,
  HabitCard,
  HabitItem,
  HomeProject,
  ImportantDate,
  KanbanTask,
  MacroData,
  MealPlanDay,
  NoteItem,
  PageId,
  PriorityItem,
  TodoItem,
  UserProfile,
  WatchlistItem,
  WatchlistMediaItem,
  WeatherData,
} from '../types/binder';
import {
  DayMealPlan,
  FavoriteFoodItem,
  FoodInventoryItem,
  GroceryListItem,
  RecipeCardItem,
} from '../types/mealPlanning';
import { MedicationItem, SupplementItem } from '../types/wellness';
import {
  initialDayMealPlans,
  initialFavoriteFoods,
  initialFoodInventories,
  initialGroceryList,
  initialRecipeCards,
} from '../data/mealPlanningInitialData';
import { initialWatchlistMediaItems } from '../data/watchlistInitialData';
import { initialMedications, initialSupplements } from '../data/wellnessInitialData';
import {
  initialAppleHealth,
  initialBills,
  initialCalendarNotes,
  initialCleaningChores,
  initialContacts,
  initialCustomPages,
  initialDocuments,
  initialHabitCards,
  initialHabits,
  initialHomeProjects,
  initialHourlySchedule,
  initialImportantDates,
  initialKanbanTasks,
  initialMacros,
  initialMealPlan,
  initialNotes,
  initialPriorities,
  initialQuickNotes,
  initialTodos,
  initialUserProfile,
  initialWatchlist,
  initialWeather,
} from '../data/initialData';

export type ThemeMode = 'dark' | 'light';
export type MealsSubTab = 'planner' | 'inventory' | 'recipes';

interface BinderContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  activeMealsTab: MealsSubTab;
  setActiveMealsTab: (tab: MealsSubTab) => void;
  weather: WeatherData;
  updateWeather: (weather: Partial<WeatherData>) => void;
  health: AppleHealthData;
  updateHealth: (health: Partial<AppleHealthData>) => void;
  macros: MacroData;
  updateMacros: (macros: Partial<MacroData>) => void;
  priorities: PriorityItem[];
  togglePriority: (id: string) => void;
  updatePriorityText: (id: string, text: string) => void;
  addPriority: (text: string) => void;
  todos: TodoItem[];
  toggleTodo: (id: string) => void;
  addTodo: (todo: Omit<TodoItem, 'id'>) => void;
  deleteTodo: (id: string) => void;
  habits: HabitItem[];
  toggleHabit: (id: string) => void;
  addHabit: (habit: Omit<HabitItem, 'id' | 'streak' | 'history' | 'completedToday'>) => void;
  deleteHabit: (id: string) => void;
  bills: BillItem[];
  toggleBillPaid: (id: string) => void;
  addBill: (bill: Omit<BillItem, 'id'>) => void;
  deleteBill: (id: string) => void;
  importantDates: ImportantDate[];
  addImportantDate: (item: Omit<ImportantDate, 'id'>) => void;
  deleteImportantDate: (id: string) => void;
  cleaningChores: CleaningChore[];
  toggleChore: (id: string) => void;
  addChore: (chore: Omit<CleaningChore, 'id' | 'completed'>) => void;
  deleteChore: (id: string) => void;
  homeProjects: HomeProject[];
  updateProjectProgress: (id: string, progress: number) => void;
  toggleProjectTask: (projectId: string, taskId: string) => void;
  addHomeProject: (project: Omit<HomeProject, 'id'>) => void;
  quickNotes: string;
  updateQuickNotes: (text: string) => void;
  kanbanTasks: KanbanTask[];
  moveKanbanTask: (taskId: string, newColumn: KanbanTask['column']) => void;
  addKanbanTask: (task: Omit<KanbanTask, 'id'>) => void;
  deleteKanbanTask: (id: string) => void;
  mealPlan: MealPlanDay[];
  updateMealPlanDay: (index: number, meals: Partial<MealPlanDay>) => void;
  watchlist: WatchlistItem[];
  addWatchlistItem: (item: Omit<WatchlistItem, 'id'>) => void;
  updateWatchlistItemStatus: (id: string, status: WatchlistItem['status']) => void;
  deleteWatchlistItem: (id: string) => void;
  contacts: ContactItem[];
  addContact: (contact: Omit<ContactItem, 'id'>) => void;
  deleteContact: (id: string) => void;
  notes: NoteItem[];
  addNote: (note: Omit<NoteItem, 'id' | 'updatedAt'>) => void;
  updateNote: (id: string, note: Partial<NoteItem>) => void;
  deleteNote: (id: string) => void;
  documents: DocumentItem[];
  addDocument: (doc: Omit<DocumentItem, 'id'>) => void;
  deleteDocument: (id: string) => void;
  customPages: CustomPage[];
  addCustomPage: (name: string, icon: string, color?: string) => void;
  updateCustomPage: (id: string, update: Partial<CustomPage>) => void;
  deleteCustomPage: (id: string) => void;
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  habitCards: HabitCard[];
  moveHabitCard: (cardId: string, newColumn: 'todo' | 'done') => void;
  setWaterGlassesForHabit: (cardId: string, count: number) => void;
  addHabitCard: (card: Omit<HabitCard, 'id'>) => void;
  deleteHabitCard: (id: string) => void;
  calendarNotes: Record<string, string>;
  updateCalendarNote: (dateStr: string, note: string) => void;
  hourlySchedule: Record<string, Record<string, string>>;
  updateHourlySlot: (dateStr: string, hourStr: string, text: string) => void;
  autoRolloverEnabled: boolean;
  setAutoRolloverEnabled: (val: boolean) => void;
  rolloverUnfinishedTasks: () => void;
  selectedPlannerDate: string;
  setSelectedPlannerDate: (date: string) => void;
  activePlannerTab: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | 'Important Dates';
  setActivePlannerTab: (tab: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | 'Important Dates') => void;
  cloudBackupMeta: CloudBackupMeta;
  backupToCloud: () => Promise<boolean>;
  exportBackupJSON: () => void;
  importBackupJSON: (jsonString: string) => boolean;
  resetToSampleData: () => void;
  celebrate: () => void;
  // Shared Meals, Recipes, Groceries & Watchlist Media for direct Gemini Assistant updates
  dayPlans: DayMealPlan[];
  setDayPlans: React.Dispatch<React.SetStateAction<DayMealPlan[]>>;
  favoriteFoods: FavoriteFoodItem[];
  setFavoriteFoods: React.Dispatch<React.SetStateAction<FavoriteFoodItem[]>>;
  foodInventories: FoodInventoryItem[];
  setFoodInventories: React.Dispatch<React.SetStateAction<FoodInventoryItem[]>>;
  groceryList: GroceryListItem[];
  setGroceryList: React.Dispatch<React.SetStateAction<GroceryListItem[]>>;
  addGroceryItems: (items: Array<Omit<GroceryListItem, 'id' | 'checked'>>) => void;
  recipes: RecipeCardItem[];
  setRecipes: React.Dispatch<React.SetStateAction<RecipeCardItem[]>>;
  addRecipeCard: (recipe: Omit<RecipeCardItem, 'id'>) => RecipeCardItem;
  watchlistMedia: WatchlistMediaItem[];
  setWatchlistMedia: React.Dispatch<React.SetStateAction<WatchlistMediaItem[]>>;
  addWatchlistMediaItem: (item: Omit<WatchlistMediaItem, 'id'>) => WatchlistMediaItem;
  // Shared Medications, Prescriptions & Supplements synced between Wellness Tab 2 and Daily Command Center
  activeWellnessTab: 'health-measurements' | 'meds-supplements' | 'fitness-routines';
  setActiveWellnessTab: (tab: 'health-measurements' | 'meds-supplements' | 'fitness-routines') => void;
  medications: MedicationItem[];
  toggleMedication: (id: string) => void;
  addMedication: (med: Omit<MedicationItem, 'id' | 'takenToday'>) => void;
  updateMedication: (id: string, update: Partial<MedicationItem>) => void;
  deleteMedication: (id: string) => void;
  supplements: SupplementItem[];
  toggleSupplement: (id: string) => void;
  addSupplement: (sup: Omit<SupplementItem, 'id' | 'takenToday'>) => void;
  updateSupplement: (id: string, update: Partial<SupplementItem>) => void;
  deleteSupplement: (id: string) => void;
}

const BinderContext = createContext<BinderContextType | null>(null);

const STORAGE_KEY = 'lifebinder_data_v1';
const THEME_STORAGE_KEY = 'lifebinder_theme_v1';

export const BinderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [activePage, setActivePage] = useState<PageId>('today');
  const [activeMealsTab, setActiveMealsTab] = useState<MealsSubTab>('planner');
  
  // Try to load state from localStorage or use initialData
  const [weather, setWeather] = useState<WeatherData>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_weather`);
      if (saved) {
        const parsed = JSON.parse(saved) as WeatherData;
        if (parsed.location === 'San Francisco, CA') {
          return { ...parsed, location: 'West Bend, WI' };
        }
        return parsed;
      }
      return initialWeather;
    } catch {
      return initialWeather;
    }
  });

  useEffect(() => {
    let cancelled = false;
    const mapWmoCondition = (code: number): WeatherData['condition'] => {
      if (code <= 1) return 'Sunny';
      if (code === 2) return 'Partly Cloudy';
      if (code === 3 || code === 45 || code === 48) return 'Cloudy';
      if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'Snowy';
      if (code >= 95) return 'Stormy';
      if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'Rainy';
      return 'Partly Cloudy';
    };

    const fetchWestBendWeather = async () => {
      try {
        const url =
          'https://api.open-meteo.com/v1/forecast?latitude=43.4253&longitude=-88.1834&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=America%2FChicago&forecast_days=1';
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data?.current) return;

        const currentTemp = Math.round(data.current.temperature_2m);
        const feelsLike = Math.round(data.current.apparent_temperature ?? currentTemp);
        const humidity = Math.round(data.current.relative_humidity_2m ?? 60);
        const condition = mapWmoCondition(Number(data.current.weather_code ?? 0));
        const high = Math.round(data.daily?.temperature_2m_max?.[0] ?? currentTemp + 4);
        const low = Math.round(data.daily?.temperature_2m_min?.[0] ?? currentTemp - 8);

        setWeather((prev) => ({
          ...prev,
          location: 'West Bend, WI',
          temperature: currentTemp,
          feelsLike,
          humidity,
          condition,
          high,
          low,
        }));
      } catch {
        // Keep cached/default West Bend, WI weather when offline
      }
    };

    fetchWestBendWeather();
    const intervalId = window.setInterval(fetchWestBendWeather, 15 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const [health, setHealth] = useState<AppleHealthData>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_health`);
      return saved ? JSON.parse(saved) : initialAppleHealth;
    } catch {
      return initialAppleHealth;
    }
  });

  const [macros, setMacros] = useState<MacroData>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_macros`);
      return saved ? JSON.parse(saved) : initialMacros;
    } catch {
      return initialMacros;
    }
  });

  const [priorities, setPriorities] = useState<PriorityItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_priorities`);
      return saved ? JSON.parse(saved) : initialPriorities;
    } catch {
      return initialPriorities;
    }
  });

  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_todos`);
      return saved ? JSON.parse(saved) : initialTodos;
    } catch {
      return initialTodos;
    }
  });

  const [habits, setHabits] = useState<HabitItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_habits`);
      return saved ? JSON.parse(saved) : initialHabits;
    } catch {
      return initialHabits;
    }
  });

  const [bills, setBills] = useState<BillItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_bills`);
      return saved ? JSON.parse(saved) : initialBills;
    } catch {
      return initialBills;
    }
  });

  const [importantDates, setImportantDates] = useState<ImportantDate[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_dates`);
      return saved ? JSON.parse(saved) : initialImportantDates;
    } catch {
      return initialImportantDates;
    }
  });

  const [cleaningChores, setCleaningChores] = useState<CleaningChore[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_chores`);
      return saved ? JSON.parse(saved) : initialCleaningChores;
    } catch {
      return initialCleaningChores;
    }
  });

  const [homeProjects, setHomeProjects] = useState<HomeProject[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_projects`);
      return saved ? JSON.parse(saved) : initialHomeProjects;
    } catch {
      return initialHomeProjects;
    }
  });

  const [quickNotes, setQuickNotes] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_quicknotes`);
      return saved !== null ? saved : initialQuickNotes;
    } catch {
      return initialQuickNotes;
    }
  });

  const [kanbanTasks, setKanbanTasks] = useState<KanbanTask[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_kanban`);
      return saved ? JSON.parse(saved) : initialKanbanTasks;
    } catch {
      return initialKanbanTasks;
    }
  });

  const [mealPlan, setMealPlan] = useState<MealPlanDay[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_meals`);
      return saved ? JSON.parse(saved) : initialMealPlan;
    } catch {
      return initialMealPlan;
    }
  });

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_watchlist`);
      return saved ? JSON.parse(saved) : initialWatchlist;
    } catch {
      return initialWatchlist;
    }
  });

  const [contacts, setContacts] = useState<ContactItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_contacts`);
      return saved ? JSON.parse(saved) : initialContacts;
    } catch {
      return initialContacts;
    }
  });

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_notes`);
      return saved ? JSON.parse(saved) : initialNotes;
    } catch {
      return initialNotes;
    }
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_documents`);
      return saved ? JSON.parse(saved) : initialDocuments;
    } catch {
      return initialDocuments;
    }
  });

  const [customPages, setCustomPages] = useState<CustomPage[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_custompages`);
      return saved ? JSON.parse(saved) : initialCustomPages;
    } catch {
      return initialCustomPages;
    }
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_profile`);
      return saved ? JSON.parse(saved) : initialUserProfile;
    } catch {
      return initialUserProfile;
    }
  });

  const [cloudBackupMeta, setCloudBackupMeta] = useState<CloudBackupMeta>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_backup_meta`);
      return saved ? JSON.parse(saved) : {
        lastBackupTime: 'Today at 08:45 AM',
        status: 'synced',
        version: 1,
        autoSyncEnabled: true,
      };
    } catch {
      return {
        lastBackupTime: 'Today at 08:45 AM',
        status: 'synced',
        version: 1,
        autoSyncEnabled: true,
      };
    }
  });

  const [habitCards, setHabitCards] = useState<HabitCard[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_habit_cards`);
      return saved ? JSON.parse(saved) : initialHabitCards;
    } catch {
      return initialHabitCards;
    }
  });

  const [calendarNotes, setCalendarNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_calendar_notes`);
      return saved ? JSON.parse(saved) : initialCalendarNotes;
    } catch {
      return initialCalendarNotes;
    }
  });

  const [hourlySchedule, setHourlySchedule] = useState<Record<string, Record<string, string>>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_hourly_schedule`);
      return saved ? JSON.parse(saved) : initialHourlySchedule;
    } catch {
      return initialHourlySchedule;
    }
  });

  const [autoRolloverEnabled, setAutoRolloverEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_auto_rollover`);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [selectedPlannerDate, setSelectedPlannerDate] = useState<string>('2026-11-12');
  const [activePlannerTab, setActivePlannerTab] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | 'Important Dates'>('Daily');

  // Shared Meal Planning, Groceries, Recipe Box, Watchlist V2 & Wellness Meds/Supplements states
  const MEAL_STORAGE_PREFIX = 'lifebinder_meals_v2';
  const WATCHLIST_V2_KEY = 'lifebinder_watchlist_v2';
  const WELLNESS_V2_PREFIX = 'lifebinder_wellness_v2';

  const [activeWellnessTab, setActiveWellnessTab] = useState<
    'health-measurements' | 'meds-supplements' | 'fitness-routines'
  >('health-measurements');

  const [medications, setMedications] = useState<MedicationItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${WELLNESS_V2_PREFIX}_meds`);
      return saved ? JSON.parse(saved) : initialMedications;
    } catch {
      return initialMedications;
    }
  });

  const [supplements, setSupplements] = useState<SupplementItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${WELLNESS_V2_PREFIX}_supplements`);
      return saved ? JSON.parse(saved) : initialSupplements;
    } catch {
      return initialSupplements;
    }
  });

  const [dayPlans, setDayPlans] = useState<DayMealPlan[]>(() => {
    try {
      const saved = localStorage.getItem(`${MEAL_STORAGE_PREFIX}_day_plans`);
      return saved ? JSON.parse(saved) : initialDayMealPlans;
    } catch {
      return initialDayMealPlans;
    }
  });

  const [favoriteFoods, setFavoriteFoods] = useState<FavoriteFoodItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${MEAL_STORAGE_PREFIX}_favorites`);
      return saved ? JSON.parse(saved) : initialFavoriteFoods;
    } catch {
      return initialFavoriteFoods;
    }
  });

  const [foodInventories, setFoodInventories] = useState<FoodInventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${MEAL_STORAGE_PREFIX}_inventory`);
      return saved ? JSON.parse(saved) : initialFoodInventories;
    } catch {
      return initialFoodInventories;
    }
  });

  const [groceryList, setGroceryList] = useState<GroceryListItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${MEAL_STORAGE_PREFIX}_groceries`);
      return saved ? JSON.parse(saved) : initialGroceryList;
    } catch {
      return initialGroceryList;
    }
  });

  const [recipes, setRecipes] = useState<RecipeCardItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${MEAL_STORAGE_PREFIX}_recipes`);
      return saved ? JSON.parse(saved) : initialRecipeCards;
    } catch {
      return initialRecipeCards;
    }
  });

  const [watchlistMedia, setWatchlistMedia] = useState<WatchlistMediaItem[]>(() => {
    try {
      const saved = localStorage.getItem(WATCHLIST_V2_KEY);
      return saved ? JSON.parse(saved) : initialWatchlistMediaItems;
    } catch {
      return initialWatchlistMediaItems;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`${MEAL_STORAGE_PREFIX}_day_plans`, JSON.stringify(dayPlans));
    } catch (e) { console.error(e); }
  }, [dayPlans]);

  useEffect(() => {
    try {
      localStorage.setItem(`${MEAL_STORAGE_PREFIX}_favorites`, JSON.stringify(favoriteFoods));
    } catch (e) { console.error(e); }
  }, [favoriteFoods]);

  useEffect(() => {
    try {
      localStorage.setItem(`${MEAL_STORAGE_PREFIX}_inventory`, JSON.stringify(foodInventories));
    } catch (e) { console.error(e); }
  }, [foodInventories]);

  useEffect(() => {
    try {
      localStorage.setItem(`${MEAL_STORAGE_PREFIX}_groceries`, JSON.stringify(groceryList));
    } catch (e) { console.error(e); }
  }, [groceryList]);

  useEffect(() => {
    try {
      localStorage.setItem(`${MEAL_STORAGE_PREFIX}_recipes`, JSON.stringify(recipes));
    } catch (e) { console.error(e); }
  }, [recipes]);

  useEffect(() => {
    try {
      localStorage.setItem(WATCHLIST_V2_KEY, JSON.stringify(watchlistMedia));
    } catch (e) { console.error(e); }
  }, [watchlistMedia]);

  useEffect(() => {
    try {
      localStorage.setItem(`${WELLNESS_V2_PREFIX}_meds`, JSON.stringify(medications));
    } catch (e) { console.error(e); }
  }, [medications]);

  useEffect(() => {
    try {
      localStorage.setItem(`${WELLNESS_V2_PREFIX}_supplements`, JSON.stringify(supplements));
    } catch (e) { console.error(e); }
  }, [supplements]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_habit_cards`, JSON.stringify(habitCards));
    } catch (e) { console.error(e); }
  }, [habitCards]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_calendar_notes`, JSON.stringify(calendarNotes));
    } catch (e) { console.error(e); }
  }, [calendarNotes]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_hourly_schedule`, JSON.stringify(hourlySchedule));
    } catch (e) { console.error(e); }
  }, [hourlySchedule]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_auto_rollover`, JSON.stringify(autoRolloverEnabled));
    } catch (e) { console.error(e); }
  }, [autoRolloverEnabled]);

  // Save to localStorage automatically on state changes
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_weather`, JSON.stringify(weather));
    } catch (e) { console.error(e); }
  }, [weather]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_health`, JSON.stringify(health));
    } catch (e) { console.error(e); }
  }, [health]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_macros`, JSON.stringify(macros));
    } catch (e) { console.error(e); }
  }, [macros]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_priorities`, JSON.stringify(priorities));
    } catch (e) { console.error(e); }
  }, [priorities]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_todos`, JSON.stringify(todos));
    } catch (e) { console.error(e); }
  }, [todos]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_habits`, JSON.stringify(habits));
    } catch (e) { console.error(e); }
  }, [habits]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_bills`, JSON.stringify(bills));
    } catch (e) { console.error(e); }
  }, [bills]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_dates`, JSON.stringify(importantDates));
    } catch (e) { console.error(e); }
  }, [importantDates]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_chores`, JSON.stringify(cleaningChores));
    } catch (e) { console.error(e); }
  }, [cleaningChores]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_projects`, JSON.stringify(homeProjects));
    } catch (e) { console.error(e); }
  }, [homeProjects]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_quicknotes`, quickNotes);
    } catch (e) { console.error(e); }
  }, [quickNotes]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_kanban`, JSON.stringify(kanbanTasks));
    } catch (e) { console.error(e); }
  }, [kanbanTasks]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_meals`, JSON.stringify(mealPlan));
    } catch (e) { console.error(e); }
  }, [mealPlan]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_watchlist`, JSON.stringify(watchlist));
    } catch (e) { console.error(e); }
  }, [watchlist]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_contacts`, JSON.stringify(contacts));
    } catch (e) { console.error(e); }
  }, [contacts]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_notes`, JSON.stringify(notes));
    } catch (e) { console.error(e); }
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_documents`, JSON.stringify(documents));
    } catch (e) { console.error(e); }
  }, [documents]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_custompages`, JSON.stringify(customPages));
    } catch (e) { console.error(e); }
  }, [customPages]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(userProfile));
    } catch (e) { console.error(e); }
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_backup_meta`, JSON.stringify(cloudBackupMeta));
    } catch (e) { console.error(e); }
  }, [cloudBackupMeta]);

  // Confetti helper in rose-mauve palette
  const celebrate = () => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#be7fab', '#d29ec2', '#daabcb', '#e6c3db', '#efd0e5'],
        disableForReducedMotion: true,
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Direct Assistant Helpers
  const addGroceryItems = (items: Array<Omit<GroceryListItem, 'id' | 'checked'>>) => {
    const now = Date.now();
    const mapped: GroceryListItem[] = items.map((item, idx) => ({
      id: `g-ai-${now}-${idx}`,
      name: item.name,
      category: item.category || 'Pantry',
      quantity: item.quantity || '1 item',
      checked: false,
      sourceLocation: item.sourceLocation || 'Gemini Assistant',
    }));
    setGroceryList(prev => [...mapped, ...prev]);
  };

  const addRecipeCard = (recipe: Omit<RecipeCardItem, 'id'>): RecipeCardItem => {
    const newCard: RecipeCardItem = {
      ...recipe,
      id: `rec-ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    setRecipes(prev => [newCard, ...prev]);
    return newCard;
  };

  const addWatchlistMediaItem = (item: Omit<WatchlistMediaItem, 'id'>): WatchlistMediaItem => {
    const newItem: WatchlistMediaItem = {
      ...item,
      id: `w-ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    setWatchlistMedia(prev => [newItem, ...prev]);
    return newItem;
  };

  // Medications & Prescriptions (shared with Daily Command Center)
  const toggleMedication = (id: string) => {
    setMedications(prev =>
      prev.map(m => {
        if (m.id === id) {
          const nextTaken = !m.takenToday;
          if (nextTaken) celebrate();
          return { ...m, takenToday: nextTaken };
        }
        return m;
      })
    );
  };

  const addMedication = (med: Omit<MedicationItem, 'id' | 'takenToday'>) => {
    setMedications(prev => [
      ...prev,
      {
        ...med,
        id: `med-${Date.now()}`,
        takenToday: false,
      },
    ]);
    celebrate();
  };

  const updateMedication = (id: string, update: Partial<MedicationItem>) => {
    setMedications(prev => prev.map(m => (m.id === id ? { ...m, ...update } : m)));
  };

  const deleteMedication = (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
  };

  // Supplements (shared with Daily Command Center)
  const toggleSupplement = (id: string) => {
    setSupplements(prev =>
      prev.map(s => {
        if (s.id === id) {
          const nextTaken = !s.takenToday;
          if (nextTaken) celebrate();
          return { ...s, takenToday: nextTaken };
        }
        return s;
      })
    );
  };

  const addSupplement = (sup: Omit<SupplementItem, 'id' | 'takenToday'>) => {
    setSupplements(prev => [
      ...prev,
      {
        ...sup,
        id: `sup-${Date.now()}`,
        takenToday: false,
      },
    ]);
    celebrate();
  };

  const updateSupplement = (id: string, update: Partial<SupplementItem>) => {
    setSupplements(prev => prev.map(s => (s.id === id ? { ...s, ...update } : s)));
  };

  const deleteSupplement = (id: string) => {
    setSupplements(prev => prev.filter(s => s.id !== id));
  };

  // Weather
  const updateWeather = (partial: Partial<WeatherData>) => {
    setWeather(prev => ({ ...prev, ...partial }));
  };

  // Health
  const updateHealth = (partial: Partial<AppleHealthData>) => {
    setHealth(prev => ({
      ...prev,
      ...partial,
    }));
  };

  // Macros
  const updateMacros = (partial: Partial<MacroData>) => {
    setMacros(prev => ({ ...prev, ...partial }));
  };

  // Priorities
  const togglePriority = (id: string) => {
    setPriorities(prev =>
      prev.map(p => {
        if (p.id === id) {
          const nextVal = !p.completed;
          if (nextVal) celebrate();
          return { ...p, completed: nextVal };
        }
        return p;
      })
    );
  };

  const updatePriorityText = (id: string, text: string) => {
    setPriorities(prev => prev.map(p => (p.id === id ? { ...p, text } : p)));
  };

  const addPriority = (text: string) => {
    if (!text.trim()) return;
    setPriorities(prev => [...prev, { id: `p-${Date.now()}`, text: text.trim(), completed: false }]);
  };

  // Todos
  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(t => {
        if (t.id === id) {
          const nextVal = !t.completed;
          if (nextVal) celebrate();
          return { ...t, completed: nextVal };
        }
        return t;
      })
    );
  };

  const addTodo = (todo: Omit<TodoItem, 'id'>) => {
    setTodos(prev => [{ ...todo, id: `t-${Date.now()}` }, ...prev]);
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  // Habits
  const toggleHabit = (id: string) => {
    const todayStr = '2026-11-12';
    setHabits(prev =>
      prev.map(h => {
        if (h.id === id) {
          const isDone = !h.completedToday;
          if (isDone) celebrate();
          const newStreak = isDone ? h.streak + 1 : Math.max(0, h.streak - 1);
          return {
            ...h,
            completedToday: isDone,
            streak: newStreak,
            history: {
              ...h.history,
              [todayStr]: isDone,
            },
          };
        }
        return h;
      })
    );
  };

  const addHabit = (habit: Omit<HabitItem, 'id' | 'streak' | 'history' | 'completedToday'>) => {
    setHabits(prev => [
      ...prev,
      {
        ...habit,
        id: `h-${Date.now()}`,
        streak: 0,
        completedToday: false,
        history: {},
      },
    ]);
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  // Bills
  const toggleBillPaid = (id: string) => {
    setBills(prev =>
      prev.map(b => {
        if (b.id === id) {
          const nextState = !b.isPaid;
          if (nextState) celebrate();
          return { ...b, isPaid: nextState };
        }
        return b;
      })
    );
  };

  const addBill = (bill: Omit<BillItem, 'id'>) => {
    setBills(prev => [...prev, { ...bill, id: `b-${Date.now()}` }]);
  };

  const deleteBill = (id: string) => {
    setBills(prev => prev.filter(b => b.id !== id));
  };

  // Important Dates
  const addImportantDate = (item: Omit<ImportantDate, 'id'>) => {
    setImportantDates(prev => [...prev, { ...item, id: `d-${Date.now()}` }]);
  };

  const deleteImportantDate = (id: string) => {
    setImportantDates(prev => prev.filter(d => d.id !== id));
  };

  // Cleaning
  const toggleChore = (id: string) => {
    setCleaningChores(prev =>
      prev.map(c => {
        if (c.id === id) {
          const done = !c.completed;
          if (done) celebrate();
          return { ...c, completed: done, lastDone: done ? 'Today' : c.lastDone };
        }
        return c;
      })
    );
  };

  const addChore = (chore: Omit<CleaningChore, 'id' | 'completed'>) => {
    setCleaningChores(prev => [...prev, { ...chore, id: `c-${Date.now()}`, completed: false }]);
  };

  const deleteChore = (id: string) => {
    setCleaningChores(prev => prev.filter(c => c.id !== id));
  };

  // Home Projects
  const updateProjectProgress = (id: string, progress: number) => {
    setHomeProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, progress: Math.min(100, Math.max(0, progress)) } : p))
    );
  };

  const toggleProjectTask = (projectId: string, taskId: string) => {
    setHomeProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          const updatedTasks = p.tasks.map(t => (t.id === taskId ? { ...t, done: !t.done } : t));
          const completedCount = updatedTasks.filter(t => t.done).length;
          const calculatedProgress = Math.round((completedCount / updatedTasks.length) * 100);
          return {
            ...p,
            tasks: updatedTasks,
            progress: calculatedProgress,
            status: calculatedProgress === 100 ? 'Completed' : 'In Progress',
          };
        }
        return p;
      })
    );
  };

  const addHomeProject = (project: Omit<HomeProject, 'id'>) => {
    setHomeProjects(prev => [...prev, { ...project, id: `hp-${Date.now()}` }]);
  };

  // Quick Notes
  const updateQuickNotes = (text: string) => {
    setQuickNotes(text);
  };

  // Kanban
  const moveKanbanTask = (taskId: string, newColumn: KanbanTask['column']) => {
    setKanbanTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          if (newColumn === 'done' && t.column !== 'done') celebrate();
          return { ...t, column: newColumn };
        }
        return t;
      })
    );
  };

  const addKanbanTask = (task: Omit<KanbanTask, 'id'>) => {
    setKanbanTasks(prev => [...prev, { ...task, id: `kb-${Date.now()}` }]);
  };

  const deleteKanbanTask = (id: string) => {
    setKanbanTasks(prev => prev.filter(t => t.id !== id));
  };

  // Meal Plan
  const updateMealPlanDay = (index: number, meals: Partial<MealPlanDay>) => {
    setMealPlan(prev =>
      prev.map((m, idx) => (idx === index ? { ...m, ...meals } : m))
    );
  };

  // Watchlist
  const addWatchlistItem = (item: Omit<WatchlistItem, 'id'>) => {
    setWatchlist(prev => [{ ...item, id: `w-${Date.now()}` }, ...prev]);
  };

  const updateWatchlistItemStatus = (id: string, status: WatchlistItem['status']) => {
    setWatchlist(prev => prev.map(w => (w.id === id ? { ...w, status } : w)));
  };

  const deleteWatchlistItem = (id: string) => {
    setWatchlist(prev => prev.filter(w => w.id !== id));
  };

  // Contacts
  const addContact = (contact: Omit<ContactItem, 'id'>) => {
    setContacts(prev => [...prev, { ...contact, id: `ct-${Date.now()}` }]);
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  // Notes
  const addNote = (note: Omit<NoteItem, 'id' | 'updatedAt'>) => {
    setNotes(prev => [
      {
        ...note,
        id: `n-${Date.now()}`,
        updatedAt: '2026-11-12',
      },
      ...prev,
    ]);
  };

  const updateNote = (id: string, update: Partial<NoteItem>) => {
    setNotes(prev =>
      prev.map(n =>
        n.id === id ? { ...n, ...update, updatedAt: '2026-11-12' } : n
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  // Documents
  const addDocument = (doc: Omit<DocumentItem, 'id'>) => {
    setDocuments(prev => [...prev, { ...doc, id: `doc-${Date.now()}` }]);
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  // Custom Pages
  const addCustomPage = (name: string, icon: string, color: string = '#be7fab') => {
    if (!name.trim()) return;
    const newId = name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20) || `page-${Date.now()}`;
    const newPage: CustomPage = {
      id: newId,
      name: name.trim(),
      icon: icon || 'FileText',
      color,
      notes: `Welcome to your custom page: ${name}! Jot down thoughts, checklists, and plans here.`,
      items: [
        { id: `item-1`, text: 'Add your first task or idea here', done: false },
      ],
      createdAt: '2026-11-12',
    };
    setCustomPages(prev => [...prev, newPage]);
    setActivePage(newId);
    celebrate();
  };

  const updateCustomPage = (id: string, update: Partial<CustomPage>) => {
    setCustomPages(prev => prev.map(p => (p.id === id ? { ...p, ...update } : p)));
  };

  const deleteCustomPage = (id: string) => {
    setCustomPages(prev => prev.filter(p => p.id !== id));
    if (activePage === id) {
      setActivePage('today');
    }
  };

  // User profile
  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...profile }));
  };

  // Habit Cards (Daily Habits Kanban Board)
  const moveHabitCard = (cardId: string, newColumn: 'todo' | 'done') => {
    setHabitCards(prev =>
      prev.map(c => {
        if (c.id === cardId) {
          if (newColumn === 'done' && c.column !== 'done') celebrate();
          return {
            ...c,
            column: newColumn,
            streak: newColumn === 'done' ? (c.streak || 0) + 1 : c.streak,
          };
        }
        return c;
      })
    );
  };

  const setWaterGlassesForHabit = (cardId: string, count: number) => {
    setHabitCards(prev =>
      prev.map(c => {
        if (c.id === cardId) {
          const clamped = Math.max(0, Math.min(8, count));
          if (clamped === 8) celebrate();
          const autoCol = clamped === 8 ? 'done' : 'todo';
          return {
            ...c,
            waterGlasses: clamped,
            column: autoCol,
          };
        }
        return c;
      })
    );
  };

  const addHabitCard = (card: Omit<HabitCard, 'id'>) => {
    setHabitCards(prev => [...prev, { ...card, id: `dh-${Date.now()}` }]);
    celebrate();
  };

  const deleteHabitCard = (id: string) => {
    setHabitCards(prev => prev.filter(c => c.id !== id));
  };

  // Calendar Notes per day
  const updateCalendarNote = (dateStr: string, note: string) => {
    setCalendarNotes(prev => ({ ...prev, [dateStr]: note }));
  };

  // Hourly schedule per date & hour
  const updateHourlySlot = (dateStr: string, hourStr: string, text: string) => {
    setHourlySchedule(prev => ({
      ...prev,
      [dateStr]: {
        ...(prev[dateStr] || {}),
        [hourStr]: text,
      },
    }));
  };

  // Auto-Rollover Unfinished Tasks past their due date
  const rolloverUnfinishedTasks = () => {
    const today = '2026-11-12';
    let changed = false;
    setKanbanTasks(prev =>
      prev.map(t => {
        if (t.column !== 'done' && t.dueDate && t.dueDate < today && t.column !== 'overdue') {
          changed = true;
          return { ...t, column: 'overdue' as const };
        }
        return t;
      })
    );
    if (changed) celebrate();
  };

  // Cloud Backup and Restore
  const backupToCloud = async (): Promise<boolean> => {
    setCloudBackupMeta(prev => ({ ...prev, status: 'syncing' }));
    
    // Simulate cloud sync delay for tactile realism
    await new Promise(r => setTimeout(r, 600));

    const now = new Date();
    const formatted = `Today at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    // Package whole state
    const allState = {
      weather,
      health,
      macros,
      priorities,
      todos,
      habits,
      bills,
      importantDates,
      cleaningChores,
      homeProjects,
      quickNotes,
      kanbanTasks,
      mealPlan,
      watchlist,
      contacts,
      notes,
      documents,
      customPages,
      userProfile,
      backupTimestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem('lifebinder_cloud_snapshot', JSON.stringify(allState));
      setCloudBackupMeta({
        lastBackupTime: formatted,
        status: 'synced',
        version: cloudBackupMeta.version + 1,
        autoSyncEnabled: true,
      });
      return true;
    } catch (e) {
      console.error(e);
      setCloudBackupMeta(prev => ({ ...prev, status: 'unsaved' }));
      return false;
    }
  };

  const exportBackupJSON = () => {
    const backupData = {
      app: 'LifeBinder Command Center',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {
        weather,
        health,
        macros,
        priorities,
        todos,
        habits,
        bills,
        importantDates,
        cleaningChores,
        homeProjects,
        quickNotes,
        kanbanTasks,
        mealPlan,
        watchlist,
        contacts,
        notes,
        documents,
        customPages,
        userProfile,
        medications,
        supplements,
      },
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LifeBinder_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importBackupJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      const data = parsed.data || parsed;
      if (data.health) setHealth(data.health);
      if (data.macros) setMacros(data.macros);
      if (data.priorities) setPriorities(data.priorities);
      if (data.todos) setTodos(data.todos);
      if (data.habits) setHabits(data.habits);
      if (data.bills) setBills(data.bills);
      if (data.importantDates) setImportantDates(data.importantDates);
      if (data.cleaningChores) setCleaningChores(data.cleaningChores);
      if (data.homeProjects) setHomeProjects(data.homeProjects);
      if (data.quickNotes) setQuickNotes(data.quickNotes);
      if (data.kanbanTasks) setKanbanTasks(data.kanbanTasks);
      if (data.mealPlan) setMealPlan(data.mealPlan);
      if (data.watchlist) setWatchlist(data.watchlist);
      if (data.contacts) setContacts(data.contacts);
      if (data.notes) setNotes(data.notes);
      if (data.documents) setDocuments(data.documents);
      if (data.customPages) setCustomPages(data.customPages);
      if (data.weather) setWeather(data.weather);
      if (data.userProfile) setUserProfile(data.userProfile);
      if (data.medications) setMedications(data.medications);
      if (data.supplements) setSupplements(data.supplements);

      setCloudBackupMeta({
        lastBackupTime: 'Just restored from file',
        status: 'synced',
        version: cloudBackupMeta.version + 1,
        autoSyncEnabled: true,
      });
      celebrate();
      return true;
    } catch (err) {
      console.error('Failed to import backup JSON', err);
      return false;
    }
  };

  const resetToSampleData = () => {
    setWeather(initialWeather);
    setHealth(initialAppleHealth);
    setMacros(initialMacros);
    setPriorities(initialPriorities);
    setTodos(initialTodos);
    setHabits(initialHabits);
    setBills(initialBills);
    setImportantDates(initialImportantDates);
    setCleaningChores(initialCleaningChores);
    setHomeProjects(initialHomeProjects);
    setQuickNotes(initialQuickNotes);
    setKanbanTasks(initialKanbanTasks);
    setMealPlan(initialMealPlan);
    setWatchlist(initialWatchlist);
    setContacts(initialContacts);
    setNotes(initialNotes);
    setDocuments(initialDocuments);
    setCustomPages(initialCustomPages);
    setUserProfile(initialUserProfile);
    setMedications(initialMedications);
    setSupplements(initialSupplements);
    setHabitCards(initialHabitCards);
    setCalendarNotes(initialCalendarNotes);
    setHourlySchedule(initialHourlySchedule);
    setAutoRolloverEnabled(true);
    setSelectedPlannerDate('2026-11-12');
    setActivePlannerTab('Daily');
    setCloudBackupMeta({
      lastBackupTime: 'Reset to sample data',
      status: 'synced',
      version: 1,
      autoSyncEnabled: true,
    });
  };

  return (
    <BinderContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        activePage,
        setActivePage,
        activeMealsTab,
        setActiveMealsTab,
        weather,
        updateWeather,
        health,
        updateHealth,
        macros,
        updateMacros,
        priorities,
        togglePriority,
        updatePriorityText,
        addPriority,
        todos,
        toggleTodo,
        addTodo,
        deleteTodo,
        habits,
        toggleHabit,
        addHabit,
        deleteHabit,
        bills,
        toggleBillPaid,
        addBill,
        deleteBill,
        importantDates,
        addImportantDate,
        deleteImportantDate,
        cleaningChores,
        toggleChore,
        addChore,
        deleteChore,
        homeProjects,
        updateProjectProgress,
        toggleProjectTask,
        addHomeProject,
        quickNotes,
        updateQuickNotes,
        kanbanTasks,
        moveKanbanTask,
        addKanbanTask,
        deleteKanbanTask,
        mealPlan,
        updateMealPlanDay,
        watchlist,
        addWatchlistItem,
        updateWatchlistItemStatus,
        deleteWatchlistItem,
        contacts,
        addContact,
        deleteContact,
        notes,
        addNote,
        updateNote,
        deleteNote,
        documents,
        addDocument,
        deleteDocument,
        customPages,
        addCustomPage,
        updateCustomPage,
        deleteCustomPage,
        userProfile,
        updateUserProfile,
        habitCards,
        moveHabitCard,
        setWaterGlassesForHabit,
        addHabitCard,
        deleteHabitCard,
        calendarNotes,
        updateCalendarNote,
        hourlySchedule,
        updateHourlySlot,
        autoRolloverEnabled,
        setAutoRolloverEnabled,
        rolloverUnfinishedTasks,
        selectedPlannerDate,
        setSelectedPlannerDate,
        activePlannerTab,
        setActivePlannerTab,
        cloudBackupMeta,
        backupToCloud,
        exportBackupJSON,
        importBackupJSON,
        resetToSampleData,
        celebrate,
        dayPlans,
        setDayPlans,
        favoriteFoods,
        setFavoriteFoods,
        foodInventories,
        setFoodInventories,
        groceryList,
        setGroceryList,
        addGroceryItems,
        recipes,
        setRecipes,
        addRecipeCard,
        watchlistMedia,
        setWatchlistMedia,
        addWatchlistMediaItem,
        activeWellnessTab,
        setActiveWellnessTab,
        medications,
        toggleMedication,
        addMedication,
        updateMedication,
        deleteMedication,
        supplements,
        toggleSupplement,
        addSupplement,
        updateSupplement,
        deleteSupplement,
      }}
    >
      {children}
    </BinderContext.Provider>
  );
};

export const useBinder = (): BinderContextType => {
  const context = useContext(BinderContext);
  if (!context) {
    throw new Error('useBinder must be used within a BinderProvider');
  }
  return context;
};
