import { 
  MeasurementPoint, 
  MedicationItem, 
  SupplementItem, 
  WeightRecord, 
  WorkoutPlanDay, 
  WorkoutRoutine,
  ExerciseCardItem, 
  NutritionMicros 
} from '../types/wellness';

export const initialMeasurementPoints: MeasurementPoint[] = [
  {
    id: 'neck',
    name: 'Neck',
    currentInches: 13.5,
    startingInches: 14.25,
    goalInches: 13.0,
    history: [
      { date: 'Sep 1, 2026', value: 14.25 },
      { date: 'Oct 1, 2026', value: 13.8 },
      { date: 'Nov 1, 2026', value: 13.5 },
    ],
    x: 50,
    y: 22.5,
    labelPosition: 'left'
  },
  {
    id: 'chest',
    name: 'Chest',
    currentInches: 36.0,
    startingInches: 37.5,
    goalInches: 35.0,
    history: [
      { date: 'Sep 1, 2026', value: 37.5 },
      { date: 'Oct 1, 2026', value: 36.8 },
      { date: 'Nov 1, 2026', value: 36.0 },
    ],
    x: 50,
    y: 27.5,
    labelPosition: 'right'
  },
  {
    id: 'arm',
    name: 'Arm',
    currentInches: 11.75,
    startingInches: 12.5,
    goalInches: 11.25,
    history: [
      { date: 'Sep 1, 2026', value: 12.5 },
      { date: 'Oct 1, 2026', value: 12.1 },
      { date: 'Nov 1, 2026', value: 11.75 },
    ],
    x: 36,
    y: 32.5,
    labelPosition: 'left'
  },
  {
    id: 'bust',
    name: 'Bust',
    currentInches: 38.0,
    startingInches: 39.5,
    goalInches: 37.0,
    history: [
      { date: 'Sep 1, 2026', value: 39.5 },
      { date: 'Oct 1, 2026', value: 38.75 },
      { date: 'Nov 1, 2026', value: 38.0 },
    ],
    x: 50,
    y: 33.5,
    labelPosition: 'right'
  },
  {
    id: 'stomach',
    name: 'Stomach',
    currentInches: 31.25,
    startingInches: 33.5,
    goalInches: 29.0,
    history: [
      { date: 'Sep 1, 2026', value: 33.5 },
      { date: 'Oct 1, 2026', value: 32.3 },
      { date: 'Nov 1, 2026', value: 31.25 },
    ],
    x: 50,
    y: 39.5,
    labelPosition: 'left'
  },
  {
    id: 'waist',
    name: 'Waist',
    currentInches: 29.5,
    startingInches: 32.0,
    goalInches: 27.5,
    history: [
      { date: 'Sep 1, 2026', value: 32.0 },
      { date: 'Oct 1, 2026', value: 30.75 },
      { date: 'Nov 1, 2026', value: 29.5 },
    ],
    x: 50,
    y: 44.5,
    labelPosition: 'right'
  },
  {
    id: 'hips',
    name: 'Hips',
    currentInches: 39.5,
    startingInches: 42.0,
    goalInches: 38.0,
    history: [
      { date: 'Sep 1, 2026', value: 42.0 },
      { date: 'Oct 1, 2026', value: 40.8 },
      { date: 'Nov 1, 2026', value: 39.5 },
    ],
    x: 42.5,
    y: 52.5,
    labelPosition: 'left'
  },
  {
    id: 'thighs',
    name: 'Thighs',
    currentInches: 22.0,
    startingInches: 23.75,
    goalInches: 21.0,
    history: [
      { date: 'Sep 1, 2026', value: 23.75 },
      { date: 'Oct 1, 2026', value: 22.8 },
      { date: 'Nov 1, 2026', value: 22.0 },
    ],
    x: 57,
    y: 63.5,
    labelPosition: 'right'
  },
  {
    id: 'calves',
    name: 'Calves',
    currentInches: 14.25,
    startingInches: 15.0,
    goalInches: 13.75,
    history: [
      { date: 'Sep 1, 2026', value: 15.0 },
      { date: 'Oct 1, 2026', value: 14.6 },
      { date: 'Nov 1, 2026', value: 14.25 },
    ],
    x: 44,
    y: 78.5,
    labelPosition: 'left'
  }
];

export function normalizeMeasurements(saved: MeasurementPoint[] | null | undefined): MeasurementPoint[] {
  if (!Array.isArray(saved) || saved.length === 0) return initialMeasurementPoints;
  const legacyMap: Record<string, string> = {
    'left-arm': 'arm',
    'right-arm': 'arm',
    'left-thigh': 'thighs',
    'right-thigh': 'thighs',
  };
  const byId = new Map<string, MeasurementPoint>();
  for (const item of saved) {
    const mappedId = legacyMap[item.id] || item.id;
    if (!byId.has(mappedId)) {
      byId.set(mappedId, item);
    }
  }
  return initialMeasurementPoints.map((def) => {
    const existing = byId.get(def.id);
    if (!existing) return def;
    return {
      ...def,
      currentInches: existing.currentInches ?? def.currentInches,
      startingInches: existing.startingInches ?? def.startingInches,
      goalInches: existing.goalInches ?? def.goalInches,
      history: Array.isArray(existing.history) && existing.history.length > 0 ? existing.history : def.history,
    };
  });
}

export const initialMedications: MedicationItem[] = [
  {
    id: 'med-1',
    name: 'Levothyroxine',
    dosage: '75 mcg Tablet',
    frequency: 'Once Daily (Morning fasting with water)',
    rxNumber: 'RX-748201',
    pharmacy: 'Froedtert Community Pharmacy',
    refillDate: 'Dec 4, 2026',
    prescriber: 'Dr. Sarah Mitchell, MD',
    status: 'Active',
    takenToday: true,
  },
  {
    id: 'med-2',
    name: 'Metformin HCl',
    dosage: '500 mg Extended Release',
    frequency: 'Twice Daily (With meals)',
    rxNumber: 'RX-693110',
    pharmacy: 'Froedtert Community Pharmacy',
    refillDate: 'Nov 28, 2026',
    prescriber: 'Dr. Sarah Mitchell, MD',
    status: 'Active',
    takenToday: true,
  },
  {
    id: 'med-3',
    name: 'Omeprazole',
    dosage: '20 mg Delayed-Release Capsule',
    frequency: 'Once Daily (30 min before breakfast)',
    rxNumber: 'RX-512994',
    pharmacy: 'CVS Pharmacy - West Bend',
    refillDate: 'Dec 18, 2026',
    prescriber: 'Dr. Daniel Vance, DO',
    status: 'Active',
    takenToday: false,
  }
];

export const initialSupplements: SupplementItem[] = [
  {
    id: 'sup-1',
    name: 'Vitamin D3 + K2 (MK-7)',
    dosage: '5,000 IU / 100 mcg',
    timing: 'Morning',
    purpose: 'Bone health, immune defense & mood',
    takenToday: true,
  },
  {
    id: 'sup-2',
    name: 'Wild Alaskan Fish Oil (Omega-3)',
    dosage: '1,200 mg (720 mg EPA / DHA)',
    timing: 'Midday',
    purpose: 'Cardiovascular & joint mobility',
    takenToday: true,
  },
  {
    id: 'sup-3',
    name: 'Magnesium Glycinate',
    dosage: '400 mg Elemental',
    timing: 'Bedtime',
    purpose: 'Deep restorative sleep & muscle recovery',
    takenToday: false,
  },
  {
    id: 'sup-4',
    name: 'Hydrolyzed Multi-Collagen Peptides',
    dosage: '1 Scoop (11g Protein)',
    timing: 'Morning',
    purpose: 'Skin elasticity, gut lining & joints',
    takenToday: true,
  },
  {
    id: 'sup-5',
    name: 'Spore Probiotic Complex',
    dosage: '50 Billion CFU',
    timing: 'Evening',
    purpose: 'Gut microbiome & digestion',
    takenToday: false,
  }
];

export const initialWeightRecords: WeightRecord[] = [
  { date: 'Sep 1, 2026', weight: 156.0, bodyFatPct: 29.2, notes: 'Initial baseline weigh-in' },
  { date: 'Sep 15, 2026', weight: 153.2, bodyFatPct: 28.5 },
  { date: 'Oct 1, 2026', weight: 149.8, bodyFatPct: 27.6, notes: 'Broke 150 milestone!' },
  { date: 'Oct 15, 2026', weight: 146.4, bodyFatPct: 26.8 },
  { date: 'Nov 1, 2026', weight: 143.8, bodyFatPct: 26.0 },
  { date: 'Nov 12, 2026', weight: 142.5, bodyFatPct: 25.4, notes: 'Current official weigh-in' },
];

export const initialNutritionMicros: NutritionMicros = {
  fiber: { current: 31, goal: 35, unit: 'g' },
  sodium: { current: 1650, goal: 2000, unit: 'mg' },
  water: { current: 72, goal: 80, unit: 'oz' },
  vitaminD: { current: 4800, goal: 5000, unit: 'IU' },
  calcium: { current: 950, goal: 1000, unit: 'mg' },
  iron: { current: 16, goal: 18, unit: 'mg' },
};

export const initialWorkoutPlan: WorkoutPlanDay[] = [
  {
    dayName: 'Monday',
    focus: 'Lower Body Sculpt & Glute Activation',
    completed: true,
    durationMins: 45,
    caloriesBurned: 320,
    exercises: ['Goblet Squats (4x12)', 'Romanian Deadlifts (4x10)', 'Glute Bridges (3x15)', 'Walking Lunges (3x20)']
  },
  {
    dayName: 'Tuesday',
    focus: 'Upper Body Tone & Posture',
    completed: true,
    durationMins: 40,
    caloriesBurned: 280,
    exercises: ['Dumbbell Overhead Press (3x12)', 'Dumbbell Rows (4x12)', 'Bicep to Hammer Curls (3x12)', 'Tricep Kickbacks (3x15)']
  },
  {
    dayName: 'Wednesday',
    focus: 'Active Recovery Walk & Mobility Flow',
    completed: true,
    durationMins: 35,
    caloriesBurned: 190,
    exercises: ['30-Min Brisk Outdoor Walk', 'Hip Flexor Stretch', 'Thoracic Spine Openers', 'Cat-Cow Flow']
  },
  {
    dayName: 'Thursday',
    focus: 'Full-Body Metabolic Toning (Today)',
    completed: false,
    durationMins: 45,
    caloriesBurned: 340,
    exercises: ['Kettlebell Swings (4x15)', 'Push-Up to Downward Dog (3x10)', 'Plank Hip Dips (3x20)', 'Band Lateral Walks (3x15)']
  },
  {
    dayName: 'Friday',
    focus: 'Pilates Core & Waist Cincher',
    completed: false,
    durationMins: 40,
    caloriesBurned: 250,
    exercises: ['Pilates Hundred', 'Bicycle Crunches (3x20)', 'Side Plank Rotations (3x10)', 'Bird-Dog Hold']
  },
  {
    dayName: 'Saturday',
    focus: 'HIIT Cardio Burst & Stretch',
    completed: false,
    durationMins: 30,
    caloriesBurned: 290,
    exercises: ['Interval Treadmill Incline Walk', 'Jump Rope Intervals', 'Full-Body Deep Stretch']
  },
  {
    dayName: 'Sunday',
    focus: 'Restorative Day of Rest & Bath Soak',
    completed: false,
    durationMins: 0,
    caloriesBurned: 0,
    exercises: ['Epsom Salt Warm Bath', 'Mindful Breathwork', 'Gentle Leg Elevation']
  }
];

export const initialExerciseCards: ExerciseCardItem[] = [
  {
    id: 'ex-1',
    name: 'Goblet Squats & Pulse',
    targetArea: 'Glutes & Legs',
    difficulty: 'Beginner',
    estCaloriesBurned: 95,
    recommendedSets: '4 Sets',
    recommendedReps: '12-15 Reps',
    equipment: '1 Kettlebell or Dumbbell (15–25 lbs)',
    photoPlaceholderSvg: 'squat',
    instructions: [
      'Hold kettlebell close to your chest with both hands under the horns, elbows tucked in.',
      'Stand with feet slightly wider than hip-width apart, toes turned out 15 degrees.',
      'Inhale and sit your hips back and down until thighs are parallel to the floor.',
      'Add a small 2-inch pulse at the bottom, then drive through heels to stand, squeezing glutes.'
    ]
  },
  {
    id: 'ex-2',
    name: 'Dumbbell Romanian Deadlift (RDL)',
    targetArea: 'Glutes & Legs',
    difficulty: 'Intermediate',
    estCaloriesBurned: 85,
    recommendedSets: '4 Sets',
    recommendedReps: '10-12 Reps',
    equipment: 'Pair of Dumbbells (15–20 lbs each)',
    photoPlaceholderSvg: 'deadlift',
    instructions: [
      'Stand with feet hip-width apart, knees slightly unlocked, weights resting in front of thighs.',
      'Hinge at your hips by pushing hips backward while keeping a flat back and proud chest.',
      'Lower weights along shins until you feel a deep stretch in hamstrings.',
      'Engage glutes and push hips forward to return to starting upright posture.'
    ]
  },
  {
    id: 'ex-3',
    name: 'Overhead Dumbbell Push Press',
    targetArea: 'Arms & Shoulders',
    difficulty: 'Beginner',
    estCaloriesBurned: 75,
    recommendedSets: '3 Sets',
    recommendedReps: '12 Reps',
    equipment: 'Pair of Dumbbells (10–15 lbs each)',
    photoPlaceholderSvg: 'overhead',
    instructions: [
      'Hold dumbbells at shoulder height with palms facing inward, elbows slightly in front.',
      'Dip knees slightly and use leg drive to press dumbbells overhead in a smooth arc.',
      'Lock out arms gently at the top with core engaged, preventing lower back arching.',
      'Lower under control back to shoulders over 2 seconds.'
    ]
  },
  {
    id: 'ex-4',
    name: 'Plank Hip Dips & Core Hold',
    targetArea: 'Core & Waist',
    difficulty: 'Intermediate',
    estCaloriesBurned: 65,
    recommendedSets: '3 Sets',
    recommendedReps: '20 Dips (10 each side)',
    equipment: 'Exercise Mat',
    photoPlaceholderSvg: 'plank',
    instructions: [
      'Start in a forearm plank with elbows directly under shoulders, body forming a straight line.',
      'Rotate hips to the right, tapping hip bone lightly 1 inch from the mat.',
      'Return to center, then rotate to the left side in a fluid, controlled motion.',
      'Focus on drawing belly button tight toward spine to carve the obliques.'
    ]
  },
  {
    id: 'ex-5',
    name: 'Resistance Band Lateral Walks',
    targetArea: 'Glutes & Legs',
    difficulty: 'Beginner',
    estCaloriesBurned: 70,
    recommendedSets: '3 Sets',
    recommendedReps: '15 Steps Left, 15 Right',
    equipment: 'Loop Resistance Band (Medium/Heavy)',
    photoPlaceholderSvg: 'band',
    instructions: [
      'Place loop band around thighs 2 inches above knees (or around ankles for extra burn).',
      'Lower into a quarter-squat position, keeping chest lifted and knees tracking over toes.',
      'Take a wide lateral step to the right, followed by the left foot while keeping tension on the band.',
      'Complete 15 steps in one direction, then reverse without standing up.'
    ]
  },
  {
    id: 'ex-6',
    name: 'Push-Up to Downward Dog',
    targetArea: 'Full Body',
    difficulty: 'Intermediate',
    estCaloriesBurned: 90,
    recommendedSets: '3 Sets',
    recommendedReps: '10-12 Reps',
    equipment: 'Exercise Mat',
    photoPlaceholderSvg: 'pushup',
    instructions: [
      'Start in standard high plank position with hands slightly wider than shoulders.',
      'Lower chest under control into a full push-up (or knees down if modifying).',
      'Press back up, then push hips back and up into Downward Facing Dog position.',
      'Pedal heels down to stretch calves and hamstrings before returning to high plank.'
    ]
  }
];

export const initialWorkoutRoutines: WorkoutRoutine[] = [
  {
    id: 'routine-1',
    name: 'Full-Body Metabolic Sculpt',
    targetFocus: 'Full Body Burn & Toning',
    difficulty: 'Intermediate',
    durationMins: 45,
    caloriesBurned: 340,
    exercises: [
      'Goblet Squats & Pulse (4x12)',
      'Push-Up to Downward Dog (3x10)',
      'Plank Hip Dips & Core Hold (3x20)',
      'Resistance Band Lateral Walks (3x15)',
    ],
    notes: 'Ideal 3-4x weekly fat-burning strength circuit with 45s rest between sets.',
  },
  {
    id: 'routine-2',
    name: 'Lower Body & Glute Architecture',
    targetFocus: 'Glutes, Hamstrings & Legs',
    difficulty: 'Intermediate',
    durationMins: 45,
    caloriesBurned: 320,
    exercises: [
      'Goblet Squats & Pulse (4x12)',
      'Dumbbell Romanian Deadlift (4x10)',
      'Glute Bridges (3x15)',
      'Walking Lunges (3x20)',
    ],
    notes: 'Focus on slow eccentric lowering and controlled glute squeeze at lockout.',
  },
  {
    id: 'routine-3',
    name: 'Pilates Waist Cincher & Posture',
    targetFocus: 'Deep Core, Obliques & Arms',
    difficulty: 'Beginner',
    durationMins: 35,
    caloriesBurned: 230,
    exercises: [
      'Overhead Dumbbell Push Press (3x12)',
      'Plank Hip Dips & Core Hold (3x20)',
      'Pilates Hundred + Slow Roll-Ups',
      'Bird-Dog Stability Holds (3x12)',
    ],
    notes: 'Low-impact mat flow for waist definition and upper back alignment.',
  },
];

