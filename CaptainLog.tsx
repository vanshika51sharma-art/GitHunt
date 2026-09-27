import React, { useState, useEffect } from 'react';
import { BookOpen, Skull, Coins, Clock, X, Trash2, RotateCcw, Award } from 'lucide-react';
import { CaptainLogEntry } from '../types/githunt';

interface CaptainLogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIslandName?: (name: string) => void;
}

export const CaptainLog: React.FC<CaptainLogProps> = ({ isOpen, onClose, onSelectIslandName }) => {
  const [entries, setEntries] = useState<CaptainLogEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      try {
        const raw = localStorage.getItem('githunt_captain_log');
        if (raw) {
          setEntries(JSON.parse(raw));
        }
      } catch {
        setEntries([]);
      }
    }
  }, [isOpen]);

  const handleClear = () => {
    if (confirm("Are ye sure ye want to burn the Captain's Journal?")) {
      localStorage.removeItem('githunt_captain_log');
      setEntries([]);
    }
  };

  const totalDoubloons = entries.reduce((acc, curr) => acc + curr.doubloons, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-void/80 dark:bg-ocean-void/80 light:bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      
      <div className="relative w-full max-w-2xl bg-ocean-hull dark:bg-ocean-hull light:bg-white border-2 border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden p-6 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ocean-border/80 dark:border-ocean-border/80 light:border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 dark:text-amber-400 light:text-amber-700">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-cinzel text-xl font-bold text-white dark:text-white light:text-slate-900">
                Captain's Conquest Journal
              </h3>
              <p className="text-xs font-mono text-slate-400 dark:text-slate-400 light:text-slate-600 mt-0.5">
                History of conquered repositories & earned doubloons
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

        {/* Summary Tally Bar */}
        <div className="grid grid-cols-2 gap-3 mb-4 font-mono">
          <div className="p-3 rounded-xl bg-ocean-deck dark:bg-ocean-deck light:bg-amber-50/70 border border-ocean-border dark:border-ocean-border light:border-amber-200 flex items-center gap-3">
            <Coins className="w-5 h-5 text-amber-400 dark:text-amber-400 light:text-amber-600" />
            <div>
              <span className="text-[10px] uppercase text-slate-400 dark:text-slate-400 light:text-slate-600 block font-semibold">Total Loot Collected</span>
              <span className="font-bold text-amber-300 dark:text-amber-300 light:text-amber-800 text-base">{totalDoubloons} Doubloons</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-ocean-deck dark:bg-ocean-deck light:bg-sky-50/70 border border-ocean-border dark:border-ocean-border light:border-sky-200 flex items-center gap-3">
            <Award className="w-5 h-5 text-cyan-400 dark:text-cyan-400 light:text-sky-600" />
            <div>
              <span className="text-[10px] uppercase text-slate-400 dark:text-slate-400 light:text-slate-600 block font-semibold">Islands Raided</span>
              <span className="font-bold text-cyan-300 dark:text-cyan-300 light:text-sky-800 text-base">{entries.length} Repositories</span>
            </div>
          </div>
        </div>

        {/* Log Entries List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
          {entries.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-500 light:text-slate-400">
              <Skull className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No conquered islands in your journal yet, Captain.</p>
              <p className="text-[11px] mt-1 text-slate-400 dark:text-slate-600">Chart a course and claim your first bounty!</p>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="p-3 rounded-xl bg-ocean-deck/80 dark:bg-ocean-deck/80 light:bg-slate-50 hover:bg-ocean-deck dark:hover:bg-ocean-deck light:hover:bg-amber-50/50 border border-ocean-border dark:border-ocean-border light:border-slate-200 hover:border-amber-500/40 flex items-center justify-between gap-3 transition-all"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-300 dark:text-amber-300 light:text-amber-800 truncate text-sm">
                      {entry.repoName}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/10 dark:bg-amber-500/10 light:bg-amber-100 text-amber-400 dark:text-amber-400 light:text-amber-800 border border-amber-500/30">
                      {entry.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1 flex items-center gap-3">
                    <span className="text-slate-500 dark:text-slate-500 light:text-slate-400">{entry.completedAt}</span>
                    <span>⏱️ {entry.timeTaken}</span>
                    <span className="text-amber-400/90 dark:text-amber-400/90 light:text-amber-700 font-bold">{entry.pirateRank}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold text-amber-300 dark:text-amber-300 light:text-amber-700 text-sm block">
                    +{entry.doubloons} 🪙
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {entries.length > 0 && (
          <div className="pt-4 border-t border-ocean-border/60 dark:border-ocean-border/60 light:border-slate-200 flex items-center justify-between text-xs font-mono">
            <button
              onClick={handleClear}
              className="text-red-400 dark:text-red-400 light:text-red-600 hover:text-red-300 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
            <span className="text-slate-500 dark:text-slate-500 light:text-slate-400">Saved locally in browser</span>
          </div>
        )}

      </div>

    </div>
  );
};
