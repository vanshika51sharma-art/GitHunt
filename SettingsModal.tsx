import React, { useState, useEffect } from 'react';
import { Settings, Key, Volume2, VolumeX, Shield, Check, X, Sparkles, ExternalLink, Sun, Moon } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMuted: boolean;
  theme: 'dark' | 'light';
  onToggleMute: () => void;
  onToggleTheme: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isMuted,
  theme,
  onToggleMute,
  onToggleTheme,
}) => {
  const [geminiKey, setGeminiKey] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGeminiKey(localStorage.getItem('githunt_gemini_key') || '');
      setGithubToken(localStorage.getItem('githunt_github_token') || '');
    }
  }, [isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('githunt_gemini_key', geminiKey.trim());
    localStorage.setItem('githunt_github_token', githubToken.trim());
    soundEngine.playCoinJingle();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-void/80 dark:bg-ocean-void/80 light:bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      
      <div className="relative w-full max-w-lg bg-ocean-hull dark:bg-ocean-hull light:bg-white border-2 border-slate-700/80 dark:border-slate-700/80 light:border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-6 font-mono transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ocean-border/80 dark:border-ocean-border/80 light:border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-amber-100 border border-slate-700 dark:border-slate-700 light:border-amber-300 text-amber-400 dark:text-amber-400 light:text-amber-800">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel text-lg font-bold text-white dark:text-white light:text-slate-900">
                Captain's Quarters & Instruments
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-600">
                Configure your ship's AI, theme, and GitHub keys
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

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          
          {/* Theme Switcher in Settings */}
          <div className="p-3 rounded-xl bg-ocean-deck dark:bg-ocean-deck light:bg-slate-50 border border-ocean-border dark:border-ocean-border light:border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-amber-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-600" />
              )}
              <div>
                <span className="font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 block">
                  Display Atmosphere
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-600">
                  {theme === 'dark' ? 'Cyber-Sea (Dark Mode)' : 'Ancient Map (Light Mode)'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleTheme}
              className="px-3 py-1.5 rounded-lg border border-ocean-border dark:border-ocean-border light:border-slate-300 bg-ocean-hull dark:bg-ocean-hull light:bg-white text-xs font-bold text-amber-400 dark:text-amber-300 light:text-amber-800 shadow-xs hover:border-amber-500/50 transition-all"
            >
              Toggle {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>

          {/* Gemini API Key */}
          <div className="p-3 rounded-xl bg-ocean-deck dark:bg-ocean-deck light:bg-slate-50 border border-ocean-border dark:border-ocean-border light:border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-amber-400 dark:text-amber-300 light:text-amber-800 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                <span>Google Gemini API Key</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-cyan-400 dark:text-cyan-400 light:text-sky-700 hover:underline flex items-center gap-0.5"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy... (optional, fallback procedural engine active)"
              className="w-full bg-ocean-void dark:bg-ocean-void light:bg-white text-slate-200 dark:text-slate-200 light:text-slate-800 text-xs px-3 py-2 rounded-lg border border-ocean-border dark:border-ocean-border light:border-slate-300 focus:border-amber-500/60 outline-none"
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 light:text-slate-600 mt-1">
              Powers live Gemini 2.0 Flash Clue Master riddles and Percy the Socratic Parrot.
            </p>
          </div>

          {/* GitHub Token */}
          <div className="p-3 rounded-xl bg-ocean-deck dark:bg-ocean-deck light:bg-slate-50 border border-ocean-border dark:border-ocean-border light:border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-300 dark:text-slate-300 light:text-slate-800 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400 dark:text-cyan-400 light:text-sky-600" />
                <span>GitHub Personal Access Token (Optional)</span>
              </label>
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-cyan-400 dark:text-cyan-400 light:text-sky-700 hover:underline flex items-center gap-0.5"
              >
                <span>Create Token</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_... (raises rate limits from 60 to 5,000 req/hr)"
              className="w-full bg-ocean-void dark:bg-ocean-void light:bg-white text-slate-200 dark:text-slate-200 light:text-slate-800 text-xs px-3 py-2 rounded-lg border border-ocean-border dark:border-ocean-border light:border-slate-300 focus:border-cyan-500/60 outline-none"
            />
          </div>

          {/* Audio Sound FX Toggle */}
          <div className="p-3 rounded-xl bg-ocean-deck dark:bg-ocean-deck light:bg-slate-50 border border-ocean-border dark:border-ocean-border light:border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-amber-400 dark:text-amber-400 light:text-amber-600" />}
              <div>
                <span className="font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 block">Acoustic Sonar & Pirate Sound FX</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-600">Synthesized Web Audio sound cues</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleMute}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                isMuted
                  ? 'bg-slate-800 dark:bg-slate-800 light:bg-slate-200 border-slate-700 text-slate-400 dark:text-slate-400 light:text-slate-600'
                  : 'bg-amber-500/20 border-amber-500/50 text-amber-300 dark:text-amber-300 light:text-amber-800'
              }`}
            >
              {isMuted ? 'Muted' : 'Enabled'}
            </button>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-ocean-deck dark:bg-ocean-deck light:bg-slate-100 hover:bg-ocean-bridge dark:hover:bg-ocean-bridge light:hover:bg-slate-200 text-slate-400 dark:text-slate-400 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-ocean-void font-bold shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Instruments</span>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
