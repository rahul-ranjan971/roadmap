import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Map, CalendarCheck, FolderGit2, Gamepad2, Briefcase, FileCode, BookOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function SearchModal() {
  const { searchOpen, setSearchOpen, roadmap, phases, projects, careers, practiceResources, topics, navigateTo } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const handleClose = () => {
    setQuery('');
    setSearchOpen(false);
  };

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Global keydown Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => {
          if (prev) setQuery('');
          return !prev;
        });
      }
      if (e.key === 'Escape' && searchOpen) {
        setQuery('');
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const matches = [];

    // Search phases
    phases.forEach((p) => {
      if (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) {
        matches.push({
          type: 'Phase',
          title: p.name,
          subtitle: `Days ${p.startDay}–${p.endDay} • ${p.shortName}`,
          icon: Map,
          action: () => {
            navigateTo('roadmap');
            setSearchOpen(false);
          },
        });
      }
    });

    // Search days and tasks
    roadmap.forEach((d) => {
      const dayMatches = d.title.toLowerCase().includes(q) ||
        d.objectives.some((obj) => obj.toLowerCase().includes(q));

      if (dayMatches) {
        matches.push({
          type: 'Day',
          title: d.title,
          subtitle: `Week ${d.week} • ${d.tasks.length} tasks`,
          icon: CalendarCheck,
          action: () => {
            navigateTo('today', d.id);
            setSearchOpen(false);
          },
        });
      }

      d.tasks.forEach((t) => {
        if (t.title.toLowerCase().includes(q)) {
          matches.push({
            type: 'Task',
            title: t.title,
            subtitle: `${d.title} • [${t.type}]`,
            icon: FileCode,
            action: () => {
              navigateTo('today', d.id);
              setSearchOpen(false);
            },
          });
        }
      });
    });

    // Search projects
    projects.forEach((p) => {
      if (
        p.name.toLowerCase().includes(q) ||
        p.technologies.some((tech) => tech.toLowerCase().includes(q)) ||
        p.objective.toLowerCase().includes(q)
      ) {
        matches.push({
          type: 'Project',
          title: p.name,
          subtitle: p.technologies.join(', '),
          icon: FolderGit2,
          action: () => {
            navigateTo('projects');
            setSearchOpen(false);
          },
        });
      }
    });

    // Search practice resources
    practiceResources.forEach((r) => {
      if (
        r.name.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      ) {
        matches.push({
          type: 'Practice',
          title: r.name,
          subtitle: `${r.category.toUpperCase()} • ${r.difficulty} • ${r.type}`,
          icon: Gamepad2,
          action: () => {
            navigateTo('practice');
            setSearchOpen(false);
          },
        });
      }
    });

    // Search careers
    careers.forEach((c) => {
      if (
        c.title.toLowerCase().includes(q) ||
        c.technologies.some((tech) => tech.toLowerCase().includes(q)) ||
        c.description.toLowerCase().includes(q)
      ) {
        matches.push({
          type: 'Career',
          title: c.title,
          subtitle: c.technologies.slice(0, 4).join(', '),
          icon: Briefcase,
          action: () => {
            navigateTo('careers');
            setSearchOpen(false);
          },
        });
      }
    });

    // Search topics
    topics.forEach((t) => {
      const matchTopic = t.name.toLowerCase().includes(q) ||
        t.subtopics?.some((s) => s.title.toLowerCase().includes(q));
      if (matchTopic) {
        matches.push({
          type: 'Topic',
          title: t.name,
          subtitle: `${t.track.toUpperCase()} • ${t.subtopics?.length || 0} subtopics`,
          icon: BookOpen,
          action: () => {
            if (t.track === 'cpp-dsa') navigateTo('dsa');
            else if (t.track === 'python') navigateTo('python');
            else if (t.track === 'core-cs') navigateTo('core-cs');
            else navigateTo('roadmap');
            setSearchOpen(false);
          },
        });
      }
    });

    return matches.slice(0, 20); // Top 20 results
  }, [query, phases, roadmap, projects, practiceResources, careers, topics, navigateTo, setSearchOpen]);

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-20 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#11131c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-white/5">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search days, topics, tasks, projects, practice, careers..."
            className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-white p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleClose}
            className="text-xs font-mono text-gray-400 hover:text-white px-2 py-1 bg-white/5 rounded border border-white/10"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-white/5">
          {query && results.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-500">
              No matching items found for &ldquo;{query}&rdquo;
            </div>
          )}

          {!query && (
            <div className="p-6 text-center text-xs text-gray-500">
              Type to search across 120 days, 621 tasks, 32 topics, 13 projects, and 28 practice resources.
            </div>
          )}

          {results.map((res, i) => {
            const Icon = res.icon;
            return (
              <button
                key={i}
                onClick={res.action}
                className="w-full p-3 rounded-xl flex items-center gap-3 text-left hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white group-hover:text-indigo-300 transition-colors truncate">
                      {res.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-gray-400">
                      {res.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 truncate mt-0.5">
                    {res.subtitle}
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
