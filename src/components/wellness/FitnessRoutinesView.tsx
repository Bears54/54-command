import React, { useState } from 'react';
import {
  Dumbbell,
  Plus,
  CheckCircle2,
  Circle,
  Edit2,
  Check,
  Upload,
  X,
  Trash2,
  Flame,
  Calendar,
  Sparkles,
  Camera,
  Wand2,
  Loader2,
} from 'lucide-react';
import { WorkoutPlanDay, WorkoutRoutine, ExerciseCardItem } from '../../types/wellness';
import { generateCoverImage } from '../../utils/coverImageApi';

interface FitnessRoutinesViewProps {
  workoutPlan: WorkoutPlanDay[];
  onToggleWorkoutDay: (dayName: string) => void;
  onUpdateWorkoutDay: (dayName: string, update: Partial<WorkoutPlanDay>) => void;
  routines: WorkoutRoutine[];
  onAddRoutine: (routine: Omit<WorkoutRoutine, 'id'>) => void;
  onUpdateRoutine: (id: string, update: Partial<WorkoutRoutine>) => void;
  onDeleteRoutine: (id: string) => void;
  exerciseCards: ExerciseCardItem[];
  onAddExerciseCard: (card: Omit<ExerciseCardItem, 'id' | 'photoPlaceholderSvg'>) => void;
  onUpdateExerciseCard: (id: string, update: Partial<ExerciseCardItem>) => void;
  onDeleteExerciseCard: (id: string) => void;
  onLogCaloriesBurned: (kcal: number) => void;
  celebrate: () => void;
}

export const FitnessRoutinesView: React.FC<FitnessRoutinesViewProps> = ({
  workoutPlan,
  onToggleWorkoutDay,
  onUpdateWorkoutDay,
  routines,
  onAddRoutine,
  onUpdateRoutine,
  onDeleteRoutine,
  exerciseCards,
  onAddExerciseCard,
  onUpdateExerciseCard,
  onDeleteExerciseCard,
  onLogCaloriesBurned,
  celebrate,
}) => {
  // Edit Weekly Planner Day modal
  const [editingDay, setEditingDay] = useState<WorkoutPlanDay | null>(null);
  const [dayFocus, setDayFocus] = useState('');
  const [dayDuration, setDayDuration] = useState(40);
  const [dayCalories, setDayCalories] = useState(280);
  const [dayExercisesText, setDayExercisesText] = useState('');

  // Custom Routine Builder modal
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [rName, setRName] = useState('');
  const [rFocus, setRFocus] = useState('');
  const [rDifficulty, setRDifficulty] = useState<WorkoutRoutine['difficulty']>('Intermediate');
  const [rDuration, setRDuration] = useState(40);
  const [rCalories, setRCalories] = useState(300);
  const [rExercisesText, setRExercisesText] = useState('');
  const [rNotes, setRNotes] = useState('');
  const [assignDayMap, setAssignDayMap] = useState<Record<string, string>>({});

  // Exercise Cards modal & filter
  const [targetFilter, setTargetFilter] = useState<string>('All');
  const [isAddExModalOpen, setIsAddExModalOpen] = useState(false);
  const [exName, setExName] = useState('');
  const [exTarget, setExTarget] = useState<ExerciseCardItem['targetArea']>('Full Body');
  const [exDifficulty, setExDifficulty] = useState<ExerciseCardItem['difficulty']>('Intermediate');
  const [exCalories, setExCalories] = useState(85);
  const [exSets, setExSets] = useState('3 Sets');
  const [exReps, setExReps] = useState('12 Reps');
  const [exEquipment, setExEquipment] = useState('Dumbbells / Exercise Mat');
  const [exInstructionsText, setExInstructionsText] = useState('');
  const [exPreviewImage, setExPreviewImage] = useState<string | undefined>(undefined);
  const [generatingExId, setGeneratingExId] = useState<string | null>(null);
  const [isGeneratingNewExCover, setIsGeneratingNewExCover] = useState(false);

  const handleGenerateExerciseCover = async (
    ex: ExerciseCardItem,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (generatingExId) return;
    setGeneratingExId(ex.id);
    try {
      const { imageDataUrl } = await generateCoverImage({
        title: ex.name,
        kind: 'exercise',
        subtitle: `${ex.targetArea} · ${ex.difficulty} · ${ex.equipment}`,
      });
      onUpdateExerciseCard(ex.id, { imageSrc: imageDataUrl });
      celebrate();
    } catch (err) {
      console.error('Failed to generate exercise cover image:', err);
    } finally {
      setGeneratingExId(null);
    }
  };

  const handleGenerateNewExerciseModalCover = async () => {
    const titleVal = exName.trim() || `${exTarget} Workout Exercise`;
    if (isGeneratingNewExCover) return;
    setIsGeneratingNewExCover(true);
    try {
      const { imageDataUrl } = await generateCoverImage({
        title: titleVal,
        kind: 'exercise',
        subtitle: `${exTarget} · ${exDifficulty} · ${exEquipment}`,
      });
      setExPreviewImage(imageDataUrl);
      celebrate();
    } catch (err) {
      console.error('Failed to generate new exercise cover image:', err);
    } finally {
      setIsGeneratingNewExCover(false);
    }
  };

  const openEditDayModal = (day: WorkoutPlanDay) => {
    setEditingDay(day);
    setDayFocus(day.focus);
    setDayDuration(day.durationMins);
    setDayCalories(day.caloriesBurned);
    setDayExercisesText(day.exercises.join('\n'));
  };

  const handleSaveDayEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDay) return;
    const exercises = dayExercisesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    onUpdateWorkoutDay(editingDay.dayName, {
      focus: dayFocus.trim() || 'Custom Workout',
      durationMins: Number(dayDuration) || 0,
      caloriesBurned: Number(dayCalories) || 0,
      exercises,
    });
    setEditingDay(null);
    celebrate();
  };

  const applyRoutineToDay = (routine: WorkoutRoutine, dayName: string) => {
    if (!dayName) return;
    onUpdateWorkoutDay(dayName, {
      focus: routine.name,
      durationMins: routine.durationMins,
      caloriesBurned: routine.caloriesBurned,
      exercises: routine.exercises,
    });
    celebrate();
  };

  const openAddRoutine = () => {
    setEditingRoutineId(null);
    setRName('');
    setRFocus('');
    setRDifficulty('Intermediate');
    setRDuration(40);
    setRCalories(300);
    setRExercisesText('');
    setRNotes('');
    setIsRoutineModalOpen(true);
  };

  const openEditRoutine = (r: WorkoutRoutine) => {
    setEditingRoutineId(r.id);
    setRName(r.name);
    setRFocus(r.targetFocus);
    setRDifficulty(r.difficulty);
    setRDuration(r.durationMins);
    setRCalories(r.caloriesBurned);
    setRExercisesText(r.exercises.join('\n'));
    setRNotes(r.notes || '');
    setIsRoutineModalOpen(true);
  };

  const handleSaveRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rName.trim()) return;
    const payload: Omit<WorkoutRoutine, 'id'> = {
      name: rName.trim(),
      targetFocus: rFocus.trim() || 'Full-Body Conditioning',
      difficulty: rDifficulty,
      durationMins: Number(rDuration) || 30,
      caloriesBurned: Number(rCalories) || 250,
      exercises: rExercisesText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      notes: rNotes.trim() || undefined,
    };

    if (editingRoutineId) {
      onUpdateRoutine(editingRoutineId, payload);
      celebrate();
    } else {
      onAddRoutine(payload);
    }
    setIsRoutineModalOpen(false);
  };

  const handleExerciseImageUpload = (exerciseId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      if (dataUrl) {
        onUpdateExerciseCard(exerciseId, { imageSrc: dataUrl });
        celebrate();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNewExercisePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setExPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveNewExerciseCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exName.trim()) return;
    const instructions = exInstructionsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    onAddExerciseCard({
      name: exName.trim(),
      targetArea: exTarget,
      difficulty: exDifficulty,
      estCaloriesBurned: Number(exCalories) || 80,
      recommendedSets: exSets.trim() || '3 Sets',
      recommendedReps: exReps.trim() || '12 Reps',
      equipment: exEquipment.trim() || 'Bodyweight',
      instructions:
        instructions.length > 0
          ? instructions
          : ['Perform controlled reps focusing on target muscle activation and steady breathing.'],
      imageSrc: exPreviewImage,
    });
    setExName('');
    setExInstructionsText('');
    setExPreviewImage(undefined);
    setIsAddExModalOpen(false);
    celebrate();
  };

  const filteredExercises =
    targetFilter === 'All'
      ? exerciseCards
      : exerciseCards.filter((ex) => ex.targetArea === targetFilter);

  return (
    <div className="space-y-6">
      {/* Section A: Editable Weekly Fitness Planner */}
      <div className="hud-panel hud-corners p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#e6c3db] dark:bg-[#be7fab]/20 text-[#be7fab] dark:text-[#daabcb]">
              <Calendar className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                Editable Weekly Fitness Planner
              </h3>
              <p className="text-xs text-[#2d1b28]/70 dark:text-[#e6c3db]/75">
                Click any day to mark complete, or tap the Edit pencil to customize focus &amp; exercises
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-white dark:text-[#120a10] bg-[#be7fab] dark:bg-[#daabcb] px-2.5 py-1 rounded-lg font-mono">
            {workoutPlan.filter((w) => w.completed).length} / 7 Workouts Complete
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {workoutPlan.map((day) => (
            <div
              key={day.dayName}
              onClick={() => {
                onToggleWorkoutDay(day.dayName);
                if (!day.completed) celebrate();
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                day.completed
                  ? 'bg-[#e6c3db]/75 dark:bg-[#be7fab]/20 border-[#be7fab] text-[#2d1b28] dark:text-[#efd0e5] shadow-[0_0_14px_rgba(190,127,171,0.22)]'
                  : day.focus.includes('Today')
                  ? 'bg-[#efd0e5]/75 dark:bg-[#241420] border-[#be7fab] dark:border-[#daabcb] ring-1 ring-[#be7fab]/45 dark:ring-[#daabcb]/50'
                  : 'bg-[#efd0e5]/40 dark:bg-[#120a10]/80 border-[#d29ec2] dark:border-[#be7fab]/25 hover:border-[#be7fab]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-[#d29ec2]/50 dark:border-[#be7fab]/20">
                  <span className="text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] truncate">{day.dayName}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDayModal(day);
                      }}
                      className="p-1 rounded text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:bg-[#e6c3db] dark:hover:bg-[#be7fab]/25 transition-colors"
                      title={`Edit ${day.dayName}`}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {day.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#be7fab]" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#be7fab]/55 dark:text-[#d29ec2]/50" />
                    )}
                  </div>
                </div>

                <div className="mt-2 text-[11px] font-semibold text-[#2d1b28] dark:text-[#efd0e5] leading-snug">
                  {day.focus}
                </div>

                <div className="mt-2 text-[10px] text-[#2d1b28]/75 dark:text-[#e6c3db]/75 space-y-0.5">
                  {day.exercises.slice(0, 3).map((ex, i) => (
                    <div key={i} className="truncate">
                      · {ex}
                    </div>
                  ))}
                  {day.exercises.length > 3 && (
                    <div className="text-[9px] text-[#be7fab] dark:text-[#daabcb] font-mono font-semibold">
                      +{day.exercises.length - 3} more
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20 flex items-center justify-between text-[10px] font-mono text-[#2d1b28]/75 dark:text-[#e6c3db]">
                <span>{day.durationMins} min</span>
                <span className="font-bold text-[#be7fab] dark:text-[#daabcb]">~{day.caloriesBurned} kcal</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section B: Custom Workout Routine Builder */}
      <div className="hud-panel hud-corners p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#e6c3db] dark:bg-[#be7fab]/20 text-[#be7fab] dark:text-[#daabcb]">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                Custom Workout Routine Builder
              </h3>
              <p className="text-xs text-[#2d1b28]/70 dark:text-[#e6c3db]/75">
                Build, edit, and assign custom training routines to any day in your planner
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddRoutine}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white dark:text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl shadow-[0_0_12px_rgba(190,127,171,0.35)] transition-all whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Routine</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {routines.map((routine) => {
            const selectedDay = assignDayMap[routine.id] || 'Monday';
            return (
              <div
                key={routine.id}
                className="p-4 rounded-2xl bg-[#e6c3db]/45 dark:bg-[#120a10]/85 border border-[#d29ec2] dark:border-[#be7fab]/35 hover:border-[#be7fab] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#d29ec2]/50 dark:border-[#be7fab]/20">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#be7fab] dark:text-[#daabcb] font-bold">
                        {routine.difficulty} · {routine.targetFocus}
                      </span>
                      <h4 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] mt-0.5">
                        {routine.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditRoutine(routine)}
                        className="p-1 text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded"
                        title="Edit routine"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteRoutine(routine.id)}
                        className="p-1 text-[#2d1b28]/55 dark:text-[#d29ec2]/60 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded"
                        title="Delete routine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-[#2d1b28]/80 dark:text-[#e6c3db] my-2.5">
                    <span>{routine.durationMins} mins</span>
                    <span>·</span>
                    <span className="text-[#be7fab] dark:text-[#daabcb] font-bold">~{routine.caloriesBurned} kcal</span>
                  </div>

                  <ul className="space-y-1 text-xs text-[#2d1b28]/85 dark:text-[#e6c3db]/85 mb-3">
                    {routine.exercises.map((ex, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#be7fab] font-mono font-bold">·</span>
                        <span>{ex}</span>
                      </li>
                    ))}
                  </ul>

                  {routine.notes && (
                    <p className="text-[11px] text-[#2d1b28]/75 dark:text-[#d29ec2]/80 italic bg-white/80 dark:bg-[#1c0f19] p-2 rounded-lg border border-[#d29ec2] dark:border-[#be7fab]/20 mb-3">
                      {routine.notes}
                    </p>
                  )}
                </div>

                <div className="pt-2.5 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20 flex items-center gap-2">
                  <select
                    value={selectedDay}
                    onChange={(e) =>
                      setAssignDayMap((prev) => ({ ...prev, [routine.id]: e.target.value }))
                    }
                    className="flex-1 px-2 py-1 text-[11px] bg-white dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/35 rounded-lg text-[#2d1b28] dark:text-[#efd0e5]"
                  >
                    {workoutPlan.map((d) => (
                      <option key={d.dayName} value={d.dayName}>
                        {d.dayName}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => applyRoutineToDay(routine, selectedDay)}
                    className="px-2.5 py-1 text-[11px] font-bold bg-[#be7fab] dark:bg-[#daabcb] hover:bg-[#d29ec2] dark:hover:bg-[#efd0e5] text-white dark:text-[#120a10] rounded-lg whitespace-nowrap transition-colors"
                  >
                    Assign to Day
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section C: Exercise Cards */}
      <div className="hud-panel hud-corners p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#e6c3db] dark:bg-[#be7fab]/20 text-[#be7fab] dark:text-[#daabcb]">
              <Dumbbell className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                Visual Exercise Cards
              </h3>
              <p className="text-xs text-[#2d1b28]/70 dark:text-[#e6c3db]/75">
                Tappable photo upload area, step-by-step form instructions, and calories burned
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddExModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white dark:text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl shadow-[0_0_12px_rgba(190,127,171,0.35)] transition-all whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Exercise Card</span>
          </button>
        </div>

        {/* Target Area Filter */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {['All', 'Full Body', 'Glutes & Legs', 'Arms & Shoulders', 'Core & Waist', 'Back & Posture'].map(
            (area) => (
              <button
                key={area}
                type="button"
                onClick={() => setTargetFilter(area)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-all whitespace-nowrap ${
                  targetFilter === area
                    ? 'bg-[#be7fab] dark:bg-[#daabcb] text-white dark:text-[#120a10]'
                    : 'bg-[#efd0e5]/55 dark:bg-[#120a10]/80 text-[#2d1b28]/80 dark:text-[#e6c3db] border border-[#d29ec2] dark:border-[#be7fab]/30 hover:border-[#be7fab]'
                }`}
              >
                {area}
              </button>
            )
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExercises.map((ex) => (
            <div
              key={ex.id}
              className="p-4 rounded-2xl bg-[#e6c3db]/45 dark:bg-[#120a10]/85 border border-[#d29ec2] dark:border-[#be7fab]/35 hover:border-[#be7fab] transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Tappable Photo Upload Area */}
                <label className="relative w-full h-44 bg-linear-to-br from-[#efd0e5] to-[#e6c3db] dark:from-[#241420] dark:to-[#1c0f19] rounded-xl border border-[#d29ec2] dark:border-[#be7fab]/35 overflow-hidden flex flex-col items-center justify-center group/photo cursor-pointer block">
                  {ex.imageSrc ? (
                    <img
                      src={ex.imageSrc}
                      alt={ex.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center h-full">
                      <Dumbbell className="w-8 h-8 text-[#be7fab] dark:text-[#daabcb] mb-1.5 group-hover/photo:text-[#2d1b28] dark:group-hover/photo:text-[#efd0e5] transition-colors" />
                      <span className="text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5]">{ex.name}</span>
                      <span className="text-[10px] text-[#2d1b28]/70 dark:text-[#e6c3db]/75 mt-1 flex items-center gap-1">
                        <Camera className="w-3 h-3 text-[#be7fab] dark:text-[#daabcb]" />
                        <span>Tap to Upload Exercise Photo</span>
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-[#120a10]/70 opacity-0 group-hover/photo:opacity-100 flex flex-col items-center justify-center gap-1 text-[#efd0e5] transition-opacity backdrop-blur-xs">
                    <Upload className="w-5 h-5 text-[#daabcb]" />
                    <span className="text-[11px] font-semibold">
                      {ex.imageSrc ? 'Swap Exercise Photo' : 'Upload Exercise Photo'}
                    </span>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleExerciseImageUpload(ex.id, e)}
                    className="hidden"
                  />

                  <span className="absolute top-2 left-2 text-[10px] font-bold bg-[#120a10]/90 text-[#efd0e5] border border-[#be7fab]/45 px-2 py-0.5 rounded font-mono">
                    {ex.targetArea}
                  </span>

                  <span className="absolute top-2 right-2 text-[10px] font-bold bg-[#be7fab] text-white dark:text-[#120a10] px-2 py-0.5 rounded font-mono flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    <span>~{ex.estCaloriesBurned} kcal</span>
                  </span>

                  <button
                    type="button"
                    disabled={generatingExId === ex.id}
                    onClick={(e) => handleGenerateExerciseCover(ex, e)}
                    className="absolute bottom-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-lg bg-[#be7fab] hover:bg-[#d29ec2] disabled:opacity-60 text-[#120a10] border border-[#efd0e5]/50 text-[10px] font-bold shadow-[0_0_10px_rgba(190,127,171,0.5)] transition-all"
                    title="Generate AI exercise cover image"
                  >
                    {generatingExId === ex.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Wand2 className="w-3 h-3" />
                    )}
                    <span>{generatingExId === ex.id ? 'Generating...' : 'Generate Cover Image'}</span>
                  </button>
                </label>

                <div className="mt-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">{ex.name}</h4>
                    <button
                      type="button"
                      onClick={() => onDeleteExerciseCard(ex.id)}
                      className="p-1 text-[#2d1b28]/55 dark:text-[#d29ec2]/55 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded shrink-0"
                      title="Delete exercise card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]/80 font-mono mt-1">
                    <span>{ex.difficulty}</span>
                    <span>·</span>
                    <span>
                      <strong className="text-[#2d1b28] dark:text-[#efd0e5]">{ex.recommendedSets}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      <strong className="text-[#2d1b28] dark:text-[#efd0e5]">{ex.recommendedReps}</strong>
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-[11px] text-[#2d1b28]/85 dark:text-[#e6c3db]/85 leading-snug">
                    {ex.instructions.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-[#be7fab] font-bold font-mono shrink-0">{idx + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20 flex items-center justify-between gap-2">
                <span className="text-[10px] text-[#2d1b28]/65 dark:text-[#d29ec2]/75 font-mono truncate">
                  Equip: {ex.equipment}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onLogCaloriesBurned(ex.estCaloriesBurned);
                    celebrate();
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-white dark:text-[#120a10] bg-[#be7fab] dark:bg-[#daabcb] hover:bg-[#d29ec2] dark:hover:bg-[#efd0e5] px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Log +{ex.estCaloriesBurned} kcal</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal 1: Edit Weekly Planner Day */}
      {editingDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-[#120a10]/80 backdrop-blur-sm">
          <div className="hud-panel hud-corners w-full max-w-md p-5 shadow-2xl relative bg-white dark:bg-[#1c0f19]">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
              <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                Edit {editingDay.dayName} Workout Plan
              </h3>
              <button
                type="button"
                onClick={() => setEditingDay(null)}
                className="text-[#be7fab] dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDayEdit} className="mt-3 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Focus / Theme</label>
                <input
                  type="text"
                  value={dayFocus}
                  onChange={(e) => setDayFocus(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    min="0"
                    value={dayDuration}
                    onChange={(e) => setDayDuration(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Est. Burn (kcal)</label>
                  <input
                    type="number"
                    min="0"
                    value={dayCalories}
                    onChange={(e) => setDayCalories(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">
                  Exercises (One per line)
                </label>
                <textarea
                  rows={4}
                  value={dayExercisesText}
                  onChange={(e) => setDayExercisesText(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDay(null)}
                  className="px-3 py-1.5 text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-white dark:text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] font-bold rounded-lg"
                >
                  Save Day Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add / Edit Custom Workout Routine */}
      {isRoutineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-[#120a10]/80 backdrop-blur-sm">
          <div className="hud-panel hud-corners w-full max-w-md p-5 shadow-2xl relative bg-white dark:bg-[#1c0f19]">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
              <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                {editingRoutineId ? 'Edit Workout Routine' : 'Build Custom Workout Routine'}
              </h3>
              <button
                type="button"
                onClick={() => setIsRoutineModalOpen(false)}
                className="text-[#be7fab] dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRoutine} className="mt-3 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Routine Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sculpt & Burn 30-Min Circuit"
                  value={rName}
                  onChange={(e) => setRName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Target Focus</label>
                  <input
                    type="text"
                    placeholder="e.g. Core & Glutes"
                    value={rFocus}
                    onChange={(e) => setRFocus(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Difficulty</label>
                  <select
                    value={rDifficulty}
                    onChange={(e) => setRDifficulty(e.target.value as WorkoutRoutine['difficulty'])}
                    className="w-full px-3 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    min="5"
                    value={rDuration}
                    onChange={(e) => setRDuration(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Est. Burn (kcal)</label>
                  <input
                    type="number"
                    min="10"
                    value={rCalories}
                    onChange={(e) => setRCalories(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">
                  Exercises &amp; Sets (One per line)
                </label>
                <textarea
                  rows={4}
                  placeholder="Goblet Squats (4x12)&#10;Dumbbell Rows (3x12)&#10;Plank Hip Dips (3x20)"
                  value={rExercisesText}
                  onChange={(e) => setRExercisesText(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg resize-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Coaching Notes</label>
                <input
                  type="text"
                  placeholder="Tempo, rest interval, or equipment reminder"
                  value={rNotes}
                  onChange={(e) => setRNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRoutineModalOpen(false)}
                  className="px-3 py-1.5 text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-white dark:text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] font-bold rounded-lg"
                >
                  {editingRoutineId ? 'Save Routine' : 'Create Routine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: + Add Exercise Card */}
      {isAddExModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-[#120a10]/80 backdrop-blur-sm">
          <div className="hud-panel hud-corners w-full max-w-md p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1c0f19]">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
              <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">Add Exercise Card</h3>
              <button
                type="button"
                onClick={() => setIsAddExModalOpen(false)}
                className="text-[#be7fab] dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewExerciseCard} className="mt-3 space-y-3 text-xs">
              {/* Optional Photo Upload or AI Cover Generation */}
              <div className="space-y-1.5">
                <label className="block relative h-32 w-full rounded-xl border border-dashed border-[#be7fab]/55 bg-[#efd0e5]/45 dark:bg-[#120a10] overflow-hidden cursor-pointer hover:border-[#be7fab] dark:hover:border-[#efd0e5] transition-colors">
                  {exPreviewImage ? (
                    <img
                      src={exPreviewImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-[#be7fab] dark:text-[#daabcb] gap-1">
                      <Camera className="w-5 h-5" />
                      <span className="font-semibold">Tap to Upload Exercise Photo (Optional)</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleNewExercisePhotoUpload}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  disabled={isGeneratingNewExCover}
                  onClick={handleGenerateNewExerciseModalCover}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#be7fab]/20 hover:bg-[#be7fab] text-[#2d1b28] dark:text-[#efd0e5] hover:text-[#120a10] border border-[#be7fab]/50 text-[11px] font-bold transition-colors"
                >
                  {isGeneratingNewExCover ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isGeneratingNewExCover ? 'Generating Cover Image...' : 'Generate Cover Image'}
                  </span>
                </button>
              </div>

              <div>
                <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Exercise Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bulgarian Split Squats"
                  value={exName}
                  onChange={(e) => setExName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Target Area</label>
                  <select
                    value={exTarget}
                    onChange={(e) => setExTarget(e.target.value as ExerciseCardItem['targetArea'])}
                    className="w-full px-2.5 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                  >
                    <option value="Full Body">Full Body</option>
                    <option value="Glutes & Legs">Glutes &amp; Legs</option>
                    <option value="Arms & Shoulders">Arms &amp; Shoulders</option>
                    <option value="Core & Waist">Core &amp; Waist</option>
                    <option value="Back & Posture">Back &amp; Posture</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Difficulty</label>
                  <select
                    value={exDifficulty}
                    onChange={(e) => setExDifficulty(e.target.value as ExerciseCardItem['difficulty'])}
                    className="w-full px-2.5 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Sets</label>
                  <input
                    type="text"
                    value={exSets}
                    onChange={(e) => setExSets(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Reps</label>
                  <input
                    type="text"
                    value={exReps}
                    onChange={(e) => setExReps(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Calories Burned</label>
                  <input
                    type="number"
                    min="5"
                    value={exCalories}
                    onChange={(e) => setExCalories(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">Equipment</label>
                <input
                  type="text"
                  value={exEquipment}
                  onChange={(e) => setExEquipment(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">
                  Step-by-Step Instructions (One step per line)
                </label>
                <textarea
                  rows={4}
                  placeholder="Step 1: Set stance hip-width apart...&#10;Step 2: Lower slowly under control..."
                  value={exInstructionsText}
                  onChange={(e) => setExInstructionsText(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg resize-none"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExModalOpen(false)}
                  className="px-3 py-1.5 text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-white dark:text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] font-bold rounded-lg"
                >
                  Add Exercise Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
