import React from 'react';
import { 
  Skull, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Trophy, 
  Settings, 
  Compass, 
  Coins, 
  RotateCcw,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { RepositoryMetadata } from '../types/githunt';
import { soundEngine } from '../utils/soundEngine';

interface NavbarProps {
  currentRepo: RepositoryMetadata | null;
  doubloons: number;
  isMuted: boolean;
  theme: 'dark' | 'light';
  onToggleMute: () => void;
  onToggleTheme: () => void;
  onOpenLog: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
  onNewVoyage: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRepo,
  doubloons,
  isMuted,
  theme,
  onToggleMute,
  onToggleTheme,
  onOpenLog,
  onOpenLeaderboard,
  onOpenSettings,
  onNewVoyage,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-ocean-hull/90 dark:bg-ocean-hull/90 light:bg-white/90 backdrop-blur-md border-b border-ocean-border/80 dark:border-ocean-border/80 light:border-slate-200 px-4 lg:px-6 py-2.5 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div 
          onClick={onNewVoyage}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-ocean-void shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Skull className="w-6 h-6 stroke-[2.2] text-ocean-void" />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyber-cyan text-[10px] font-black text-ocean-void">
              X
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-pirate text-2xl tracking-wider text-amber-400 group-hover:text-amber-300 transition-colors">
                GitHunt
              </span>
              <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-ocean-deck dark:bg-ocean-deck light:bg-slate-100 border border-amber-500/30 text-amber-400 dark:text-amber-300 font-mono font-bold">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500 -mt-1 font-mono hidden sm:block">
              X Marks the Bug
            </p>
          </div>
        </div>

        {/* Center: Current Island Status (if active) */}
        {currentRepo && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ocean-deck/80 dark:bg-ocean-deck/80 light:bg-slate-100 border border-ocean-border dark:border-ocean-border light:border-slate-300 text-xs font-mono">
            <Compass className="w-3.5 h-3.5 text-cyber-cyan dark:text-cyber-cyan light:text-sky-600 animate-spin-slow" />
            <span className="text-slate-400 dark:text-slate-400 light:text-slate-600">Island:</span>
            <span className="text-amber-300 dark:text-amber-300 light:text-amber-700 font-semibold truncate max-w-[200px]">
              {currentRepo.fullName || currentRepo.repo}
            </span>
            {currentRepo.isPreset && (
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 dark:text-amber-300 light:text-amber-800 text-[10px] font-bold">
                Cursed Isle
              </span>
            )}
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Doubloons Wallet */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/20 border border-amber-500/40 shadow-inner">
            <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-mono font-bold text-amber-400 dark:text-amber-300 light:text-amber-700 text-sm">
              {doubloons}
            </span>
            <span className="text-[10px] text-amber-400/80 font-mono uppercase hidden xs:inline">
              Loot
            </span>
          </div>

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={() => {
              onToggleTheme();
              soundEngine.playSonarPing('warm');
            }}
            title={theme === 'dark' ? "Switch to Ancient Map (Light Mode)" : "Switch to Cyber Sea (Dark Mode)"}
            className="p-2 rounded-lg bg-ocean-deck dark:bg-ocean-deck light:bg-slate-100 hover:bg-ocean-bridge dark:hover:bg-ocean-bridge light:hover:bg-slate-200 border border-ocean-border dark:border-ocean-border light:border-slate-300 text-amber-400 dark:text-amber-300 light:text-amber-700 transition-all shadow-sm active:scale-95 flex items-center justify-center"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={() => {
              onToggleMute();
              soundEngine.playSonarPing('cold');
            }}
            title={isMuted ? "Unmute Sound FX" : "Mute Sound FX"}
            className={`p-2 rounded-lg border transition-all ${
              isMuted
                ? 'bg-ocean-deck/50 dark:bg-ocean-deck/50 light:bg-slate-100 border-ocean-border dark:border-ocean-border light:border-slate-300 text-slate-500'
                : 'bg-ocean-deck dark:bg-ocean-deck light:bg-slate-100 border-amber-500/40 text-amber-400 dark:text-amber-400 light:text-amber-700 shadow-sm'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Captain's Log Button */}
          <button
            onClick={onOpenLog}
            title="Captain's Conquest Log"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-ocean-deck dark:bg-ocean-deck light:bg-slate-100 hover:bg-ocean-bridge dark:hover:bg-ocean-bridge light:hover:bg-slate-200 border border-ocean-border dark:border-ocean-border light:border-slate-300 text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 font-mono transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400 dark:text-amber-400 light:text-amber-600" />
            <span className="hidden sm:inline">Log</span>
          </button>

          {/* Leaderboard Button */}
          <button
            onClick={onOpenLeaderboard}
            title="Hall of Notorious Buccaneer Captains"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-ocean-deck dark:bg-ocean-deck light:bg-slate-100 hover:bg-ocean-bridge dark:hover:bg-ocean-bridge light:hover:bg-slate-200 border border-ocean-border dark:border-ocean-border light:border-slate-300 text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 font-mono transition-all"
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-500 dark:text-yellow-400 light:text-amber-600" />
            <span className="hidden sm:inline">Hall</span>
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            title="Captain's Quarters (Settings & AI Keys)"
            className="p-2 rounded-lg bg-ocean-deck dark:bg-ocean-deck light:bg-slate-100 hover:bg-ocean-bridge dark:hover:bg-ocean-bridge light:hover:bg-slate-200 border border-ocean-border dark:border-ocean-border light:border-slate-300 text-slate-400 dark:text-slate-400 light:text-slate-600 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* New Voyage Button */}
          {currentRepo && (
            <button
              onClick={onNewVoyage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 dark:from-cyan-600 dark:to-blue-600 text-ocean-void dark:text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">New Voyage</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
