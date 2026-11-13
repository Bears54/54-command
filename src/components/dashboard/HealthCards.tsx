import React, { useState } from 'react';
import {
  Footprints,
  Moon,
  Flame,
  Activity,
  Edit2,
  X,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';

const MiniHudGauge: React.FC<{
  percent: number;
  size?: number;
  strokeWidth?: number;
  label: string;
}> = ({ percent, size = 50, strokeWidth = 4.5, label }) => {
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
          stroke="rgba(210, 158, 194, 0.32)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#be7fab"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold font-mono tabular-nums text-[#2d1b28] dark:text-[#efd0e5]">{label}</span>
      </div>
    </div>
  );
};

const MiniSparkBars: React.FC<{ values: number[] }> = ({ values }) => (
  <div className="flex items-end gap-1 h-6">
    {values.map((v, idx) => (
      <div
        key={idx}
        className={`flex-1 rounded-t-xs transition-all ${
          idx === values.length - 1
            ? 'bg-[#be7fab] shadow-[0_0_8px_rgba(190,127,171,0.65)]'
            : 'bg-[#daabcb] dark:bg-[#d29ec2]/55'
        }`}
        style={{ height: `${Math.max(18, Math.min(100, v))}%` }}
      />
    ))}
  </div>
);

export const HealthCards: React.FC = () => {
  const { health, updateHealth, celebrate } = useBinder();
  const [editingCard, setEditingCard] = useState<'steps' | 'sleep' | 'calories' | 'bloodSugar' | null>(null);

  const [stepsVal, setStepsVal] = useState(health.steps.current);
  const [stepsGoal, setStepsGoal] = useState(health.steps.goal);
  const [sleepHours, setSleepHours] = useState(health.sleep.hours);
  const [sleepMins, setSleepMins] = useState(health.sleep.minutes);
  const [sleepQuality, setSleepQuality] = useState(health.sleep.quality);
  const [calVal, setCalVal] = useState(health.calories.burned);
  const [calGoal, setCalGoal] = useState(health.calories.goal);
  const [sugarVal, setSugarVal] = useState(health.bloodSugar.value);
  const [sugarStatus, setSugarStatus] = useState(health.bloodSugar.status);

  const openEditor = (type: 'steps' | 'sleep' | 'calories' | 'bloodSugar') => {
    setEditingCard(type);
    if (type === 'steps') {
      setStepsVal(health.steps.current);
      setStepsGoal(health.steps.goal);
    } else if (type === 'sleep') {
      setSleepHours(health.sleep.hours);
      setSleepMins(health.sleep.minutes);
      setSleepQuality(health.sleep.quality);
    } else if (type === 'calories') {
      setCalVal(health.calories.burned);
      setCalGoal(health.calories.goal);
    } else if (type === 'bloodSugar') {
      setSugarVal(health.bloodSugar.value);
      setSugarStatus(health.bloodSugar.status);
    }
  };

  const saveEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCard === 'steps') {
      updateHealth({ steps: { current: Number(stepsVal), goal: Number(stepsGoal) } });
    } else if (editingCard === 'sleep') {
      updateHealth({
        sleep: {
          hours: Number(sleepHours),
          minutes: Number(sleepMins),
          goalHours: health.sleep.goalHours,
          quality: sleepQuality,
        },
      });
    } else if (editingCard === 'calories') {
      updateHealth({ calories: { burned: Number(calVal), goal: Number(calGoal) } });
    } else if (editingCard === 'bloodSugar') {
      const val = Number(sugarVal);
      const range = val < 70 ? 'Low' : val <= 99 ? 'Normal' : 'Elevated';
      updateHealth({
        bloodSugar: {
          value: val,
          unit: 'mg/dL',
          status: sugarStatus,
          range,
        },
      });
    }
    celebrate();
    setEditingCard(null);
  };

  const stepPercent = Math.min(100, Math.round((health.steps.current / health.steps.goal) * 100));
  const calPercent = Math.min(100, Math.round((health.calories.burned / health.calories.goal) * 100));
  const totalSleepMins = health.sleep.hours * 60 + health.sleep.minutes;
  const sleepPercent = Math.min(100, Math.round((totalSleepMins / (health.sleep.goalHours * 60)) * 100));
  const glucosePercent = Math.min(100, Math.max(20, Math.round((health.bloodSugar.value / 140) * 100)));

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* 1. Steps Card */}
        <div
          onClick={() => openEditor('steps')}
          className="hud-panel hud-corners washi-tape-top p-4 flex flex-col justify-between cursor-pointer group transition-all"
          title="Click to log steps"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />
              Apple Health · Steps
            </span>
            <span className="text-[11px] text-[#2d1b28]/75 dark:text-[#daabcb] font-mono tabular-nums">
              ~{(health.steps.current * 0.00045).toFixed(1)} mi
            </span>
          </div>

          <div className="my-3 flex items-center justify-between gap-3">
            <div>
              <div className="font-display text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums font-mono">
                {health.steps.current.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db] font-mono tabular-nums">
                Target {health.steps.goal.toLocaleString()}
              </div>
            </div>
            <MiniHudGauge percent={stepPercent} label={`${stepPercent}%`} />
          </div>

          <div className="space-y-2 pt-2 border-t border-[#d29ec2] dark:border-[#d29ec2]/25">
            <MiniSparkBars values={[62, 74, 88, 70, 95, 81, stepPercent]} />
            <div className="w-full h-1.5 bg-[#e6c3db] dark:bg-[#120a10] rounded-full overflow-hidden border border-[#d29ec2] dark:border-[#d29ec2]/30">
              <div
                className="h-full bg-[#be7fab] shadow-[0_0_8px_#be7fab] rounded-full transition-all duration-500"
                style={{ width: `${stepPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. Sleep Card */}
        <div
          onClick={() => openEditor('sleep')}
          className="hud-panel hud-corners washi-tape-top p-4 flex flex-col justify-between cursor-pointer group transition-all"
          title="Click to log sleep"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />
              Sleep Recovery
            </span>
            <span className="text-[11px] text-[#2d1b28]/75 dark:text-[#daabcb] font-medium truncate max-w-[110px]">
              {health.sleep.quality}
            </span>
          </div>

          <div className="my-3 flex items-center justify-between gap-3">
            <div>
              <div className="font-display text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums font-mono">
                {health.sleep.hours}h {health.sleep.minutes}m
              </div>
              <div className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db] font-mono tabular-nums">
                Goal {health.sleep.goalHours}h 00m
              </div>
            </div>
            <MiniHudGauge percent={sleepPercent} label={`${sleepPercent}%`} />
          </div>

          <div className="space-y-2 pt-2 border-t border-[#d29ec2] dark:border-[#d29ec2]/25">
            <MiniSparkBars values={[78, 84, 72, 91, 86, 80, sleepPercent]} />
            <div className="w-full h-1.5 bg-[#e6c3db] dark:bg-[#120a10] rounded-full overflow-hidden border border-[#d29ec2] dark:border-[#d29ec2]/30">
              <div
                className="h-full bg-[#be7fab] dark:bg-[#daabcb] shadow-[0_0_8px_#be7fab] rounded-full transition-all duration-500"
                style={{ width: `${sleepPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3. Active Calories Card */}
        <div
          onClick={() => openEditor('calories')}
          className="hud-panel hud-corners washi-tape-top p-4 flex flex-col justify-between cursor-pointer group transition-all"
          title="Click to log active calories"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />
              Active Burn
            </span>
            <span className="text-[11px] text-[#2d1b28]/75 dark:text-[#daabcb] font-mono">Move Ring</span>
          </div>

          <div className="my-3 flex items-center justify-between gap-3">
            <div>
              <div className="font-display text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums font-mono">
                {health.calories.burned}
              </div>
              <div className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db] font-mono tabular-nums">
                / {health.calories.goal} kcal
              </div>
            </div>
            <MiniHudGauge percent={calPercent} label={`${calPercent}%`} />
          </div>

          <div className="space-y-2 pt-2 border-t border-[#d29ec2] dark:border-[#d29ec2]/25">
            <MiniSparkBars values={[55, 79, 85, 65, 92, 88, calPercent]} />
            <div className="w-full h-1.5 bg-[#e6c3db] dark:bg-[#120a10] rounded-full overflow-hidden border border-[#d29ec2] dark:border-[#d29ec2]/30">
              <div
                className="h-full bg-[#be7fab] shadow-[0_0_8px_#be7fab] rounded-full transition-all duration-500"
                style={{ width: `${calPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4. Blood Sugar Card */}
        <div
          onClick={() => openEditor('bloodSugar')}
          className="hud-panel hud-corners washi-tape-top p-4 flex flex-col justify-between cursor-pointer group transition-all"
          title="Click to log blood sugar"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />
              Blood Glucose
            </span>
            <span className="text-[11px] font-mono font-bold text-[#2d1b28] dark:text-[#efd0e5]">
              {health.bloodSugar.range}
            </span>
          </div>

          <div className="my-3 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums font-mono">
                  {health.bloodSugar.value}
                </span>
                <span className="text-xs text-[#2d1b28]/80 dark:text-[#e6c3db]">{health.bloodSugar.unit}</span>
              </div>
              <div className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db] font-mono">
                {health.bloodSugar.status} · 70–99 target
              </div>
            </div>
            <MiniHudGauge percent={glucosePercent} label={`${health.bloodSugar.value}`} />
          </div>

          <div className="space-y-2 pt-2 border-t border-[#d29ec2] dark:border-[#d29ec2]/25">
            <MiniSparkBars values={[64, 68, 62, 70, 66, 65, glucosePercent]} />
            <div className="flex items-center justify-between text-[10px] text-[#2d1b28]/75 dark:text-[#daabcb] font-mono">
              <span>Metabolic Range</span>
              <span className="flex items-center gap-1 group-hover:underline">
                Edit <Edit2 className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Health Edit Dialog Modal */}
      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-[#120a10]/80 backdrop-blur-sm">
          <div className="hud-panel hud-corners w-full max-w-sm p-5 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2] dark:border-[#d29ec2]/40">
              <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] capitalize">
                Update Apple Health: {editingCard === 'bloodSugar' ? 'Blood Sugar' : editingCard}
              </h3>
              <button onClick={() => setEditingCard(null)} className="text-[#2d1b28]/70 dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={saveEdits} className="mt-4 space-y-3.5">
              {editingCard === 'steps' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#2d1b28] dark:text-[#e6c3db] mb-1">Today's Steps Count</label>
                    <input
                      type="number"
                      value={stepsVal}
                      onChange={(e) => setStepsVal(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-sm bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#d29ec2]/50 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2d1b28] dark:text-[#e6c3db] mb-1">Daily Step Goal</label>
                    <input
                      type="number"
                      value={stepsGoal}
                      onChange={(e) => setStepsGoal(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-sm bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#d29ec2]/50 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                      required
                    />
                  </div>
                </>
              )}

              {editingCard === 'sleep' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#2d1b28] dark:text-[#e6c3db] mb-1">Hours</label>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        value={sleepHours}
                        onChange={(e) => setSleepHours(Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-sm bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#d29ec2]/50 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#2d1b28] dark:text-[#e6c3db] mb-1">Minutes</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={sleepMins}
                        onChange={(e) => setSleepMins(Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-sm bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#d29ec2]/50 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2d1b28] dark:text-[#e6c3db] mb-1">Sleep Quality Rating</label>
                    <select
                      value={sleepQuality}
                      onChange={(e) => setSleepQuality(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#d29ec2]/50 rounded-lg text-[#2d1b28] dark:text-[#efd0e5]"
                    >
                      <option value="Deep & Restful">Deep & Restful</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Restless">Restless</option>
                    </select>
                  </div>
                </>
              )}

              {editingCard === 'calories' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#2d1b28] dark:text-[#e6c3db] mb-1">Active Calories Burned (kcal)</label>
                    <input
                      type="number"
                      value={calVal}
                      onChange={(e) => setCalVal(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-sm bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#d29ec2]/50 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2d1b28] dark:text-[#e6c3db] mb-1">Daily Calorie Burn Target</label>
                    <input
                      type="number"
                      value={calGoal}
                      onChange={(e) => setCalGoal(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-sm bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#d29ec2]/50 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                      required
                    />
                  </div>
                </>
              )}

              {editingCard === 'bloodSugar' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#2d1b28] dark:text-[#e6c3db] mb-1">Glucose Level (mg/dL)</label>
                    <input
                      type="number"
                      value={sugarVal}
                      onChange={(e) => setSugarVal(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-sm bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#d29ec2]/50 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2d1b28] dark:text-[#e6c3db] mb-1">Measurement Context</label>
                    <select
                      value={sugarStatus}
                      onChange={(e) => setSugarStatus(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#d29ec2]/50 rounded-lg text-[#2d1b28] dark:text-[#efd0e5]"
                    >
                      <option value="Fasting">Fasting (Morning)</option>
                      <option value="Post-Meal">Post-Meal (2h after eating)</option>
                      <option value="Before Sleep">Before Sleep</option>
                      <option value="Random">Random Check</option>
                    </select>
                  </div>
                </>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-[#d29ec2] dark:border-[#d29ec2]/30">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl shadow-[0_0_12px_rgba(190,127,171,0.45)]"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
