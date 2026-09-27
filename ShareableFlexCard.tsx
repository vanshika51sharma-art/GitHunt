import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { 
  Skull, 
  Coins, 
  Clock, 
  Award, 
  Download, 
  Copy, 
  Check, 
  X, 
  Share2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { GameScore, RepositoryMetadata, TreasureTarget } from '../types/githunt';
import { soundEngine } from '../utils/soundEngine';

interface ShareableFlexCardProps {
  isOpen: boolean;
  onClose: () => void;
  target: TreasureTarget;
  repo: RepositoryMetadata;
  score: GameScore;
}

export const ShareableFlexCard: React.FC<ShareableFlexCardProps> = ({
  isOpen,
  onClose,
  target,
  repo,
  score,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const tweetText = encodeURIComponent(
    `🏴‍☠️ Just claimed ${score.doubloons} Doubloons on GitHunt! Found buried ${target.category.replace('_', ' ')} in ${repo.fullName} in ${formatTime(score.timeSpentSeconds)}.\n\nRank: ${score.pirateRank.badge} ${score.pirateRank.title}\n\nThink ye can find the bug faster, Captain? ⚔️ #GitHunt #Algothon26 #CodeReview`
  );

  const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    soundEngine.playCoinJingle();

    try {
      const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `GitHunt-${repo.repo}-Loot.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // Fallback
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = async () => {
    if (!cardRef.current) return;
    soundEngine.playCoinJingle();

    try {
      const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // If clipboard copy of image isn't supported, fallback to tweet text
      navigator.clipboard.writeText(decodeURIComponent(tweetText));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-void/80 dark:bg-ocean-void/80 light:bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      
      <div className="relative w-full max-w-lg bg-ocean-hull dark:bg-ocean-hull light:bg-white border-2 border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden p-6 transition-colors">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-ocean-deck dark:bg-ocean-deck light:bg-slate-100 hover:bg-ocean-bridge dark:hover:bg-ocean-bridge light:hover:bg-slate-200 text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-4">
          <h3 className="font-cinzel text-xl font-bold text-white dark:text-white light:text-slate-900 flex items-center justify-center gap-2">
            <Award className="w-5 h-5 text-amber-400 dark:text-amber-400 light:text-amber-600" />
            <span>Shareable Pirate Flex Card</span>
          </h3>
          <p className="text-xs font-mono text-slate-400 dark:text-slate-400 light:text-slate-600 mt-0.5">
            Export your conquest and challenge fellow buccaneers
          </p>
        </div>

        {/* The Exportable Visual Card */}
        <div
          ref={cardRef}
          className="p-6 rounded-2xl bg-gradient-to-br from-ocean-deck via-ocean-hull to-ocean-void dark:from-ocean-deck dark:via-ocean-hull dark:to-ocean-void light:from-slate-900 light:via-slate-950 light:to-ocean-abyss border-2 border-amber-500/60 shadow-2xl relative overflow-hidden font-mono text-white"
        >
          {/* Background Ambient Glows */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Card Header with GitHunt Logo */}
          <div className="flex items-center justify-between gap-3 border-b border-ocean-border/80 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-ocean-void font-bold shadow-md">
                <Skull className="w-5 h-5" />
              </div>
              <div>
                <span className="font-pirate text-xl text-amber-400 block leading-none">
                  GitHunt
                </span>
                <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">
                  X Marks the Bug
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl">{score.pirateRank.badge}</span>
            </div>
          </div>

          {/* Island & Rank Info */}
          <div className="mb-4">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Conquered Island
            </span>
            <h4 className="font-cinzel font-bold text-lg text-amber-200 truncate">
              {repo.fullName || repo.repo}
            </h4>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-300">
              <span>{score.pirateRank.title}</span>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="p-2 rounded-xl bg-ocean-void/80 border border-ocean-border text-center">
              <Coins className="w-4 h-4 text-amber-400 mx-auto mb-0.5" />
              <span className="text-[9px] text-slate-400 block uppercase">Doubloons</span>
              <span className="font-black text-amber-300 text-sm">{score.doubloons}</span>
            </div>
            <div className="p-2 rounded-xl bg-ocean-void/80 border border-ocean-border text-center">
              <Clock className="w-4 h-4 text-cyan-400 mx-auto mb-0.5" />
              <span className="text-[9px] text-slate-400 block uppercase">Time</span>
              <span className="font-bold text-slate-200 text-xs mt-0.5 block">{formatTime(score.timeSpentSeconds)}</span>
            </div>
            <div className="p-2 rounded-xl bg-ocean-void/80 border border-ocean-border text-center">
              <Sparkles className="w-4 h-4 text-emerald-400 mx-auto mb-0.5" />
              <span className="text-[9px] text-slate-400 block uppercase">Accuracy</span>
              <span className="font-bold text-emerald-300 text-xs mt-0.5 block">{score.accuracyPercent}%</span>
            </div>
          </div>

          {/* Concepts Mastered */}
          <div className="pt-2 border-t border-ocean-border/60">
            <span className="text-[9px] text-slate-400 uppercase block mb-1">
              Concepts Mastered:
            </span>
            <div className="flex flex-wrap gap-1">
              {target.conceptTags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-ocean-bridge text-[10px] text-cyan-300 border border-ocean-border"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Watermark CTA */}
          <div className="mt-4 pt-2 border-t border-ocean-border/40 text-[9px] text-slate-400 flex justify-between items-center">
            <span>Play free at GitHunt</span>
            <span className="text-amber-400 font-bold">Algothon'26</span>
          </div>

        </div>

        {/* Action Controls */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          
          <button
            onClick={handleCopy}
            className="p-2.5 rounded-xl bg-ocean-deck dark:bg-ocean-deck light:bg-slate-100 hover:bg-ocean-bridge dark:hover:bg-ocean-bridge light:hover:bg-slate-200 border border-ocean-border dark:border-ocean-border light:border-slate-300 text-slate-200 dark:text-slate-200 light:text-slate-800 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400 dark:text-amber-400 light:text-amber-600" />}
            <span>{isCopied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="p-2.5 rounded-xl bg-ocean-deck dark:bg-ocean-deck light:bg-slate-100 hover:bg-ocean-bridge dark:hover:bg-ocean-bridge light:hover:bg-slate-200 border border-ocean-border dark:border-ocean-border light:border-slate-300 text-slate-200 dark:text-slate-200 light:text-slate-800 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400 dark:text-cyan-400 light:text-sky-600" />
            <span>{isDownloading ? 'Exporting...' : 'Save PNG'}</span>
          </button>

          <a
            href={twitterIntentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 shadow-md transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share on X</span>
          </a>

        </div>

      </div>

    </div>
  );
};
