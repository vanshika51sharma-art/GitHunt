import React, { useState, useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { 
  FileCode, 
  Sparkles, 
  HelpCircle, 
  Feather, 
  AlertCircle, 
  Flame, 
  CheckCircle2, 
  XCircle,
  Search,
  Code2,
  Zap,
  ShieldAlert,
  Bug,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import { TreasureCategory, GuessRecord } from '../types/githunt';
import { soundEngine } from '../utils/soundEngine';

interface CodeArenaProps {
  filePath: string;
  code: string;
  language: string;
  riddle: string;
  category: TreasureCategory;
  targetLine: number;
  isTargetFile: boolean;
  theme?: 'dark' | 'light';
  onGuessLine: (lineNumber: number) => void;
  onSummonParrot: () => void;
  lastGuess: GuessRecord | null;
  attemptCount: number;
}

export const CodeArena: React.FC<CodeArenaProps> = ({
  filePath,
  code,
  language,
  riddle,
  category,
  targetLine,
  isTargetFile,
  theme = 'dark',
  onGuessLine,
  onSummonParrot,
  lastGuess,
  attemptCount,
}) => {
  const [editorReady, setEditorReady] = useState(false);
  const [activeFeedback, setActiveFeedback] = useState<{
    line: number;
    type: 'exact' | 'near' | 'far';
    message: string;
  } | null>(null);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  // Switch Monaco editor theme when the theme prop changes
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === 'dark' ? 'cyberPirateDark' : 'cyberPirateLight');
    }
  }, [theme]);

  // Update Monaco decorations when guesses are made
  const applyLineDecorations = (line: number, type: 'exact' | 'near' | 'far') => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    let className = 'bg-red-500/20 border-l-4 border-red-500';
    let glyphClassName = 'text-red-400 font-bold';

    if (type === 'exact') {
      className = 'bg-amber-500/30 border-l-4 border-amber-400 font-bold';
      glyphClassName = 'text-amber-300 font-bold text-base';
    } else if (type === 'near') {
      className = 'bg-amber-500/15 border-l-4 border-amber-500';
      glyphClassName = 'text-amber-400 font-bold';
    }

    const newDecorations = [
      {
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          className,
          glyphMarginClassName: glyphClassName,
          hoverMessage: {
            value: type === 'exact' ? '💰 **X MARKS THE SPOT!**' : `Dig Result: **${type.toUpperCase()}**`,
          },
        },
      },
    ];

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
    editor.revealLineInCenter(line);
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setEditorReady(true);

    // Dark Theme definition
    monaco.editor.defineTheme('cyberPirateDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'f59e0b', fontStyle: 'bold' },
        { token: 'string', foreground: '00f0ff' },
        { token: 'number', foreground: '38bdf8' },
        { token: 'function', foreground: 'fcd34d' },
      ],
      colors: {
        'editor.background': '#070D18',
        'editor.foreground': '#e2e8f0',
        'editor.lineHighlightBackground': '#111C3855',
        'editorGutter.background': '#050B14',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#f59e0b',
        'editorCursor.foreground': '#00f0ff',
      },
    });

    // Light Theme definition (warm parchment code viewer)
    monaco.editor.defineTheme('cyberPirateLight', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'd97706', fontStyle: 'bold' },
        { token: 'string', foreground: '0369a1' },
        { token: 'number', foreground: '0891b2' },
        { token: 'function', foreground: 'b45309' },
      ],
      colors: {
        'editor.background': '#FAF7EE',
        'editor.foreground': '#1E293B',
        'editor.lineHighlightBackground': '#F3EEDB77',
        'editorGutter.background': '#F0EAD6',
        'editorLineNumber.foreground': '#94A3B8',
        'editorLineNumber.activeForeground': '#D97706',
        'editorCursor.foreground': '#D97706',
      },
    });

    monaco.editor.setTheme(theme === 'dark' ? 'cyberPirateDark' : 'cyberPirateLight');

    // Handle line click as treasure dig
    editor.onMouseDown((e) => {
      const line = e.target.position?.lineNumber;
      if (line && line > 0) {
        handleLineDig(line);
      }
    });
  };

  const handleLineDig = (lineNumber: number) => {
    onGuessLine(lineNumber);

    if (isTargetFile) {
      const diff = Math.abs(lineNumber - targetLine);
      if (diff === 0) {
        soundEngine.playChestOpen();
        soundEngine.playCoinJingle();
        setActiveFeedback({
          line: lineNumber,
          type: 'exact',
          message: '💰 X MARKS THE SPOT! Treasure claimed!',
        });
        applyLineDecorations(lineNumber, 'exact');
      } else if (diff <= 4) {
        soundEngine.playNearGuess();
        setActiveFeedback({
          line: lineNumber,
          type: 'near',
          message: `🔥 SCORCHING HOT! The X be ${diff} line${diff === 1 ? '' : 's'} ${lineNumber < targetLine ? 'below' : 'above'}!`,
        });
        applyLineDecorations(lineNumber, 'near');
      } else {
        soundEngine.playWrongGuess();
        setActiveFeedback({
          line: lineNumber,
          type: 'far',
          message: `🌊 Missed! Dig coordinates off by ${diff} lines. Inspect the Clue Master's clue!`,
        });
        applyLineDecorations(lineNumber, 'far');
      }
    } else {
      soundEngine.playWrongGuess();
      setActiveFeedback({
        line: lineNumber,
        type: 'far',
        message: '🧊 Frozen waters! The treasure is buried in a different file/cove! Follow the Sonar Radar on the left!',
      });
    }
  };

  const getCategoryBadge = () => {
    switch (category) {
      case 'TIME_COMPLEXITY':
        return { label: 'Time Complexity', icon: Zap, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30 dark:text-amber-300 light:text-amber-700 light:bg-amber-100 light:border-amber-300' };
      case 'EDGE_CASE':
        return { label: 'Edge Case', icon: Bug, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30 dark:text-rose-300 light:text-rose-700 light:bg-rose-100 light:border-rose-300' };
      case 'SECURITY':
        return { label: 'Security Flaw', icon: ShieldAlert, color: 'text-red-400 bg-red-500/10 border-red-500/30 dark:text-red-300 light:text-red-700 light:bg-red-100 light:border-red-300' };
      case 'CLEAN_CODE':
      default:
        return { label: 'Clean Code', icon: Sparkles, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30 dark:text-cyan-300 light:text-sky-700 light:bg-sky-100 light:border-sky-300' };
    }
  };

  const catBadge = getCategoryBadge();
  const CategoryIcon = catBadge.icon;
  const lines = code.split('\n');

  return (
    <div className="flex flex-col h-full bg-ocean-deck/90 dark:bg-ocean-deck/90 light:bg-white border border-ocean-border dark:border-ocean-border light:border-slate-200 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md transition-colors">
      
      {/* Top Riddle & Clue Banner */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-ocean-hull via-ocean-deck to-ocean-bridge dark:from-ocean-hull dark:via-ocean-deck dark:to-ocean-bridge light:from-amber-50 light:via-orange-50 light:to-yellow-50 border-b border-ocean-border dark:border-ocean-border light:border-amber-200">
        
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
            <h3 className="font-cinzel text-xs sm:text-sm font-bold text-amber-300 dark:text-amber-300 light:text-amber-800 tracking-wide flex items-center gap-1.5">
              <span>🏴‍☠️ Clue Master's Clue</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono border ${catBadge.color}`}>
              <CategoryIcon className="w-3 h-3" />
              {catBadge.label}
            </span>
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-400 light:text-slate-600 px-2 py-0.5 rounded bg-ocean-void dark:bg-ocean-void light:bg-white border border-ocean-border dark:border-ocean-border light:border-slate-300">
              {attemptCount} Dig{attemptCount === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Clear & Accessible Clue Box */}
        <div className="p-3.5 rounded-xl bg-ocean-void/70 dark:bg-ocean-void/70 light:bg-white/90 border border-amber-500/30 dark:border-amber-500/30 light:border-amber-300 shadow-inner">
          <div className="flex items-start gap-2.5">
            <QuestionIcon className="w-4 h-4 text-amber-400 dark:text-amber-400 light:text-amber-600 shrink-0 mt-0.5" />
            <div className="font-mono text-xs sm:text-sm text-amber-200/95 dark:text-amber-200/95 light:text-slate-800 leading-relaxed whitespace-pre-line">
              {riddle}
            </div>
          </div>
        </div>

      </div>

      {/* Code Header & Breadcrumbs */}
      <div className="px-4 py-2 bg-ocean-hull/80 dark:bg-ocean-hull/80 light:bg-slate-50 border-b border-ocean-border/80 dark:border-ocean-border/80 light:border-slate-200 flex items-center justify-between gap-3 text-xs font-mono">
        
        <div className="flex items-center gap-2 min-w-0">
          <FileCode className="w-4 h-4 text-cyan-400 dark:text-cyan-400 light:text-sky-600 shrink-0" />
          <span className="text-slate-300 dark:text-slate-400 light:text-slate-700 font-semibold truncate">{filePath}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 light:text-slate-600 hidden sm:inline">
            👉 Click any line in the code to DIG
          </span>
          <button
            onClick={onSummonParrot}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 dark:text-amber-300 light:text-amber-800 text-xs font-semibold shadow-sm transition-all"
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Ask Percy 🦜</span>
          </button>
        </div>

      </div>

      {/* Active Guess Feedback Toast Bar */}
      {activeFeedback && (
        <div
          className={`px-4 py-2 border-b text-xs font-mono flex items-center justify-between gap-2 transition-all ${
            activeFeedback.type === 'exact'
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 dark:text-amber-300 light:text-amber-900 light:bg-amber-100'
              : activeFeedback.type === 'near'
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 dark:text-amber-400 light:text-amber-800 light:bg-amber-50'
              : 'bg-red-500/10 border-red-500/40 text-red-300 dark:text-red-300 light:text-red-800 light:bg-red-50'
          }`}
        >
          <div className="flex items-center gap-2">
            {activeFeedback.type === 'exact' ? (
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            ) : activeFeedback.type === 'near' ? (
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span className="font-semibold">{activeFeedback.message}</span>
          </div>

          {activeFeedback.type === 'far' && attemptCount >= 2 && (
            <button
              onClick={onSummonParrot}
              className="text-[11px] underline text-amber-300 dark:text-amber-300 light:text-amber-700 font-bold hover:text-amber-200"
            >
              Get Hint from Percy 🦜
            </button>
          )}
        </div>
      )}

      {/* Editor Body */}
      <div className="flex-1 relative min-h-[360px] bg-ocean-void dark:bg-ocean-void light:bg-[#FAF7EE]">
        <Editor
          height="100%"
          language={language || 'typescript'}
          value={code}
          theme={theme === 'dark' ? 'cyberPirateDark' : 'cyberPirateLight'}
          onMount={handleEditorMount}
          options={{
            readOnly: true,
            domReadOnly: true,
            minimap: { enabled: true },
            fontSize: 13,
            lineHeight: 20,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            scrollBeyondLastLine: false,
            glyphMargin: true,
            renderLineHighlight: 'all',
            cursorStyle: 'line',
            padding: { top: 8, bottom: 8 },
          }}
        />

        {/* Fallback code lines for fast line digging */}
        <noscript>
          <div className="p-4 font-mono text-xs text-slate-300 dark:text-slate-300 light:text-slate-800 overflow-auto h-full">
            {lines.map((line, idx) => (
              <div
                key={idx}
                onClick={() => handleLineDig(idx + 1)}
                className="hover:bg-amber-500/20 cursor-pointer py-0.5 flex gap-3"
              >
                <span className="text-slate-600 select-none w-8 text-right">{idx + 1}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </noscript>
      </div>

    </div>
  );
};
