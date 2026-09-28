import React, { useState } from 'react';
import {
  FileCode,
  CheckCircle2,
  ExternalLink,
  BarChart3,
  Brain,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function PythonPage() {
  const { topics, navigateTo, aiTrackStatus } = useApp();
  const [activeTab, setActiveTab] = useState('fundamentals');

  // Find python topics
  const pythonFundamentals = topics.find((t) => t.id === 'topic-python-fundamentals');
  const pythonData = topics.find((t) => t.id === 'topic-python-data');
  const pythonAi = topics.find((t) => t.id === 'topic-python-ai');

  const currentTopic = {
    fundamentals: pythonFundamentals,
    data: pythonData,
    ai: pythonAi,
  }[activeTab] || pythonFundamentals;

  const isUnlocked = aiTrackStatus?.isUnlocked;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#11131c] border border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Python Track & Data / AI Specialization
              </h1>
              {!isUnlocked && (
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked Companion Track
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              Continuous companion track from syntax and OOP to Pandas, NumPy, Scikit-Learn, and PyTorch
            </p>
          </div>
        </div>

        <button
          onClick={() => navigateTo('practice')}
          className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <span>Python Practice Sandbox</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sequential Progression Lock Banner */}
      {!isUnlocked && (
        <div className="p-6 rounded-3xl bg-amber-950/25 border border-amber-500/30 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Sequential Progression Lock Active</h3>
              <p className="text-xs text-amber-200/80 mt-0.5 leading-relaxed">
                The AI, Python, and AI Engineering companion track is locked from Day 1 to ensure foundational mastery. Complete Web Development (Phases 1–4) and Cloud + Docker (Phases 5–6) to activate this track. All curriculum content below remains available for reference preview.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-white">Phase 1–4: Web Development (Days 1–52)</div>
                <div className="text-[10px] text-gray-400">JS, React, Next.js, Backend & MERN</div>
              </div>
              <div className="text-xs font-mono font-bold text-amber-400">
                {aiTrackStatus?.webDevProgress?.completed || 0}/{aiTrackStatus?.webDevProgress?.total || 52} Days
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-white">Phase 5–6: Cloud + Docker (Days 53–72)</div>
                <div className="text-[10px] text-gray-400">Git, Linux, Docker, CI/CD & Cloud</div>
              </div>
              <div className="text-xs font-mono font-bold text-amber-400">
                {aiTrackStatus?.cloudDockerProgress?.completed || 0}/{aiTrackStatus?.cloudDockerProgress?.total || 20} Days
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3 Pillar Tabs: Fundamentals, Data, AI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setActiveTab('fundamentals')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'fundamentals'
              ? 'bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-500/10'
              : 'bg-white/5 border-white/5 hover:border-white/10'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <FileCode className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white">01. Fundamentals</span>
          </div>
          <p className="text-[11px] text-gray-400">
            Syntax, collections, comprehensions, modules, exceptions & OOP
          </p>
        </button>

        <button
          onClick={() => setActiveTab('data')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'data'
              ? 'bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-500/10'
              : 'bg-white/5 border-white/5 hover:border-white/10'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white">02. Data Science</span>
          </div>
          <p className="text-[11px] text-gray-400">
            NumPy arrays, Pandas DataFrames, Matplotlib & EDA
          </p>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'ai'
              ? 'bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-500/10'
              : 'bg-white/5 border-white/5 hover:border-white/10'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white">03. AI Engineering</span>
          </div>
          <p className="text-[11px] text-gray-400">
            Scikit-Learn, PyTorch tensors, Neural Nets & Model Serving
          </p>
        </button>
      </div>

      {/* Selected Pillar Subtopics Details */}
      {currentTopic && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-amber-400">
                Topic ID: {currentTopic.id}
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
                {currentTopic.name}
              </h2>
            </div>
            <div className="text-xs font-mono text-gray-400">
              {currentTopic.subtopics.length} Subtopics
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {currentTopic.subtopics.map((sub) => (
              <div
                key={sub.id}
                className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white capitalize">{sub.title}</div>
                  <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                    {sub.id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
