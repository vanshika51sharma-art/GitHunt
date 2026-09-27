import React, { useState } from 'react';
import { 
  Skull, 
  Compass, 
  Sparkles, 
  ArrowRight, 
  Flame, 
  ShieldAlert, 
  Zap, 
  Bug, 
  Coins, 
  Search, 
  ExternalLink,
  Code2,
  Radio,
  Feather
} from 'lucide-react';
import { PRESET_ISLANDS, POPULAR_GITHUB_REPOS } from '../data/islandPresets';
import { PresetIsland, RepositoryMetadata } from '../types/githunt';
import { soundEngine } from '../utils/soundEngine';

interface LandingHeroProps {
  onStartHunt: (repoUrl: string) => void;
  onSelectPreset: (island: PresetIsland) => void;
  onSelectPopular: (repo: RepositoryMetadata) => void;
  isLoading: boolean;
  errorMessage: string | null;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartHunt,
  onSelectPreset,
  onSelectPopular,
  isLoading,
  errorMessage,
}) => {
  const [inputUrl, setInputUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    soundEngine.playCannon();
    onStartHunt(inputUrl.trim());
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'TIME_COMPLEXITY':
        return { label: 'Time Complexity', icon: Zap, color: 'text-amber-400 dark:text-amber-300 light:text-amber-700 bg-amber-500/10 dark:bg-amber-500/10 light:bg-amber-100 border-amber-500/30' };
      case 'EDGE_CASE':
        return { label: 'Edge Case', icon: Bug, color: 'text-rose-400 dark:text-rose-300 light:text-rose-700 bg-rose-500/10 dark:bg-rose-500/10 light:bg-rose-100 border-rose-500/30' };
      case 'SECURITY':
        return { label: 'Security Flaw', icon: ShieldAlert, color: 'text-red-400 dark:text-red-300 light:text-red-700 bg-red-500/10 dark:bg-red-500/10 light:bg-red-100 border-red-500/30' };
      case 'CLEAN_CODE':
      default:
        return { label: 'Clean Code', icon: Sparkles, color: 'text-cyan-400 dark:text-cyan-300 light:text-sky-700 bg-cyan-500/10 dark:bg-cyan-500/10 light:bg-sky-100 border-cyan-500/30' };
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-65px)] overflow-hidden py-10 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col justify-center">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 dark:bg-amber-500/10 light:bg-amber-300/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-cyan-500/10 dark:bg-cyan-500/10 light:bg-sky-300/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Hero Header */}
      <div className="relative z-10 text-center max-w-3xl mx-auto mb-10">
        
        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ocean-deck/90 dark:bg-ocean-deck/90 light:bg-white border border-amber-500/30 dark:border-amber-500/30 light:border-amber-300 shadow-md text-amber-400 dark:text-amber-300 light:text-amber-800 text-xs font-mono mb-6">
          <Skull className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 animate-pulse" />
          <span>Algothon'26 Solo Hackathon Entry</span>
          <span className="text-slate-400">•</span>
          <span className="text-cyber-cyan dark:text-cyber-cyan light:text-sky-600 font-semibold">100% Procedural & AI Powered</span>
        </div>

        {/* Title */}
        <h1 className="font-cinzel text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 drop-shadow-md">
          <span className="font-pirate text-5xl sm:text-7xl text-amber-500 dark:text-amber-400 block sm:inline">
            GitHunt
          </span>
          <span className="block sm:inline sm:ml-4 text-slate-800 dark:text-slate-100 text-3xl sm:text-5xl">
            — X Marks the Bug.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-sans">
          Transform any public GitHub repository into an interactive code-review treasure hunt.
          Dig through real code with a <span className="text-sky-600 dark:text-cyber-cyan font-medium">Sonar Distance Radar</span> and learn CS fundamentals guided by a wise-cracking <span className="text-amber-600 dark:text-amber-400 font-medium">AI Parrot</span>.
        </p>

        {/* Repo Input Box */}
        <form onSubmit={handleSubmit} className="mt-8 max-w-2xl mx-auto">
          <div className="relative flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl bg-white dark:bg-ocean-deck/95 border-2 border-slate-300 dark:border-ocean-border focus-within:border-amber-500/80 shadow-2xl transition-all">
            <div className="flex items-center flex-1 w-full pl-3 gap-3">
              <Compass className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Enter GitHub URL or owner/repo (e.g. expressjs/express)..."
                disabled={isLoading}
                className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm sm:text-base outline-none font-mono py-2"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputUrl.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 disabled:opacity-50 text-ocean-void font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              {isLoading ? (
                <>
                  <Compass className="w-4 h-4 animate-spin text-ocean-void" />
                  <span>Charting...</span>
                </>
              ) : (
                <>
                  <span>Set Sail</span>
                  <ArrowRight className="w-4 h-4 text-ocean-void" />
                </>
              )}
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-red-100 dark:bg-red-950/70 border border-red-300 dark:border-red-500/50 text-red-800 dark:text-red-200 text-xs font-mono text-left flex items-start gap-2 shadow-lg">
              <ShieldAlert className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-700 dark:text-red-300">Voyage Interrupted:</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Popular Repos Quick Chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Quick Raid:</span>
            {POPULAR_GITHUB_REPOS.map((pop) => (
              <button
                key={pop.fullName}
                type="button"
                onClick={() => {
                  soundEngine.playCannon();
                  onSelectPopular(pop);
                }}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-ocean-deck hover:bg-slate-100 dark:hover:bg-ocean-bridge border border-slate-300 dark:border-ocean-border hover:border-amber-500/50 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-300 shadow-sm transition-colors"
              >
                {pop.fullName}
              </button>
            ))}
          </div>
        </form>

      </div>

      {/* Featured Cursed Preset Islands Grid */}
      <div className="relative z-10 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            <h2 className="font-cinzel text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-200">
              Legendary Cursed Islands (Instant Play)
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
            Zero setup • Pre-charted waters
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESET_ISLANDS.map((island) => {
            const badge = getCategoryBadge(island.category);
            const BadgeIcon = badge.icon;

            return (
              <div
                key={island.id}
                onClick={() => {
                  soundEngine.playCannon();
                  onSelectPreset(island);
                }}
                className="group relative p-4 rounded-2xl bg-white dark:bg-ocean-deck/90 hover:bg-amber-50/50 dark:hover:bg-ocean-bridge border border-slate-200 dark:border-ocean-border hover:border-amber-400 dark:hover:border-amber-500/50 shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono border ${badge.color}`}>
                      <BadgeIcon className="w-3 h-3" />
                      {badge.label}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-ocean-hull text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-ocean-border">
                      {island.difficulty}
                    </span>
                  </div>

                  {/* Island Name */}
                  <h3 className="font-cinzel font-bold text-base text-amber-700 dark:text-amber-300 group-hover:text-amber-800 dark:group-hover:text-amber-200 transition-colors line-clamp-1">
                    {island.name}
                  </h3>

                  {/* Tagline */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {island.tagline}
                  </p>
                </div>

                {/* Footer Metadata */}
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-ocean-border/60 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span className="text-sky-600 dark:text-cyber-cyan font-semibold">{island.language}</span>
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold group-hover:translate-x-1 transition-transform">
                    Raid Island →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3-Step Gameplay Loop Mechanics Banner */}
      <div className="relative z-10 mt-14 pt-10 border-t border-slate-200 dark:border-ocean-border/80">
        <h2 className="text-center font-cinzel text-lg font-bold text-slate-800 dark:text-slate-300 mb-8">
          How GitHunt Transforms Code Review into Dopamine
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          
          <div className="p-5 rounded-2xl bg-white dark:bg-ocean-deck/60 border border-slate-200 dark:border-ocean-border shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30 flex items-center justify-center text-sky-600 dark:text-cyan-400 mb-3">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="font-cinzel font-bold text-sm text-slate-900 dark:text-slate-200 mb-1">
              1. Chart the Island
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              GitHunt ingests any public repository in a single tree request. Candidate files are scored procedurally, and the AI Clue Master hides real bugs as buried treasure.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-ocean-deck/60 border border-slate-200 dark:border-ocean-border shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="font-cinzel font-bold text-sm text-slate-900 dark:text-slate-200 mb-1">
              2. Follow the Sonar Radar
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Navigate coves and files with instant hot/cold sonar telemetry (🔥 BURNING HOT to 🧊 FROZEN). As you enter the treasure cove, line-level fathoms lock onto your target.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-ocean-deck/60 border border-slate-200 dark:border-ocean-border shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
              <Feather className="w-5 h-5" />
            </div>
            <h3 className="font-cinzel font-bold text-sm text-slate-900 dark:text-slate-200 mb-1">
              3. Dig & Learn with Percy
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Click code lines in the Monaco Code Arena to submit your guess. Stuck? Ask Percy the Parrot for witty Socratic clues that teach real CS concepts without spoiling answers.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
