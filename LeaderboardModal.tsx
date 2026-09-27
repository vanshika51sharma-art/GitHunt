import React from 'react';
import { Trophy, Skull, Coins, Clock, X, Award, Flame } from 'lucide-react';
import { INITIAL_LEADERBOARD } from '../data/pirateLeaderboard';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerDoubloons?: number;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  playerDoubloons = 0,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-void/80 dark:bg-ocean-void/80 light:bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      
      <div className="relative w-full max-w-2xl bg-ocean-hull dark:bg-ocean-hull light:bg-white border-2 border-yellow-500/50 rounded-3xl shadow-2xl overflow-hidden p-6 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ocean-border/80 dark:border-ocean-border/80 light:border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-500 dark:text-yellow-400 light:text-amber-600">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-cinzel text-xl font-bold text-white dark:text-white light:text-slate-900">
                Hall of Notorious Buccaneer Captains
              </h3>
              <p className="text-xs font-mono text-slate-400 dark:text-slate-400 light:text-slate-600 mt-0.5">
                Top Code Reviewers across the Cyber-Sea
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-ocean-deck dark:bg-ocean-deck light:bg-slate-100 hover:bg-ocean-bridge dark:hover:bg-ocean-bridge light:hover:bg-slate-200 text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Leaderboard Table */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
          {INITIAL_LEADERBOARD.map((captain, index) => {
            const isTop3 = index < 3;
            return (
              <div
                key={captain.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  isTop3
                    ? 'bg-ocean-deck/90 dark:bg-ocean-deck/90 light:bg-amber-50/70 border-amber-500/40 dark:border-amber-500/40 light:border-amber-300 shadow-sm'
                    : 'bg-ocean-deck/50 dark:bg-ocean-deck/50 light:bg-slate-50 border-ocean-border dark:border-ocean-border light:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Position Badge */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm shrink-0 ${
                      index === 0
                        ? 'bg-amber-400 text-ocean-void shadow-md shadow-amber-400/30 font-bold'
                        : index === 1
                        ? 'bg-slate-300 text-slate-900 font-bold'
                        : index === 2
                        ? 'bg-amber-700 text-amber-100 font-bold'
                        : 'bg-ocean-void dark:bg-ocean-void light:bg-slate-200 text-slate-500 border border-ocean-border dark:border-ocean-border light:border-slate-300'
                    }`}
                  >
                    {index + 1}
                  </div>

                  {/* Captain Avatar & Name */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{captain.avatar}</span>
                      <span className="font-bold text-amber-200 dark:text-amber-200 light:text-amber-900 truncate text-sm">
                        {captain.captainName}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-400 dark:text-amber-300 light:text-amber-800 font-bold hidden sm:inline">
                        {captain.rankBadge}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-600 mt-0.5 flex items-center gap-2">
                      <span className="text-cyan-300 dark:text-cyan-300 light:text-sky-700 font-semibold">{captain.islandName}</span>
                      <span>•</span>
                      <span>⏱️ {captain.timeTaken}</span>
                    </div>
                  </div>
                </div>

                {/* Loot */}
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-amber-300 dark:text-amber-300 light:text-amber-800 font-black text-sm">
                    <Coins className="w-3.5 h-3.5 text-amber-400 dark:text-amber-400 light:text-amber-600" />
                    <span>{captain.doubloons}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase">Doubloons</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-ocean-border/60 dark:border-ocean-border/60 light:border-slate-200 text-center text-xs font-mono text-slate-500 dark:text-slate-500 light:text-slate-400">
          Rankings updated after each conquered repository
        </div>

      </div>

    </div>
  );
};
