import React, { useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CORE_CS_SOURCES = {
  'topic-sql': {
    provider: 'Apna College',
    instructor: 'Shradha Khapra',
    title: 'SQL Tutorial - Full Database Course for Beginners',
    url: 'https://www.youtube.com/watch?v=hlGoQC332VM',
    badge: '1-Shot Masterclass',
    description: 'Relational databases, queries, JOINs, subqueries, aggregations, schema design & normalization.',
  },
  'topic-oop': {
    provider: 'Apna College',
    instructor: 'Shradha Khapra',
    title: 'Object Oriented Programming (OOPs) in C++ [One Shot]',
    url: 'https://www.youtube.com/watch?v=bSrm9RXwBaI',
    badge: 'Core Paradigm',
    description: 'Classes, Objects, Inheritance, Polymorphism, Encapsulation, Abstraction & Design Patterns.',
  },
  'topic-dbms': {
    provider: 'CodeHelp',
    instructor: 'Love Babbar',
    title: 'DBMS Complete Course Playlist',
    url: 'https://www.youtube.com/playlist?list=PLDzeHZWIZsTpukecmA2p5rhHM14bl2dHU',
    badge: 'Comprehensive Series',
    description: 'ACID properties, Transactions, Concurrency Control, ER Diagrams, Indexing & B-Trees.',
  },
  'topic-os': {
    provider: 'CodeHelp',
    instructor: 'Love Babbar',
    title: 'Operating System Complete Course Playlist',
    url: 'https://www.youtube.com/playlist?list=PLDzeHZWIZsTr3nwuTegHLa2qlI81QwcYG',
    badge: 'Systems Deep Dive',
    description: 'Processes, Threads, CPU Scheduling, Virtual Memory, Paging, Deadlocks & Synchronization.',
  },
  'topic-cn': {
    provider: 'Kunal Kushwaha',
    instructor: 'Kunal Kushwaha',
    title: 'Complete Computer Networking Course',
    url: 'https://www.youtube.com/playlist?list=PL9gnSGHSqcnQQgfZnuBcT3rPlYlwXXKV3',
    badge: 'Protocols & Architecture',
    description: 'OSI Model, TCP/IP, Sockets, DNS, HTTP/HTTPS, Routing algorithms & Network Security.',
  },
  'topic-system-design': {
    provider: 'designKarle / Shivam Tiwari',
    instructor: 'Shivam Tiwari',
    title: 'System Design Simplified (HLD & LLD)',
    url: 'https://www.youtube.com/playlist?list=PLTCrU9sGyburBw9wNOHebv9SFTqv4Azv2',
    badge: 'HLD & LLD Architecture',
    description: 'Scalability, Load Balancing, Caching, Sharding, Message Queues, Rate Limiting & CAP Theorem.',
    altProvider: 'Piyush Garg',
    altUrl: 'https://www.youtube.com/playlist?list=PLinedj3B30sBv3B_x1bHUpd_EOnn_p-Z4',
  },
};

const CORE_CS_ORDER = [
  'topic-sql',
  'topic-oop',
  'topic-dbms',
  'topic-os',
  'topic-cn',
  'topic-system-design',
];

export function CoreCsPage() {
  const { topics } = useApp();
  // SQL is strictly first in Core CS
  const [activeSectionId, setActiveSectionId] = useState('topic-sql');

  // Filter core CS topics in strict sequence
  const coreCsTopics = CORE_CS_ORDER
    .map((id) => topics.find((t) => t.id === id))
    .filter(Boolean);

  const selectedTopic = coreCsTopics.find((t) => t.id === activeSectionId) || coreCsTopics[0];
  const sourceInfo = CORE_CS_SOURCES[selectedTopic?.id] || selectedTopic?.source;

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
              Core CS • Page Source
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              Strict Sequence: 1. SQL → 2. OOP → 3. DBMS → 4. Operating Systems → 5. Computer Networks → 6. System Design
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 font-mono">
            6 Core Subjects
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 font-mono">
            Page Source
          </span>
        </div>
      </div>

      {/* Core CS Sections Grid Selector (Numbered 1-6) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {coreCsTopics.map((topic, index) => {
          const isSelected = activeSectionId === topic.id;
          return (
            <button
              key={topic.id}
              onClick={() => setActiveSectionId(topic.id)}
              className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500/50 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                  : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-2xl">{topic.icon}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-semibold ${
                  isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-gray-400'
                }`}>
                  #{index + 1}
                </span>
              </div>
              <div className="text-xs font-bold text-white line-clamp-1">{topic.name}</div>
              <div className="text-[10px] text-gray-400 mt-1 font-mono">
                {topic.subtopics.length} concepts
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Subject Source & Resource Card */}
      {selectedTopic && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[#11131c] to-[#0c0e16] border border-cyan-500/30 shadow-2xl relative overflow-hidden space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 border-b border-white/5 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Core CS Subject #{CORE_CS_ORDER.indexOf(selectedTopic.id) + 1} of 6</span>
                {sourceInfo?.badge && (
                  <span className="ml-1 pl-2 border-l border-cyan-500/30 text-cyan-200">
                    {sourceInfo.badge}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                <span>{selectedTopic.icon}</span>
                <span>{selectedTopic.name}</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 max-w-2xl">
                {sourceInfo?.description || 'Foundational computer science curriculum engineered for high-performance software engineering.'}
              </p>
            </div>

            {/* Source CTAs */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {sourceInfo?.url && (
                <a
                  href={sourceInfo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-cyan-600/20 hover:scale-[1.02] cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Learn from Source</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              )}

              {sourceInfo?.altUrl && (
                <a
                  href={sourceInfo.altUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Alt: {sourceInfo.altProvider}</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}
            </div>
          </div>

          {/* Source Metadata & Progress Decoupling Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-mono">Curriculum Source</span>
              <span className="text-white font-medium mt-1 block">
                {sourceInfo?.provider || 'Established Course'}
                {sourceInfo?.instructor && <span className="text-gray-400"> ({sourceInfo.instructor})</span>}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-mono">Course Material</span>
              <span className="text-cyan-300 font-medium mt-1 block truncate">
                {sourceInfo?.title || selectedTopic.name}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-amber-300 font-medium block">Progress Decoupled</span>
                <span className="text-gray-400 text-[11px] mt-0.5 block leading-relaxed">
                  Source link is a study resource. Task completion is driven strictly by your roadmap progress.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

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
                {selectedTopic.name} Syllabus
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
              className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3 hover:border-white/10 transition-colors"
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
