import React, { useState, useEffect } from 'react';
import { Skull, Compass, Radio, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface VoyageLoadingProps {
  repoName: string;
}

export const VoyageLoading: React.FC<VoyageLoadingProps> = ({ repoName }) => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    { text: "Unfurling sails and navigating the Cyber-Sea...", icon: Compass },
    { text: `Reconnoitering island shores of "${repoName}"...`, icon: Radio },
    { text: "Charting the recursive file tree & hidden coves...", icon: Sparkles },
    { text: "The Clue Master is inspecting algorithms & hiding loot...", icon: Skull },
    { text: "Arming the Sonar Distance Radar for your quest...", icon: Radio },
  ];

  useEffect(() => {
    soundEngine.playSonarPing('cold');
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        const next = (prev + 1) % steps.length;
        if (next === 2) soundEngine.playSonarPing('warm');
        if (next === 3) soundEngine.playParrotSquawk();
        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = steps[stepIndex].icon;

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-6 max-w-2xl mx-auto text-center">
      
      {/* Animated Pirate Ship & Sonar Compass HUD */}
      <div className="relative mb-8 flex items-center justify-center">
        
        {/* Pulsing Sonar Rings */}
        <div className="absolute w-44 h-44 rounded-full border border-cyan-500/20 animate-ping opacity-30" />
        <div className="absolute w-36 h-36 rounded-full border border-amber-500/30 animate-pulse" />
        <div className="absolute w-28 h-28 rounded-full border-2 border-dashed border-cyan-400/40 animate-spin-slow" />
        
        {/* Core Center Vessel Symbol */}
        <div className="relative w-20 h-20 rounded-2xl bg-ocean-deck border-2 border-amber-500/60 shadow-2xl shadow-amber-500/20 flex items-center justify-center animate-float-gentle z-10">
          <CurrentIcon className="w-10 h-10 text-amber-400 animate-pulse" />
        </div>

        {/* Small Compass Tag */}
        <div className="absolute -top-3 -right-3 px-2 py-0.5 rounded-full bg-ocean-void border border-cyan-400 text-[10px] font-mono text-cyan-300 font-bold z-20">
          RADAR LOCK
        </div>
      </div>

      {/* Main Voyage Header */}
      <h2 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-white mb-2">
        Setting Sail for the Digital Cove
      </h2>
      
      <p className="text-sm font-mono text-amber-300 font-semibold mb-6 truncate max-w-md">
        Island: {repoName}
      </p>

      {/* Dynamic Animated Status Message Box */}
      <div className="w-full max-w-md p-4 rounded-xl bg-ocean-deck/90 border border-ocean-border shadow-inner font-mono text-xs text-slate-300 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
        <span className="text-left flex-1 transition-all duration-300">
          {steps[stepIndex].text}
        </span>
      </div>

      {/* Animated Wave Indicator */}
      <div className="mt-8 flex items-center gap-1.5 opacity-60">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="w-1 bg-amber-400/80 rounded-full animate-pulse"
            style={{
              height: `${12 + Math.sin(i + stepIndex) * 8}px`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

    </div>
  );
};
