import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Mic,
  MicOff,
  Search,
  ArrowRight,
  Zap,
  CornerDownLeft,
  X,
  Compass,
  FileSpreadsheet,
  Layers,
  HelpCircle,
  Activity
} from 'lucide-react';
import { FinancialDataset } from '../types';

interface CinematicCommandHUDProps {
  dataset: FinancialDataset | null;
  onRunQuery: (query: string) => void;
  isInvestigating: boolean;
  investigationStepText?: string;
  investigationProgress?: number;
  activeQuery?: string | null;
  onClearInvestigation?: () => void;
}

const SUGGESTED_PROMPTS = [
  { text: 'Where is my money going?', icon: '📊', category: 'Topology' },
  { text: 'What changed recently?', icon: '📈', category: 'Trends' },
  { text: 'Find unusual spending', icon: '🚨', category: 'Risk' },
  { text: 'Show me my biggest recurring expense', icon: '🔄', category: 'Habits' },
  { text: 'Can I afford a ₹25,000 purchase?', icon: '🛒', category: 'Simulation' },
  { text: 'Audit tax deduction shields (80C & 80D)', icon: '🛡️', category: 'Tax' }
];

export const CinematicCommandHUD: React.FC<CinematicCommandHUDProps> = ({
  dataset,
  onRunQuery,
  isInvestigating,
  investigationStepText,
  investigationProgress = 0,
  activeQuery,
  onClearInvestigation
}) => {
  const [queryInput, setQueryInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [voiceVolume, setVoiceVolume] = useState<number[]>([12, 18, 28, 14, 22, 10, 32, 16]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioIntervalRef = useRef<any>(null);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsExpanded(true);
        inputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsExpanded(true);
        inputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsExpanded(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setSpeechTranscript(transcript);
        setQueryInput(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      };

      recognition.onerror = () => {
        setIsListening(false);
        if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      if (queryInput.trim()) {
        handleSubmit(queryInput);
      }
    } else {
      setIsListening(true);
      setSpeechTranscript('');
      setIsExpanded(true);

      // Audio waveform simulation
      audioIntervalRef.current = setInterval(() => {
        setVoiceVolume([
          Math.floor(Math.random() * 26) + 8,
          Math.floor(Math.random() * 32) + 12,
          Math.floor(Math.random() * 38) + 16,
          Math.floor(Math.random() * 28) + 10,
          Math.floor(Math.random() * 36) + 14,
          Math.floor(Math.random() * 24) + 8,
          Math.floor(Math.random() * 40) + 12,
          Math.floor(Math.random() * 20) + 6
        ]);
      }, 100);

      try {
        if (recognitionRef.current) {
          recognitionRef.current.start();
        } else {
          // Graceful fallback simulation
          setTimeout(() => {
            const fallbackVoicePrompts = [
              'Where is my money going?',
              'Find unusual spending',
              'Show me my biggest recurring expense',
              'What changed recently?'
            ];
            const chosen = fallbackVoicePrompts[Math.floor(Math.random() * fallbackVoicePrompts.length)];
            setQueryInput(chosen);
            setIsListening(false);
            if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
          }, 2400);
        }
      } catch (err) {
        setIsListening(false);
        if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      }
    }
  };

  const handleSubmit = (overrideQuery?: string) => {
    const q = (overrideQuery || queryInput).trim();
    if (!q || isInvestigating) return;
    setIsListening(false);
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    setIsExpanded(false);
    onRunQuery(q);
  };

  return (
    <div className="w-full relative z-30">
      {/* Floating Minimal Command Bar */}
      <div className="relative mx-auto max-w-3xl">
        {/* Glow backdrop aura */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 via-cyan-500/30 to-purple-500/20 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-500 pointer-events-none" />

        <div className="relative rounded-2xl sm:rounded-3xl bg-[#090E18]/95 border border-white/15 p-2 sm:p-2.5 shadow-2xl shadow-black/90 backdrop-blur-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex items-center gap-2"
          >
            {/* AI Spark Icon / Status */}
            <div className="pl-2 sm:pl-3 flex items-center justify-center shrink-0">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center border transition-all ${
                  isInvestigating
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 animate-pulse'
                    : 'bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border-emerald-500/30 text-emerald-400'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${isInvestigating ? 'animate-spin' : ''}`} />
              </div>
            </div>

            {/* Input Field */}
            <div className="flex-1 relative min-w-0">
              <input
                ref={inputRef}
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                placeholder={
                  isListening
                    ? 'Listening to your voice prompt...'
                    : dataset
                    ? `Ask FinGuard Copilot (${dataset.transactions.length} rows loaded)...`
                    : 'Ask about spending, unusual outliers, or recurring commitments...'
                }
                className="w-full bg-transparent px-2 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
              />
            </div>

            {/* Voice Waveform when listening */}
            {isListening && (
              <div className="flex items-center space-x-1 px-2 shrink-0">
                {voiceVolume.map((vol, idx) => (
                  <motion.div
                    key={idx}
                    animate={{ height: vol }}
                    className="w-1 bg-cyan-400 rounded-full"
                    transition={{ type: 'spring', damping: 10, stiffness: 200 }}
                  />
                ))}
              </div>
            )}

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2 rounded-xl border transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                isListening
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-white'
              }`}
              title={isListening ? 'Stop listening' : 'Voice Input (Ask questions with voice)'}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>

            {/* Submit / Action Button */}
            <button
              type="submit"
              disabled={!queryInput.trim() || isInvestigating}
              className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 disabled:opacity-30 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 shadow-md shadow-emerald-500/20"
            >
              <span className="hidden xs:inline">Ask AI</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>

            {/* Keyboard shortcut hint */}
            <div className="hidden lg:flex items-center text-[10px] font-mono-num text-slate-500 pr-2 border-l border-white/10 pl-2">
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">⌘K</kbd>
            </div>
          </form>

          {/* Active Investigation Progress Bar */}
          {isInvestigating && (
            <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1.5 px-2">
              <div className="flex items-center justify-between text-[11px] font-mono-num">
                <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>{investigationStepText || 'Investigating Ledger Vector Matrix...'}</span>
                </span>
                <span className="text-slate-400">{investigationProgress}%</span>
              </div>
              <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400"
                  animate={{ width: `${investigationProgress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Fast Prompts Bar */}
      <div className="mt-3 flex items-center justify-center flex-wrap gap-2 max-w-4xl mx-auto px-2">
        <span className="text-[10px] font-mono-num text-slate-500 uppercase tracking-widest hidden sm:inline mr-1">
          SUGGESTIONS:
        </span>
        {SUGGESTED_PROMPTS.slice(0, 4).map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQueryInput(prompt.text);
              handleSubmit(prompt.text);
            }}
            disabled={isInvestigating}
            className="text-[11px] font-medium px-3 py-1.5 rounded-xl bg-[#090E18]/80 hover:bg-slate-800/90 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer flex items-center space-x-1.5 shadow-sm"
          >
            <span className="text-xs">{prompt.icon}</span>
            <span>{prompt.text}</span>
          </button>
        ))}
      </div>

      {/* Expanded Prompt Palette Dropdown (When focused) */}
      <AnimatePresence>
        {isExpanded && !isInvestigating && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setIsExpanded(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-full max-w-2xl rounded-2xl bg-[#0A0F1D]/95 border border-white/15 p-4 shadow-2xl shadow-black z-30 backdrop-blur-2xl space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[11px] font-mono-num text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Curated Analytical Inquiries</span>
                </span>
                <span className="text-[10px] text-slate-500">Click to run immediately</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setQueryInput(prompt.text);
                      handleSubmit(prompt.text);
                    }}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="text-base">{prompt.icon}</span>
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 truncate">
                        {prompt.text}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono-num uppercase px-1.5 py-0.5 rounded bg-white/5 text-slate-400 shrink-0">
                      {prompt.category}
                    </span>
                  </div>
                ))}
              </div>

              {dataset && (
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono-num text-slate-500">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <FileSpreadsheet className="w-3 h-3" />
                    <span>Grounded in: {dataset.name}</span>
                  </span>
                  <span>{dataset.transactions.length} Ledger Vectors</span>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
