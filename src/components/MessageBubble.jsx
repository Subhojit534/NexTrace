import React from 'react';
import { Sparkles, User, ShieldAlert, FileCode, CheckCircle2, AlertTriangle, Database, Shield } from 'lucide-react';
import KillChainCards from './KillChainCards';
import PathProof from './PathProof';
import CypherLogsDrawer from './CypherLogsDrawer';

export default function MessageBubble({ message, onSelectFollowup, onOpenRemediation }) {
  const isUser = message.role === 'user';

  // Simple clean markdown formatter for agent messages
  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return (
      <div className="space-y-2 text-sm leading-relaxed text-gemini-text">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-base font-bold text-white pt-2 pb-1 border-b border-gemini-border/40">
                {line.replace('### ', '')}
              </h3>
            );
          }
          if (line.startsWith('#### ')) {
            return (
              <h4 key={idx} className="text-sm font-semibold text-gemini-accent pt-1.5">
                {line.replace('#### ', '')}
              </h4>
            );
          }
          if (line.startsWith('- ')) {
            const rawContent = line.replace('- ', '');
            return (
              <div key={idx} className="flex items-start space-x-2 pl-2">
                <span className="text-gemini-accent font-bold mt-1">•</span>
                <span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(rawContent) }} />
              </div>
            );
          }
          if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
            const num = line.slice(0, 3);
            const rawContent = line.slice(3);
            return (
              <div key={idx} className="flex items-start space-x-2 pl-2">
                <span className="text-gemini-muted font-bold font-mono text-xs mt-0.5">{num}</span>
                <span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(rawContent) }} />
              </div>
            );
          }
          if (line.trim() === '') {
            return <div key={idx} className="h-1" />;
          }
          return (
            <p key={idx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
          );
        })}
      </div>
    );
  };

  const formatInlineMarkdown = (str) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="bg-gemini-card px-1.5 py-0.5 rounded text-purple-300 font-mono text-xs border border-gemini-border">$1</code>');
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-4 animate-fade-in">
        <div className="max-w-2xl bg-gemini-surface border border-gemini-border rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-white shadow-sm">
          <p className="whitespace-pre-wrap">{message.content}</p>
          {message.attachedFile && (
            <div className="mt-2 pt-2 border-t border-gemini-border/50 text-[11px] text-gemini-muted flex items-center space-x-1.5">
              <span className="px-1.5 py-0.5 rounded bg-gemini-card border border-gemini-border font-mono text-blue-300">
                📄 {message.attachedFile}
              </span>
              <span>imported to workspace</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  const blast = message.blast_radius;

  return (
    <div className="flex items-start space-x-3.5 my-6 animate-fade-in">
      {/* Agent Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gemini-gradientStart to-gemini-gradientEnd flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20 mt-1">
        <Sparkles className="w-4 h-4 text-white" />
      </div>

      {/* Main Message Body */}
      <div className="flex-1 max-w-4xl overflow-hidden">
        {/* Author & Model Tag */}
        <div className="flex items-center space-x-2 mb-1.5">
          <span className="text-xs font-semibold text-white">NexTrace Agent</span>
          {message.model_used && (
            <span className="text-[10px] text-gemini-muted bg-gemini-surface px-2 py-0.5 rounded-full border border-gemini-border">
              {message.model_used}
            </span>
          )}
          {message.severance_verified && (
            <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Containment Verified</span>
            </span>
          )}
        </div>

        {/* Narrative Formatted Response */}
        <div className="bg-gemini-surface/60 border border-gemini-border/80 rounded-2xl p-4 shadow-sm">
          {renderFormattedText(message.content || message.reply)}

          {/* Blast Radius Stat Cards */}
          {blast && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 pt-2 border-t border-gemini-border/50">
              <div className="p-3 rounded-xl bg-gemini-card border border-gemini-border">
                <span className="text-[10px] uppercase font-semibold text-gemini-muted block mb-1">
                  Total Impacted
                </span>
                <span className="text-xl font-bold text-white font-mono">
                  {blast.total_affected_entities ?? 0}
                </span>
                <span className="text-[10px] text-gemini-muted block mt-0.5">Entities Downstream</span>
              </div>

              <div className="p-3 rounded-xl bg-gemini-card border border-gemini-border">
                <span className="text-[10px] uppercase font-semibold text-gemini-muted block mb-1">
                  Services
                </span>
                <span className="text-xl font-bold text-blue-400 font-mono">
                  {blast.downstream_services?.length ?? 0}
                </span>
                <span className="text-[10px] text-gemini-muted block mt-0.5">Exposed Workloads</span>
              </div>

              <div className="p-3 rounded-xl bg-gemini-card border border-gemini-border">
                <span className="text-[10px] uppercase font-semibold text-gemini-muted block mb-1">
                  IAM Roles
                </span>
                <span className="text-xl font-bold text-purple-400 font-mono">
                  {blast.accessible_iam_roles?.length ?? 0}
                </span>
                <span className="text-[10px] text-gemini-muted block mt-0.5">Assumable Identities</span>
              </div>

              <div className="p-3 rounded-xl bg-gemini-card border border-gemini-border">
                <span className="text-[10px] uppercase font-semibold text-gemini-muted block mb-1">
                  Crown Jewels
                </span>
                <span className="text-xl font-bold text-amber-400 font-mono">
                  {blast.exposed_crown_jewels?.length ?? 0}
                </span>
                <span className="text-[10px] text-gemini-muted block mt-0.5">High-Value Stores</span>
              </div>
            </div>
          )}

          {/* Cyber Kill Chain Component */}
          {message.kill_chain && message.kill_chain.length > 0 && (
            <KillChainCards killChain={message.kill_chain} />
          )}

          {/* Attack Path Proof */}
          {message.attack_path && message.attack_path.length > 0 && (
            <PathProof attackPath={message.attack_path} pathArrow={message.path_arrow} />
          )}

          {/* Cypher Logs & MCP Execution Logs */}
          {message.cypher_logs && message.cypher_logs.length > 0 && (
            <CypherLogsDrawer
              cypherLogs={message.cypher_logs}
              mutations={message.mutations_applied || []}
              severanceVerified={message.severance_verified}
              pathsRemaining={message.attack_paths_remaining}
            />
          )}

          {/* Remediation Bundle CTA */}
          {message.remediation_bundle && Object.keys(message.remediation_bundle).length > 0 && (
            <div className="mt-3.5 pt-3 border-t border-gemini-border/60 flex items-center justify-between">
              <span className="text-xs text-gemini-muted flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-trust cloud isolation policies generated</span>
              </span>
              <button
                onClick={() => onOpenRemediation(message.remediation_bundle)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center space-x-1.5 transition"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>View Remediation Bundle (Terraform/K8s)</span>
              </button>
            </div>
          )}
        </div>

        {/* Suggested Follow-up Prompt Pills */}
        {message.suggested_followups && message.suggested_followups.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.suggested_followups.map((prompt, pIdx) => (
              <button
                key={pIdx}
                onClick={() => onSelectFollowup(prompt)}
                className="text-xs px-3 py-1.5 rounded-full bg-gemini-surface hover:bg-gemini-surfaceHover border border-gemini-border hover:border-gemini-accent/40 text-gemini-text hover:text-white transition shadow-sm text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
