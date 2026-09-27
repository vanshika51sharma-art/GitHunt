import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Skull, 
  Coins, 
  Clock, 
  Feather, 
  Sparkles, 
  Share2, 
  RotateCcw, 
  BookOpen, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Bug,
  Download,
  Award
} from 'lucide-react';
import { TreasureTarget, GameScore, RepositoryMetadata } from '../types/githunt';
import { soundEngine } from '../utils/soundEngine';

interface SkillScrollProps {
  target: TreasureTarget;
  repo: RepositoryMetadata;
  score: GameScore;
  onOpenFlexCard: () => void;
  onPlayAgain: () => void;
  onOpenLog: () => void;
}

export const SkillScroll: React.FC<SkillScrollProps> = ({
  target,
  repo,
  score,
  onOpenFlexCard,
  onPlayAgain,
  onOpenLog,
}) => {
  const [animatedDoubloons, setAnimatedDoubloons] = useState(0);

  // Trigger gold confetti burst and sound on mount
  useEffect(() => {
    soundEngine.playChestOpen();
    soundEngine.playCoinJingle();

    // Cascading gold coin confetti
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#F59E0B', '#FBBF24', '#00F0FF', '#FFFFFF'];

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Animate doubloon counter ticking up
    let current = 0;
    const step = Math.max(1, Math.floor(score.doubloons / 40));
    const timer = setInterval(() => {
      current += step;
      if (current >= score.doubloons) {
        setAnimatedDoubloons(score.doubloons);
        clearInterval(timer);
      } else {
        setAnimatedDoubloons(current);
      }
    }, 25);

    return () => clearInterval(timer);
  }, [score.doubloons]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4 flex flex-col items-center justify-center max-w-4xl mx-auto">
      
      {/* Top Triumphant Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono text-xs font-bold mb-3 shadow-lg shadow-amber-500/20 animate-pulse">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>TREASURE CLAIMED & LOOT REVEALED</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-white tracking-tight">
          Loot & Learning Scroll
        </h1>
        <p className="text-sm font-mono text-slate-300 mt-1">
          Island: <span className="text-amber-300 font-bold">{repo.fullName || repo.repo}</span>
        </p>
      </div>

      {/* The Ancient Parchment Skill Scroll */}
      <div className="relative w-full rounded-3xl bg-gradient-to-b from-[#FBF5E5] via-[#F4ECD8] to-[#E8DCBF] text-[#26170D] p-6 sm:p-10 parchment-shadow border-4 border-[#8C683B] relative overflow-hidden font-serif">
        
        {/* Decorative Corner Ornaments */}
        <div className="absolute top-3 left-3 text-2xl select-none opacity-40 text-[#8C683B]">⚜️</div>
        <div className="absolute top-3 right-3 text-2xl select-none opacity-40 text-[#8C683B]">⚜️</div>
        <div className="absolute bottom-3 left-3 text-2xl select-none opacity-40 text-[#8C683B]">⚜️</div>
        <div className="absolute bottom-3 right-3 text-2xl select-none opacity-40 text-[#8C683B]">⚜️</div>

        {/* Wax Seal Stamp */}
        <div className="absolute top-6 right-6 sm:top-8 sm:right-8 w-16 h-16 sm:w-20 sm:h-20 rounded-full wax-seal flex flex-col items-center justify-center text-white border-2 border-amber-300/40 rotate-12 shadow-2xl z-20 select-none">
          <span className="font-pirate text-xl sm:text-2xl font-bold leading-none">
            {score.pirateRank.badge}
          </span>
          <span className="text-[8px] font-mono tracking-widest font-black uppercase text-amber-200 mt-0.5">
            VERIFIED
          </span>
        </div>

        {/* Scroll Header */}
        <div className="border-b-2 border-[#8C683B]/40 pb-4 mb-6">
          <span className="text-xs font-mono tracking-widest uppercase text-[#8C683B] font-bold block mb-1">
            Official Cyber-Pirate Charter
          </span>
          <h2 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-[#26170D]">
            📜 Skill Scroll of Mastery
          </h2>
          <p className="font-mono text-xs sm:text-sm text-[#574133] mt-1">
            Treasure Found In: <span className="font-bold underline">{target.filePath}</span>, Line <span className="font-bold underline">{target.targetLine}</span>
          </p>
        </div>

        {/* Concept Mastered Section */}
        <div className="space-y-6">
          
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-lg">🏴‍☠️</span>
              <h3 className="font-cinzel text-base sm:text-lg font-bold text-[#26170D] tracking-wide">
                CONCEPT MASTERED: {target.category.replace('_', ' ')}
              </h3>
            </div>
            <p className="font-sans text-sm sm:text-base text-[#3D2617] leading-relaxed pl-7">
              {target.revealExplanation}
            </p>
          </div>

          {/* Why It Matters */}
          {target.whyItMatters && (
            <div className="bg-[#EDE1C5]/70 p-4 rounded-xl border border-[#8C683B]/30 pl-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">📖</span>
                <h4 className="font-cinzel font-bold text-sm text-[#26170D]">
                  WHY IT MATTERS:
                </h4>
              </div>
              <p className="font-sans text-xs sm:text-sm text-[#4A3222] leading-relaxed italic">
                "{target.whyItMatters}"
              </p>
            </div>
          )}

          {/* The Conceptual Fix */}
          {target.theFix && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">💡</span>
                <h4 className="font-cinzel font-bold text-sm text-[#26170D]">
                  THE ARCHITECTURAL FIX:
                </h4>
              </div>
              <p className="font-sans text-xs sm:text-sm text-[#3D2617] leading-relaxed pl-7">
                {target.theFix}
              </p>
            </div>
          )}

          {/* Concept Tag Chips */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#8C683B]/30">
            {target.conceptTags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md bg-[#DFD0AF] border border-[#8C683B]/40 font-mono text-xs font-bold text-[#26170D]"
              >
                🏷️ {tag}
              </span>
            ))}
          </div>

        </div>

        {/* Voyage Stats Grid */}
        <div className="mt-8 pt-6 border-t-2 border-[#8C683B]/40 grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
          
          <div className="p-3 rounded-xl bg-[#EDE1C5]/80 border border-[#8C683B]/30 text-center">
            <Coins className="w-5 h-5 text-amber-700 mx-auto mb-1" />
            <span className="text-[10px] uppercase text-[#6B4F2C] block font-bold">Doubloons</span>
            <span className="text-lg font-black text-[#26170D]">{animatedDoubloons}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#EDE1C5]/80 border border-[#8C683B]/30 text-center">
            <Clock className="w-5 h-5 text-amber-700 mx-auto mb-1" />
            <span className="text-[10px] uppercase text-[#6B4F2C] block font-bold">Time Taken</span>
            <span className="text-lg font-black text-[#26170D]">{formatTime(score.timeSpentSeconds)}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#EDE1C5]/80 border border-[#8C683B]/30 text-center">
            <Feather className="w-5 h-5 text-amber-700 mx-auto mb-1" />
            <span className="text-[10px] uppercase text-[#6B4F2C] block font-bold">Parrot Hints</span>
            <span className="text-lg font-black text-[#26170D]">{score.hintsUsed}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#EDE1C5]/80 border border-[#8C683B]/30 text-center">
            <Award className="w-5 h-5 text-amber-700 mx-auto mb-1" />
            <span className="text-[10px] uppercase text-[#6B4F2C] block font-bold">Rank Awarded</span>
            <span className="text-xs font-black text-[#26170D] truncate block">{score.pirateRank.title}</span>
          </div>

        </div>

      </div>

      {/* Bottom Action Triggers */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        
        <button
          onClick={onOpenFlexCard}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-ocean-void font-bold font-mono text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Claim Shareable Flex Card</span>
        </button>

        <button
          onClick={onOpenLog}
          className="px-5 py-3 rounded-xl bg-ocean-deck hover:bg-ocean-bridge border border-ocean-border hover:border-amber-500/40 text-slate-200 hover:text-amber-300 font-mono text-sm flex items-center gap-2 transition-all"
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>Captain's Journal</span>
        </button>

        <button
          onClick={onPlayAgain}
          className="px-5 py-3 rounded-xl bg-ocean-deck hover:bg-ocean-bridge border border-ocean-border hover:border-cyan-400/50 text-cyan-300 hover:text-cyan-200 font-mono text-sm flex items-center gap-2 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Raid Another Island</span>
        </button>

      </div>

    </div>
  );
};
