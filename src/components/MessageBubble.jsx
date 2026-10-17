import React from 'react';
import { Sparkles, User, ShieldAlert, FileCode, CheckCircle2, AlertTriangle, Database, Shield } from 'lucide-react';
import KillChainCards from './KillChainCards';
import PathProof from './PathProof';
import CypherLogsDrawer from './CypherLogsDrawer';

export default function MessageBubble({ message, onSelectFollowup, onOpenRemediation }) {
  const isUser = message.role === 'user';

  // Rich markdown formatter for agent messages with Table, Blockquote, and List support
  const renderFormattedText = (text) => {
    if (!text) return null;
    const rawLines = text.split('\n');

    const blocks = [];
    let i = 0;

    while (i < rawLines.length) {
      const line = rawLines[i];
      const trimmed = line.trim();

      // Check if this line starts a Markdown Table
      if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|')) {
        const tableLines = [trimmed];
        i++;
        while (i < rawLines.length) {
          const nextTrimmed = rawLines[i].trim();
          if (nextTrimmed.startsWith('|') && nextTrimmed.endsWith('|')) {
            tableLines.push(nextTrimmed);
            i++;
          } else if (
            nextTrimmed === '' &&
            i + 1 < rawLines.length &&
            rawLines[i + 1].trim().startsWith('|') &&
            rawLines[i + 1].trim().endsWith('|')
          ) {
            // Handle loose LLM markdown with single blank lines between table rows
            i++;
          } else {
            break;
          }
        }

        // Process collected table lines
        if (tableLines.length >= 2) {
          const isSeparator = (str) => /^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/.test(str);
          const parseRow = (str) => {
            let parts = str.split('|').map((c) => c.trim());
            if (parts.length > 0 && parts[0] === '') parts.shift();
            if (parts.length > 0 && parts[parts.length - 1] === '') parts.pop();
            return parts;
          };

          const headerRow = parseRow(tableLines[0]);
          let bodyLines = tableLines.slice(1);
          if (bodyLines.length > 0 && isSeparator(bodyLines[0])) {
            bodyLines = bodyLines.slice(1);
          }
          const bodyRows = bodyLines.filter((l) => !isSeparator(l)).map(parseRow);

          blocks.push({
            type: 'table',
            headers: headerRow,
            rows: bodyRows,
          });
          continue;
        } else {
          blocks.push({ type: 'p', content: tableLines[0] });
          continue;
        }
      }

      // Check code block ```
      if (trimmed.startsWith('```')) {
        const codeLines = [];
        const lang = trimmed.slice(3).trim();
        i++;
        while (i < rawLines.length && !rawLines[i].trim().startsWith('```')) {
          codeLines.push(rawLines[i]);
          i++;
        }
        if (i < rawLines.length) i++;
        blocks.push({ type: 'code', code: codeLines.join('\n'), lang });
        continue;
      }

      // Check blockquote >
      if (trimmed.startsWith('> ')) {
        blocks.push({ type: 'quote', content: trimmed.replace(/^>\s*/, '') });
        i++;
        continue;
      }

      // Headers, lists, and paragraphs
      if (trimmed.startsWith('### ')) {
        blocks.push({ type: 'h3', content: trimmed.replace('### ', '') });
      } else if (trimmed.startsWith('#### ')) {
        blocks.push({ type: 'h4', content: trimmed.replace('#### ', '') });
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        blocks.push({ type: 'bullet', content: trimmed.replace(/^[-•]\s*/, '') });
      } else if (/^\d+\.\s/.test(trimmed)) {
        const num = trimmed.match(/^(\d+\.)\s/)[1];
        blocks.push({ type: 'number', num, content: trimmed.replace(/^\d+\.\s/, '') });
      } else if (trimmed === '') {
        blocks.push({ type: 'space' });
      } else {
        blocks.push({ type: 'p', content: line });
      }
      i++;
    }

    return (
      <div className="space-y-2 text-sm leading-relaxed text-gemini-text">
        {blocks.map((block, idx) => {
          if (block.type === 'table') {
            return (
              <div key={idx} className="my-3 overflow-x-auto rounded-xl border border-gemini-border bg-gemini-card/70 shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gemini-border bg-gemini-surface/90">
                      {block.headers.map((h, hIdx) => (
                        <th key={hIdx} className="px-3.5 py-2.5 font-semibold text-white tracking-wide">
                          <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(h) }} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gemini-border/50">
                    {block.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-gemini-surface/40 transition">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3.5 py-2.5 text-gemini-text leading-relaxed align-top">
                            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cell) }} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          if (block.type === 'code') {
            return (
              <pre key={idx} className="my-2 p-3 rounded-xl bg-gemini-card border border-gemini-border text-xs font-mono text-purple-200 overflow-x-auto leading-relaxed">
                <code>{block.code}</code>
              </pre>
            );
          }
          if (block.type === 'quote') {
            return (
              <div key={idx} className="my-2 pl-3 py-1.5 border-l-2 border-gemini-accent bg-gemini-surface/40 rounded-r-lg text-xs font-mono text-purple-200 break-all leading-relaxed">
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block.content) }} />
              </div>
            );
          }
          if (block.type === 'h3') {
            return (
              <h3 key={idx} className="text-base font-bold text-white pt-2 pb-1 border-b border-gemini-border/40">
                {block.content}
              </h3>
            );
          }
          if (block.type === 'h4') {
            return (
              <h4 key={idx} className="text-sm font-semibold text-gemini-accent pt-1.5">
                {block.content}
              </h4>
            );
          }
          if (block.type === 'bullet') {
            return (
              <div key={idx} className="flex items-start space-x-2 pl-2">
                <span className="text-gemini-accent font-bold mt-1">•</span>
                <span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block.content) }} />
              </div>
            );
          }
          if (block.type === 'number') {
            return (
              <div key={idx} className="flex items-start space-x-2 pl-2">
                <span className="text-gemini-muted font-bold font-mono text-xs mt-0.5">{block.num}</span>
                <span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block.content) }} />
              </div>
            );
          }
          if (block.type === 'space') {
            return <div key={idx} className="h-1" />;
          }
          return (
            <p key={idx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block.content) }} />
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
      <div className="flex justify-end my-3 sm:my-4 animate-fade-in">
        <div className="max-w-[88%] sm:max-w-2xl bg-gemini-surface border border-gemini-border rounded-2xl rounded-tr-sm px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-white shadow-sm">
          <p className="whitespace-pre-wrap">{message.content}</p>
          {message.attachedFile && (
            <div className="mt-2 pt-2 border-t border-gemini-border/50 text-[10px] sm:text-[11px] text-gemini-muted flex items-center space-x-1.5 flex-wrap">
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
    <div className="flex items-start space-x-2 sm:space-x-3.5 my-3 sm:my-6 animate-fade-in w-full min-w-0">
      {/* Agent Avatar */}
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-gemini-gradientStart to-gemini-gradientEnd flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20 mt-0.5">
        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
      </div>

      {/* Main Message Body */}
      <div className="flex-1 max-w-4xl overflow-hidden min-w-0">
        {/* Author & Model Tag */}
        <div className="flex items-center flex-wrap gap-1.5 mb-1.5">
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
        <div className="bg-gemini-surface/60 border border-gemini-border/80 rounded-2xl p-3 sm:p-4 shadow-sm w-full min-w-0">
          {renderFormattedText(message.content || message.reply)}

          {/* Blast Radius Stat Cards */}
          {blast && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 my-3 sm:my-4 pt-2 border-t border-gemini-border/50">
              <div className="p-2 sm:p-3 rounded-xl bg-gemini-card border border-gemini-border">
                <span className="text-[9px] sm:text-[10px] uppercase font-semibold text-gemini-muted block mb-1">
                  Total Impacted
                </span>
                <span className="text-lg sm:text-xl font-bold text-white font-mono">
                  {blast.total_affected_entities ?? 0}
                </span>
                <span className="text-[9px] sm:text-[10px] text-gemini-muted block mt-0.5">Entities Downstream</span>
              </div>

              <div className="p-2 sm:p-3 rounded-xl bg-gemini-card border border-gemini-border">
                <span className="text-[9px] sm:text-[10px] uppercase font-semibold text-gemini-muted block mb-1">
                  Services
                </span>
                <span className="text-lg sm:text-xl font-bold text-blue-400 font-mono">
                  {blast.downstream_services?.length ?? 0}
                </span>
                <span className="text-[9px] sm:text-[10px] text-gemini-muted block mt-0.5">Exposed Workloads</span>
              </div>

              <div className="p-2 sm:p-3 rounded-xl bg-gemini-card border border-gemini-border">
                <span className="text-[9px] sm:text-[10px] uppercase font-semibold text-gemini-muted block mb-1">
                  IAM Roles
                </span>
                <span className="text-lg sm:text-xl font-bold text-purple-400 font-mono">
                  {blast.accessible_iam_roles?.length ?? 0}
                </span>
                <span className="text-[9px] sm:text-[10px] text-gemini-muted block mt-0.5">Assumable Identities</span>
              </div>

              <div className="p-2 sm:p-3 rounded-xl bg-gemini-card border border-gemini-border">
                <span className="text-[9px] sm:text-[10px] uppercase font-semibold text-gemini-muted block mb-1">
                  Crown Jewels
                </span>
                <span className="text-lg sm:text-xl font-bold text-amber-400 font-mono">
                  {blast.exposed_crown_jewels?.length ?? 0}
                </span>
                <span className="text-[9px] sm:text-[10px] text-gemini-muted block mt-0.5">High-Value Stores</span>
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
            <div className="mt-3 pt-3 border-t border-gemini-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <span className="text-xs text-gemini-muted flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero-trust cloud isolation policies generated</span>
              </span>
              <button
                onClick={() => onOpenRemediation(message.remediation_bundle)}
                className="w-full sm:w-auto justify-center px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center space-x-1.5 transition text-center"
              >
                <FileCode className="w-3.5 h-3.5 shrink-0" />
                <span>View Remediation Bundle (Terraform/K8s)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
