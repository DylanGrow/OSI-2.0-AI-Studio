/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, 
  Layers, 
  ChevronRight, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  BrainCircuit,
  Info
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Question, QuizState } from './types.ts';
import { INITIAL_QUESTIONS, OSI_LAYERS } from './constants.ts';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [state, setState] = useState<QuizState>({
    currentQuestionIndex: 0,
    score: 0,
    answers: [],
    status: 'idle'
  });
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds

  // Subtle audio feedback system
  const playSfx = (type: 'start' | 'correct' | 'incorrect' | 'finish') => {
    const urls = {
      start: 'https://cdn.pixabay.com/audio/2022/03/10/audio_b28274431f.mp3', // Tech/Bleep
      correct: 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625902047.mp3', // Ding/Success
      incorrect: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c0338ec71E.mp3', // Subtle Thud/Error
      finish: 'https://cdn.pixabay.com/audio/2022/10/05/audio_276a6e5414.mp3', // Win/Success long
    };
    const audio = new Audio(urls[type]);
    audio.volume = 0.2;
    audio.play().catch(() => {}); // Catch browser autoplay restrictions
  };

  useEffect(() => {
    if (state.status === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [state.status, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = INITIAL_QUESTIONS[state.currentQuestionIndex];

  const startQuiz = () => {
    playSfx('start');
    setState({
      currentQuestionIndex: 0,
      score: 0,
      answers: [],
      status: 'playing'
    });
    setSelectedOption(null);
    setShowExplanation(false);
    setAiExplanation(null);
    setTimeLeft(3600);
  };

  const handleOptionSelect = (index: number) => {
    if (showExplanation) return;
    setSelectedOption(index);
  };

  const submitAnswer = async () => {
    if (selectedOption === null) return;
    
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    playSfx(isCorrect ? 'correct' : 'incorrect');
    setShowExplanation(true);

    if (!isCorrect) {
      fetchAiExplanation();
    }
  };

  const fetchAiExplanation = async () => {
    setIsAiLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `The student is taking an OSI model quiz. 
        Question: ${currentQuestion.text}
        Their Answer: ${currentQuestion.options[selectedOption!]}
        Correct Answer: ${currentQuestion.options[currentQuestion.correctAnswer]}
        
        Provide a very brief (2 sentences), clear, technical explanation of why the correct answer is right and why the misconception about their answer might exist. Focus on the technical function of the layer.`,
      });
      setAiExplanation(response.text || null);
    } catch (e) {
      console.error("AI fetch failed", e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const nextQuestion = () => {
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const newAnswers = [...state.answers];
    newAnswers[state.currentQuestionIndex] = selectedOption!;

    if (state.currentQuestionIndex + 1 < INITIAL_QUESTIONS.length) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        score: isCorrect ? prev.score + 1 : prev.score,
        answers: newAnswers
      }));
      setSelectedOption(null);
      setShowExplanation(false);
      setAiExplanation(null);
    } else {
      playSfx('finish');
      setState(prev => ({
        ...prev,
        score: isCorrect ? prev.score + 1 : prev.score,
        status: 'finished'
      }));
    }
  };

  if (state.status === 'idle') {
    return (
      <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-4xl border-4 border-[#141414] bg-white shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] overflow-hidden flex flex-col md:flex-row"
        >
          <div className="md:w-1/2 p-12 bg-[#D1D0CC] border-b md:border-b-0 md:border-r-4 border-[#141414] flex flex-col justify-between">
            <div>
              <div className="bg-[#141414] text-[#E4E3E0] inline-block px-3 py-1 font-mono text-sm font-bold mb-8">
                OSI-PRO-CERT
              </div>
              <h1 className="text-6xl font-bold tracking-tighter uppercase italic leading-none font-serif mb-6">
                Technical Assessment
              </h1>
              <p className="text-lg font-medium leading-tight opacity-80 uppercase tracking-widest font-mono">
                ISO/IEC 7498-1 Compliance Test
              </p>
            </div>
            <div className="mt-12 space-y-2 opacity-60 font-mono text-xs uppercase">
              <div>Version 2.4.0-STABLE</div>
              <div>Standard Protocol Validation</div>
            </div>
          </div>
          
          <div className="md:w-1/2 p-12 flex flex-col justify-between bg-white">
            <div className="space-y-8">
              <div className="border-l-4 border-[#141414] pl-6 py-2">
                <h3 className="font-mono text-[10px] uppercase tracking-widest opacity-40 mb-2 font-bold">Objective</h3>
                <p className="text-sm font-medium">Validation of conceptual understanding across all 7 OSI abstract layers including data encapsulation and PDU mapping.</p>
              </div>
              <div className="border-l-4 border-[#141414] pl-6 py-2">
                <h3 className="font-mono text-[10px] uppercase tracking-widest opacity-40 mb-2 font-bold">Technical Guard</h3>
                <p className="text-sm font-medium">Dynamic AI logic verification powered by Gemini Core for remediation feedback.</p>
              </div>
            </div>

            <button 
              onClick={startQuiz}
              className="mt-12 group flex items-center justify-between w-full px-8 py-6 bg-[#141414] text-[#E4E3E0] font-bold text-xl uppercase tracking-widest hover:bg-[#2a2a2a] transition-all"
            >
              Begin Session
              <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (state.status === 'finished') {
    return (
      <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl border-4 border-[#141414] bg-white shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] p-12"
        >
          <div className="flex justify-between items-start mb-12 pb-12 border-b-2 border-[#141414]">
            <div className="space-y-1">
              <h2 className="text-4xl font-serif font-bold italic tracking-tighter uppercase">Certification Result</h2>
              <div className="font-mono text-[10px] opacity-50 uppercase tracking-[0.3em]">Module 07: OSI Reference Model</div>
            </div>
            <div className="text-right">
              <div className="text-7xl font-bold font-mono tracking-tighter leading-none">
                {Math.round((state.score / INITIAL_QUESTIONS.length) * 100)}
              </div>
              <div className="text-[10px] uppercase font-bold opacity-60 tracking-widest">Global Score %</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="bg-[#D1D0CC] p-6 border-2 border-[#141414]">
              <div className="text-[10px] font-mono font-bold opacity-50 uppercase tracking-widest mb-1">Status</div>
              <div className="text-xl font-bold uppercase font-serif italic">
                {state.score >= 7 ? "Certified" : "Re-eval Required"}
              </div>
            </div>
            <div className="bg-[#D1D0CC] p-6 border-2 border-[#141414]">
              <div className="text-[10px] font-mono font-bold opacity-50 uppercase tracking-widest mb-1">Correct Units</div>
              <div className="text-xl font-bold font-mono">{state.score}/{INITIAL_QUESTIONS.length}</div>
            </div>
          </div>

          <button 
            onClick={startQuiz}
            className="w-full flex items-center justify-center gap-4 px-8 py-6 bg-[#141414] text-[#E4E3E0] font-bold text-xl uppercase tracking-widest hover:bg-[#2a2a2a] transition-all"
          >
            <RotateCcw size={24} />
            Reset Diagnostic
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#E4E3E0] text-[#141414] font-sans flex flex-col overflow-hidden border-4 border-[#141414]">
      {/* Header */}
      <header className="h-16 border-b border-[#141414] bg-[#D1D0CC] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-[#141414] text-[#E4E3E0] px-2 py-1 font-mono text-xs font-bold">OSI-SIM-PRO</div>
          <h1 className="font-serif italic text-xl hidden md:block">Network Architecture Certification: Module 07</h1>
        </div>
        <div className="flex items-center gap-6 font-mono text-[11px]">
          <div className="flex flex-col items-end">
            <span className="opacity-50">CANDIDATE ID</span>
            <span className="font-bold uppercase tracking-tighter">sys_admin_904</span>
          </div>
          <div className="bg-[#141414] text-[#E4E3E0] px-4 py-2 flex gap-3">
            <span className="opacity-70">REMAINING:</span> 
            <span className="font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-[#141414] bg-[#DBD9D5] hidden md:flex flex-col shrink-0">
          <div className="p-4 border-b border-[#141414] bg-[#C4C3BF]">
            <div className="text-[10px] uppercase tracking-widest opacity-60 mb-3 font-bold">Question Matrix</div>
            <div className="grid grid-cols-5 gap-1">
              {INITIAL_QUESTIONS.map((_, i) => {
                const isCurrent = i === state.currentQuestionIndex;
                const isAnswered = i < state.currentQuestionIndex;
                const baseClasses = "h-8 border border-[#141414] flex items-center justify-center text-xs font-mono transition-colors";
                
                if (isCurrent) return <div key={i} className={`${baseClasses} bg-white border-2 ring-1 ring-inset ring-[#141414] font-bold`}>0{i+1}</div>;
                if (isAnswered) return <div key={i} className={`${baseClasses} bg-[#141414] text-[#E4E3E0]`}>0{i+1}</div>;
                return <div key={i} className={`${baseClasses} opacity-40`}>0{i+1}</div>;
              })}
            </div>
          </div>
          <div className="p-4 space-y-6 flex-1 overflow-y-auto">
            <div>
              <div className="text-[10px] uppercase tracking-widest opacity-60 mb-2 font-bold">Layer Reference</div>
              <div className="space-y-1 font-mono text-[9px]">
                {OSI_LAYERS.slice().reverse().map((layer, i) => {
                  const num = 7 - i;
                  const isCurrent = currentQuestion.layer === num;
                  return (
                    <div key={layer} className={`flex justify-between border-b border-[#141414]/10 py-0.5 ${isCurrent ? 'bg-white/40 px-1 font-bold' : ''}`}>
                      <span>0{num} {layer.toUpperCase()}</span>
                      <span className="opacity-40">{[7,6,5].includes(num) ? 'DATA' : num === 4 ? 'SEGMENTS' : num === 3 ? 'PACKETS' : num === 2 ? 'FRAMES' : 'BITS'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest opacity-60 mb-2 font-bold">Exam Score</div>
              <div className="bg-white border border-[#141414] p-3 flex items-end gap-2">
                <span className="text-4xl font-mono leading-none">{state.score * 10}</span>
                <span className="text-[10px] mb-1 opacity-50 underline font-bold">PTS</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 md:p-16 flex flex-col relative overflow-y-auto bg-white">
          <div className="absolute top-0 right-0 p-12 opacity-[0.04] pointer-events-none">
            <div className="text-[240px] font-serif font-bold italic tracking-tighter leading-none">
              Q.0{state.currentQuestionIndex + 1}
            </div>
          </div>

          <div className="mb-12 relative z-10">
            <div className="inline-block px-2 py-0.5 bg-[#141414] text-[#E4E3E0] font-mono text-[10px] mb-6 uppercase tracking-widest font-bold">
              Competency Level: Professional
            </div>
            <h2 className="text-3xl md:text-4xl font-bold max-w-3xl leading-tight text-[#141414] font-serif italic tracking-tight">
              {currentQuestion.text}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl relative z-10">
            {currentQuestion.options.map((option, i) => {
              const isSelected = selectedOption === i;
              const isCorrect = showExplanation && i === currentQuestion.correctAnswer;
              const isWrong = showExplanation && isSelected && i !== currentQuestion.correctAnswer;
              const letter = String.fromCharCode(65 + i);

              let boxClasses = "bg-white border border-[#141414]";
              let indicatorClasses = "bg-white text-[#141414] border border-[#141414]";

              if (showExplanation) {
                if (isCorrect) {
                  boxClasses = "bg-[#D1D0CC] border-2 border-[#141414]";
                  indicatorClasses = "bg-[#141414] text-[#E4E3E0]";
                } else if (isWrong) {
                  boxClasses = "opacity-40 line-through";
                } else {
                  boxClasses = "opacity-40";
                }
              } else if (isSelected) {
                boxClasses = "bg-[#141414] text-[#E4E3E0] border-2 border-[#141414]";
                indicatorClasses = "bg-[#E4E3E0] text-[#141414]";
              }

              return (
                <div 
                  key={i}
                  onClick={() => !showExplanation && setSelectedOption(i)}
                  className={`group cursor-pointer p-4 flex items-center gap-4 transition-all h-20 ${boxClasses} ${!showExplanation ? 'hover:bg-[#141414] hover:text-[#E4E3E0]' : ''}`}
                >
                  <div className={`w-10 h-10 shrink-0 flex items-center justify-center font-mono font-bold text-lg group-hover:border-[#E4E3E0] ${indicatorClasses}`}>
                    {letter}
                  </div>
                  <div className="text-sm font-bold uppercase tracking-tight leading-tight">{option}</div>
                </div>
              );
            })}
          </div>

          <AnimatePresence>
            {showExplanation && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 space-y-6 max-w-4xl relative z-10"
              >
                <div className="bg-[#E4E3E0] border-2 border-[#141414] p-6 flex gap-4">
                  <div className="p-2 border border-[#141414] h-fit bg-white">
                    <Info size={20} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono font-bold uppercase opacity-50">Protocol Summary</div>
                    <p className="font-bold text-sm leading-relaxed">{currentQuestion.explanation}</p>
                  </div>
                </div>

                {selectedOption !== currentQuestion.correctAnswer && (
                  <div className="bg-[#141414] text-[#E4E3E0] p-8 border-l-[12px] border-[#D1D0CC]">
                    <div className="flex items-center gap-3 mb-4 text-[#D1D0CC] uppercase font-mono text-xs font-bold tracking-[0.2em]">
                      <BrainCircuit size={18} />
                      Misconception Audit
                    </div>
                    {isAiLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="animate-spin"><RotateCcw size={16} /></div>
                        <span className="font-mono text-xs uppercase opacity-60">Synchronizing AI Node...</span>
                      </div>
                    ) : (
                      <p className="text-lg font-serif italic leading-relaxed opacity-90">
                        "{aiExplanation}"
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-auto pt-12 flex flex-col md:flex-row justify-between items-end border-t border-[#141414]/20 gap-8">
            <div className="max-w-xs text-[10px] font-mono leading-relaxed opacity-40 uppercase tracking-tight">
              ERRATA: System-generated validation active. All responses are final once confirmed. Ensure Layer {currentQuestion.layer || 'X'} criteria are met before injection.
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              {!showExplanation ? (
                <button 
                  onClick={submitAnswer}
                  disabled={selectedOption === null}
                  className={`h-16 px-12 font-mono text-sm font-bold uppercase tracking-widest transition-all w-full md:w-auto ${
                    selectedOption !== null 
                    ? 'bg-[#141414] text-[#E4E3E0] hover:bg-[#333] cursor-pointer' 
                    : 'bg-[#D1D0CC] text-[#141414] opacity-40 cursor-not-allowed'
                  }`}
                >
                  Confirm & Protocol
                </button>
              ) : (
                <button 
                  onClick={nextQuestion}
                  className="h-16 px-12 bg-[#141414] text-[#E4E3E0] font-mono text-sm font-bold hover:bg-[#333] uppercase tracking-widest w-full md:w-auto flex items-center justify-center gap-3"
                >
                  {state.currentQuestionIndex + 1 === INITIAL_QUESTIONS.length ? "Finalize Review" : "Next Data Unit"}
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="h-8 border-t border-[#141414] bg-[#141414] text-[#E4E3E0] px-6 flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.2em] shrink-0">
        <div className="flex gap-6 items-center">
          <span>Status: Encryption Active</span>
          <span className="hidden md:inline text-[8px] opacity-40">Socket ID: PRO-7498-1</span>
        </div>
        <div className="flex gap-6 items-center">
          <span>Build 0.9.77-CERT</span>
          <span className="hidden md:inline">ISO/IEC 7498-1 Standard compliant</span>
        </div>
      </footer>
    </div>
  );
}
