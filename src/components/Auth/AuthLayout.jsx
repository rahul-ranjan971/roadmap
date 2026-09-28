import React from 'react';
import { Compass } from 'lucide-react';

export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 flex flex-col justify-center items-center p-4 sm:p-6 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Subtle ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-cyan-600/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 shadow-inner">
            <Compass className="w-8 h-8 animate-pulse-subtle" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              Career Compass
            </h1>
            <p className="text-xs text-indigo-300/80 font-mono tracking-wider uppercase mt-0.5">
              120-Day Engineering Curriculum
            </p>
          </div>
          {title && (
            <div className="pt-2">
              <h2 className="text-xl font-semibold text-gray-100 tracking-tight">{title}</h2>
              {subtitle && <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">{subtitle}</p>}
            </div>
          )}
        </div>

        {/* Form Card */}
        <div className="bg-[#11131c] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {children}
        </div>

        {/* Clean Footer Notice */}
        <p className="text-center text-xs text-gray-500">
          Career Compass &bull; Secure Authentication &bull; Isolated User Progress
        </p>
      </div>
    </div>
  );
}
