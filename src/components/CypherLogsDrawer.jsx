import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Terminal, CheckCircle2, Shield, Copy, Check } from 'lucide-react';

export default function CypherLogsDrawer({ cypherLogs = [], mutations = [], severanceVerified, pathsRemaining }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!cypherLogs || cypherLogs.length === 0) return null;

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className="my-3 rounded-xl border border-gemini-border bg-gemini-card overflow-hidden">
      {/* Header Accordion Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between text-left hover:bg-gemini-surfaceHover/50 transition"
      >
        <div className="flex items-center space-x-2 flex-wrap gap-y-1 mr-2 min-w-0">
          <Terminal className="w-4 h-4 text-gemini-accent shrink-0" />
          <span className="text-xs font-semibold text-white">
            FalkorDB Cypher & MCP Logs ({cypherLogs.length})
          </span>
          {severanceVerified && (
            <span className="text-[9px] sm:text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 sm:px-2 py-0.5 rounded-full flex items-center space-x-1 shrink-0">
              <CheckCircle2 className="w-3 h-3" />
              <span>0 Paths Remaining</span>
            </span>
          )}
        </div>
        <div className="text-gemini-muted shrink-0">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-3 sm:p-4 pt-1 border-t border-gemini-border/60 space-y-3 bg-gemini-surface/40">
          {/* Mutations Applied */}
          {mutations.length > 0 && (
            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <h5 className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Graph State Mutations Applied</span>
              </h5>
              <ul className="space-y-1">
                {mutations.map((m, i) => (
                  <li key={i} className="text-xs font-mono text-emerald-300/90 flex items-center space-x-1.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cypher Logs List */}
          <div className="space-y-2.5">
            {cypherLogs.map((log, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-gemini-bg border border-gemini-border">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold bg-gemini-surface px-1.5 py-0.5 rounded text-gemini-accent border border-gemini-border">
                      {log.tool || `Tool 0${idx + 1}`}
                    </span>
                    {log.thought && (
                      <span className="text-xs text-gemini-muted italic line-clamp-1">
                        "{log.thought}"
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleCopy(log.cypher, idx)}
                    className="p-1 rounded hover:bg-gemini-surface text-gemini-muted hover:text-white transition"
                    title="Copy Cypher query"
                  >
                    {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <pre className="text-xs font-mono bg-gemini-card p-2.5 rounded border border-gemini-border/60 text-purple-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {log.cypher}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
