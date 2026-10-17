# 🛡️ NexTrace — Frontend Web Application

> **Hackathon Track:** Agents That Act on Connected Data  
> **Live Deployment:** [https://nextrace-tau.vercel.app](https://nextrace-tau.vercel.app)  
> **Backend Repository:** [Subhojit534/NexTrace_Backend](https://github.com/Subhojit534/NexTrace_Backend)  
> **Frontend Repository:** [Subhojit534/NexTrace](https://github.com/Subhojit534/NexTrace)  

NexTrace is an autonomous cloud security and blast-radius investigator. Inspired by Google Gemini's clean conversational experience, it connects directly with FalkorDB to help security teams simulate zero-day exploits, trace attack exposure paths to confidential customer databases, isolate compromised microservices, and generate instant multi-cloud remediation code.

---

## 🌟 Key Features

- **Google Gemini-Style Interface**: Clean, centered chat layout with prompt suggestions and a floating prompt bar with an attachment (`+`) button to upload any custom architecture graph.
- **Autonomous Blast-Radius Mapping**: Dynamically visualizes downstream entity impact across 1 to 4 hops using FalkorDB multi-hop traversals.
- **Explainable Attack Traversal Proof**: Renders the exact step-by-step path from public ingress entrypoints to crown-jewel databases using FalkorDB's native `shortestPath()` algorithm.
- **Visual Cyber Kill-Chain Cards**: Structured 5-stage MITRE ATT&CK progression cards with live `CONTAINED` status badges.
- **Transparent Cypher Execution Drawer**: Inspect the exact Cypher queries executed in FalkorDB, query latency, and autonomous state mutation records.
- **One-Click Remediation Bundles**: Interactive multi-tab viewer for generated Terraform HCL, AWS CLI commands, and Kubernetes `NetworkPolicy` YAML.
- **Cross-Device Chat History**: Isolated per Google account using Supabase OAuth, with seamless guest mode for immediate testing.
- **Fully Mobile Responsive**: Dynamic viewport management (`100dvh`), slide-over mobile history drawer, and touch-optimized action cards.

---

## 📊 Graph Data Model

NexTrace models complex cloud environments as a property graph in FalkorDB.

### Node Labels & Entities

| Entity Label | Description | Example Properties |
| :--- | :--- | :--- |
| **`Service`** | Microservice workloads running in Kubernetes or VMs | `name: 'PublicAPIGateway'`, `tier: 1`, `public_facing: true`, `status: 'HEALTHY'` |
| **`IAMRole`** | Cloud identity and access management roles | `name: 'IAMRole_AuthServicePrivileged'`, `privilege_level: 'ADMIN'` |
| **`Database`** | Data persistence stores and caches | `name: 'ProdCustomerDB'`, `crown_jewel: true`, `classification: 'CONFIDENTIAL'` |
| **`Vulnerability`** | Known Common Vulnerabilities and Exposures (CVEs) | `name: 'CVE-2024-3094_XZBackdoor'`, `cvss_score: 10.0`, `severity: 'CRITICAL'` |

### Relationship Types (Edges)

| Relationship | Direction | Meaning |
| :--- | :--- | :--- |
| **`[:CALLS]`** | `(Service) ➔ (Service)` | Network RPC / HTTP communication between microservices |
| **`[:CAN_ASSUME]`** | `(Service) ➔ (IAMRole)` | Service workload is authorized to assume an IAM identity |
| **`[:ACCESSES]`** | `(IAMRole/Service) ➔ (Database)` | Identity or workload has data access permissions |
| **`[:DEPENDS_ON]`** | `(Service) ➔ (Vulnerability)` | Workload is bundled with a known vulnerable dependency |

---

## 📁 Sample Architecture JSON Files

You can test NexTrace using our pre-built canonical JSON benchmarks. These can be downloaded from `public/samples/` or uploaded via the **`+` Attachment Button** in the UI:

| File Name | Nodes | Edges | Real-World Scenario |
| :--- | :---: | :---: | :--- |
| [`fintech_enterprise.json`](/samples/fintech_enterprise.json) | **34** | **36** | Tier-0/1 banking architecture with PCI payment vaults and customer databases. Includes zero-day CVE-2024-3094 on `AuthService`. |
| [`google_online_boutique.json`](/samples/google_online_boutique.json) | **28** | **35** | Official Google Cloud microservices architecture with `CreditCardVault`. |
| [`aws_cloud_iam.json`](/samples/aws_cloud_iam.json) | **21** | **24** | Multi-hop IAM privilege escalation chain from EC2 to Cloud Admin. |
| [`opentelemetry_astronomy_shop.json`](/samples/opentelemetry_astronomy_shop.json) | **12** | **11** | Polyglot CNCF benchmark tracing edge Envoy ingress to payment vaults. |
| [`sockshop_microservices.json`](/samples/sockshop_microservices.json) | **12** | **11** | Cloud-native Kubernetes eCommerce architecture with Traefik router. |
| [`netflix_microservices_topology.json`](/samples/netflix_microservices_topology.json) | **9** | **7** | Enterprise Netflix stack modeling Zuul gateway and Cassandra databases. |
| [`azure_cloud_infrastructure.json`](/samples/azure_cloud_infrastructure.json) | **7** | **6** | Multi-tier Azure enterprise topology with Azure Front Door and Key Vault HSM. |

### Canonical Architecture JSON Format
If you want to create your own architecture file to upload:
```json
{
  "name": "My Custom Cloud Topology",
  "nodes": [
    { "id": "APIGateway", "name": "APIGateway", "label": "Service", "public_facing": true, "status": "HEALTHY" },
    { "id": "OrderService", "name": "OrderService", "label": "Service", "public_facing": false, "status": "HEALTHY" },
    { "id": "UserDB", "name": "UserDB", "label": "Database", "crown_jewel": true, "classification": "CONFIDENTIAL" }
  ],
  "relationships": [
    { "from": "APIGateway", "to": "OrderService", "type": "CALLS" },
    { "from": "OrderService", "to": "UserDB", "type": "ACCESSES" }
  ]
}
```

---

## 🧠 Cypher Queries & Graph Algorithms Used

1. **Multi-Hop Blast-Radius Discovery**:
   ```cypher
   MATCH path = (s {name: $service})-[:CALLS|DEPENDS_ON|CAN_ASSUME|ACCESSES*1..4]->(target)
   RETURN [n in nodes(path) | n.name] AS node_sequence, length(path) AS depth, target.name, target.crown_jewel
   ```
2. **Shortest Attack Path (`shortestPath()`)**:
   ```cypher
   MATCH (entry:Service {public_facing: true}), (crown:Database {crown_jewel: true})
   MATCH path = shortestPath((entry)-[:CALLS|CAN_ASSUME|ACCESSES*..10]->(crown))
   RETURN [n in nodes(path) | n.name] AS node_sequence, length(path) AS hops
   ```
3. **Autonomous Node Quarantine (State Mutation)**:
   ```cypher
   MATCH (s:Service {name: $service})
   SET s.status = 'QUARANTINED', s.quarantine_reason = $reason, s.quarantined_at = timestamp()
   ```
4. **Autonomous Edge Severance**:
   ```cypher
   MATCH (a {name: $from_service})-[r:CALLS|CAN_ASSUME]->(b)
   DELETE r
   ```
5. **Path Severance Verification**:
   Re-executes `shortestPath()` on the modified topology to verify that active attack paths to crown jewels equal `0`.

---

## 🛠️ Local Setup Instructions

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### 1. Clone & Install
```bash
git clone https://github.com/Subhojit534/NexTrace.git
cd NexTrace
npm install
```

### 2. Configure Environment (`.env`)
Create a `.env` file in the root directory:
```env
# Backend API URL (use localhost for local backend, or live Vercel URL)
VITE_API_BASE_URL=http://localhost:8000

# (Optional) Supabase Credentials for Google Login
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
*(Note: If Supabase credentials are not provided, the application runs seamlessly in Guest Mode).*

### 3. Run the Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## ☁️ Deploy to Vercel

1. Push your code to GitHub.
2. In the **Vercel Dashboard**, click **Add New Project** and select `Subhojit534/NexTrace`.
3. Set the Framework Preset to **Vite**.
4. Add the `VITE_API_BASE_URL` environment variable pointing to your backend.
5. Click **Deploy**.
