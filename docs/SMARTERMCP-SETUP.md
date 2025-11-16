# 📘 SmarterMCP — Official MCP Server Documentation

SmarterMCP es el Model Context Protocol server oficial de SmarterOS que expone todos los servicios del sistema a través de una interfaz unificada y conversacional para AI agents.

## 🎯 Overview

**SmarterMCP** proporciona acceso programático a todos los servicios de SmarterOS:
- **N8N**: Workflow automation
- **Supabase**: Database & backend
- **Odoo**: ERP & CRM
- **Chatwoot**: Customer support
- **Botpress**: Conversational AI
- **Metabase**: Analytics & BI
- **Infrastructure**: Docker, VPS, monitoring

Todo a través de 35 herramientas organizadas en 9 categorías.

## 🚀 Quick Start

### 1. Instalación

```bash
# Via npm (global)
npm install -g @smartercl/mcp-server

# Via Docker
docker pull smartercl/mcp-server:latest

# Via install script
curl -fsSL https://mcp.smarterbot.cl/install.sh | sh
```

### 2. Generar API Token

```bash
# Genera un token con scopes específicos
curl -X POST https://mcp.smarterbot.cl/auth/token \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "my-agent",
    "scopes": ["read:services", "write:workflows", "read:analytics"]
  }'

# Response:
{
  "api_token": "smcp_xxxxxxxxxxxxx",
  "tenant_id": "tenant-uuid-here",
  "scopes": ["read:services", "write:workflows", "read:analytics"],
  "expires_at": "2025-12-31T23:59:59Z"
}
```

### 3. Configurar Vault

```bash
# Almacenar credenciales en Vault
vault kv put smarteros/mcp/smartermcp \
  api_token="smcp_xxxxxxxxxxxxx" \
  tenant_id="tenant-uuid-here" \
  endpoint="https://mcp.smarterbot.cl"

# Verificar
vault kv get smarteros/mcp/smartermcp

# Aplicar policy
vault policy write mcp-smartermcp-read \
  smarteros-specs/vault/policies/mcp-smartermcp-read.hcl
```

### 4. Configurar MCP Client

#### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "smartermcp": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.smarterbot.cl"],
      "env": {
        "SMARTERMCP_API_TOKEN": "smcp_xxxxxxxxxxxxx",
        "SMARTERMCP_TENANT_ID": "tenant-uuid-here"
      }
    }
  }
}
```

#### Cline (VS Code)

Edit `.vscode/settings.json`:

```json
{
  "cline.mcpServers": {
    "smartermcp": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.smarterbot.cl"],
      "env": {
        "SMARTERMCP_API_TOKEN": "smcp_xxxxxxxxxxxxx",
        "SMARTERMCP_TENANT_ID": "tenant-uuid-here"
      }
    }
  }
}
```

Restart Claude Desktop o VS Code para aplicar cambios.

## 🛠️ Available Tools (35 total)

### 1. Services Management (5 tools)

```typescript
// List all services
services_list(filter: "all" | "frontend" | "backend" | "infrastructure")

// Check health
services_health(service_id?: string)

// Deploy service
services_deploy(service_id: string, version?: string, force?: boolean)

// Restart service
services_restart(service_id: string)

// Get logs
services_logs(service_id: string, lines?: number, follow?: boolean)
```

**Example prompts:**
```
"List all backend services that are active"
"Check health of N8N service"
"Restart Chatwoot service"
"Show last 100 lines of Odoo logs"
```

### 2. N8N Workflows (4 tools)

```typescript
// List workflows
workflows_list(active?: boolean, tags?: string[])

// Trigger workflow
workflows_trigger(workflow_id: string, input_data?: object)

// Check execution status
workflows_status(execution_id: string)

// Create new workflow
workflows_create(name: string, workflow_json: object, tags?: string[])
```

**Example prompts:**
```
"List active workflows with tag 'automation'"
"Trigger backup workflow for smarteros database"
"Check status of execution exec_abc123"
"Create workflow to sync Shopify orders to Supabase"
```

### 3. Analytics (3 tools)

```typescript
// Get KPIs
analytics_kpis(kpis?: string[])

// List dashboards
analytics_dashboards()

// Generate report
analytics_reports(query: string, format?: "json" | "csv" | "markdown")
```

**Example prompts:**
```
"Show me current revenue_mtd and conversion_rate"
"List all available Metabase dashboards"
"Generate markdown report of top 10 customers by revenue this month"
```

### 4. CRM / Odoo (4 tools)

```typescript
// List contacts
crm_contacts_list(limit?: number, filter?: object)

// Search contacts
crm_contacts_search(query: string)

// List opportunities
crm_opportunities_list(stage?: string)

// Pipeline status
crm_pipeline_status()
```

**Example prompts:**
```
"List 50 contacts from Chile with type 'lead'"
"Search for contact with email john@example.com"
"Show opportunities in negotiation stage"
"Get sales pipeline overview"
```

### 5. Support / Chatwoot (4 tools)

```typescript
// List conversations
support_conversations_list(status?: string, assignee?: string, limit?: number)

// Search conversations
support_conversations_search(query: string)

// Agents status
support_agents_status()

// Team metrics
support_metrics(period?: "today" | "week" | "month")
```

**Example prompts:**
```
"Show 20 open support conversations"
"Search conversations about 'refund request'"
"Check which support agents are online"
"Get support metrics for this week"
```

### 6. Bots / Botpress (3 tools)

```typescript
// List bots
bots_list()

// Get conversations
bots_conversations(bot_id: string, limit?: number)

// Bot analytics
bots_analytics(bot_id: string, period?: string)
```

**Example prompts:**
```
"List all deployed Botpress bots"
"Show last 20 conversations for bot_abc123"
"Get bot performance analytics for the last month"
```

### 7. Infrastructure (4 tools)

```typescript
// Infrastructure status
infra_status()

// Detailed metrics
infra_metrics(metric?: string, period?: string)

// List containers
containers_list(filter?: "all" | "running" | "stopped" | "error")

// Restart container
containers_restart(container_id: string)
```

**Example prompts:**
```
"Show infrastructure status overview"
"Get CPU metrics for the last 24 hours"
"List all running Docker containers"
"Restart N8N container"
```

### 8. Documentation (3 tools)

```typescript
// Service docs
docs_services(service_id: string)

// API documentation
docs_apis(service_id: string)

// Database schemas
docs_schemas(database: string)
```

**Example prompts:**
```
"Get documentation for N8N service"
"Show Supabase API documentation"
"Get database schema for smarteros database"
```

### 9. Code Generation (3 tools)

```typescript
// Generate N8N workflow
generate_n8n_workflow(description: string, services?: string[])

// Generate Botpress skill
generate_botpress_skill(description: string)

// Generate API client
generate_api_client(service_id: string, language?: string)
```

**Example prompts:**
```
"Generate N8N workflow to sync Shopify orders to Supabase when created"
"Create Botpress skill to help users track their order status"
"Generate TypeScript API client for N8N service"
```

## 📊 Agent Capabilities

### Executor-Codex (Primary)

**Services:** deploy, restart, logs, health checks  
**Workflows:** trigger, create, monitor  
**Infrastructure:** containers, metrics, scaling  

**Use cases:**
- Deploy and manage services
- Trigger backup workflows
- Monitor infrastructure
- Restart failed containers
- Scale services

### Director-Gemini (Secondary)

**Analytics:** KPIs, dashboards, reports  
**CRM:** contacts, opportunities, pipeline  
**Support:** conversations, agents, metrics  
**Bots:** performance, conversations  

**Use cases:**
- Strategic planning from KPIs
- Customer insights from CRM/support
- Sales pipeline analysis
- Bot performance monitoring

### Writer-Copilot (Secondary)

**Documentation:** services, APIs, schemas  
**Code Generation:** workflows, skills, clients  

**Use cases:**
- Generate N8N workflows
- Create Botpress skills
- Scaffold API integrations
- Generate documentation

## 🔐 Authentication & Scopes

### Available Scopes

- `read:services` - List and read service configurations
- `write:services` - Deploy and restart services
- `read:workflows` - List N8N workflows
- `write:workflows` - Create and trigger workflows
- `read:analytics` - Access Metabase dashboards and KPIs
- `read:crm` - Access Odoo CRM data
- `write:crm` - Create/update CRM records
- `read:support` - Access Chatwoot conversations
- `read:bots` - Access Botpress bots and conversations
- `write:bots` - Deploy and configure bots
- `admin:tenants` - Manage multi-tenant configurations

### Multi-tenant Support

Cada API token está asociado a un `tenant_id`. Todos los datos y operaciones están aislados por tenant:

- **Services:** Instancias aisladas por tenant
- **Workflows:** Workflows scoped por tenant
- **Data:** RLS en Supabase garantiza aislamiento
- **Analytics:** Dashboards específicos por tenant
- **CRM:** Multi-company support en Odoo
- **Support:** Account separation en Chatwoot
- **Bots:** Workspace isolation en Botpress

## 📈 Rate Limits

### Default Limits

- **100 requests/minute** (general)
- **5000 requests/hour** (general)
- **Burst:** 20 requests

### By Category

- **Services:** 50/min
- **Workflows:** 30/min (trigger/create)
- **Analytics:** 20/min (expensive queries)
- **CRM:** 100/min
- **Support:** 100/min
- **Bots:** 50/min
- **Infrastructure:** 20/min (critical)
- **Documentation:** 50/min (read-only)
- **Code Generation:** 10/min, 100/hour (AI-powered)

## 🐍 Python SDK

```bash
pip install smartermcp-client
```

```python
from smartermcp import SmarterMCP

client = SmarterMCP(
    api_token="smcp_xxxxxxxxxxxxx",
    tenant_id="tenant-uuid-here"
)

# List services
services = client.services.list(filter="backend")
for service in services:
    print(f"{service.name}: {service.status}")

# Trigger workflow
execution = client.workflows.trigger(
    workflow_id="wf_backup_db",
    input_data={"database": "smarteros", "compress": True}
)
print(f"Execution ID: {execution.execution_id}")

# Get analytics
kpis = client.analytics.kpis(kpis=["revenue_mtd", "conversion_rate"])
print(f"Revenue MTD: ${kpis['revenue_mtd']}")
print(f"Conversion Rate: {kpis['conversion_rate']}%")

# Search CRM contacts
contacts = client.crm.contacts.search(query="john@example.com")
for contact in contacts:
    print(f"{contact.name} - {contact.email}")
```

## 📦 TypeScript SDK

```bash
npm install @smartercl/mcp-client
```

```typescript
import { SmarterMCP } from '@smartercl/mcp-client';

const client = new SmarterMCP({
  apiToken: 'smcp_xxxxxxxxxxxxx',
  tenantId: 'tenant-uuid-here',
});

// List services
const services = await client.services.list({ filter: 'backend' });
services.forEach(service => {
  console.log(`${service.name}: ${service.status}`);
});

// Trigger workflow
const execution = await client.workflows.trigger({
  workflowId: 'wf_backup_db',
  inputData: { database: 'smarteros', compress: true },
});
console.log(`Execution ID: ${execution.executionId}`);

// Get analytics
const kpis = await client.analytics.kpis({
  kpis: ['revenue_mtd', 'conversion_rate'],
});
console.log(`Revenue MTD: $${kpis.revenue_mtd}`);
console.log(`Conversion Rate: ${kpis.conversion_rate}%`);

// Search CRM contacts
const contacts = await client.crm.contacts.search({
  query: 'john@example.com',
});
contacts.forEach(contact => {
  console.log(`${contact.name} - ${contact.email}`);
});
```

## 🔍 Health & Monitoring

### Health Check Endpoint

```bash
curl https://mcp.smarterbot.cl/health
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 86400,
  "services": {
    "n8n": "healthy",
    "supabase": "healthy",
    "odoo": "healthy",
    "chatwoot": "healthy",
    "botpress": "healthy",
    "metabase": "healthy"
  },
  "database": "connected",
  "timestamp": "2025-11-16T12:00:00Z"
}
```

### Metrics Endpoint

```bash
curl https://mcp.smarterbot.cl/metrics
```

Prometheus-format metrics:
```
mcp_requests_total{tool="services_list",agent="codex",status="200"} 1250
mcp_request_duration_seconds{tool="workflows_trigger"} 0.45
mcp_errors_total{tool="crm_contacts_list",error_type="timeout"} 3
mcp_rate_limit_exceeded{agent="gemini"} 0
mcp_active_connections 12
```

### Status Page

https://status.smarterbot.cl

## 🛟 Troubleshooting

### Error: Unauthorized (401)

```
Error: Unauthorized - Invalid or expired API token
```

**Solution:**
1. Verify token is correct: `vault kv get smarteros/mcp/smartermcp`
2. Check token hasn't expired
3. Generate new token if needed

### Error: Rate Limit Exceeded (429)

```
Error: Rate limit exceeded for category 'workflows'
```

**Solution:**
1. Wait 1 minute and retry
2. Reduce request frequency
3. Contact support for higher limits

### Error: Service Unavailable (503)

```
Error: Service 'n8n' is currently unavailable
```

**Solution:**
1. Check service health: `services_health(service_id='n8n')`
2. Check infrastructure status: `infra_status()`
3. Restart service if needed: `services_restart(service_id='n8n')`

### Error: Tenant Not Found

```
Error: Tenant 'tenant-uuid' not found or access denied
```

**Solution:**
1. Verify tenant_id is correct
2. Check token has access to this tenant
3. Contact admin if tenant should exist

## 📚 Additional Resources

- **Specification:** `smarteros-specs/mcp/smartermcp.yml`
- **MCP Registry:** `smarteros-specs/agents/mcp-registry.yml`
- **Vault Policy:** `smarteros-specs/vault/policies/mcp-smartermcp-read.hcl`
- **GitHub Repository:** https://github.com/SmarterCL/smartermcp-server
- **NPM Package:** https://npmjs.com/package/@smartercl/mcp-server
- **Status Page:** https://status.smarterbot.cl
- **API Docs:** https://mcp.smarterbot.cl/docs

## 🗺️ Roadmap

### v1.0 (Current) ✅
- 35 tools across 9 categories
- Multi-tenant support
- Rate limiting & quotas
- Python & TypeScript SDKs
- Health monitoring

### v1.1 (Planned) 📋
- Shopify integration (orders, products, customers)
- Email automation (Mailgun/SendGrid)
- WhatsApp Business API
- SMS via Twilio
- Slack notifications

### v2.0 (Future) 🔮
- AI-powered service recommendations
- Automated incident response
- Predictive scaling
- Advanced multi-tenant analytics
- Marketplace for skills & workflows

## 💡 Example Workflows

### Deploy & Monitor Service

```
Agent: "Check N8N service health, restart if unhealthy"

1. services_health(service_id="n8n")
   → Status: degraded

2. services_restart(service_id="n8n")
   → Restarting...

3. Wait 30s

4. services_health(service_id="n8n")
   → Status: healthy ✅
```

### Strategic Planning from Data

```
Agent: "Analyze business performance and suggest priorities"

1. analytics_kpis()
   → revenue_mtd: $45,780, conversion_rate: 3.2%

2. crm_pipeline_status()
   → $125K in negotiation stage

3. support_metrics(period="week")
   → CSAT: 4.2/5, avg_resolution_time: 2.4h

4. bots_analytics(bot_id="main", period="week")
   → completion_rate: 78%

Analysis: Revenue on track, high-value deals in pipeline,
support performing well, bot needs optimization.

Recommendation: Focus on bot optimization to improve
completion rate and reduce support load.
```

### Generate & Deploy Workflow

```
Agent: "Create workflow to backup database daily at 2am"

1. generate_n8n_workflow(
     description="Backup smarteros database daily at 2am",
     services=["postgresql", "aws-s3"]
   )
   → workflow_json: {...}

2. workflows_create(
     name="Daily DB Backup",
     workflow_json={...},
     tags=["backup", "automation"]
   )
   → workflow_id: "wf_backup_db"

3. workflows_trigger(workflow_id="wf_backup_db")
   → execution_id: "exec_test_backup"

4. workflows_status(execution_id="exec_test_backup")
   → Status: completed ✅
```

## 🤝 Support

- **Issues:** https://github.com/SmarterCL/smartermcp-server/issues
- **Email:** support@smarterbot.cl
- **Slack:** #smartermcp channel
- **Documentation:** https://docs.smarterbot.cl/mcp

---

**SmarterMCP v1.0** — Built with ❤️ by SmarterCL
