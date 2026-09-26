import React, { useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function CoreCsPage() {
  const { topics } = useApp();
  const [activeSectionId, setActiveSectionId] = useState('topic-system-design'); // Default to System Design!

  // Filter core CS topics
  const coreCsTopics = topics.filter((t) => t.track === 'core-cs');

  const selectedTopic = coreCsTopics.find((t) => t.id === activeSectionId) || coreCsTopics[0];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#11131c] border border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Core Software Engineering
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              CS Fundamentals, System Design, SQL, DBMS, OS, Networks, Aptitude & Placement Prep
            </p>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 font-mono">
          Mandatory CS Foundation
        </div>
      </div>

      {/* Prominent System Design Highlight Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-[#11131c] border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              High-Priority Subject • Never Removed
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Distributed System Design (HLD & LLD)
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl">
              Scalability, CAP Theorem, Load Balancing, Caching, Sharding, Message Brokers, CDN, Rate Limiting, High-Level and Low-Level Architecture.
            </p>
          </div>

          <button
            onClick={() => setActiveSectionId('topic-system-design')}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <span>Inspect System Design Syllabus</span>
          </button>
        </div>
      </div>

      {/* Core CS Sections Grid Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {coreCsTopics.map((topic) => {
          const isSelected = activeSectionId === topic.id;
          return (
            <button
              key={topic.id}
              onClick={() => setActiveSectionId(topic.id)}
              className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                  : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="text-2xl mb-2">{topic.icon}</div>
              <div className="text-xs font-bold text-white line-clamp-1">{topic.name}</div>
              <div className="text-[10px] text-gray-400 mt-1 font-mono">
                {topic.subtopics.length} concepts
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Syllabus & Subtopics of Selected Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedTopic.icon}</span>
            <div>
              <div className="text-xs font-mono font-bold text-cyan-400">
                Core Topic • {selectedTopic.id}
              </div>
              <h3 className="text-xl font-bold text-white mt-0.5">
                {selectedTopic.name}
              </h3>
            </div>
          </div>

          <div className="text-xs font-mono text-gray-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
            {selectedTopic.subtopics.length} Key Subtopics
          </div>
        </div>

        {/* Subtopics Checklist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {selectedTopic.subtopics.map((sub) => (
            <div
              key={sub.id}
              className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3"
            >
              <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-white capitalize">{sub.title}</div>
                <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                  ID: {sub.id}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
