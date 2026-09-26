import React, { useState } from 'react';
import {
  FolderGit2,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  GitBranch,
  BookOpen,
  Cloud,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function ProjectLab() {
  const {
    projects,
    phases,
    milestones,
    checklists,
    toggleMilestone,
    toggleChecklist,
    stats,
  } = useApp();

  const [expandedProjectId, setExpandedProjectId] = useState('project-01');

  const toggleExpand = (projectId) => {
    setExpandedProjectId((prev) => (prev === projectId ? null : projectId));
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#11131c] border border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Project Lab (13 Flagships)
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              Production-grade portfolio artifacts with milestones, GitHub, README, deployment, and testing checklists
            </p>
          </div>
        </div>

        {/* Global Project Progress */}
        <div className="flex items-center gap-4 bg-white/5 p-3.5 rounded-2xl border border-white/5 shrink-0">
          <div>
            <div className="text-[11px] text-gray-400 uppercase font-semibold">Total Milestones</div>
            <div className="text-sm font-bold font-mono text-indigo-300">
              {stats.completedMilestones} / {stats.totalMilestones} Completed ({stats.milestonesPercent}%)
            </div>
          </div>
        </div>
      </div>

      {/* Projects List Accordions */}
      <div className="space-y-4">
        {projects.map((project, idx) => {
          const isExpanded = expandedProjectId === project.id;
          const phase = phases.find((p) => p.id === project.phase) || phases[0];

          // Compute milestone progress
          const doneMilestones = project.milestones.filter((m) => milestones[m.id]).length;
          const totalMilestones = project.milestones.length;
          const milestonePercent = totalMilestones > 0 ? Math.round((doneMilestones / totalMilestones) * 100) : 0;

          // Checklist items count
          const ghDone = project.checklists.github.filter((_, i) => checklists[`${project.id}-gh-${i}`]).length;
          const rmDone = project.checklists.readme.filter((_, i) => checklists[`${project.id}-rm-${i}`]).length;
          const dpDone = project.checklists.deployment.filter((_, i) => checklists[`${project.id}-dp-${i}`]).length;
          const tsDone = project.checklists.testing.filter((_, i) => checklists[`${project.id}-ts-${i}`]).length;

          const totalChecklistItems = project.checklists.github.length + project.checklists.readme.length + project.checklists.deployment.length + project.checklists.testing.length;
          const totalChecklistDone = ghDone + rmDone + dpDone + tsDone;

          return (
            <div
              key={project.id}
              className={`rounded-3xl border transition-all ${
                isExpanded
                  ? 'glass-panel border-indigo-500/30 shadow-xl shadow-indigo-500/5'
                  : 'bg-[#11131c] border-white/5 hover:border-white/10'
              }`}
            >
              {/* Project Accordion Header */}
              <button
                onClick={() => toggleExpand(project.id)}
                className="w-full p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 mt-1 shrink-0">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white/5 text-gray-300">
                        Project {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                      <span className="text-xs text-purple-400 font-medium">• {phase.name}</span>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {project.name}
                    </h2>

                    <p className="text-xs text-gray-400 mt-1 line-clamp-1 max-w-2xl">
                      {project.objective}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      {project.technologies.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-gray-400 border border-white/5"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Progress Meter & Toggle Icon */}
                <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                  <div className="text-left md:text-right">
                    <div className="text-xs font-mono font-bold text-indigo-400">
                      {milestonePercent}% Milestones
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                      {doneMilestones}/{totalMilestones} done • {totalChecklistDone}/{totalChecklistItems} checks
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </div>
              </button>

              {/* Expanded Detail Panel */}
              {isExpanded && (
                <div className="p-6 border-t border-white/10 space-y-6 bg-black/20">
                  {/* Milestones Checklist */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Core Engineering Milestones ({doneMilestones}/{totalMilestones})
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {project.milestones.map((m) => {
                        const isDone = !!milestones[m.id];
                        return (
                          <button
                            key={m.id}
                            onClick={() => toggleMilestone(m.id)}
                            className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                              isDone
                                ? 'bg-emerald-950/20 border-emerald-500/30 text-gray-300'
                                : 'bg-white/5 border-white/5 hover:border-white/10 text-gray-200'
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
                              <div className={`text-xs font-semibold ${isDone ? 'line-through text-gray-500' : 'text-white'}`}>
                                {m.title}
                              </div>
                              <div className="text-[11px] text-gray-400 mt-0.5">
                                {m.description}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4 Professional Review Checklists */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                    {/* GitHub Checklist */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2.5">
                      <div className="text-xs font-bold text-gray-300 flex items-center gap-1.5 border-b border-white/5 pb-2">
                        <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                        GitHub Checklist
                      </div>
                      <div className="space-y-1.5">
                        {project.checklists.github.map((item, i) => {
                          const key = `${project.id}-gh-${i}`;
                          const isDone = !!checklists[key];
                          return (
                            <button
                              key={i}
                              onClick={() => toggleChecklist(key)}
                              className="w-full text-left flex items-start gap-2 text-xs py-1 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isDone ? 'text-emerald-400' : 'text-gray-600'}`} />
                              <span className={`text-[11px] ${isDone ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                                {item}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* README Checklist */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2.5">
                      <div className="text-xs font-bold text-gray-300 flex items-center gap-1.5 border-b border-white/5 pb-2">
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                        README Standard
                      </div>
                      <div className="space-y-1.5">
                        {project.checklists.readme.map((item, i) => {
                          const key = `${project.id}-rm-${i}`;
                          const isDone = !!checklists[key];
                          return (
                            <button
                              key={i}
                              onClick={() => toggleChecklist(key)}
                              className="w-full text-left flex items-start gap-2 text-xs py-1 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isDone ? 'text-emerald-400' : 'text-gray-600'}`} />
                              <span className={`text-[11px] ${isDone ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                                {item}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Deployment Checklist */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2.5">
                      <div className="text-xs font-bold text-gray-300 flex items-center gap-1.5 border-b border-white/5 pb-2">
                        <Cloud className="w-3.5 h-3.5 text-purple-400" />
                        Deployment Checklist
                      </div>
                      <div className="space-y-1.5">
                        {project.checklists.deployment.map((item, i) => {
                          const key = `${project.id}-dp-${i}`;
                          const isDone = !!checklists[key];
                          return (
                            <button
                              key={i}
                              onClick={() => toggleChecklist(key)}
                              className="w-full text-left flex items-start gap-2 text-xs py-1 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isDone ? 'text-emerald-400' : 'text-gray-600'}`} />
                              <span className={`text-[11px] ${isDone ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                                {item}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Testing Checklist */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2.5">
                      <div className="text-xs font-bold text-gray-300 flex items-center gap-1.5 border-b border-white/5 pb-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Testing & QA
                      </div>
                      <div className="space-y-1.5">
                        {project.checklists.testing.map((item, i) => {
                          const key = `${project.id}-ts-${i}`;
                          const isDone = !!checklists[key];
                          return (
                            <button
                              key={i}
                              onClick={() => toggleChecklist(key)}
                              className="w-full text-left flex items-start gap-2 text-xs py-1 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isDone ? 'text-emerald-400' : 'text-gray-600'}`} />
                              <span className={`text-[11px] ${isDone ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                                {item}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
