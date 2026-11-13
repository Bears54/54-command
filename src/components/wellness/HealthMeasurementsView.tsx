import React, { useState } from 'react';
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  History,
  Ruler,
  Moon,
  Scale,
  Edit2,
  Flame,
  Apple,
  Plus,
} from 'lucide-react';
import { MeasurementPoint, WeightRecord, NutritionMicros } from '../../types/wellness';
import { AppleHealthData, MacroData } from '../../types/binder';
import womanAnatomyImg from '../../assets/images/woman_body_anatomy_1794608563366.jpg';

interface HealthMeasurementsViewProps {
  measurements: MeasurementPoint[];
  onUpdateMeasurement: (id: string, newInches: number, dateStr?: string) => void;
  health: AppleHealthData;
  onUpdateHealth: (data: Partial<AppleHealthData>) => void;
  macros: MacroData;
  onUpdateMacros: (data: Partial<MacroData>) => void;
  weightRecords: WeightRecord[];
  onAddWeightRecord: (record: WeightRecord) => void;
  micros: NutritionMicros;
  onUpdateMicros: (micros: Partial<NutritionMicros>) => void;
  celebrate: () => void;
}

export const HealthMeasurementsView: React.FC<HealthMeasurementsViewProps> = ({
  measurements,
  onUpdateMeasurement,
  health,
  onUpdateHealth,
  macros,
  onUpdateMacros,
  weightRecords,
  onAddWeightRecord,
  micros,
  onUpdateMicros,
  celebrate,
}) => {
  const [selectedPointId, setSelectedPointId] = useState<string>('waist');
  const [entryValue, setEntryValue] = useState<string>('');
  const [entryDate, setEntryDate] = useState<string>('Nov 12, 2026');

  // Sleep editor
  const [isEditingSleep, setIsEditingSleep] = useState(false);
  const [sleepHours, setSleepHours] = useState(health.sleep.hours);
  const [sleepMinutes, setSleepMinutes] = useState(health.sleep.minutes);
  const [sleepQuality, setSleepQuality] = useState(health.sleep.quality);

  // Weight logger
  const [newWeight, setNewWeight] = useState('');
  const [newWeightDate] = useState('Nov 12, 2026');

  // Nutrition view & quick macro editor
  const [nutritionView, setNutritionView] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [isEditingMacros, setIsEditingMacros] = useState(false);
  const [macroCal, setMacroCal] = useState(macros.calories.current);
  const [macroProt, setMacroProt] = useState(macros.protein.current);
  const [macroCarbs, setMacroCarbs] = useState(macros.carbs.current);
  const [macroFat, setMacroFat] = useState(macros.fat.current);

  const activePoint = measurements.find((m) => m.id === selectedPointId) || measurements[0];
  const totalStarting = measurements.reduce((sum, m) => sum + m.startingInches, 0);
  const totalCurrent = measurements.reduce((sum, m) => sum + m.currentInches, 0);
  const totalDelta = totalCurrent - totalStarting;

  const currentWeightRecord = weightRecords[weightRecords.length - 1] || { weight: 142.5, date: 'Nov 12, 2026' };
  const startWeight = weightRecords[0]?.weight || 156.0;
  const goalWeight = 135.0;
  const weightDelta = currentWeightRecord.weight - startWeight;

  const handleSelectPoint = (point: MeasurementPoint) => {
    setSelectedPointId(point.id);
    setEntryValue(point.currentInches.toString());
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(entryValue);
    if (!isNaN(val) && val > 0) {
      onUpdateMeasurement(selectedPointId, val, entryDate.trim() || 'Nov 12, 2026');
      celebrate();
    }
  };

  const handleQuickAdjust = (delta: number) => {
    const current = parseFloat(entryValue) || activePoint.currentInches;
    const nextVal = Math.round((current + delta) * 100) / 100;
    if (nextVal > 0) {
      setEntryValue(nextVal.toString());
      onUpdateMeasurement(selectedPointId, nextVal, entryDate.trim() || 'Nov 12, 2026');
      celebrate();
    }
  };

  const handleSaveSleep = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateHealth({
      sleep: {
        ...health.sleep,
        hours: Number(sleepHours),
        minutes: Number(sleepMinutes),
        quality: sleepQuality,
      },
    });
    setIsEditingSleep(false);
    celebrate();
  };

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newWeight);
    if (!isNaN(w) && w > 0) {
      onAddWeightRecord({ date: newWeightDate, weight: w });
      setNewWeight('');
      celebrate();
    }
  };

  const handleSaveMacros = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMacros({
      calories: { ...macros.calories, current: Number(macroCal) || 0 },
      protein: { ...macros.protein, current: Number(macroProt) || 0 },
      carbs: { ...macros.carbs, current: Number(macroCarbs) || 0 },
      fat: { ...macros.fat, current: Number(macroFat) || 0 },
    });
    setIsEditingMacros(false);
    celebrate();
  };

  const nutritionMultiplier = nutritionView === 'Daily' ? 1 : nutritionView === 'Weekly' ? 7 : 30;

  return (
    <div className="space-y-6">
      {/* Section 1: Core Vitals Row (Sleep, Weight, Active Burn) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sleep */}
        <div className="hud-panel hud-corners washi-tape-top p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                <Moon className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" /> Apple Health Sleep
              </span>
              <button
                type="button"
                onClick={() => setIsEditingSleep(!isEditingSleep)}
                className="text-[11px] font-semibold text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>{isEditingSleep ? 'Close' : 'Edit'}</span>
              </button>
            </div>

            {isEditingSleep ? (
              <form onSubmit={handleSaveSleep} className="mt-3 space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#2d1b28]/75 dark:text-[#e6c3db] font-semibold">Hours</label>
                    <input
                      type="number"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg text-xs"
                      min="0"
                      max="14"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#2d1b28]/75 dark:text-[#e6c3db] font-semibold">Minutes</label>
                    <input
                      type="number"
                      value={sleepMinutes}
                      onChange={(e) => setSleepMinutes(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg text-xs"
                      min="0"
                      max="59"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#2d1b28]/75 dark:text-[#e6c3db] font-semibold">Quality</label>
                  <select
                    value={sleepQuality}
                    onChange={(e) => setSleepQuality(e.target.value as AppleHealthData['sleep']['quality'])}
                    className="w-full px-2 py-1 bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg text-xs"
                  >
                    <option value="Deep & Restful">Deep &amp; Restful</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Restless">Restless</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-1.5 text-white dark:text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] font-bold rounded-lg text-xs"
                >
                  Save Sleep Log
                </button>
              </form>
            ) : (
              <div className="my-3">
                <div className="font-display text-3xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
                  {health.sleep.hours}h {health.sleep.minutes}m
                </div>
                <div className="text-xs text-[#be7fab] dark:text-[#daabcb] font-semibold mt-1">
                  Quality: {health.sleep.quality}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20 flex items-center justify-between text-[11px] text-[#2d1b28]/70 dark:text-[#e6c3db]/75 font-mono">
            <span>Goal: {health.sleep.goalHours}h 00m</span>
            <span className="font-semibold text-[#be7fab] dark:text-[#daabcb]">Watch Synced</span>
          </div>
        </div>

        {/* Weight */}
        <div className="hud-panel hud-corners washi-tape-top p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                <Scale className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" /> Weight Tracker
              </span>
              <span className="text-xs font-mono font-bold text-[#2d1b28] dark:text-[#efd0e5] bg-[#e6c3db] dark:bg-[#be7fab]/25 px-2 py-0.5 rounded">
                {weightDelta > 0 ? `+${weightDelta.toFixed(1)}` : weightDelta.toFixed(1)} lbs
              </span>
            </div>

            <div className="my-3 flex items-baseline justify-between">
              <div>
                <div className="font-display text-3xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
                  {currentWeightRecord.weight.toFixed(1)}{' '}
                  <span className="text-sm font-sans font-medium text-[#2d1b28]/70 dark:text-[#e6c3db]/75">lbs</span>
                </div>
                <div className="text-[11px] text-[#2d1b28]/65 dark:text-[#d29ec2]/75 mt-0.5">
                  Logged: {currentWeightRecord.date}
                </div>
              </div>
              <div className="text-right text-[11px] font-mono text-[#2d1b28]/80 dark:text-[#e6c3db]/80">
                <div>Start: {startWeight} lbs</div>
                <div className="text-[#be7fab] dark:text-[#daabcb] font-bold">Goal: {goalWeight} lbs</div>
              </div>
            </div>

            <form onSubmit={handleAddWeight} className="flex items-center gap-2 mt-2">
              <input
                type="number"
                step="0.1"
                placeholder="Log lbs (e.g. 142.0)"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="flex-1 px-2.5 py-1 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
              />
              <button
                type="submit"
                className="px-3 py-1 text-xs font-bold text-white dark:text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-lg"
              >
                Log
              </button>
            </form>
          </div>

          <div className="pt-2 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20 flex items-center justify-between text-[11px] text-[#2d1b28]/70 dark:text-[#e6c3db]/75 font-mono">
            <span>To goal: {Math.max(0, currentWeightRecord.weight - goalWeight).toFixed(1)} lbs</span>
            <span className="text-[#be7fab] dark:text-[#daabcb] font-medium">{weightRecords.length} entries</span>
          </div>
        </div>

        {/* Body Scan Net Change KPI */}
        <div className="hud-panel hud-corners washi-tape-top p-5 flex flex-col justify-between border-[#be7fab]! bg-[#e6c3db]/45 dark:bg-[#be7fab]/10">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                <Ruler className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" /> Body Scan Net Change
              </span>
              {totalDelta <= 0 ? (
                <TrendingDown className="w-4 h-4 text-[#be7fab]" />
              ) : (
                <TrendingUp className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
              )}
            </div>

            <div className="my-3 flex items-baseline justify-between">
              <div>
                <div className="font-display text-3xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
                  {totalDelta > 0 ? `+${totalDelta.toFixed(1)}` : totalDelta.toFixed(1)}&quot;
                </div>
                <div className="text-[11px] text-[#be7fab] dark:text-[#daabcb] mt-0.5 font-medium">
                  Sum across 9 anatomical zones
                </div>
              </div>
              <div className="text-right text-[11px] font-mono text-[#2d1b28]/80 dark:text-[#e6c3db]/80">
                <div>Start: {totalStarting.toFixed(1)}&quot;</div>
                <div className="text-[#2d1b28] dark:text-[#efd0e5] font-bold">Now: {totalCurrent.toFixed(1)}&quot;</div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20 flex items-center justify-between text-[11px] text-[#2d1b28]/70 dark:text-[#e6c3db]/75 font-mono">
            <span>Daily Active Burn: {health.calories.burned} kcal</span>
            <span className="text-[#be7fab] dark:text-[#daabcb] font-semibold">Biometric Lock</span>
          </div>
        </div>
      </div>

      {/* Section 2: Interactive Anatomical Body Measurement Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Realistic Anatomical Image with Glowing Interactive Callouts */}
        <div className="lg:col-span-7 hud-panel hud-corners washi-tape-top p-5 relative overflow-hidden flex flex-col items-center">
          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25 text-xs">
            <div>
              <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                Anatomical Body Measurement Scanner
              </h3>
              <p className="text-[11px] text-[#2d1b28]/70 dark:text-[#e6c3db]/75">
                Click any glowing callout line pointing to Neck, Arm, Chest, Bust, Stomach, Waist, Hips, Thighs, or Calves
              </p>
            </div>
            <span className="text-[11px] text-white dark:text-[#120a10] font-bold bg-[#be7fab] dark:bg-[#daabcb] px-2.5 py-0.5 rounded-md font-mono whitespace-nowrap self-start sm:self-center">
              9 Active Zones
            </span>
          </div>

          {/* Zone Quick-Select Ribbon for rapid tapping */}
          <div className="w-full flex flex-wrap items-center justify-center gap-1.5 pt-3">
            {measurements.map((pt) => {
              const active = pt.id === selectedPointId;
              return (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => handleSelectPoint(pt)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border transition-all whitespace-nowrap ${
                    active
                      ? 'bg-[#be7fab] text-white dark:text-[#120a10] border-[#be7fab] dark:border-[#efd0e5] shadow-[0_0_10px_rgba(190,127,171,0.45)]'
                      : 'bg-[#efd0e5]/60 dark:bg-[#120a10]/85 text-[#2d1b28]/80 dark:text-[#e6c3db] border-[#d29ec2] dark:border-[#be7fab]/35 hover:border-[#be7fab]'
                  }`}
                >
                  {pt.name}
                </button>
              );
            })}
          </div>

          {/* 3:4 Studio Anatomical Photo + Aligned SVG Callout Overlay */}
          <div className="relative w-full max-w-[450px] aspect-3/4 my-4 rounded-2xl overflow-hidden border border-[#be7fab]/55 shadow-[0_0_28px_rgba(190,127,171,0.28)] bg-[#120a10] select-none">
            <img
              src={womanAnatomyImg}
              alt="Female anatomical measurement reference silhouette"
              className="w-full h-full object-cover object-top"
              referrerPolicy="no-referrer"
            />

            {/* Subtle HUD telemetry vignette & reticle grid */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 50% 45%, transparent 45%, rgba(18, 10, 16, 0.72) 100%)',
              }}
            />
            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[#be7fab]/15 pointer-events-none" />
            <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-[#be7fab]/15 pointer-events-none" />

            {/* Interactive SVG Callout Layer */}
            <svg
              viewBox="0 0 450 600"
              className="absolute inset-0 w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="roseGlow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {measurements.map((pt) => {
                const isSelected = selectedPointId === pt.id;
                const svgX = (pt.x / 100) * 450;
                const svgY = (pt.y / 100) * 600;
                const isLeft = pt.labelPosition === 'left';
                const boxX = isLeft ? 8 : 326;
                const boxWidth = 116;
                const lineEndX = isLeft ? boxX + boxWidth : boxX;
                const netDiff = pt.currentInches - pt.startingInches;
                const diffStr = netDiff > 0 ? `+${netDiff.toFixed(1)}"` : `${netDiff.toFixed(1)}"`;

                return (
                  <g
                    key={pt.id}
                    className="cursor-pointer group"
                    onClick={() => handleSelectPoint(pt)}
                  >
                    {/* Glowing connector beam */}
                    <line
                      x1={svgX}
                      y1={svgY}
                      x2={lineEndX}
                      y2={svgY}
                      stroke={isSelected ? '#efd0e5' : '#be7fab'}
                      strokeWidth={isSelected ? '2.4' : '1.4'}
                      strokeDasharray={isSelected ? 'none' : '4 3'}
                      filter="url(#roseGlow)"
                    />

                    {/* Pulse ring on active node */}
                    {isSelected && (
                      <circle
                        cx={svgX}
                        cy={svgY}
                        r={10}
                        fill="none"
                        stroke="#be7fab"
                        strokeWidth="1.5"
                        opacity="0.7"
                      />
                    )}

                    {/* Anatomical target anchor dot */}
                    <circle
                      cx={svgX}
                      cy={svgY}
                      r={isSelected ? 5.5 : 4}
                      fill={isSelected ? '#efd0e5' : '#120a10'}
                      stroke="#be7fab"
                      strokeWidth="2.2"
                      filter="url(#roseGlow)"
                    />

                    {/* Interactive HUD Tag Box */}
                    <rect
                      x={boxX}
                      y={svgY - 15}
                      width={boxWidth}
                      height="30"
                      rx="6"
                      fill={isSelected ? '#be7fab' : 'rgba(18, 10, 16, 0.88)'}
                      stroke={isSelected ? '#efd0e5' : '#be7fab'}
                      strokeWidth={isSelected ? '1.8' : '1.1'}
                      filter={isSelected ? 'url(#roseGlow)' : undefined}
                    />

                    <text
                      x={boxX + boxWidth / 2}
                      y={svgY - 2}
                      textAnchor="middle"
                      fill={isSelected ? '#120a10' : '#efd0e5'}
                      fontSize="10"
                      fontFamily="Outfit, sans-serif"
                      fontWeight="700"
                    >
                      {pt.name}
                    </text>

                    <text
                      x={boxX + boxWidth / 2}
                      y={svgY + 10}
                      textAnchor="middle"
                      fill={isSelected ? '#120a10' : '#daabcb'}
                      fontSize="9.5"
                      fontFamily="monospace"
                      fontWeight="700"
                    >
                      {pt.currentInches.toFixed(1)}&quot; ({diffStr})
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Inch Entry Box & Progress Chart (Inches Gained or Lost Over Time) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="hud-panel hud-corners washi-tape-top p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#be7fab] dark:text-[#daabcb] font-mono">
                  Active Target Zone
                </span>
                <h3 className="font-display text-xl font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                  {activePoint.name} Circumference
                </h3>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#e6c3db] dark:bg-[#be7fab]/20 text-[#2d1b28] dark:text-[#efd0e5] border border-[#be7fab]/45">
                Goal: {activePoint.goalInches.toFixed(1)}&quot;
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 my-4 text-center">
              <div className="p-2.5 bg-[#e6c3db]/45 dark:bg-[#120a10]/80 rounded-xl border border-[#d29ec2] dark:border-[#be7fab]/25">
                <span className="text-[10px] text-[#2d1b28]/70 dark:text-[#e6c3db]/75 font-semibold uppercase block">Baseline</span>
                <span className="font-mono text-base font-bold text-[#2d1b28] dark:text-[#e6c3db] tabular-nums">
                  {activePoint.startingInches.toFixed(1)}&quot;
                </span>
              </div>
              <div className="p-2.5 bg-[#e6c3db] dark:bg-[#be7fab]/20 rounded-xl border border-[#be7fab] dark:border-[#be7fab]/55">
                <span className="text-[10px] text-[#be7fab] dark:text-[#daabcb] font-semibold uppercase block">Current</span>
                <span className="font-mono text-lg font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
                  {activePoint.currentInches.toFixed(1)}&quot;
                </span>
              </div>
              <div className="p-2.5 bg-[#e6c3db]/45 dark:bg-[#120a10]/80 rounded-xl border border-[#d29ec2] dark:border-[#d29ec2]/35">
                <span className="text-[10px] text-[#be7fab] dark:text-[#daabcb] font-semibold uppercase block">Gained / Lost</span>
                <span className="font-mono text-base font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
                  {activePoint.currentInches - activePoint.startingInches > 0 ? '+' : ''}
                  {(activePoint.currentInches - activePoint.startingInches).toFixed(1)}&quot;
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">
                    Inches Entry
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.05"
                      value={entryValue}
                      onChange={(e) => setEntryValue(e.target.value)}
                      placeholder={activePoint.currentInches.toString()}
                      className="w-full pl-3 pr-8 py-2 text-sm font-mono font-bold bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-xl focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-[#be7fab] dark:text-[#daabcb] font-mono font-bold">
                      in
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db] mb-1">
                    Date Label
                  </label>
                  <input
                    type="text"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-xl focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {[-0.5, -0.25, 0.25, 0.5].map((delta) => (
                    <button
                      key={delta}
                      type="button"
                      onClick={() => handleQuickAdjust(delta)}
                      className="px-2 py-1.5 text-[11px] font-mono font-semibold bg-[#efd0e5]/55 dark:bg-[#120a10] hover:bg-[#e6c3db] dark:hover:bg-[#be7fab]/25 border border-[#d29ec2] dark:border-[#be7fab]/35 rounded-lg text-[#2d1b28] dark:text-[#efd0e5]"
                    >
                      {delta > 0 ? `+${delta}"` : `${delta}"`}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white dark:text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl shadow-[0_0_12px_rgba(190,127,171,0.35)] transition-all active:scale-95 whitespace-nowrap"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>

          {/* Inches Gained / Lost History Chart */}
          <div className="hud-panel hud-corners p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
              <h4 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
                <span>{activePoint.name} History (Inches Gained / Lost)</span>
              </h4>
              <span className="text-[11px] text-[#be7fab] dark:text-[#daabcb] font-mono">
                {activePoint.history.length} Logs
              </span>
            </div>

            <div className="p-3 bg-[#e6c3db]/45 dark:bg-[#120a10]/85 rounded-xl border border-[#d29ec2] dark:border-[#be7fab]/30">
              <div className="h-28 w-full flex items-end justify-between gap-2 px-1 pt-4">
                {activePoint.history.map((h, idx) => {
                  const maxVal = Math.max(
                    ...activePoint.history.map((x) => x.value),
                    activePoint.startingInches
                  );
                  const minVal =
                    Math.min(...activePoint.history.map((x) => x.value), activePoint.goalInches) - 1;
                  const range = maxVal - minVal || 1;
                  const heightPct = Math.max(18, Math.min(100, ((h.value - minVal) / range) * 100));

                  return (
                    <div key={`${h.date}-${idx}`} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                      <span className="font-mono text-[10px] font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
                        {h.value.toFixed(1)}&quot;
                      </span>
                      <div className="w-full bg-white dark:bg-[#1c0f19] h-16 rounded-t-md relative flex items-end justify-center border border-[#d29ec2] dark:border-[#be7fab]/20">
                        <div
                          className="w-4 bg-linear-to-t from-[#be7fab] to-[#daabcb] dark:to-[#efd0e5] rounded-t-sm transition-all shadow-[0_0_8px_rgba(190,127,171,0.45)]"
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-[#2d1b28]/70 dark:text-[#d29ec2]/80 truncate max-w-full">
                        {h.date.split(',')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5 pt-1 max-h-40 overflow-y-auto pr-1">
              {activePoint.history.map((record, idx) => {
                const diffFromStart = record.value - activePoint.startingInches;
                return (
                  <div
                    key={`${record.date}-${idx}`}
                    className="flex items-center justify-between text-xs py-1 border-b border-[#d29ec2]/40 dark:border-[#be7fab]/15 last:border-0 font-mono"
                  >
                    <span className="text-[#2d1b28]/85 dark:text-[#e6c3db] font-sans font-medium">{record.date}</span>
                    <span className="font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums">
                      {record.value.toFixed(1)}&quot;
                    </span>
                    <span className="text-[11px] text-[#be7fab] dark:text-[#daabcb] tabular-nums font-semibold">
                      {diffFromStart > 0 ? `+${diffFromStart.toFixed(1)}" gained` : `${diffFromStart.toFixed(1)}" lost`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Nutrition, Macros & Micronutrients Analytics */}
      <div className="hud-panel hud-corners p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#e6c3db] dark:bg-[#be7fab]/20 text-[#be7fab] dark:text-[#daabcb]">
              <Apple className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                Nutrition, Macros &amp; Micronutrients
              </h3>
              <p className="text-xs text-[#2d1b28]/70 dark:text-[#e6c3db]/80">
                Macronutrient targets and essential vitamin &amp; mineral benchmarks
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setMacroCal(macros.calories.current);
                setMacroProt(macros.protein.current);
                setMacroCarbs(macros.carbs.current);
                setMacroFat(macros.fat.current);
                setIsEditingMacros(!isEditingMacros);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#efd0e5]/60 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 text-[#2d1b28] dark:text-[#efd0e5] hover:bg-[#e6c3db] dark:hover:bg-[#be7fab]/20 transition-colors"
            >
              {isEditingMacros ? 'Cancel Edit' : 'Update Today Macros'}
            </button>

            <div className="flex items-center gap-1 p-1 bg-[#e6c3db]/60 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/35 rounded-xl text-xs font-semibold">
              {(['Daily', 'Weekly', 'Monthly'] as const).map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setNutritionView(view)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    nutritionView === view
                      ? 'bg-[#be7fab] text-white dark:text-[#120a10] font-bold'
                      : 'text-[#2d1b28]/80 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isEditingMacros && (
          <form
            onSubmit={handleSaveMacros}
            className="mt-4 p-4 rounded-xl bg-[#e6c3db]/55 dark:bg-[#120a10]/90 border border-[#d29ec2] dark:border-[#be7fab]/50 grid grid-cols-2 sm:grid-cols-5 gap-3 items-end text-xs"
          >
            <div>
              <label className="text-[10px] text-[#be7fab] dark:text-[#daabcb] font-mono uppercase font-bold">Calories</label>
              <input
                type="number"
                value={macroCal}
                onChange={(e) => setMacroCal(Number(e.target.value))}
                className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#be7fab] dark:text-[#daabcb] font-mono uppercase font-bold">Protein (g)</label>
              <input
                type="number"
                value={macroProt}
                onChange={(e) => setMacroProt(Number(e.target.value))}
                className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#be7fab] dark:text-[#daabcb] font-mono uppercase font-bold">Carbs (g)</label>
              <input
                type="number"
                value={macroCarbs}
                onChange={(e) => setMacroCarbs(Number(e.target.value))}
                className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#be7fab] dark:text-[#daabcb] font-mono uppercase font-bold">Fat (g)</label>
              <input
                type="number"
                value={macroFat}
                onChange={(e) => setMacroFat(Number(e.target.value))}
                className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#be7fab] hover:bg-[#d29ec2] text-white dark:text-[#120a10] font-bold"
            >
              Save Macros
            </button>
          </form>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          {[
            {
              label: 'Energy Calories',
              curr: macros.calories.current * nutritionMultiplier,
              goal: macros.calories.goal * nutritionMultiplier,
              unit: 'kcal',
              bar: 'from-[#be7fab] to-[#daabcb] dark:to-[#efd0e5]',
            },
            {
              label: 'Protein Target',
              curr: macros.protein.current * nutritionMultiplier,
              goal: macros.protein.goal * nutritionMultiplier,
              unit: 'g',
              bar: 'from-[#be7fab] to-[#daabcb] dark:from-[#daabcb] dark:to-[#efd0e5]',
            },
            {
              label: 'Carbohydrates',
              curr: macros.carbs.current * nutritionMultiplier,
              goal: macros.carbs.goal * nutritionMultiplier,
              unit: 'g',
              bar: 'from-[#be7fab] to-[#d29ec2] dark:from-[#d29ec2] dark:to-[#e6c3db]',
            },
            {
              label: 'Healthy Fats',
              curr: macros.fat.current * nutritionMultiplier,
              goal: macros.fat.goal * nutritionMultiplier,
              unit: 'g',
              bar: 'from-[#be7fab] to-[#d29ec2]',
            },
          ].map((m) => (
            <div key={m.label} className="p-3 bg-[#e6c3db]/45 dark:bg-[#120a10]/85 rounded-xl border border-[#d29ec2] dark:border-[#be7fab]/35">
              <span className="text-[10px] text-[#be7fab] dark:text-[#daabcb] uppercase font-semibold">{m.label}</span>
              <div className="font-mono text-lg sm:text-xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums mt-0.5">
                {m.curr.toLocaleString()} / {m.goal.toLocaleString()}{' '}
                <span className="text-xs font-sans text-[#2d1b28]/70 dark:text-[#e6c3db]/70 font-normal">{m.unit}</span>
              </div>
              <div className="w-full bg-[#e6c3db] dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/25 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`bg-linear-to-r ${m.bar} h-full rounded-full`}
                  style={{ width: `${Math.min(100, (m.curr / m.goal) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-[#d29ec2]/60 dark:border-[#be7fab]/25">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#be7fab] dark:text-[#daabcb] uppercase tracking-wider">
              Essential Micronutrients ({nutritionView} View)
            </span>
            <button
              type="button"
              onClick={() => {
                onUpdateMicros({
                  water: { ...micros.water, current: micros.water.current + 8 },
                });
                celebrate();
              }}
              className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#e6c3db] dark:bg-[#be7fab]/20 border border-[#be7fab]/45 text-[#2d1b28] dark:text-[#efd0e5] hover:bg-[#be7fab] hover:text-white dark:hover:text-[#120a10] transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>+8 oz Water</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Dietary Fiber', curr: micros.fiber.current, goal: micros.fiber.goal, unit: 'g' },
              { label: 'Hydration Water', curr: micros.water.current, goal: micros.water.goal, unit: 'oz' },
              { label: 'Sodium Limit', curr: micros.sodium.current, goal: micros.sodium.goal, unit: 'mg' },
              { label: 'Vitamin D3', curr: micros.vitaminD.current, goal: micros.vitaminD.goal, unit: 'IU' },
              { label: 'Calcium', curr: micros.calcium.current, goal: micros.calcium.goal, unit: 'mg' },
              { label: 'Iron (Ferritin)', curr: micros.iron.current, goal: micros.iron.goal, unit: 'mg' },
            ].map((item) => (
              <div key={item.label} className="p-2.5 bg-[#e6c3db]/45 dark:bg-[#120a10]/80 rounded-xl border border-[#d29ec2] dark:border-[#be7fab]/25 text-xs">
                <span className="text-[10px] text-[#2d1b28]/75 dark:text-[#e6c3db]/80 block truncate">{item.label}</span>
                <div className="font-mono font-bold text-[#2d1b28] dark:text-[#efd0e5] mt-0.5 tabular-nums">
                  {item.curr} <span className="text-[10px] font-normal text-[#be7fab] dark:text-[#d29ec2]">{item.unit}</span>
                </div>
                <div className="w-full bg-[#e6c3db] dark:bg-[#1c0f19] h-1 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-[#be7fab] rounded-full"
                    style={{ width: `${Math.min(100, (item.curr / item.goal) * 100)}%` }}
                  />
                </div>
                <span className="text-[9px] text-[#2d1b28]/65 dark:text-[#d29ec2]/75 font-mono block mt-1">
                  Goal: {item.goal}
                  {item.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
