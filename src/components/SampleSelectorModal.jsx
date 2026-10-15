import React from 'react';
import { X, Download, HardDrive, Check, ExternalLink, ArrowRight } from 'lucide-react';

const SAMPLES = [
  {
    id: 'fintech_enterprise',
    filename: 'fintech_enterprise.json',
    name: 'FinTech Enterprise Core',
    description: '34-node Tier-0 microservice mesh with AWS IAM roles, PaymentService, and PCI/Customer database crown jewels.',
    nodes: 34,
    rels: 36,
    scenarios: [
      'Scenario A: AuthService RCE (CVE-2024-3094)',
      'Scenario B: OrderService Deserialization (CVE-2022-25845)',
      'Scenario C: NotificationWorker DDoS (CVE-2023-44487)'
    ]
  },
  {
    id: 'google_online_boutique',
    filename: 'google_online_boutique.json',
    name: 'Google Cloud Online Boutique',
    description: "Official 11-tier microservice architecture from Google Cloud with Workload Identities and CreditCardVault.",
    nodes: 28,
    rels: 35,
    scenarios: [
      'Scenario A: CheckoutService gRPC RCE (CVE-2023-32731)',
      'Scenario B: PaymentService Key Confusion (CVE-2022-29217)',
      'Scenario C: Frontend Rapid Reset DoS (CVE-2023-44487)'
    ]
  },
  {
    id: 'aws_cloud_iam',
    filename: 'aws_cloud_iam.json',
    name: 'AWS Cloud IAM Privilege Escalation',
    description: 'Multi-step cloud identity privilege escalation path from compromised EC2/APIs to Root Organization Admin.',
    nodes: 21,
    rels: 24,
    scenarios: [
      'Scenario A: DevEC2Workload SSRF Credential Theft (CVE-2023-38035)',
      'Scenario B: CI/CD Pipeline Build Token Injection (CVE-2024-21626)',
      'Scenario C: Lambda Role Direct Access Violation'
    ]
  },
  {
    id: 'opentelemetry_astronomy_shop',
    filename: 'opentelemetry_astronomy_shop.json',
    name: 'OpenTelemetry Astronomy Shop',
    description: 'Polyglot microservices benchmark from CNCF OpenTelemetry Astronomy Shop. Traces edge Envoy ingress to accounting ledger.',
    nodes: 12,
    rels: 11,
    scenarios: [
      'Scenario A: CheckoutService gRPC Memory Flaw (CVE-2023-32731)',
      'Scenario B: Payment Service Unauthorized Lateral Access',
      'Scenario C: Cart Store Remote Deserialization'
    ]
  },
  {
    id: 'sockshop_microservices',
    filename: 'sockshop_microservices.json',
    name: 'Weaveworks Sock Shop Cloud-Native',
    description: 'Standard Kubernetes cloud-native architecture modeling Traefik edge router, front-end, orders, and MongoDB database.',
    nodes: 12,
    rels: 11,
    scenarios: [
      'Scenario A: Spring4Shell RCE in orders-service (CVE-2022-22965)',
      'Scenario B: Payment Service Unauthorized Lateral Access',
      'Scenario C: Front-End HTTP/2 Flood DoS'
    ]
  },
  {
    id: 'netflix_microservices_topology',
    filename: 'netflix_microservices_topology.json',
    name: 'Netflix OSS Microservices Topology',
    description: 'Enterprise Netflix-stack microservice topology with Zuul edge gateway, Eureka, and protected subscriber and payment vaults.',
    nodes: 9,
    rels: 7,
    scenarios: [
      'Scenario A: SubscriberAccountService RCE (CVE-2023-34053)',
      'Scenario B: Zuul Gateway Ingress Probe',
      'Scenario C: Billing Payment IAM Lateral Movement'
    ]
  },
  {
    id: 'azure_cloud_infrastructure',
    filename: 'azure_cloud_infrastructure.json',
    name: 'Azure Enterprise Cloud Infrastructure',
    description: 'Multi-tier Azure enterprise topology with Azure Front Door ingress, App Service, Managed Identities, Azure Key Vault, and Azure SQL DB.',
    nodes: 7,
    rels: 6,
    scenarios: [
      'Scenario A: Remote command injection in AppService_EcommerceApi (CVE-2024-21319)',
      'Scenario B: EntraID Managed Identity Lateral Movement',
      'Scenario C: Azure Key Vault Master HSM Access Probe'
    ]
  }
];

export default function SampleSelectorModal({
  isOpen,
  onClose,
  activePreset,
  onLoadSampleIntoWorkspace
}) {
  if (!isOpen) return null;

  const handleDownload = (filename) => {
    // Direct browser download from /samples/
    const url = `/samples/${filename}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gemini-surface border border-gemini-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gemini-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gemini-card border border-gemini-border text-blue-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Demo Graph Topologies</h2>
              <p className="text-xs text-gemini-muted">Download sample JSON files or load them directly into FalkorDB</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gemini-muted hover:text-white hover:bg-gemini-surfaceHover transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
          {SAMPLES.map((sample) => (
            <div
              key={sample.id}
              className={`p-4 rounded-xl border transition ${
                activePreset === sample.id
                  ? 'bg-blue-500/10 border-blue-500/40'
                  : 'bg-gemini-card border-gemini-border hover:border-gemini-border/80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-semibold text-white">{sample.name}</h3>
                    {activePreset === sample.id && (
                      <span className="text-[10px] font-medium bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                        Active in Workspace
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gemini-muted mt-1 leading-relaxed">{sample.description}</p>
                </div>

                <div className="flex items-center space-x-2 shrink-0 ml-3">
                  <button
                    onClick={() => handleDownload(sample.filename)}
                    className="p-2 rounded-lg bg-gemini-surface hover:bg-gemini-surfaceHover border border-gemini-border text-xs text-gemini-text font-medium flex items-center space-x-1.5 transition"
                    title={`Download ${sample.filename}`}
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span className="hidden sm:inline">Download JSON</span>
                  </button>

                  <button
                    onClick={() => {
                      onLoadSampleIntoWorkspace(sample.id);
                      onClose();
                    }}
                    className="py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-medium flex items-center space-x-1 transition shadow-md shadow-blue-500/20"
                  >
                    <span>Load Universe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Stats & Scenarios */}
              <div className="mt-3 pt-3 border-t border-gemini-border/50 flex flex-wrap items-center justify-between text-[11px] text-gemini-muted gap-2">
                <div className="flex items-center space-x-3">
                  <span><strong>{sample.nodes}</strong> nodes</span>
                  <span>·</span>
                  <span><strong>{sample.rels}</strong> relationships</span>
                </div>
                <div className="text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  {sample.scenarios.length} Pre-Engineered Threat Scenarios Included
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gemini-border bg-gemini-card/50 flex items-center justify-between text-xs text-gemini-muted">
          <span>All 5 files are also available in <code className="text-gemini-accent">sample_graphs/</code> and <code className="text-gemini-accent">frontend/public/samples/</code></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gemini-surface hover:bg-gemini-surfaceHover border border-gemini-border text-white text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
