import React, { useState, useRef, useEffect } from 'react';
import { 
  Feather, 
  Send, 
  Sparkles, 
  Volume2, 
  X, 
  HelpCircle, 
  MessageSquare,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { ChatMessage, TreasureTarget } from '../types/githunt';
import { askPercyTheParrot } from '../services/geminiService';
import { soundEngine } from '../utils/soundEngine';

interface ParrotCoPilotProps {
  isOpen: boolean;
  onClose: () => void;
  target: TreasureTarget;
  attemptCount: number;
  currentFilePath: string;
  onHintUsed: () => void;
}

export const ParrotCoPilot: React.FC<ParrotCoPilotProps> = ({
  isOpen,
  onClose,
  target,
  attemptCount,
  currentFilePath,
  onHintUsed,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'percy',
      text: "*Squawk!* 🦜 Ahoy, Captain! I be Percy, your ship's parrot! Ask me for a hint, and I will guide you with helpful questions without spoiling the exact line! What part of the code can I help you think about?",
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isThinking) return;

    soundEngine.playParrotSquawk();
    onHintUsed();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      const percyReply = await askPercyTheParrot(
        query.trim(),
        target,
        attemptCount,
        messages,
        currentFilePath
      );

      const percyMsg: ChatMessage = {
        id: `percy-${Date.now()}`,
        sender: 'percy',
        text: percyReply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, percyMsg]);
      soundEngine.playParrotSquawk();
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `percy-err-${Date.now()}`,
        sender: 'percy',
        text: "*Flaps wings!* 🦜 Look closely at how data passes through your routines, Captain!",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const quickPrompts = [
    "Give me a clear hint 🦜",
    "What CS concept is this?",
    "Am I in the right file?",
    "How does the loop behave?",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[92vw] sm:w-[400px] h-[520px] max-h-[85vh] flex flex-col bg-ocean-hull/95 dark:bg-ocean-hull/95 light:bg-white border-2 border-amber-500/60 rounded-2xl shadow-2xl shadow-black/60 backdrop-blur-xl overflow-hidden animate-float-gentle transition-colors">
      
      {/* Parrot Header */}
      <div className="p-3.5 bg-gradient-to-r from-amber-600/30 via-yellow-600/20 to-ocean-deck dark:from-amber-600/30 dark:via-yellow-600/20 dark:to-ocean-deck light:from-amber-100 light:via-yellow-50 light:to-orange-100 border-b border-amber-500/40 flex items-center justify-between gap-2">
        
        <div className="flex items-center gap-2.5">
          {/* Animated Parrot Avatar */}
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 text-ocean-void shadow-md shadow-amber-500/30">
            <span className="text-xl">🦜</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-ocean-void" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-pirate text-lg text-amber-300 dark:text-amber-300 light:text-amber-800 leading-none">
                Percy the Parrot
              </h3>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 dark:text-amber-300 light:text-amber-800 border border-amber-500/40 font-bold">
                Socratic Mentor
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-400 light:text-slate-600 mt-0.5">
              Strict Pirate Code: No answer leaks
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-800 hover:bg-ocean-deck dark:hover:bg-ocean-deck light:hover:bg-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

      </div>

      {/* Chat Messages Bubble Stream */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 font-mono text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-amber-500/20 dark:bg-amber-500/20 light:bg-amber-100 text-amber-100 dark:text-amber-100 light:text-amber-950 border border-amber-500/40 rounded-br-xs'
                  : 'bg-ocean-deck dark:bg-ocean-deck light:bg-slate-50 border border-ocean-border dark:border-ocean-border light:border-slate-200 text-slate-200 dark:text-slate-200 light:text-slate-800 rounded-bl-xs shadow-md'
              }`}
            >
              {msg.sender === 'percy' && (
                <div className="flex items-center gap-1 text-[10px] text-amber-400 dark:text-amber-400 light:text-amber-700 font-bold mb-1">
                  <span>🦜 Percy:</span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-start gap-2">
            <div className="p-3 rounded-2xl bg-ocean-deck dark:bg-ocean-deck light:bg-slate-50 border border-ocean-border dark:border-ocean-border light:border-slate-200 text-amber-300 dark:text-amber-300 light:text-amber-800 flex items-center gap-2">
              <span className="text-sm animate-bounce">🦜</span>
              <span className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 italic">Percy is thinking...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="p-2 border-t border-ocean-border/60 dark:border-ocean-border/60 light:border-slate-200 bg-ocean-void/40 dark:bg-ocean-void/40 light:bg-slate-50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={isThinking}
            className="px-2.5 py-1 rounded-full bg-ocean-deck dark:bg-ocean-deck light:bg-white hover:bg-ocean-bridge dark:hover:bg-ocean-bridge light:hover:bg-slate-100 border border-ocean-border dark:border-ocean-border light:border-slate-300 text-[10px] font-mono text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-amber-300 dark:hover:text-amber-300 light:hover:text-amber-800 shrink-0 transition-all shadow-xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2.5 bg-ocean-deck dark:bg-ocean-deck light:bg-slate-100 border-t border-ocean-border dark:border-ocean-border light:border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask Percy for a Socratic hint..."
          disabled={isThinking}
          className="flex-1 bg-ocean-void dark:bg-ocean-void light:bg-white text-slate-200 dark:text-slate-200 light:text-slate-800 text-xs font-mono px-3 py-2 rounded-xl border border-ocean-border dark:border-ocean-border light:border-slate-300 focus:border-amber-500/60 outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isThinking}
          className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 disabled:opacity-40 text-ocean-void font-bold transition-all"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
};
