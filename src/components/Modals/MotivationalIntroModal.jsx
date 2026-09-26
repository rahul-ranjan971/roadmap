import React, { useEffect, useState } from 'react';
import { Compass, ArrowRight, X, Sparkles, BookOpen, Binary, FileCode, Cpu } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function MotivationalIntroModal() {
  const { introOpen, closeIntro, todayQuote, stats, todayMission } = useApp();
  const [progress, setProgress] = useState(0);

  // 30-second presentation experience (can be skipped or entered at any second)
  useEffect(() => {
    if (!introOpen) return;
    const duration = 30000; // 30s max presentation
    const interval = 100;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          closeIntro();
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [introOpen, closeIntro]);

  if (!introOpen) return null;

  const currentDay = stats.currentDay;
  const currentPhase = stats.currentPhase;

  // Extract mission components from actual roadmap data (Requirement 9)
  const mainTrackSection = todayMission?.sections?.find((s) => s.id === 'main');
  const dsaSection = todayMission?.sections?.find((s) => s.id === 'dsa');
  const pythonSection = todayMission?.sections?.find((s) => s.id === 'python');
  const coreCsSection = todayMission?.sections?.find((s) => s.id === 'core-cs');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-title"
    >
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#121524] via-[#0d0f1a] to-[#080911] border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl overflow-hidden text-center my-auto transition-all">
        {/* Subtle animated background glow (respects reduced motion) */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none motion-safe:animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none motion-safe:animate-pulse" />

        {/* Top Header: Brand & Skip Button */}
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Compass className="w-5 h-5 motion-safe:animate-spin-slow" />
            </div>
            <div className="text-left">
              <span className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase block">
                CAREER COMPASS
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                120-Day Engineering Placement OS
              </span>
            </div>
          </div>

          <button
            onClick={closeIntro}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-medium border border-white/5 transition-colors cursor-pointer"
            aria-label="Skip Intro"
          >
            <span>Skip Intro</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* DAY X / 120 Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wider uppercase mb-5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>DAY {currentDay.day} / 120</span>
          <span className="text-gray-500">•</span>
          <span className="text-purple-300">{currentPhase.name}</span>
        </div>

        {/* Today's Motivational Quote (Fade-in with author and source attribution) */}
        <div className="relative my-4 px-2 sm:px-6">
          <blockquote className="text-lg sm:text-xl md:text-2xl font-medium text-gray-100 leading-relaxed tracking-tight motion-safe:animate-fade-in">
            &ldquo;{todayQuote.quote || todayQuote.text}&rdquo;
          </blockquote>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="font-semibold text-purple-400">
              — {todayQuote.author}
            </span>
            {todayQuote.category && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400 capitalize">
                {todayQuote.category}
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Today's Learning Mission (Requirements 1 & 9) */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-left space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-white/5 pb-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              TODAY&apos;S MISSION (DAY {currentDay.day})
            </span>
            <span className="text-[10px] text-gray-500 font-mono capitalize">
              Week {currentDay.week}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Main Track focus */}
            {mainTrackSection && (
              <div className="flex items-start gap-2.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="font-semibold text-white">Main Track: </span>
                  <span className="text-gray-300">{mainTrackSection.focus}</span>
                </div>
              </div>
            )}

            {/* C++ & DSA problem focus */}
            {dsaSection && (
              <div className="flex items-start gap-2.5">
                <Binary className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="font-semibold text-white">C++ & DSA: </span>
                  <span className="text-gray-300">{dsaSection.focus}</span>
                </div>
              </div>
            )}

            {/* Python companion focus */}
            {pythonSection && (
              <div className="flex items-start gap-2.5">
                <FileCode className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="font-semibold text-white">Python Track: </span>
                  <span className="text-gray-300">{pythonSection.focus}</span>
                </div>
              </div>
            )}

            {/* Core CS focus (if scheduled) */}
            {coreCsSection && (
              <div className="flex items-start gap-2.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="font-semibold text-white">Core CS: </span>
                  <span className="text-gray-300">{coreCsSection.focus}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress & Preparing status (Requirements 1 & 2) */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center text-[11px] text-gray-400 font-mono">
            <span>Preparing your Career Compass...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-800/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Action Controls: [ ENTER CAREER COMPASS → ] & Skip Intro (Requirement 3) */}
        <div className="mt-6 pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={closeIntro}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>ENTER CAREER COMPASS</span>
            <ArrowRight className="w-4 h-4 motion-safe:group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={closeIntro}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-medium text-xs border border-white/5 transition-colors cursor-pointer"
          >
            Skip Intro
          </button>
        </div>
      </div>
    </div>
  );
}
