import React from 'react';
import { ShieldAlert, Terminal, Network, Database, ShieldCheck, ArrowRight } from 'lucide-react';

const STAGE_ICONS = [
  ShieldAlert,
  Terminal,
  Network,
  Database,
  ShieldCheck,
];

export default function KillChainCards({ killChain = [] }) {
  if (!killChain || killChain.length === 0) return null;

  return (
    <div className="my-3 sm:my-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
        <span className="text-xs font-semibold text-gemini-text tracking-wide uppercase flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
          <span>Cyber Kill-Chain Traversal & Containment</span>
        </span>
        <span className="text-[10px] sm:text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium w-fit">
          Autonomous Containment Active
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-2.5">
        {killChain.map((step, idx) => {
          const Icon = STAGE_ICONS[idx % STAGE_ICONS.length];
          const isContained = step.status === 'CONTAINED';
          return (
            <div
              key={idx}
              className={`p-2.5 sm:p-3 rounded-xl border flex flex-col justify-between transition relative overflow-hidden ${
                isContained
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                  : 'bg-gemini-card border-gemini-border hover:border-gemini-border/80'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-gemini-muted">
                    STEP 0{step.step || idx + 1}
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      isContained
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {step.status}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 mb-1">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isContained ? 'text-emerald-400' : 'text-rose-400'}`} />
                  <h4 className="text-xs font-semibold text-white truncate" title={step.stage}>
                    {step.stage}
                  </h4>
                </div>

                <p className="text-[11px] font-mono text-gemini-accent truncate mb-1.5" title={step.entity}>
                  {step.entity}
                </p>

                <p className="text-[10px] text-gemini-muted line-clamp-3 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Vector Tag */}
              {step.vector && (
                <div className="mt-2 pt-2 border-t border-gemini-border/50 text-[9px] font-mono text-gemini-muted truncate" title={step.vector}>
                  {step.vector}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
