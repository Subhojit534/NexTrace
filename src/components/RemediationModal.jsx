import React, { useState } from 'react';
import { X, Code, Copy, Check, Download, FileCode } from 'lucide-react';

export default function RemediationModal({ isOpen, onClose, bundle = {} }) {
  const [activeTab, setActiveTab] = useState('terraform'); // 'terraform' | 'aws_cli' | 'k8s' | 'json'
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const tabs = [
    { id: 'terraform', label: 'Terraform (HCL)', content: bundle.terraform_code || '# No Terraform generated' },
    { id: 'aws_cli', label: 'AWS CLI Script', content: bundle.aws_cli_script || '# No AWS CLI generated' },
    { id: 'k8s', label: 'Kubernetes NetworkPolicy', content: bundle.k8s_network_policy || '# No K8s policy generated' },
    { id: 'json', label: 'Incident JSON', content: JSON.stringify(bundle, null, 2) },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentTab.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const ext = activeTab === 'terraform' ? 'tf' : activeTab === 'aws_cli' ? 'sh' : activeTab === 'k8s' ? 'yaml' : 'json';
    const blob = new Blob([currentTab.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `remediation_${activeTab}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gemini-surface border border-gemini-border rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gemini-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gemini-card border border-gemini-border text-emerald-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Multi-Cloud Remediation Bundle</h2>
              <p className="text-xs text-gemini-muted">Automated Terraform, AWS CLI, and Kubernetes zero-trust policies</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gemini-muted hover:text-white hover:bg-gemini-surfaceHover transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-gemini-border px-6 bg-gemini-card/30">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-xs font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-emerald-400 text-emerald-300 font-semibold'
                  : 'border-transparent text-gemini-muted hover:text-gemini-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Box */}
        <div className="p-6 overflow-y-auto flex-1 bg-gemini-bg/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-gemini-muted uppercase">
              {currentTab.label} Bundle
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-gemini-card hover:bg-gemini-surfaceHover border border-gemini-border text-xs text-gemini-text flex items-center space-x-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-lg bg-gemini-card hover:bg-gemini-surfaceHover border border-gemini-border text-xs text-gemini-text flex items-center space-x-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Download</span>
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-gemini-card border border-gemini-border text-xs font-mono text-emerald-300/90 overflow-x-auto whitespace-pre leading-relaxed max-h-[50vh]">
            {currentTab.content}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gemini-border bg-gemini-card/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gemini-surface hover:bg-gemini-surfaceHover border border-gemini-border text-xs font-medium text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
