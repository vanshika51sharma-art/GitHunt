import React, { useEffect } from 'react';
import { Radio, Flame, Sparkles, Navigation, Volume2, Shield } from 'lucide-react';
import { SonarState } from '../types/githunt';
import { soundEngine } from '../utils/soundEngine';

interface SonarRadarProps {
  sonarState: SonarState;
  onManualPing?: () => void;
}

export const SonarRadar: React.FC<SonarRadarProps> = ({ sonarState, onManualPing }) => {
  const { temperature, similarityPercent, fathomsDistance, statusMessage } = sonarState;

  // Sound ping on temperature changes
  useEffect(() => {
    soundEngine.playSonarPing(temperature);
  }, [temperature]);

  // Color mappings
  const getTempVisuals = () => {
    switch (temperature) {
      case 'hot':
        return {
          color: 'text-red-400 dark:text-red-400 light:text-red-600',
          bg: 'bg-red-500/15 dark:bg-red-500/15 light:bg-red-100',
          border: 'border-red-500/50 dark:border-red-500/50 light:border-red-300',
          glow: 'shadow-red-500/30',
          coneClass: 'radar-sweep-hot',
          needleDeg: 90, // Spiked high
          label: '🔥 BURNING HOT',
          subtext: fathomsDistance !== null 
            ? `${fathomsDistance === 0 ? 'ON TARGET' : `${fathomsDistance} lines away`}` 
            : 'Inside Treasure Cove!',
        };
      case 'warm':
        return {
          color: 'text-amber-400 dark:text-amber-400 light:text-amber-700',
          bg: 'bg-amber-500/15 dark:bg-amber-500/15 light:bg-amber-100',
          border: 'border-amber-500/50 dark:border-amber-500/50 light:border-amber-300',
          glow: 'shadow-amber-500/20',
          coneClass: 'radar-sweep-cone',
          needleDeg: 55,
          label: '🌡️ WARM',
          subtext: 'Same Directory / Cove',
        };
      case 'cold':
        return {
          color: 'text-cyan-400 dark:text-cyan-400 light:text-sky-700',
          bg: 'bg-cyan-500/15 dark:bg-cyan-500/15 light:bg-sky-100',
          border: 'border-cyan-500/40 dark:border-cyan-500/40 light:border-sky-300',
          glow: 'shadow-cyan-500/10',
          coneClass: 'radar-sweep-cone',
          needleDeg: 25,
          label: '❄️ COLD',
          subtext: 'Same Module / Region',
        };
      case 'frozen':
      default:
        return {
          color: 'text-slate-400 dark:text-slate-400 light:text-slate-600',
          bg: 'bg-slate-800/40 dark:bg-slate-800/40 light:bg-slate-100',
          border: 'border-slate-700/50 dark:border-slate-700/50 light:border-slate-300',
          glow: '',
          coneClass: 'radar-sweep-cone',
          needleDeg: 5,
          label: '🧊 FROZEN',
          subtext: 'Far from Coordinates',
        };
    }
  };

  const visuals = getTempVisuals();

  return (
    <div className={`relative p-3.5 sm:p-4 rounded-2xl bg-ocean-deck/95 dark:bg-ocean-deck/95 light:bg-white border ${visuals.border} shadow-xl backdrop-blur-md transition-all duration-300`}>
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className={`w-4 h-4 ${visuals.color} animate-pulse`} />
            {temperature === 'hot' && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </div>
          <span className="font-cinzel text-xs font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 uppercase tracking-wider">
            Sonar Radar HUD
          </span>
        </div>

        <button
          onClick={() => {
            soundEngine.playSonarPing(temperature);
            onManualPing?.();
          }}
          title="Emit active acoustic sonar ping"
          className="px-2 py-0.5 rounded bg-ocean-hull dark:bg-ocean-hull light:bg-slate-100 hover:bg-ocean-bridge dark:hover:bg-ocean-bridge light:hover:bg-slate-200 border border-ocean-border dark:border-ocean-border light:border-slate-300 text-[10px] font-mono text-slate-300 dark:text-slate-300 light:text-slate-700 flex items-center gap-1 transition-all"
        >
          <Volume2 className="w-3 h-3" />
          <span>Ping</span>
        </button>
      </div>

      {/* Main Radar Screen Visual */}
      <div className="flex items-center gap-4">
        
        {/* Radar Circular Scope */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-ocean-void dark:bg-ocean-void light:bg-slate-900 border-2 border-ocean-border dark:border-ocean-border light:border-slate-400 flex items-center justify-center shrink-0 overflow-hidden radar-grid shadow-inner">
          
          {/* Concentric Distance Rings */}
          <div className="absolute inset-2 rounded-full border border-cyan-500/15 dark:border-cyan-500/15 light:border-sky-400/20" />
          <div className="absolute inset-5 rounded-full border border-cyan-500/20 dark:border-cyan-500/20 light:border-sky-400/30" />
          <div className="absolute inset-8 rounded-full border border-cyan-500/25 dark:border-cyan-500/25 light:border-sky-400/40" />

          {/* Crosshairs */}
          <div className="absolute inset-x-0 top-1/2 h-[1px] bg-cyan-500/20" />
          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-cyan-500/20" />

          {/* Rotating Sonar Sweep Beam */}
          <div className={`absolute inset-0 rounded-full animate-radar-sweep ${visuals.coneClass}`} />

          {/* Compass / Needle Pointer */}
          <div 
            className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out"
            style={{ transform: `rotate(${visuals.needleDeg * 3.6}deg)` }}
          >
            <div className="w-0.5 h-10 -translate-y-3 bg-gradient-to-t from-transparent via-amber-400 to-amber-300 rounded-full shadow-lg shadow-amber-400/50" />
          </div>

          {/* Center Hub */}
          <div className="relative z-10 w-3 h-3 rounded-full bg-ocean-void border-2 border-amber-400 shadow-md shadow-amber-400/60" />

          {/* Target Blip if Hot */}
          {temperature === 'hot' && (
            <div className="absolute top-6 right-6 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          )}
        </div>

        {/* Right Status Information */}
        <div className="flex-1 min-w-0">
          
          {/* Temperature Status Pill */}
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${visuals.bg} ${visuals.color} ${visuals.border} mb-2 shadow-sm`}>
            <span>{visuals.label}</span>
          </div>

          {/* Subtext description */}
          <div className="text-xs font-mono text-slate-300 dark:text-slate-300 light:text-slate-800 font-semibold mb-1">
            {visuals.subtext}
          </div>

          {/* Proximity Percentage Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-slate-400 light:text-slate-600">
              <span>Proximity Signal</span>
              <span className="font-bold text-amber-400 dark:text-amber-300 light:text-amber-700">{similarityPercent}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-ocean-void dark:bg-ocean-void light:bg-slate-200 overflow-hidden border border-ocean-border/60 dark:border-ocean-border/60 light:border-slate-300">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  temperature === 'hot' ? 'bg-gradient-to-r from-amber-500 to-red-500' :
                  temperature === 'warm' ? 'bg-gradient-to-r from-cyan-500 to-amber-500' :
                  temperature === 'cold' ? 'bg-cyan-500' : 'bg-slate-600'
                }`}
                style={{ width: `${similarityPercent}%` }}
              />
            </div>
          </div>

          {/* Directional Radar Feedback */}
          <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-600 font-mono line-clamp-1">
            {statusMessage}
          </p>

        </div>

      </div>

    </div>
  );
};
