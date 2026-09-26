import React, { useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  FolderGit2,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function CareerPaths() {
  const { careers, projects, topics, navigateTo } = useApp();
  const [selectedCareerId, setSelectedCareerId] = useState('career-fullstack');

  const selectedCareer = careers.find((c) => c.id === selectedCareerId) || careers[0];

  // Resolve projects recommended for selected career
  const careerProjects = projects.filter((p) =>
    selectedCareer.recommendedProjects.includes(p.id)
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#11131c] border border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Career Paths Explorer
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              12 equal, non-ranked software engineering career targets with required skills, projects, and portfolio evidence
            </p>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs text-gray-300 font-mono">
          12 Target Paths Available
        </div>
      </div>

      {/* 12 Career Selectors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {careers.map((career) => {
          const isSelected = selectedCareerId === career.id;
          return (
            <button
              key={career.id}
              onClick={() => setSelectedCareerId(career.id)}
              className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                  : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="text-2xl mb-2">{career.icon}</div>
              <div className="text-xs font-bold text-white line-clamp-1">
                {career.title}
              </div>
              <div className="text-[10px] text-gray-400 mt-1 font-mono">
                {career.technologies.length} key tools
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Career Deep Dive */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl shrink-0">
              {selectedCareer.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                  Career Blueprint
                </span>
                <span className="text-xs text-gray-400 font-mono">{selectedCareer.id}</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                {selectedCareer.title}
              </h2>
            </div>
          </div>

          <button
            onClick={() => navigateTo('roadmap')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <span>Track in 120-Day Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Role Overview */}
        <p className="text-sm text-gray-300 leading-relaxed max-w-3xl">
          {selectedCareer.description}
        </p>

        {/* 3 Pillars: Skills, Core CS, Portfolio Evidence */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Required Skills */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
            <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Required Technology Skills
            </div>
            <div className="space-y-1.5">
              {selectedCareer.requiredSkills.map((skillId) => {
                const topic = topics.find((t) => t.id === skillId);
                return (
                  <div key={skillId} className="flex items-center gap-2 text-xs text-gray-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{topic ? topic.name : skillId}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core Software & DSA */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
            <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Core CS & DSA Relevance
            </div>
            <div className="space-y-1.5">
              {selectedCareer.coreCS.map((csId) => {
                const topic = topics.find((t) => t.id === csId);
                return (
                  <div key={csId} className="flex items-center gap-2 text-xs text-gray-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{topic ? topic.name : csId}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Portfolio Evidence */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
            <div className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Proof-of-Work Evidence
            </div>
            <div className="space-y-1.5">
              {selectedCareer.portfolioEvidence.map((ev, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-200">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>{ev}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended Flagship Projects */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
            Recommended Flagship Projects for this Career
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {careerProjects.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white mb-1">{p.name}</div>
                  <div className="text-[11px] text-gray-400 line-clamp-2">{p.objective}</div>
                </div>
                <div className="pt-3 border-t border-white/5 mt-3 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-indigo-400">{p.id}</span>
                  <button
                    onClick={() => navigateTo('projects')}
                    className="text-[10px] font-semibold text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Project</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
