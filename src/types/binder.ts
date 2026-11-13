export type PageId = 
  | 'today'
  | 'planner'
  | 'kanban'
  | 'habits'
  | 'finance'
  | 'cleaning'
  | 'wellness'
  | 'meals'
  | 'projects'
  | 'watchlist'
  | 'albums'
  | 'music'
  | 'contacts'
  | 'notes'
  | 'documents'
  | 'setup'
  | string;

export interface CustomPage {
  id: string;
  name: string;
  icon: string;
  color: string;
  notes: string;
  items: { id: string; text: string; done: boolean }[];
  createdAt: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: 'Sunny' | 'Partly Cloudy' | 'Cloudy' | 'Rainy' | 'Stormy' | 'Snowy';
  high: number;
  low: number;
  humidity: number;
  feelsLike: number;
}

export interface AppleHealthData {
  steps: {
    current: number;
    goal: number;
  };
  sleep: {
    hours: number;
    minutes: number;
    goalHours: number;
    quality: 'Deep & Restful' | 'Good' | 'Fair' | 'Restless';
  };
  calories: {
    burned: number;
    goal: number;
  };
  bloodSugar: {
    value: number; // mg/dL
    unit: 'mg/dL';
    status: 'Fasting' | 'Post-Meal' | 'Before Sleep' | 'Random';
    range: 'Normal' | 'Elevated' | 'Low';
  };
}

export interface MacroData {
  calories: { current: number; goal: number };
  protein: { current: number; goal: number }; // grams
  carbs: { current: number; goal: number }; // grams
  fat: { current: number; goal: number }; // grams
}

export interface PriorityItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string; // YYYY-MM-DD
  category: 'Personal' | 'Work' | 'Errand' | 'Health';
  priority: 'low' | 'medium' | 'high';
}

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  column: 'overdue' | 'high' | 'medium' | 'low' | 'done';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  dueDate?: string; // YYYY-MM-DD
  reminderTime?: string; // e.g., '09:00 AM'
  frequency: 'Once' | 'Daily' | 'Weekly' | 'Monthly';
  autoRollover: boolean;
}

export interface HabitCard {
  id: string;
  title: string;
  column: 'todo' | 'done';
  category: string;
  isWaterHabit?: boolean;
  waterGlasses?: number; // 0 to 8
  icon?: string;
  streak?: number;
}

export interface HabitItem {
  id: string;
  name: string;
  category: 'Wellness' | 'Productivity' | 'Mindfulness' | 'Home';
  streak: number;
  targetPerWeek: number;
  completedToday: boolean;
  history: { [dateStr: string]: boolean }; // YYYY-MM-DD: true
}

export interface BillItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  category: 'Utilities' | 'Subscriptions' | 'Housing' | 'Insurance' | 'Credit';
  isPaid: boolean;
  autopay: boolean;
}

export interface ImportantDate {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'Birthday' | 'Anniversary' | 'Appointment' | 'Deadline' | 'Holiday';
  reminderDaysBefore: number;
}

export interface CleaningChore {
  id: string;
  task: string;
  room: 'Kitchen' | 'Living Room' | 'Bedroom' | 'Bathroom' | 'Whole Home';
  frequency: 'Daily' | 'Weekly' | 'Bi-Weekly' | 'Monthly';
  completed: boolean;
  lastDone?: string;
}

export interface HomeProject {
  id: string;
  title: string;
  category: 'DIY' | 'Renovation' | 'Organization' | 'Garden';
  progress: number; // 0 - 100
  budget: number;
  spent: number;
  status: 'In Progress' | 'Planning' | 'Paused' | 'Completed';
  targetDate: string;
  tasks: { id: string; text: string; done: boolean }[];
}

export interface MealPlanDay {
  dayName: string; // Monday, Tuesday, etc.
  date: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
}

export interface WatchlistItem {
  id: string;
  title: string;
  type: 'Movie' | 'Series' | 'Book' | 'Podcast';
  status: 'Want to Watch' | 'In Progress' | 'Finished';
  rating: number; // 0 - 5
  genre?: string;
  notes?: string;
}

export interface WatchlistMediaItem {
  id: string;
  title: string;
  type: 'Series' | 'Movie' | 'Book' | 'Podcast';
  platform?: string;
  status: 'In Progress' | 'Want to Watch' | 'Finished';
  currentProgress: number;
  totalProgress: number;
  seasonsCount?: number;
  unit: string;
  rating: number;
  genre: string;
  notes?: string;
  imageSrc?: string;
  coverColor?: string;
}

export interface ContactItem {
  id: string;
  name: string;
  relation: 'Family' | 'Friend' | 'Work' | 'Professional' | 'Emergency' | 'Services';
  phone: string;
  email: string;
  birthday?: string;
  notes?: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: 'Personal' | 'Ideas' | 'Journal' | 'Recipes' | 'Lists';
  pinned: boolean;
  updatedAt: string;
  imageSrc?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'Identification' | 'Insurance' | 'Property' | 'Medical' | 'Vehicle';
  docNumber?: string;
  expirationDate?: string;
  location: string;
  notes?: string;
}

export interface UserProfile {
  name: string;
  tagline: string;
  avatarSeed: string;
  accentPreference: 'rose-teal' | 'teal-rose' | 'warm-gold';
}

export interface CloudBackupMeta {
  lastBackupTime: string | null;
  status: 'synced' | 'syncing' | 'unsaved' | 'local_only';
  version: number;
  autoSyncEnabled: boolean;
}
