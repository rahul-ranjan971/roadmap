import React, { useState, useMemo, useCallback } from 'react';
import {
  Gamepad2,
  ExternalLink,
  CheckCircle2,
  Circle,
  Search,
  Trophy,
  History,
  Sparkles,
  RotateCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function PracticeArcade() {
  const { practiceResources, practice, togglePractice } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHistoryOnly, setShowHistoryOnly] = useState(false);

  // All 17 categories from Prompt 4 Requirement 10
  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'css', label: 'CSS' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'react', label: 'React' },
    { id: 'git', label: 'Git' },
    { id: 'sql', label: 'SQL' },
    { id: 'python', label: 'Python' },
    { id: 'cpp', label: 'C++' },
    { id: 'dsa', label: 'DSA' },
    { id: 'linux', label: 'Linux' },
    { id: 'docker', label: 'Docker' },
    { id: 'kubernetes', label: 'Kubernetes' },
    { id: 'cloud', label: 'Cloud' },
    { id: 'system-design', label: 'System Design' },
    { id: 'data-analytics', label: 'Data Analytics' },
    { id: 'data-engineering', label: 'Data Engineering' },
    { id: 'genai', label: 'GenAI' },
    { id: 'ai-ml', label: 'AI/ML' },
  ];

  const types = [
    { id: 'all', label: 'All Types' },
    { id: 'game', label: '🎮 GAME' },
    { id: 'lab', label: '🧪 LAB' },
    { id: 'practice', label: '💻 PRACTICE' },
    { id: 'system-design', label: '🏗️ SYSTEM DESIGN' },
    { id: 'ai-ml', label: '🤖 AI/ML' },
  ];

  // Helper to extract practice status safely (handles both boolean and object states)
  const getResourceStatus = useCallback((resId) => {
    const item = practice[resId];
    if (!item) return { isDone: false, timesPracticed: 0, lastPracticed: null };
    if (typeof item === 'boolean') {
      return { isDone: item, timesPracticed: item ? 1 : 0, lastPracticed: item ? 'Recorded' : null };
    }
    return {
      isDone: !!item.status,
      timesPracticed: item.timesPracticed || (item.status ? 1 : 0),
      lastPracticed: item.lastPracticed || null,
    };
  }, [practice]);

  // Filter only verified resources with real URLs (strictly adheres to Req #11)
  const verifiedResources = useMemo(() => {
    return practiceResources.filter((r) => r.verified && r.url);
  }, [practiceResources]);

  // Apply active search & filters
  const filteredResources = useMemo(() => {
    return verifiedResources.filter((r) => {
      const status = getResourceStatus(r.id);

      if (showHistoryOnly && !status.isDone && status.timesPracticed === 0) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;

      // Type filter
      if (selectedType !== 'all' && r.type !== selectedType) return false;

      // Difficulty filter
      if (selectedDifficulty !== 'all' && r.difficulty !== selectedDifficulty) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesDesc = r.description.toLowerCase().includes(q);
        const matchesCat = r.category.toLowerCase().includes(q);
        const matchesPhase = r.roadmapPhase?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat && !matchesPhase) return false;
      }

      return true;
    });
  }, [verifiedResources, selectedCategory, selectedType, selectedDifficulty, searchQuery, showHistoryOnly, getResourceStatus]);

  // Practice History list (persisted data)
  const practiceHistoryList = useMemo(() => {
    return verifiedResources
      .map((r) => {
        const status = getResourceStatus(r.id);
        return {
          ...r,
          ...status,
        };
      })
      .filter((r) => r.isDone || r.timesPracticed > 0)
      .sort((a, b) => (b.timesPracticed || 0) - (a.timesPracticed || 0));
  }, [verifiedResources, getResourceStatus]);

  const completedCount = verifiedResources.filter((r) => {
    const s = getResourceStatus(r.id);
    return s.isDone;
  }).length;
  const totalCount = verifiedResources.length;
  const percentDone = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const difficultyBadgeColor = {
    beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    advanced: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  const typeBadgeColor = {
    game: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    lab: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    practice: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    'system-design': 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    'ai-ml': 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-[#11131c] border border-white/5 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Interactive Practice Arcade
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                100% Verified URLs
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              28 verified external gamified challenges, terminal sandboxes, algorithm visualizers, and system design labs
            </p>
          </div>
        </div>

        {/* Arcade Completion Metric & History Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3.5 bg-white/5 p-3.5 rounded-2xl border border-white/5 shrink-0">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-semibold">Practiced</div>
              <div className="text-sm font-bold font-mono text-purple-300">
                {completedCount} / {totalCount} ({percentDone}%)
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowHistoryOnly((prev) => !prev)}
            className={`px-3.5 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2 border transition-colors cursor-pointer shrink-0 ${
              showHistoryOnly
                ? 'bg-purple-600 text-white border-purple-500'
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">
              {showHistoryOnly ? 'Showing History' : 'History'}
            </span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, category, phase, or description..."
              className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="text-[11px] font-semibold uppercase">Difficulty:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-black/30 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resource Type Filter Pills (Requirement 12: 🎮 GAME, 🧪 LAB, 💻 PRACTICE, 🏗️ SYSTEM DESIGN, 🤖 AI/ML) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-white/5 pt-2">
          <span className="text-[11px] font-semibold uppercase text-gray-500 shrink-0">Type:</span>
          {types.map((tp) => (
            <button
              key={tp.id}
              onClick={() => setSelectedType(tp.id)}
              className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedType === tp.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills Slider (17 Categories) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/20'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Resources Cards Grid (Requirement 10) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((res) => {
          const status = getResourceStatus(res.id);
          const isDone = status.isDone;

          return (
            <div
              key={res.id}
              className={`p-5 rounded-3xl border flex flex-col justify-between transition-all ${
                isDone
                  ? 'bg-purple-950/20 border-purple-500/30 shadow-lg shadow-purple-500/5'
                  : 'glass-panel border-white/5 hover:border-white/15 hover:bg-white/[0.03]'
              }`}
            >
              <div>
                {/* Badges: Category, Type (🎮 GAME / 🧪 LAB / 💻 PRACTICE / 🏗️ SYSTEM DESIGN / 🤖 AI/ML), Difficulty */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-white/5 text-gray-300">
                      {res.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        typeBadgeColor[res.type] || 'bg-gray-800 text-gray-300 border-white/10'
                      }`}
                    >
                      {res.typeLabel || res.type.toUpperCase()}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono capitalize px-2 py-0.5 rounded-full border shrink-0 ${
                      difficultyBadgeColor[res.difficulty] || 'bg-gray-800 text-gray-300 border-white/10'
                    }`}
                  >
                    {res.difficulty}
                  </span>
                </div>

                {/* Name */}
                <h3 className="text-base font-bold text-white mb-1 flex items-center justify-between">
                  <span>{res.name}</span>
                  {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                </h3>

                {/* Roadmap Phase display (Requirement 10) */}
                <div className="text-[11px] font-mono text-purple-400 font-semibold mb-2">
                  • {res.roadmapPhase}
                </div>

                {/* Description */}
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  {res.description}
                </p>

                {/* Practice count tag if practiced before */}
                {status.timesPracticed > 0 && (
                  <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 bg-white/5 px-2.5 py-1 rounded-xl border border-white/5 w-fit mb-3">
                    <RotateCw className="w-3 h-3 text-purple-400" />
                    <span>Practiced {status.timesPracticed} time{status.timesPracticed > 1 ? 's' : ''}</span>
                    {status.lastPracticed && (
                      <span className="text-gray-500">• Last: {status.lastPracticed}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons: Open Practice (verified link) & Mark Practiced */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 mt-auto">
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Open Practice</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => togglePractice(res.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Practiced ✓</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-3.5 h-3.5 text-gray-500" />
                      <span>Mark Practiced</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12 text-sm text-gray-500">
          No verified practice resources found matching active filters.
        </div>
      )}

      {/* Dedicated Practice History Section (Requirement 14) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Practice History & Telemetry
              </h2>
              <p className="text-xs text-gray-400">
                Log of completed interactive platforms with real persisted practice counts
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-purple-300 font-semibold bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 w-fit">
            {practiceHistoryList.length} Platforms Practiced
          </div>
        </div>

        {practiceHistoryList.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            <Sparkles className="w-5 h-5 text-gray-600 mx-auto mb-2" />
            No practice recorded yet. Select any challenge above, launch it, and click &ldquo;Mark Practiced&rdquo; to build your verified log.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 font-mono text-[11px]">
                  <th className="pb-3 font-semibold">Resource</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Last Practiced</th>
                  <th className="pb-3 font-semibold text-right">Times Practiced</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {practiceHistoryList.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 font-semibold text-white">
                      {item.name}
                    </td>
                    <td className="py-3 font-mono text-[11px] text-gray-400 uppercase">
                      {item.category}
                    </td>
                    <td className="py-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-gray-300">
                        {item.typeLabel || item.type}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-gray-400 text-[11px]">
                      {item.lastPracticed || 'Recorded'}
                    </td>
                    <td className="py-3 text-right font-mono text-purple-400 font-bold">
                      {item.timesPracticed}
                    </td>
                    <td className="py-3 text-right">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <span>Launch</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
