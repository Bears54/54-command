export interface MeasurementPoint {
  id: string;
  name: string;
  currentInches: number;
  startingInches: number;
  goalInches: number;
  history: { date: string; value: number }[];
  x: number; // percentage in SVG coordinate space
  y: number;
  labelPosition: 'left' | 'right';
}

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  rxNumber?: string;
  pharmacy?: string;
  refillDate?: string;
  prescriber?: string;
  status: 'Active' | 'Need Refill' | 'Paused';
  takenToday: boolean;
}

export interface SupplementItem {
  id: string;
  name: string;
  dosage: string;
  timing: 'Morning' | 'Midday' | 'Evening' | 'Bedtime';
  purpose: string;
  takenToday: boolean;
}

export interface WeightRecord {
  date: string;
  weight: number; // lbs
  bodyFatPct?: number;
  notes?: string;
}

export interface WorkoutPlanDay {
  dayName: string; // Monday, Tuesday, etc.
  focus: string;
  completed: boolean;
  durationMins: number;
  caloriesBurned: number;
  exercises: string[];
}

export interface ExerciseCardItem {
  id: string;
  name: string;
  targetArea: 'Full Body' | 'Glutes & Legs' | 'Arms & Shoulders' | 'Core & Waist' | 'Back & Posture';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estCaloriesBurned: number; // per 10-15 mins
  recommendedSets: string;
  recommendedReps: string;
  instructions: string[];
  photoPlaceholderSvg: string; // custom illustrated SVG
  imageSrc?: string;
  equipment: string;
}

export interface NutritionMicros {
  fiber: { current: number; goal: number; unit: 'g' };
  sodium: { current: number; goal: number; unit: 'mg' };
  water: { current: number; goal: number; unit: 'oz' };
  vitaminD: { current: number; goal: number; unit: 'IU' };
  calcium: { current: number; goal: number; unit: 'mg' };
  iron: { current: number; goal: number; unit: 'mg' };
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  targetFocus: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMins: number;
  caloriesBurned: number;
  exercises: string[];
  notes?: string;
}

