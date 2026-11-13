import React, { useState } from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  MapPin,
  Edit3,
  X,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';
import { WeatherData } from '../../types/binder';

export const WeatherWidget: React.FC = () => {
  const { weather, updateWeather } = useBinder();
  const [isEditing, setIsEditing] = useState(false);
  const [tempLocation, setTempLocation] = useState(weather.location);
  const [tempTemperature, setTempTemperature] = useState(weather.temperature.toString());
  const [tempCondition, setTempCondition] = useState<WeatherData['condition']>(weather.condition);
  const [tempHigh, setTempHigh] = useState(weather.high.toString());
  const [tempLow, setTempLow] = useState(weather.low.toString());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateWeather({
      location: tempLocation,
      temperature: parseInt(tempTemperature) || 70,
      condition: tempCondition,
      high: parseInt(tempHigh) || 72,
      low: parseInt(tempLow) || 55,
    });
    setIsEditing(false);
  };

  const getWeatherIcon = (cond: WeatherData['condition']) => {
    switch (cond) {
      case 'Sunny': return <Sun className="w-8 h-8 text-[#be7fab] dark:text-[#efd0e5] hud-svg-glow" />;
      case 'Partly Cloudy': return <CloudSun className="w-8 h-8 text-[#be7fab] dark:text-[#efd0e5] hud-svg-glow" />;
      case 'Cloudy': return <Cloud className="w-8 h-8 text-[#be7fab] dark:text-[#d29ec2] hud-svg-glow" />;
      case 'Rainy': return <CloudRain className="w-8 h-8 text-[#be7fab] dark:text-[#daabcb] hud-svg-glow" />;
      case 'Stormy': return <CloudLightning className="w-8 h-8 text-[#be7fab] hud-svg-glow" />;
      case 'Snowy': return <Snowflake className="w-8 h-8 text-[#be7fab] dark:text-[#efd0e5] hud-svg-glow" />;
      default: return <Sun className="w-8 h-8 text-[#be7fab] dark:text-[#efd0e5] hud-svg-glow" />;
    }
  };

  return (
    <>
      <div
        onClick={() => setIsEditing(true)}
        className="hud-panel hud-corners washi-tape-top p-4 flex flex-col justify-between cursor-pointer group transition-all"
        title="Click to edit atmospheric telemetry"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2d1b28]/80 dark:text-[#e6c3db]">
            <MapPin className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />
            <span className="truncate max-w-[160px]">{weather.location}</span>
          </div>
          <button
            type="button"
            className="opacity-0 group-hover:opacity-100 p-1 text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] transition-opacity"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between my-3">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-3xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tabular-nums font-mono">
              {weather.temperature}°
            </span>
            <span className="text-xs text-[#2d1b28]/80 dark:text-[#e6c3db] font-bold">F</span>
          </div>
          <div>{getWeatherIcon(weather.condition)}</div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#2d1b28]/80 dark:text-[#e6c3db] pt-2.5 border-t border-[#d29ec2] dark:border-[#d29ec2]/25 font-mono tabular-nums">
          <span className="font-semibold text-[#2d1b28] dark:text-[#efd0e5]">{weather.condition}</span>
          <div className="flex items-center gap-2">
            <span>H {weather.high}°</span>
            <span className="text-[#be7fab]">/</span>
            <span>L {weather.low}°</span>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-[#120a10]/80 backdrop-blur-sm">
          <div className="hud-panel hud-corners w-full max-w-sm p-5 relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2] dark:border-[#d29ec2]/40">
              <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] flex items-center gap-2">
                <Sun className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
                <span>Update Today's Weather</span>
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-[#2d1b28]/70 dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#2d1b28] dark:text-[#e6c3db] mb-1">Location</label>
                <input
                  type="text"
                  value={tempLocation}
                  onChange={(e) => setTempLocation(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#d29ec2]/50 rounded-lg text-[#2d1b28] dark:text-[#efd0e5]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2d1b28] dark:text-[#e6c3db] mb-1">Current Temp (°F)</label>
                  <input
                    type="number"
                    value={tempTemperature}
                    onChange={(e) => setTempTemperature(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#d29ec2]/50 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2d1b28] dark:text-[#e6c3db] mb-1">Condition</label>
                  <select
                    value={tempCondition}
                    onChange={(e) => setTempCondition(e.target.value as WeatherData['condition'])}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#d29ec2]/50 rounded-lg text-[#2d1b28] dark:text-[#efd0e5]"
                  >
                    <option value="Sunny">Sunny</option>
                    <option value="Partly Cloudy">Partly Cloudy</option>
                    <option value="Cloudy">Cloudy</option>
                    <option value="Rainy">Rainy</option>
                    <option value="Stormy">Stormy</option>
                    <option value="Snowy">Snowy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2d1b28] dark:text-[#e6c3db] mb-1">High (°F)</label>
                  <input
                    type="number"
                    value={tempHigh}
                    onChange={(e) => setTempHigh(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#d29ec2]/50 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2d1b28] dark:text-[#e6c3db] mb-1">Low (°F)</label>
                  <input
                    type="number"
                    value={tempLow}
                    onChange={(e) => setTempLow(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#d29ec2]/50 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
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
                  Save Weather
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
