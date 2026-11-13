import React, { useEffect, useRef, useState } from 'react';
import {
  CalendarDays,
  CheckSquare,
  Plus,
  Heart,
  Menu,
  ShoppingCart,
  StickyNote,
  UtensilsCrossed,
  Receipt,
  X,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';
import { BillItem, HabitItem, NoteItem, PageId, TodoItem } from '../../types/binder';

interface MobileBottomNavProps {
  onOpenSidebar: () => void;
}

type QuickAddType = 'todos' | 'habits' | 'grocery' | 'notes' | 'food' | 'bills';

interface ShortcutMeta {
  id: QuickAddType;
  label: string;
  subtitle: string;
  placeholder: string;
  icon: React.ReactNode;
  targetPage: PageId;
  targetPageLabel: string;
}

const SHORTCUTS: ShortcutMeta[] = [
  {
    id: 'todos',
    label: 'To-Dos',
    subtitle: 'Add to Today & Kanban',
    placeholder: 'e.g., Pick up prescriptions, email Sarah...',
    icon: <CheckSquare className="w-5 h-5" />,
    targetPage: 'kanban',
    targetPageLabel: 'Kanban Tasks',
  },
  {
    id: 'habits',
    label: 'Habits',
    subtitle: 'Track a daily routine',
    placeholder: 'e.g., 15-min evening stretch...',
    icon: <Heart className="w-5 h-5" />,
    targetPage: 'habits',
    targetPageLabel: 'Daily Habits',
  },
  {
    id: 'grocery',
    label: 'Grocery',
    subtitle: 'Add to Grocery List',
    placeholder: 'e.g., Honeycrisp apples, Greek yogurt...',
    icon: <ShoppingCart className="w-5 h-5" />,
    targetPage: 'meals',
    targetPageLabel: 'Meal Planning',
  },
  {
    id: 'notes',
    label: 'Notes',
    subtitle: 'Capture a quick note',
    placeholder: 'Note title (e.g., Weekend Pantry Ideas)...',
    icon: <StickyNote className="w-5 h-5" />,
    targetPage: 'notes',
    targetPageLabel: 'Notes',
  },
  {
    id: 'food',
    label: 'Food Diary',
    subtitle: 'Log meal & macros',
    placeholder: 'e.g., Grilled chicken & avocado bowl...',
    icon: <UtensilsCrossed className="w-5 h-5" />,
    targetPage: 'meals',
    targetPageLabel: 'Food Diary',
  },
  {
    id: 'bills',
    label: 'Bills',
    subtitle: 'Add upcoming payment',
    placeholder: 'e.g., WE Energies Electric...',
    icon: <Receipt className="w-5 h-5" />,
    targetPage: 'finance',
    targetPageLabel: 'Finance Hub',
  },
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenSidebar }) => {
  const {
    activePage,
    setActivePage,
    setActiveMealsTab,
    todos,
    habits,
    addTodo,
    addKanbanTask,
    addHabit,
    addHabitCard,
    addGroceryItems,
    addNote,
    dayPlans,
    setDayPlans,
    macros,
    updateMacros,
    addBill,
    celebrate,
  } = useBinder();

  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [activeQuickType, setActiveQuickType] = useState<QuickAddType | null>(null);

  // Shared primary text input + focused ref
  const [primaryText, setPrimaryText] = useState('');
  const primaryInputRef = useRef<HTMLInputElement>(null);

  // Type-specific fields
  const [todoCategory, setTodoCategory] = useState<TodoItem['category']>('Personal');
  const [todoPriority, setTodoPriority] = useState<TodoItem['priority']>('medium');

  const [habitCategory, setHabitCategory] = useState<HabitItem['category']>('Wellness');

  const [groceryQty, setGroceryQty] = useState('1');
  const [groceryCat, setGroceryCat] = useState('Produce');

  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<NoteItem['category']>('Personal');

  const [foodSlot, setFoodSlot] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks'>('lunch');
  const [foodDayIndex, setFoodDayIndex] = useState<number>(() => {
    const idx = dayPlans.findIndex((d) => d.dayName.toLowerCase().includes('today'));
    return idx >= 0 ? idx : 0;
  });
  const [foodCalories, setFoodCalories] = useState('');
  const [foodProtein, setFoodProtein] = useState('');

  const [billAmount, setBillAmount] = useState('');
  const [billCategory, setBillCategory] = useState<BillItem['category']>('Utilities');
  const [billDueDate, setBillDueDate] = useState('2026-11-12');
  const [billAutopay, setBillAutopay] = useState(false);

  const [savedToast, setSavedToast] = useState<{
    message: string;
    page: PageId;
    label: string;
    mealsTab?: 'planner' | 'inventory' | 'recipes';
  } | null>(null);

  const pendingTodosCount = todos.filter((t) => !t.completed).length;
  const pendingHabitsCount = habits.filter((h) => !h.completedToday).length;

  // Focus primary text box immediately whenever a quick-add modal opens
  useEffect(() => {
    if (!activeQuickType) return;
    primaryInputRef.current?.focus();
    const raf = requestAnimationFrame(() => {
      primaryInputRef.current?.focus();
    });
    const timer = window.setTimeout(() => {
      primaryInputRef.current?.focus();
    }, 50);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [activeQuickType]);

  // Dismiss toast automatically
  useEffect(() => {
    if (!savedToast) return;
    const t = window.setTimeout(() => setSavedToast(null), 3500);
    return () => clearTimeout(t);
  }, [savedToast]);

  const openQuickModal = (type: QuickAddType) => {
    setIsQuickMenuOpen(false);
    setPrimaryText('');
    setNoteContent('');
    setFoodCalories('');
    setFoodProtein('');
    setBillAmount('');
    setGroceryQty('1');
    setActiveQuickType(type);
  };

  const handleSaveQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = primaryText.trim();
    if (!cleanText || !activeQuickType) return;

    switch (activeQuickType) {
      case 'todos': {
        addTodo({
          title: cleanText,
          completed: false,
          dueDate: '2026-11-12',
          category: todoCategory,
          priority: todoPriority,
        });
        addKanbanTask({
          title: cleanText,
          column: todoPriority,
          priority: todoPriority,
          tags: [todoCategory],
          dueDate: '2026-11-12',
          frequency: 'Once',
          autoRollover: true,
        });
        setSavedToast({
          message: `Added to-do: "${cleanText}"`,
          page: 'kanban',
          label: 'View To-Dos',
        });
        break;
      }

      case 'habits': {
        addHabit({
          name: cleanText,
          category: habitCategory,
          targetPerWeek: 7,
        });
        addHabitCard({
          title: cleanText,
          column: 'todo',
          category: habitCategory,
          streak: 0,
        });
        setSavedToast({
          message: `Added habit: "${cleanText}"`,
          page: 'habits',
          label: 'View Habits',
        });
        break;
      }

      case 'grocery': {
        addGroceryItems([
          {
            name: cleanText,
            quantity: groceryQty.trim() || '1',
            category: groceryCat,
          },
        ]);
        setSavedToast({
          message: `Added "${cleanText}" to Grocery List`,
          page: 'meals',
          label: 'Open Groceries',
          mealsTab: 'inventory',
        });
        break;
      }

      case 'notes': {
        addNote({
          title: cleanText,
          content: noteContent.trim() || cleanText,
          category: noteCategory,
          pinned: false,
        });
        setSavedToast({
          message: `Saved note: "${cleanText}"`,
          page: 'notes',
          label: 'Open Notes',
        });
        break;
      }

      case 'food': {
        const cals = Number(foodCalories) || 0;
        const prot = Number(foodProtein) || 0;
        const targetIdx = Math.min(Math.max(foodDayIndex, 0), Math.max(dayPlans.length - 1, 0));

        setDayPlans((prev) =>
          prev.map((day, idx) =>
            idx === targetIdx
              ? {
                  ...day,
                  [foodSlot]: [
                    ...day[foodSlot],
                    {
                      id: `meal-${Date.now()}`,
                      name: cleanText,
                      serving: '1 serving',
                      macros: {
                        calories: cals,
                        protein: prot,
                        carbs: 0,
                        fat: 0,
                      },
                    },
                  ],
                }
              : day
          )
        );

        if (cals > 0 || prot > 0) {
          updateMacros({
            calories: {
              ...macros.calories,
              current: macros.calories.current + cals,
            },
            protein: {
              ...macros.protein,
              current: macros.protein.current + prot,
            },
          });
        }

        setSavedToast({
          message: `Logged "${cleanText}" to Food Diary`,
          page: 'meals',
          label: 'View Diary',
          mealsTab: 'planner',
        });
        break;
      }

      case 'bills': {
        const amt = parseFloat(billAmount) || 0;
        addBill({
          title: cleanText,
          amount: amt,
          dueDate: billDueDate || '2026-11-12',
          category: billCategory,
          isPaid: false,
          autopay: billAutopay,
        });
        setSavedToast({
          message: `Added bill: "${cleanText}" ($${amt.toFixed(2)})`,
          page: 'finance',
          label: 'Finance Hub',
        });
        break;
      }
    }

    celebrate();
    setActiveQuickType(null);
    setPrimaryText('');
  };

  const activeMeta = SHORTCUTS.find((s) => s.id === activeQuickType);

  return (
    <>
      {/* Toast Notification after Quick Save */}
      {savedToast && (
        <div className="lg:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#1c0f19] border border-[#be7fab] text-[#2d1b28] dark:text-[#efd0e5] shadow-[0_8px_28px_rgba(45,27,40,0.22)] dark:shadow-[0_0_24px_rgba(190,127,171,0.5)] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-[#be7fab] shrink-0" />
            <span className="text-xs font-semibold truncate">{savedToast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (savedToast.mealsTab) {
                setActiveMealsTab(savedToast.mealsTab);
              }
              setActivePage(savedToast.page);
              setSavedToast(null);
            }}
            className="flex items-center gap-0.5 text-[11px] font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] px-2.5 py-1 rounded-lg shrink-0"
          >
            <span>{savedToast.label}</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Quick Add Pop-Up Backdrop */}
      {isQuickMenuOpen && (
        <div
          onClick={() => setIsQuickMenuOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-[#2d1b28]/45 dark:bg-[#120a10]/75 backdrop-blur-xs animate-in fade-in duration-150"
          aria-hidden="true"
        />
      )}

      {/* Interactive Dark Rose-Mauve Quick Add Pop-Up Menu */}
      {isQuickMenuOpen && (
        <div
          role="dialog"
          aria-label="Quick Add Shortcuts"
          className="lg:hidden fixed bottom-22 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm rounded-3xl p-4 bg-white dark:bg-[#1c0f19] border border-[#be7fab] shadow-[0_12px_40px_rgba(45,27,40,0.28)] dark:shadow-[0_0_38px_rgba(190,127,171,0.45)] animate-in fade-in slide-in-from-bottom-3 duration-150"
        >
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#d29ec2] dark:border-[#be7fab]/30">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#be7fab] text-[#120a10] shadow-[0_0_10px_rgba(190,127,171,0.5)]">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <div>
                <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] leading-none">
                  Quick Add Command
                </h3>
                <p className="text-[10px] text-[#2d1b28]/70 dark:text-[#e6c3db]/75 mt-0.5 font-mono">
                  Tap a module to type &amp; save instantly
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsQuickMenuOpen(false)}
              className="p-1.5 rounded-lg text-[#be7fab] dark:text-[#daabcb] hover:bg-[#be7fab]/20"
              aria-label="Close Quick Add menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {SHORTCUTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openQuickModal(item.id)}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#efd0e5]/55 dark:bg-[#120a10]/85 border border-[#d29ec2] dark:border-[#be7fab]/45 hover:border-[#be7fab] hover:bg-[#e6c3db] dark:hover:bg-[#be7fab]/20 text-[#2d1b28] dark:text-[#efd0e5] active:scale-95 transition-all text-center"
              >
                <span className="p-2 rounded-xl bg-white dark:bg-[#be7fab]/20 border border-[#d29ec2] dark:border-[#be7fab]/50 text-[#be7fab] dark:text-[#daabcb] shadow-2xs">
                  {item.icon}
                </span>
                <span className="text-xs font-bold leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Instant-Focus Quick Add Input Modal */}
      {activeQuickType && activeMeta && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-[#2d1b28]/60 dark:bg-[#120a10]/85 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setActiveQuickType(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="hud-panel hud-corners w-full max-w-md p-5 bg-white dark:bg-[#1c0f19] border border-[#be7fab] shadow-[0_0_40px_rgba(190,127,171,0.45)] animate-in slide-in-from-bottom-4 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2] dark:border-[#be7fab]/30">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#be7fab] text-[#120a10] shadow-[0_0_12px_rgba(190,127,171,0.55)]">
                  {activeMeta.icon}
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5] leading-tight">
                    Quick Add {activeMeta.label}
                  </h3>
                  <p className="text-[11px] text-[#2d1b28]/70 dark:text-[#e6c3db]/80">
                    {activeMeta.subtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveQuickType(null)}
                className="p-1.5 rounded-lg text-[#be7fab] dark:text-[#daabcb] hover:bg-[#be7fab]/20"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickAdd} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#2d1b28] dark:text-[#e6c3db] mb-1">
                  {activeQuickType === 'notes'
                    ? 'Note Title'
                    : activeQuickType === 'bills'
                    ? 'Bill / Payee Name'
                    : activeQuickType === 'food'
                    ? 'Food or Meal Name'
                    : activeQuickType === 'grocery'
                    ? 'Grocery Item'
                    : activeQuickType === 'habits'
                    ? 'Habit Name'
                    : 'To-Do Task'}
                </label>
                <input
                  ref={primaryInputRef}
                  type="text"
                  autoFocus
                  value={primaryText}
                  onChange={(e) => setPrimaryText(e.target.value)}
                  placeholder={activeMeta.placeholder}
                  required
                  className="w-full px-3.5 py-2.5 text-sm font-medium bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/55 border-2 border-[#be7fab] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#be7fab]/40"
                />
              </div>

              {/* Contextual Quick Options */}
              {activeQuickType === 'todos' && (
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">
                      Category
                    </label>
                    <select
                      value={todoCategory}
                      onChange={(e) => setTodoCategory(e.target.value as TodoItem['category'])}
                      className="w-full px-2.5 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-xl"
                    >
                      <option value="Personal">Personal</option>
                      <option value="Work">Work</option>
                      <option value="Errand">Errand</option>
                      <option value="Health">Health</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">
                      Priority
                    </label>
                    <select
                      value={todoPriority}
                      onChange={(e) => setTodoPriority(e.target.value as TodoItem['priority'])}
                      className="w-full px-2.5 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-xl"
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>
                </div>
              )}

              {activeQuickType === 'habits' && (
                <div>
                  <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">
                    Habit Category
                  </label>
                  <select
                    value={habitCategory}
                    onChange={(e) => setHabitCategory(e.target.value as HabitItem['category'])}
                    className="w-full px-2.5 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-xl"
                  >
                    <option value="Wellness">Wellness</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Mindfulness">Mindfulness</option>
                    <option value="Home">Home</option>
                  </select>
                </div>
              )}

              {activeQuickType === 'grocery' && (
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">
                      Quantity
                    </label>
                    <input
                      type="text"
                      value={groceryQty}
                      onChange={(e) => setGroceryQty(e.target.value)}
                      placeholder="e.g., 2 lbs"
                      className="w-full px-2.5 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">
                      Aisle / Category
                    </label>
                    <select
                      value={groceryCat}
                      onChange={(e) => setGroceryCat(e.target.value)}
                      className="w-full px-2.5 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-xl"
                    >
                      <option value="Produce">Produce</option>
                      <option value="Proteins & Meat">Proteins &amp; Meat</option>
                      <option value="Dairy & Eggs">Dairy &amp; Eggs</option>
                      <option value="Pantry & Dry Goods">Pantry &amp; Dry Goods</option>
                      <option value="Frozen">Frozen</option>
                      <option value="Beverages">Beverages</option>
                    </select>
                  </div>
                </div>
              )}

              {activeQuickType === 'notes' && (
                <>
                  <div>
                    <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">
                      Note Details (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Write your thoughts, reminders, or checklist..."
                      className="w-full px-3 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/55 border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-xl resize-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">
                      Folder / Category
                    </label>
                    <select
                      value={noteCategory}
                      onChange={(e) => setNoteCategory(e.target.value as NoteItem['category'])}
                      className="w-full px-2.5 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-xl"
                    >
                      <option value="Personal">Personal</option>
                      <option value="Ideas">Ideas</option>
                      <option value="Journal">Journal</option>
                      <option value="Recipes">Recipes</option>
                      <option value="Lists">Lists</option>
                    </select>
                  </div>
                </>
              )}

              {activeQuickType === 'food' && (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">
                        Day
                      </label>
                      <select
                        value={foodDayIndex}
                        onChange={(e) => setFoodDayIndex(Number(e.target.value))}
                        className="w-full px-2.5 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-xl"
                      >
                        {dayPlans.map((d, i) => (
                          <option key={d.dayName} value={i}>
                            {d.dayName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">
                        Meal Slot
                      </label>
                      <select
                        value={foodSlot}
                        onChange={(e) =>
                          setFoodSlot(
                            e.target.value as 'breakfast' | 'lunch' | 'dinner' | 'snacks'
                          )
                        }
                        className="w-full px-2.5 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-xl"
                      >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snacks">Snacks</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">
                        Calories (optional)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={foodCalories}
                        onChange={(e) => setFoodCalories(e.target.value)}
                        placeholder="e.g., 420"
                        className="w-full px-2.5 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">
                        Protein g (optional)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={foodProtein}
                        onChange={(e) => setFoodProtein(e.target.value)}
                        placeholder="e.g., 32"
                        className="w-full px-2.5 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-xl font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeQuickType === 'bills' && (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">
                        Amount ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={billAmount}
                        onChange={(e) => setBillAmount(e.target.value)}
                        placeholder="e.g., 145.00"
                        className="w-full px-2.5 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">
                        Category
                      </label>
                      <select
                        value={billCategory}
                        onChange={(e) => setBillCategory(e.target.value as BillItem['category'])}
                        className="w-full px-2.5 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-xl"
                      >
                        <option value="Utilities">Utilities</option>
                        <option value="Housing">Housing</option>
                        <option value="Credit">Credit</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Subscriptions">Subscriptions</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 items-center">
                    <div>
                      <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={billDueDate}
                        onChange={(e) => setBillDueDate(e.target.value)}
                        className="w-full px-2.5 py-2 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-xl font-mono"
                      />
                    </div>
                    <label className="flex items-center gap-2 pt-5 cursor-pointer text-[#2d1b28] dark:text-[#e6c3db] font-semibold">
                      <input
                        type="checkbox"
                        checked={billAutopay}
                        onChange={(e) => setBillAutopay(e.target.checked)}
                        className="rounded accent-[#be7fab]"
                      />
                      <span>Autopay On</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#d29ec2]/60 dark:border-[#be7fab]/25">
                <button
                  type="button"
                  onClick={() => setActiveQuickType(null)}
                  className="px-3.5 py-2 text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#be7fab] hover:bg-[#d29ec2] text-[#120a10] font-bold rounded-xl shadow-[0_0_16px_rgba(190,127,171,0.5)] transition-all active:scale-95"
                >
                  Save {activeMeta.label}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fixed Mobile & Tablet Bottom Navigation Bar (< 1024px only) */}
      <nav
        aria-label="Mobile and Tablet Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#1c0f19]/95 backdrop-blur-md border-t border-[#d29ec2] dark:border-[#be7fab]/45 shadow-[0_-8px_28px_rgba(45,27,40,0.14)] dark:shadow-[0_-8px_32px_rgba(0,0,0,0.75)] px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5 transition-colors"
      >
        <div className="max-w-xl mx-auto grid grid-cols-5 items-end">
          {/* 1. Today */}
          <button
            type="button"
            onClick={() => {
              setIsQuickMenuOpen(false);
              setActivePage('today');
            }}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-all ${
              activePage === 'today'
                ? 'text-[#be7fab] dark:text-[#efd0e5] font-bold'
                : 'text-[#2d1b28]/70 dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]'
            }`}
          >
            <span
              className={`p-1.5 rounded-xl transition-all ${
                activePage === 'today'
                  ? 'bg-[#e6c3db] dark:bg-[#be7fab]/25 border border-[#be7fab]/60 shadow-[0_0_12px_rgba(190,127,171,0.35)]'
                  : ''
              }`}
            >
              <CalendarDays className="w-4.5 h-4.5" />
            </span>
            <span className="text-[10px] tracking-tight">Today</span>
          </button>

          {/* 2. To-Do's */}
          <button
            type="button"
            onClick={() => {
              setIsQuickMenuOpen(false);
              setActivePage('kanban');
            }}
            className={`relative flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-all ${
              activePage === 'kanban'
                ? 'text-[#be7fab] dark:text-[#efd0e5] font-bold'
                : 'text-[#2d1b28]/70 dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]'
            }`}
          >
            <span
              className={`relative p-1.5 rounded-xl transition-all ${
                activePage === 'kanban'
                  ? 'bg-[#e6c3db] dark:bg-[#be7fab]/25 border border-[#be7fab]/60 shadow-[0_0_12px_rgba(190,127,171,0.35)]'
                  : ''
              }`}
            >
              <CheckSquare className="w-4.5 h-4.5" />
              {pendingTodosCount > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] px-1 rounded-full bg-[#be7fab] text-[#120a10] text-[9px] font-mono font-bold flex items-center justify-center">
                  {pendingTodosCount}
                </span>
              )}
            </span>
            <span className="text-[10px] tracking-tight">To-Do&rsquo;s</span>
          </button>

          {/* 3. Center Raised #be7fab + Quick Add Button */}
          <div className="flex flex-col items-center justify-end">
            <button
              type="button"
              onClick={() => setIsQuickMenuOpen((prev) => !prev)}
              aria-expanded={isQuickMenuOpen}
              aria-label="Open Quick Add menu"
              className={`w-14 h-14 -mt-7 rounded-full bg-[#be7fab] hover:bg-[#d29ec2] text-[#120a10] border-4 border-[#efd0e5] dark:border-[#120a10] shadow-[0_0_24px_rgba(190,127,171,0.7)] flex items-center justify-center transition-all active:scale-95 ${
                isQuickMenuOpen ? 'ring-2 ring-[#efd0e5] dark:ring-[#efd0e5]/80' : ''
              }`}
            >
              <Plus
                className={`w-6 h-6 stroke-[2.6] transition-transform duration-200 ${
                  isQuickMenuOpen ? 'rotate-45' : ''
                }`}
              />
            </button>
            <span className="text-[10px] font-bold text-[#be7fab] dark:text-[#daabcb] mt-0.5 tracking-tight">
              Quick Add
            </span>
          </div>

          {/* 4. Habits */}
          <button
            type="button"
            onClick={() => {
              setIsQuickMenuOpen(false);
              setActivePage('habits');
            }}
            className={`relative flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-all ${
              activePage === 'habits'
                ? 'text-[#be7fab] dark:text-[#efd0e5] font-bold'
                : 'text-[#2d1b28]/70 dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]'
            }`}
          >
            <span
              className={`relative p-1.5 rounded-xl transition-all ${
                activePage === 'habits'
                  ? 'bg-[#e6c3db] dark:bg-[#be7fab]/25 border border-[#be7fab]/60 shadow-[0_0_12px_rgba(190,127,171,0.35)]'
                  : ''
              }`}
            >
              <Heart className="w-4.5 h-4.5" />
              {pendingHabitsCount > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] px-1 rounded-full bg-[#daabcb] text-[#120a10] text-[9px] font-mono font-bold flex items-center justify-center">
                  {pendingHabitsCount}
                </span>
              )}
            </span>
            <span className="text-[10px] tracking-tight">Habits</span>
          </button>

          {/* 5. Menu (Opens slide-out sidebar drawer) */}
          <button
            type="button"
            onClick={() => {
              setIsQuickMenuOpen(false);
              onOpenSidebar();
            }}
            className="flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl text-[#2d1b28]/70 dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] transition-all"
          >
            <span className="p-1.5 rounded-xl">
              <Menu className="w-4.5 h-4.5" />
            </span>
            <span className="text-[10px] tracking-tight">Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
};
