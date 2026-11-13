import React, { useState } from 'react';
import { UtensilsCrossed, ArrowRight, Edit2, X } from 'lucide-react';
import { useBinder } from '../../context/BinderContext';

const CircularProgressRing: React.FC<{
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
}> = ({
  percent,
  size = 64,
  strokeWidth = 5.5,
  color = '#be7fab',
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90 hud-svg-glow">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(210, 158, 194, 0.35)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
};

export const NutritionWidget: React.FC = () => {
  const { theme, macros, updateMacros, setActivePage, celebrate } = useBinder();
  const [isEditing, setIsEditing] = useState(false);

  const [calCur, setCalCur] = useState(macros.calories.current);
  const [calGoal, setCalGoal] = useState(macros.calories.goal);
  const [protCur, setProtCur] = useState(macros.protein.current);
  const [protGoal, setProtGoal] = useState(macros.protein.goal);
  const [carbCur, setCarbCur] = useState(macros.carbs.current);
  const [carbGoal, setCarbGoal] = useState(macros.carbs.goal);
  const [fatCur, setFatCur] = useState(macros.fat.current);
  const [fatGoal, setFatGoal] = useState(macros.fat.goal);

  const calPercent = Math.min(100, Math.round((macros.calories.current / macros.calories.goal) * 100));
  const protPercent = Math.min(100, Math.round((macros.protein.current / macros.protein.goal) * 100));
  const carbPercent = Math.min(100, Math.round((macros.carbs.current / macros.carbs.goal) * 100));
  const fatPercent = Math.min(100, Math.round((macros.fat.current / macros.fat.goal) * 100));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMacros({
      calories: { current: Number(calCur), goal: Number(calGoal) },
      protein: { current: Number(protCur), goal: Number(protGoal) },
      carbs: { current: Number(carbCur), goal: Number(carbGoal) },
      fat: { current: Number(fatCur), goal: Number(fatGoal) },
    });
    celebrate();
    setIsEditing(false);
  };

  const isDark = theme === 'dark';

  const macroCards = [
    { label: 'Calories', cur: macros.calories.current, goal: macros.calories.goal, unit: 'kcal', pct: calPercent, ringColor: isDark ? '#efd0e5' : '#be7fab' },
    { label: 'Protein', cur: macros.protein.current, goal: macros.protein.goal, unit: 'g', pct: protPercent, ringColor: '#be7fab' },
    { label: 'Carbs', cur: macros.carbs.current, goal: macros.carbs.goal, unit: 'g', pct: carbPercent, ringColor: isDark ? '#daabcb' : '#d29ec2' },
    { label: 'Fat', cur: macros.fat.current, goal: macros.fat.goal, unit: 'g', pct: fatPercent, ringColor: isDark ? '#d29ec2' : '#be7fab' },
  ];

  return (
    <>
      <div className="hud-panel hud-corners washi-tape-top p-4 sm:p-5 flex flex-col justify-between transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2] dark:border-[#d29ec2]/30">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#be7fab]/20 border border-[#be7fab]/60 text-[#be7fab] dark:text-[#efd0e5]">
              <UtensilsCrossed className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
            </span>
            <div>
              <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
                Daily Nutrition &amp; Macro Targets
              </h3>
              <p className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db] font-mono tabular-nums">
                {macros.calories.goal - macros.calories.current > 0
                  ? `${macros.calories.goal - macros.calories.current} kcal remaining today`
                  : 'Daily calorie target achieved'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:bg-[#be7fab]/20 rounded-lg transition-colors border border-transparent hover:border-[#be7fab]/45"
              title="Edit nutrition macros"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActivePage('meals')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl transition-all shadow-[0_0_15px_rgba(190,127,171,0.35)] active:scale-95"
            >
              <span>Meal Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Circular Gauges & Progress Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3.5">
          {macroCards.map((m) => (
            <div
              key={m.label}
              className="bg-[#e6c3db]/70 dark:bg-[#120a10]/75 p-3 rounded-xl border border-[#d29ec2] dark:border-[#d29ec2]/30 flex flex-col justify-between gap-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] block">{m.label}</span>
                  <div className="font-display text-lg font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums font-mono mt-0.5">
                    {m.cur}{m.unit !== 'kcal' ? m.unit : ''}
                  </div>
                  <span className="text-[10px] text-[#2d1b28]/70 dark:text-[#daabcb] font-mono tabular-nums">
                    /{m.goal}{m.unit === 'kcal' ? '' : m.unit}
                  </span>
                </div>

                <CircularProgressRing percent={m.pct} size={52} strokeWidth={5} color={m.ringColor}>
                  <span className="text-[10px] font-bold font-mono text-[#2d1b28] dark:text-[#efd0e5]">{m.pct}%</span>
                </CircularProgressRing>
              </div>

              <div className="w-full h-1.5 bg-white dark:bg-[#1c0f19] rounded-full overflow-hidden border border-[#d29ec2] dark:border-[#d29ec2]/25">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${m.pct}%`, backgroundColor: m.ringColor, boxShadow: `0 0 8px ${m.ringColor}` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Macros Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-[#120a10]/80 backdrop-blur-sm">
          <div className="hud-panel hud-corners w-full max-w-md p-5 relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2] dark:border-[#d29ec2]/40">
              <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
                <span>Update Daily Nutrition Targets</span>
              </h3>
              <button onClick={() => setIsEditing(false)} className="text-[#2d1b28]/70 dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2d1b28] dark:text-[#e6c3db] mb-1">Calories Today</label>
                  <input
                    type="number"
                    value={calCur}
                    onChange={(e) => setCalCur(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#d29ec2]/50 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2d1b28] dark:text-[#e6c3db] mb-1">Calorie Target</label>
                  <input
                    type="number"
                    value={calGoal}
                    onChange={(e) => setCalGoal(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#d29ec2]/50 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2d1b28] dark:text-[#e6c3db] mb-1">Protein (g) Today</label>
                  <input
                    type="number"
                    value={protCur}
                    onChange={(e) => setProtCur(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#d29ec2]/50 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2d1b28] dark:text-[#e6c3db] mb-1">Protein Goal (g)</label>
                  <input
                    type="number"
                    value={protGoal}
                    onChange={(e) => setProtGoal(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#d29ec2]/50 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2d1b28] dark:text-[#e6c3db] mb-1">Carbs (g) Today</label>
                  <input
                    type="number"
                    value={carbCur}
                    onChange={(e) => setCarbCur(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#d29ec2]/50 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2d1b28] dark:text-[#e6c3db] mb-1">Carbs Goal (g)</label>
                  <input
                    type="number"
                    value={carbGoal}
                    onChange={(e) => setCarbGoal(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#d29ec2]/50 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2d1b28] dark:text-[#e6c3db] mb-1">Fat (g) Today</label>
                  <input
                    type="number"
                    value={fatCur}
                    onChange={(e) => setFatCur(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#d29ec2]/50 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2d1b28] dark:text-[#e6c3db] mb-1">Fat Goal (g)</label>
                  <input
                    type="number"
                    value={fatGoal}
                    onChange={(e) => setFatGoal(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#d29ec2]/50 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#d29ec2] dark:border-[#d29ec2]/30">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl shadow-[0_0_12px_rgba(190,127,171,0.45)]"
                >
                  Save Macros
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
