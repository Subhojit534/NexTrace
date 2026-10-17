import React from 'react';
import { ArrowRight, Shield, Database, Lock, Server } from 'lucide-react';

export default function PathProof({ attackPath = [], pathArrow }) {
  if (!attackPath || attackPath.length === 0) return null;

  return (
    <div className="my-3 sm:my-3.5 p-2.5 sm:p-3.5 rounded-xl bg-gemini-card border border-gemini-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
        <span className="text-[10px] sm:text-[11px] font-semibold text-gemini-muted uppercase tracking-wider flex items-center space-x-1.5">
          <Lock className="w-3.5 h-3.5 text-gemini-accent shrink-0" />
          <span>FalkorDB shortestPath() Traversal Proof</span>
        </span>
        <span className="text-[10px] sm:text-[11px] font-mono text-gemini-muted">
          {attackPath.length} Hops Traversed
        </span>
      </div>

      {/* Interactive Path Flow */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 py-1">
        {attackPath.map((node, index) => {
          const isFirst = index === 0;
          const isLast = index === attackPath.length - 1;

          let badgeColor = 'bg-gemini-surface border-gemini-border text-gemini-text';
          let Icon = Server;

          if (isFirst) {
            badgeColor = 'bg-blue-500/10 border-blue-500/30 text-blue-300 font-semibold';
            Icon = Shield;
          } else if (isLast) {
            badgeColor = 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-semibold';
            Icon = Database;
          }

          return (
            <React.Fragment key={index}>
              <div
                className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-[11px] sm:text-xs shadow-sm transition hover:scale-105 ${badgeColor}`}
                title={isFirst ? 'Public Ingress Entrypoint' : isLast ? 'Target Crown Jewel Database' : `Hop ${index}: Internal Service / IAM`}
              >
                <Icon className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0 opacity-80" />
                <span className="font-mono text-[11px] sm:text-xs">{node}</span>
                {isFirst && (
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-wider ml-1 bg-blue-500/20 px-1 rounded">
                    Ingress
                  </span>
                )}
                {isLast && (
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-wider ml-1 bg-amber-500/20 px-1 rounded">
                    Crown Jewel
                  </span>
                )}
              </div>

              {!isLast && (
                <ArrowRight className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-gemini-muted shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {pathArrow && (
        <div className="mt-2.5 pt-2 border-t border-gemini-border/50 text-[10px] sm:text-[11px] font-mono text-gemini-muted break-all select-all leading-relaxed">
          {pathArrow}
        </div>
      )}
    </div>
  );
}
