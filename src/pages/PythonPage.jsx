import React, { useState } from 'react';
import {
  FileCode,
  CheckCircle2,
  ExternalLink,
  BarChart3,
  Brain,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function PythonPage() {
  const { topics, navigateTo } = useApp();
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

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#11131c] border border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Python Track & Data / AI Specialization
            </h1>
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
