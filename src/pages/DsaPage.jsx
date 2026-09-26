import React, { useState, useMemo } from 'react';
import {
  Binary,
  CheckCircle2,
  Circle,
  ExternalLink,
  Search,
  Code2,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const dsaTopicClusters = [
  { id: 'cpp-basics', title: 'C++ Fundamentals & STL', pattern: ['syntax', 'variable', 'pointer', 'reference', 'stl', 'function'] },
  { id: 'arrays-strings', title: 'Arrays & Strings', pattern: ['array', 'string', 'two pointer', 'sliding window'] },
  { id: 'searching-sorting', title: 'Binary Search & Sorting', pattern: ['binary search', 'sorting', 'merge sort', 'quick sort'] },
  { id: 'recursion-backtracking', title: 'Recursion & Backtracking', pattern: ['recursion', 'backtracking', 'n-queens', 'permutations'] },
  { id: 'linked-lists', title: 'Linked Lists & Pointers', pattern: ['linked list', 'reverse list', 'cycle', 'doubly'] },
  { id: 'stacks-queues', title: 'Stacks, Queues & Deques', pattern: ['stack', 'queue', 'deque', 'monotonic', 'parentheses'] },
  { id: 'trees-bst', title: 'Trees, Binary Trees & BST', pattern: ['tree', 'bst', 'traversal', 'depth', 'lca'] },
  { id: 'heaps-priority', title: 'Heaps & Priority Queues', pattern: ['heap', 'priority queue', 'kth largest', 'top k'] },
  { id: 'graphs', title: 'Graphs, BFS & DFS', pattern: ['graph', 'bfs', 'dfs', 'topological', 'shortest path', 'dijkstra'] },
  { id: 'dp', title: 'Dynamic Programming & Greedy', pattern: ['dynamic programming', 'dp', 'memoization', 'tabulation', 'knapsack', 'greedy'] },
  { id: 'advanced', title: 'Tries & Bit Manipulation', pattern: ['trie', 'bit manipulation', 'prefix tree', 'bitwise'] },
];

export function DsaPage() {
  const { roadmap, tasks, toggleTask, practiceResources, navigateTo } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const allDsaTasks = useMemo(() => {
    const list = [];
    roadmap.forEach((d) => {
      d.tasks.forEach((t) => {
        if (t.topicId.includes('dsa') || t.topicId.includes('cpp')) {
          list.push({ ...t, dayId: d.id, dayNumber: d.day });
        }
      });
    });
    return list;
  }, [roadmap]);

  const filteredTasks = useMemo(() => {
    return allDsaTasks.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!t.title.toLowerCase().includes(q)) return false;
      }

      if (activeCategory !== 'all') {
        const cluster = dsaTopicClusters.find((c) => c.id === activeCategory);
        if (cluster) {
          const title = t.title.toLowerCase();
          const match = cluster.pattern.some((pat) => title.includes(pat));
          if (!match) return false;
        }
      }

      return true;
    });
  }, [allDsaTasks, searchQuery, activeCategory]);

  const completedDsaCount = allDsaTasks.filter((t) => tasks[t.id]).length;
  const totalDsaCount = allDsaTasks.length;
  const dsaPercent = totalDsaCount > 0 ? Math.round((completedDsaCount / totalDsaCount) * 100) : 0;

  // Find NeetCode or LeetCode practice resource
  const leetcodeResource = practiceResources.find((r) => r.id === 'practice-leetcode');
  const neetcodeResource = practiceResources.find((r) => r.id === 'practice-neetcode');

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#11131c] border border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Binary className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              DSA with C++ Master Tracker
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              Continuous 120-day algorithm mastery from basic syntax and complexity to Dynamic Programming & Tries
            </p>
          </div>
        </div>

        {/* Global DSA Progress */}
        <div className="flex items-center gap-4 bg-white/5 p-3.5 rounded-2xl border border-white/5 shrink-0">
          <div>
            <div className="text-[11px] text-gray-400 uppercase font-semibold">DSA Tasks Done</div>
            <div className="text-sm font-bold font-mono text-emerald-400">
              {completedDsaCount} / {totalDsaCount} ({dsaPercent}%)
            </div>
          </div>
        </div>
      </div>

      {/* External Verified Platforms Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {neetcodeResource && (
          <a
            href={neetcodeResource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl glass-panel border border-white/5 hover:border-emerald-500/30 flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                  NeetCode 150 Roadmap
                </div>
                <div className="text-[10px] text-gray-400">Structured LeetCode patterns</div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
          </a>
        )}

        {leetcodeResource && (
          <a
            href={leetcodeResource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl glass-panel border border-white/5 hover:border-amber-500/30 flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                  LeetCode Practice
                </div>
                <div className="text-[10px] text-gray-400">Daily interview problems</div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-amber-400 transition-colors" />
          </a>
        )}

        <button
          onClick={() => navigateTo('practice')}
          className="p-4 rounded-2xl glass-panel border border-white/5 hover:border-purple-500/30 flex items-center justify-between group transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                Practice Arcade
              </div>
              <div className="text-[10px] text-gray-400">Visualgo, Bandit & more</div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems, patterns, or C++ concepts..."
            className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="bg-black/30 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-gray-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Topics (120 Days)</option>
            {dsaTopicClusters.map((cluster) => (
              <option key={cluster.id} value={cluster.id}>
                {cluster.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* DSA Task List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-400 font-semibold uppercase tracking-wider">
          <span>Curated Roadmap DSA Problems ({filteredTasks.length})</span>
          <span>Click checkbox to mark solved</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredTasks.map((t) => {
            const isDone = !!tasks[t.id];
            return (
              <button
                key={t.id}
                onClick={() => toggleTask(t.id, t.dayId)}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                  isDone
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-gray-300'
                    : 'glass-panel border-white/5 hover:border-white/15 text-gray-200'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-gray-400">
                      Day {t.dayNumber}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {t.topicId}
                    </span>
                  </div>
                  <div className={`text-xs font-semibold ${isDone ? 'line-through text-gray-500' : 'text-white'}`}>
                    {t.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
