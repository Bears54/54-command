import React, { useState, useEffect } from 'react';
import {
  Heart,
  Ruler,
  Pill,
  Dumbbell,
  Activity,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';
import { HealthMeasurementsView } from '../wellness/HealthMeasurementsView';
import { MedicationsSupplementsView } from '../wellness/MedicationsSupplementsView';
import { FitnessRoutinesView } from '../wellness/FitnessRoutinesView';
import {
  initialWeightRecords,
  initialNutritionMicros,
  initialWorkoutPlan,
  initialWorkoutRoutines,
  initialExerciseCards,
  normalizeMeasurements,
} from '../../data/wellnessInitialData';
import {
  MeasurementPoint,
  WeightRecord,
  WorkoutPlanDay,
  WorkoutRoutine,
  ExerciseCardItem,
  NutritionMicros,
} from '../../types/wellness';

const STORAGE_PREFIX = 'lifebinder_wellness_v2';

export const WellnessPage: React.FC = () => {
  const {
    health,
    updateHealth,
    macros,
    updateMacros,
    activeWellnessTab,
    setActiveWellnessTab,
    medications,
    supplements,
    celebrate,
  } = useBinder();

  const [measurements, setMeasurements] = useState<MeasurementPoint[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}_measurements`);
      return normalizeMeasurements(saved ? JSON.parse(saved) : null);
    } catch {
      return normalizeMeasurements(null);
    }
  });

  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}_weight`);
      return saved ? JSON.parse(saved) : initialWeightRecords;
    } catch {
      return initialWeightRecords;
    }
  });

  const [micros, setMicros] = useState<NutritionMicros>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}_micros`);
      return saved ? JSON.parse(saved) : initialNutritionMicros;
    } catch {
      return initialNutritionMicros;
    }
  });

  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlanDay[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}_workouts`);
      return saved ? JSON.parse(saved) : initialWorkoutPlan;
    } catch {
      return initialWorkoutPlan;
    }
  });

  const [routines, setRoutines] = useState<WorkoutRoutine[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}_routines`);
      return saved ? JSON.parse(saved) : initialWorkoutRoutines;
    } catch {
      return initialWorkoutRoutines;
    }
  });

  const [exerciseCards, setExerciseCards] = useState<ExerciseCardItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}_exercises`);
      return saved ? JSON.parse(saved) : initialExerciseCards;
    } catch {
      return initialExerciseCards;
    }
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_measurements`, JSON.stringify(measurements));
  }, [measurements]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_weight`, JSON.stringify(weightRecords));
  }, [weightRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_micros`, JSON.stringify(micros));
  }, [micros]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_workouts`, JSON.stringify(workoutPlan));
  }, [workoutPlan]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_routines`, JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_exercises`, JSON.stringify(exerciseCards));
  }, [exerciseCards]);

  const handleUpdateMeasurement = (
    id: string,
    newInches: number,
    dateStr: string = 'Nov 12, 2026'
  ) => {
    setMeasurements((prev) =>
      prev.map((pt) => {
        if (pt.id === id) {
          const updatedHistory = [...pt.history, { date: dateStr, value: newInches }];
          return {
            ...pt,
            currentInches: newInches,
            history: updatedHistory,
          };
        }
        return pt;
      })
    );
  };

  const handleAddWeightRecord = (record: WeightRecord) => {
    setWeightRecords((prev) => [...prev, record]);
  };

  const handleUpdateMicros = (partial: Partial<NutritionMicros>) => {
    setMicros((prev) => ({ ...prev, ...partial }));
  };

  const handleToggleWorkoutDay = (dayName: string) => {
    setWorkoutPlan((prev) =>
      prev.map((w) => (w.dayName === dayName ? { ...w, completed: !w.completed } : w))
    );
  };

  const handleUpdateWorkoutDay = (dayName: string, update: Partial<WorkoutPlanDay>) => {
    setWorkoutPlan((prev) =>
      prev.map((w) => (w.dayName === dayName ? { ...w, ...update } : w))
    );
  };

  const handleAddRoutine = (routine: Omit<WorkoutRoutine, 'id'>) => {
    setRoutines((prev) => [{ ...routine, id: `routine-${Date.now()}` }, ...prev]);
    celebrate();
  };

  const handleUpdateRoutine = (id: string, update: Partial<WorkoutRoutine>) => {
    setRoutines((prev) => prev.map((r) => (r.id === id ? { ...r, ...update } : r)));
  };

  const handleDeleteRoutine = (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddExerciseCard = (card: Omit<ExerciseCardItem, 'id' | 'photoPlaceholderSvg'>) => {
    setExerciseCards((prev) => [
      {
        ...card,
        id: `ex-${Date.now()}`,
        photoPlaceholderSvg: 'custom',
      },
      ...prev,
    ]);
  };

  const handleUpdateExerciseCard = (id: string, update: Partial<ExerciseCardItem>) => {
    setExerciseCards((prev) => prev.map((ex) => (ex.id === id ? { ...ex, ...update } : ex)));
  };

  const handleDeleteExerciseCard = (id: string) => {
    setExerciseCards((prev) => prev.filter((ex) => ex.id !== id));
  };

  const handleLogCaloriesBurned = (kcal: number) => {
    updateHealth({
      calories: {
        ...health.calories,
        burned: health.calories.burned + kcal,
      },
    });
  };

  const pendingRxSupCount =
    medications.filter((m) => m.status !== 'Paused' && !m.takenToday).length +
    supplements.filter((s) => !s.takenToday).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/30">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#be7fab]/20 border border-[#be7fab]/45 text-[#be7fab] dark:text-[#daabcb]">
              <Heart className="w-5 h-5" />
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
              Wellness &amp; Vitality Hub
            </h1>
          </div>
          <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/80 mt-1">
            Health &amp; Body Measurements · Medications, Prescriptions &amp; Supplements · Fitness Planner, Routines &amp; Exercise Cards
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-[#1c0f19] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/45 whitespace-nowrap">
          <Activity className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />
          <span>Vitals &amp; Rx Telemetry Active</span>
        </div>
      </div>

      {/* 3 Clear Sub-Tabs */}
      <div className="hud-panel p-1.5">
        <nav className="grid grid-cols-1 md:grid-cols-3 gap-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveWellnessTab('health-measurements')}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              activeWellnessTab === 'health-measurements'
                ? 'bg-[#be7fab] text-[#120a10] shadow-[0_0_12px_rgba(190,127,171,0.45)] font-bold'
                : 'text-[#2d1b28]/80 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:bg-[#be7fab]/15'
            }`}
          >
            <Ruler className="w-4 h-4 shrink-0" />
            <span>1. Health &amp; Measurements</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveWellnessTab('meds-supplements')}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              activeWellnessTab === 'meds-supplements'
                ? 'bg-[#be7fab] text-[#120a10] shadow-[0_0_12px_rgba(190,127,171,0.45)] font-bold'
                : 'text-[#2d1b28]/80 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:bg-[#be7fab]/15'
            }`}
          >
            <Pill className="w-4 h-4 shrink-0" />
            <span>2. Meds, Rx &amp; Supplements</span>
            {pendingRxSupCount > 0 && (
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  activeWellnessTab === 'meds-supplements'
                    ? 'bg-[#120a10] text-[#efd0e5]'
                    : 'bg-[#be7fab]/25 dark:bg-[#be7fab]/30 text-[#2d1b28] dark:text-[#efd0e5]'
                }`}
              >
                {pendingRxSupCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveWellnessTab('fitness-routines')}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              activeWellnessTab === 'fitness-routines'
                ? 'bg-[#be7fab] text-[#120a10] shadow-[0_0_12px_rgba(190,127,171,0.45)] font-bold'
                : 'text-[#2d1b28]/80 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:bg-[#be7fab]/15'
            }`}
          >
            <Dumbbell className="w-4 h-4 shrink-0" />
            <span>3. Fitness Planner, Routines &amp; Cards</span>
          </button>
        </nav>
      </div>

      {/* Active Tab Content */}
      {activeWellnessTab === 'health-measurements' && (
        <HealthMeasurementsView
          measurements={measurements}
          onUpdateMeasurement={handleUpdateMeasurement}
          health={health}
          onUpdateHealth={updateHealth}
          macros={macros}
          onUpdateMacros={updateMacros}
          weightRecords={weightRecords}
          onAddWeightRecord={handleAddWeightRecord}
          micros={micros}
          onUpdateMicros={handleUpdateMicros}
          celebrate={celebrate}
        />
      )}

      {activeWellnessTab === 'meds-supplements' && <MedicationsSupplementsView />}

      {activeWellnessTab === 'fitness-routines' && (
        <FitnessRoutinesView
          workoutPlan={workoutPlan}
          onToggleWorkoutDay={handleToggleWorkoutDay}
          onUpdateWorkoutDay={handleUpdateWorkoutDay}
          routines={routines}
          onAddRoutine={handleAddRoutine}
          onUpdateRoutine={handleUpdateRoutine}
          onDeleteRoutine={handleDeleteRoutine}
          exerciseCards={exerciseCards}
          onAddExerciseCard={handleAddExerciseCard}
          onUpdateExerciseCard={handleUpdateExerciseCard}
          onDeleteExerciseCard={handleDeleteExerciseCard}
          onLogCaloriesBurned={handleLogCaloriesBurned}
          celebrate={celebrate}
        />
      )}
    </div>
  );
};
