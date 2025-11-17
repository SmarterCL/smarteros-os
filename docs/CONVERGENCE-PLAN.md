# 🌊 SmarterOS Convergence Plan

**Fecha**: 17 de noviembre de 2025  
**Estado**: Datos vivos fluyendo → Unificar experiencia → SaaS operativo  
**Objetivo**: Transformar servicios independientes en un OS unificado y productivo

---

## 🎯 Estado Actual (Pre-Convergencia)

### ✅ Servicios Operativos con Datos Reales

| Servicio | URL | Estado | Datos Generados |
|----------|-----|--------|-----------------|
| **App Dashboard** | `app.smarterbot.cl` | ✅ Operativo | Clerk auth, Supabase profiles, KPIs, onboarding |
| **Chatwoot** | `chatwoot.smarterbot.cl` | ✅ Operativo | Inboxes, conversations, contacts, WhatsApp messages |
| **N8N** | `n8n.smarterbot.cl` | ✅ Operativo | Workflows, executions, webhooks, triggers |
| **Odoo** | `odoo.smarterbot.cl` | ✅ Operativo | Invoices, customers, products, sales |
| **Shopify Store** | `store.smarterbot.cl` | ✅ Operativo | Products, orders, inventory, webhooks |
| **Supabase** | `api.smarterbot.cl` | ✅ Operativo | RUTs, profiles, tenants, logs, activities |
| **Clerk** | Embedded en app | ✅ Operativo | Sign-ins, sign-ups, sessions, user metadata |
| **Grafana** | `metrics.smarterbot.cl` | 🟡 Parcial | OTEL traces, ClickHouse queries (necesita dashboards) |
| **Metabase** | `bi.smarterbot.cl` | 🟡 Parcial | SQL queries a Supabase (necesita dashboards) |

### 🔴 Servicios Pendientes de Integración

| Servicio | Estado | Bloqueador |
|----------|--------|------------|
| **Redpanda** | Infraestructura lista | No desplegado en VPS |
| **Vault** | Infraestructura lista | No desplegado en VPS |
| **MCP Server** | Código generado | Pendiente `make generate` + deploy |
| **Google Workspace** | Cuenta free | Necesita upgrade a pago + Gemini |

---

## 🚀 Convergencia en 6 Fases

### Fase 1: Renombrado y Limpieza 🏷️

**Objetivo**: Eliminar `dash.smarterbot.cl`, unificar bajo nombres descriptivos

#### 1.1 DNS Cleanup (Cloudflare)

**Acciones**:
```bash
# Eliminar registro DNS
dash.smarterbot.cl → DELETE (ya no se usa)

# Verificar existentes
chatwoot.smarterbot.cl → VPS IP ✅ (ya configurado)
app.smarterbot.cl → Vercel ✅
```

**Resultado**: Un solo punto de entrada para mensajería (`chatwoot.smarterbot.cl`)

#### 1.2 Actualizar Documentación

**Archivos a modificar**:
- `smarteros-specs/services/registry.yml`: Eliminar referencias a `dash.smarterbot.cl`
- `smarteros-specs/index.yml`: Actualizar listado de servicios
- `smarteros-specs/smos-version.yml`: Remover versión de dash

**Cambios**:
```yaml
# Antes
- dash.smarterbot.cl      # Dashboard multi-tenant

# Después
- chatwoot.smarterbot.cl  # Mensajería unificada (WhatsApp, Email, Web)
```

#### 1.3 Actualizar README y Arquitectura

**Archivos**:
- `README.md`: Actualizar mapa de servicios
- `smarteros-specs/ARCHITECTURE.md`: Diagrama con naming correcto
- `DEPLOYMENT-GUIDE.md`: Referencias a Chatwoot

**Status**: ✅ En progreso

---

### Fase 2: Integración UI Dashboard + Chatwoot 🎨

**Objetivo**: Mantener UI de `app.smarterbot.cl`, agregar vista de mensajes desde Chatwoot API

#### 2.1 Crear Componente ChatwootWidget

**Archivo**: `app.smarterbot.cl/components/chatwoot-widget.tsx`

**Funcionalidad**:
- Embeds iframe de Chatwoot o consume API REST
- Muestra inboxes en dashboard
- Click en inbox → abre conversation en modal/drawer
- Integración con Clerk para contexto de usuario

**Ejemplo API**:
```typescript
// GET /api/v1/accounts/{account_id}/inboxes
// GET /api/v1/accounts/{account_id}/conversations
// POST /api/v1/accounts/{account_id}/conversations/{id}/messages
```

#### 2.2 Agregar Tab "Mensajes" al Dashboard

**Archivo**: `app.smarterbot.cl/components/dashboard-content.tsx`

**Cambios**:
```typescript
const tabItems = [
  { value: "overview", label: "Overview", icon: BarChart3 },
  { value: "messages", label: "Mensajes", icon: MessageSquare }, // NUEVO
  { value: "contacts", label: "Contactos", icon: Users },
  { value: "automation", label: "Automatización", icon: Zap },
  // ...
]
```

#### 2.3 API Route para Proxy Chatwoot

**Archivo**: `app.smarterbot.cl/app/api/chatwoot/route.ts`

**Funcionalidad**:
- Proxy autenticado a Chatwoot API
- Maneja access tokens de Chatwoot
- CORS + rate limiting

**Status**: 🔜 Siguiente acción

---

### Fase 3: WhatsApp ↔ Shopify ↔ Chatwoot 🛍️💬

**Objetivo**: Cerrar el loop de comercio conversacional

#### 3.1 Activar Shopify Messenger App

**Pasos**:
1. Shopify Admin → Apps → Buscar "WhatsApp"
2. Instalar app oficial de WhatsApp Business
3. Conectar con número verificado
4. Configurar webhooks → Chatwoot inbox

#### 3.2 Configurar Chatwoot Inbox para Shopify

**Pasos**:
1. Chatwoot → Inboxes → "Add Inbox"
2. Seleccionar "API Channel"
3. Configurar webhook URL: `https://chatwoot.smarterbot.cl/webhooks/shopify`
4. Guardar webhook secret en Vault

#### 3.3 Crear N8N Workflow: Shopify → Chatwoot

**Flujo**:
```
Shopify Webhook (order.created)
  → N8N Trigger
  → Extract customer data
  → Create/Update Contact in Chatwoot
  → Send welcome message via WhatsApp
  → Log to Supabase
  → Publish to Redpanda (shopify.orders topic)
```

**Status**: 🔜 Pending

---

### Fase 4: Google Workspace + Gemini + MCP 🤖

**Objetivo**: Activar AI agents con acceso a Gmail, Calendar, Drive

#### 4.1 Upgrade Google Workspace

**Plan**: Business Standard ($12 USD/mes por usuario)

**Acciones**:
1. Login en `admin.google.com` con `smarterbotcl@gmail.com`
2. Upgrade plan
3. Configurar dominio personalizado: `smarterbot.cl`
4. Crear cuentas:
   - `admin@smarterbot.cl` (tú)
   - `support@smarterbot.cl` (Chatwoot inbox)
   - `automation@smarterbot.cl` (N8N notifications)

#### 4.2 Activar Gemini for Workspace

**Pasos**:
1. Google Cloud Console → AI Platform
2. Enable Gemini API
3. Create Service Account con permisos:
   - Gmail API
   - Calendar API
   - Drive API
   - Contacts API
4. Download JSON key → Guardar en Vault

#### 4.3 Crear MCP Server para Google Workspace

**Archivo**: `smarteros-specs/specs/proto/smarteros/v1/google.proto`

**RPC Methods**:
```protobuf
service GoogleWorkspaceService {
  rpc SendEmail(SendEmailRequest) returns (SendEmailResponse);
  rpc CreateCalendarEvent(CreateEventRequest) returns (CreateEventResponse);
  rpc UploadToDrive(UploadRequest) returns (UploadResponse);
  rpc SearchContacts(SearchContactsRequest) returns (SearchContactsResponse);
  rpc SummarizeThread(SummarizeThreadRequest) returns (SummarizeThreadResponse); // Gemini
}
```

**Status**: 🔜 Pending

---

### Fase 5: Dashboards Metabase + Grafana 📊

**Objetivo**: Visualización de datos operativos

#### 5.1 Grafana Dashboards

**Dashboard 1: MCP Tool Execution**
- Datasource: ClickHouse (OTEL traces)
- Métricas:
  - Tool execution latency (p50, p95, p99)
  - Error rate por tool
  - Throughput (tools/min)
  - Top 10 tools más usados

**Dashboard 2: Event Stream Flow**
- Datasource: Redpanda metrics + ClickHouse
- Métricas:
  - Messages per topic (shopify.*, whatsapp.*, n8n.*)
  - Consumer lag
  - Partition distribution
  - Producer throughput

**Dashboard 3: N8N Automations**
- Datasource: Supabase (via Grafana PostgreSQL plugin)
- Métricas:
  - Workflow execution count
  - Success vs error rate
  - Execution duration
  - Trigger source breakdown (Kafka, Webhook, Schedule)

#### 5.2 Metabase Dashboards

**Dashboard 1: User Growth**
- Datasource: Supabase `profiles` table + Clerk sync
- Métricas:
  - Daily signups
  - Active users (DAU, MAU)
  - Churn rate
  - Onboarding completion rate

**Dashboard 2: Commerce Analytics**
- Datasource: Supabase `orders` table (synced from Shopify)
- Métricas:
  - Revenue per day
  - Average order value
  - Products sold
  - Conversion rate

**Dashboard 3: Messaging & Support**
- Datasource: Chatwoot PostgreSQL database
- Métricas:
  - Conversations per inbox
  - First response time
  - Resolution time
  - Agent activity

**Status**: 🔜 Pending (datos ya disponibles)

---

### Fase 6: Deploy Completo VPS + MCP 🚢

**Objetivo**: Desplegar toda la infraestructura faltante

#### 6.1 Deploy Redpanda

```bash
ssh root@smarterbot.cl
cd /opt/SmarterOS/dkcompose
docker-compose -f redpanda.yml up -d
docker logs -f smarter-redpanda-init  # Wait for 20 topics
```

#### 6.2 Deploy Vault

```bash
docker-compose -f vault.yml up -d
docker exec smarter-vault /vault-init.sh  # SAVE KEYS
docker exec -it smarter-vault vault operator unseal  # 3 times
```

#### 6.3 Generate & Deploy MCP Server

```bash
# Local
cd /Users/mac/dev/2025/smarteros-specs
make install-tools
make generate  # Creates 23 MCP tools
make build
make deploy-vps

# VPS
systemctl enable smarteros-mcp-server
systemctl start smarteros-mcp-server
```

#### 6.4 Deploy Observability Stack

```bash
docker-compose -f observability.yml --env-file .env.observability up -d
```

**Status**: 🔜 Pending (guías ya creadas en DEPLOYMENT-GUIDE.md)

---

## 🎯 Resultado Final: SmarterOS Unificado

### Arquitectura Convergida

```
┌────────────────────────────────────────────────────────────┐
│                   app.smarterbot.cl                        │
│                    (SmarterOS Hub)                          │
├────────────────────────────────────────────────────────────┤
│  Tabs:                                                     │
│  [Overview] [Mensajes] [Contactos] [Automatización] [KPIs] │
│                                                             │
│  Overview Tab:                                              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Stats Cards (Mensajes, Contactos, Automatizaciones)│  │
│  │ Recent Activity Feed (Supabase logs)                │  │
│  │ Quick Actions (Create workflow, Send campaign)      │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  Mensajes Tab (NUEVO):                                     │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ChatwootWidget Component                            │  │
│  │ ├─ Inboxes (WhatsApp, Email, Web)                   │  │
│  │ ├─ Conversations List                                │  │
│  │ ├─ Message Thread View                               │  │
│  │ └─ Quick Reply Templates                             │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  Contactos Tab:                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Supabase contacts + Chatwoot contacts (merged)      │  │
│  │ Search, Filter, Tag, Export                          │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                           ↓
              ┌──────────────────────────┐
              │   Backend Services       │
              ├──────────────────────────┤
              │ Chatwoot API (messages)  │
              │ Supabase (data)          │
              │ N8N (automations)        │
              │ Redpanda (events)        │
              │ Vault (secrets)          │
              │ MCP Server (AI tools)    │
              │ Grafana (metrics)        │
              │ Metabase (analytics)     │
              └──────────────────────────┘
```

### Flujo de Datos Unificado

```
Customer → WhatsApp
  ↓
Chatwoot Inbox (chatwoot.smarterbot.cl)
  ↓
Dashboard "Mensajes" Tab (app.smarterbot.cl)
  ↓
Agent Reply OR MCP AI Agent
  ↓
N8N Workflow Triggered (Redpanda event)
  ↓
Shopify Order Created
  ↓
OTEL Telemetry → ClickHouse
  ↓
Grafana Dashboard (metrics.smarterbot.cl)
```

---

## ✅ Checklist de Convergencia

### Fase 1: Renombrado ✅
- [x] Eliminar referencias a `dash.smarterbot.cl` en specs
- [x] Actualizar `services/registry.yml`
- [x] Actualizar `index.yml`
- [x] Actualizar `smos-version.yml`
- [x] Documentar plan de convergencia

### Fase 2: UI Integration 🔜
- [ ] Crear `chatwoot-widget.tsx` component
- [ ] Agregar tab "Mensajes" al dashboard
- [ ] API route `/api/chatwoot` para proxy
- [ ] Integrar Chatwoot SDK en frontend

### Fase 3: WhatsApp + Shopify 🔜
- [ ] Instalar Shopify WhatsApp app
- [ ] Configurar Chatwoot inbox para Shopify
- [ ] Crear N8N workflow: Shopify → Chatwoot
- [ ] Test E2E: Order → WhatsApp notification

### Fase 4: Google Workspace 🔜
- [ ] Upgrade a Business Standard plan
- [ ] Configurar dominio `smarterbot.cl`
- [ ] Activar Gemini API
- [ ] Crear service account
- [ ] Guardar credentials en Vault
- [ ] Crear `google.proto` service
- [ ] Generate MCP tools para Gmail/Calendar/Drive

### Fase 5: Dashboards 🔜
- [ ] Grafana: MCP Tool Execution dashboard
- [ ] Grafana: Event Stream Flow dashboard
- [ ] Grafana: N8N Automations dashboard
- [ ] Metabase: User Growth dashboard
- [ ] Metabase: Commerce Analytics dashboard
- [ ] Metabase: Messaging & Support dashboard

### Fase 6: Deploy VPS 🔜
- [ ] Deploy Redpanda cluster
- [ ] Deploy Vault + unseal
- [ ] Generate MCP code (`make generate`)
- [ ] Deploy MCP server
- [ ] Deploy Observability stack
- [ ] Smoke test E2E completo

---

## 🎉 Definición de "Convergencia Completa"

✅ **UI Unificada**: Un solo dashboard en `app.smarterbot.cl` con todas las funciones  
✅ **Mensajería Integrada**: Chatwoot embedado en dashboard principal  
✅ **WhatsApp Operativo**: Clientes pueden hacer pedidos por WhatsApp  
✅ **AI Agents Activos**: MCP tools respondiendo automáticamente  
✅ **Eventos Fluyen**: Redpanda procesando shopify.*, whatsapp.*, n8n.* topics  
✅ **Observabilidad Full**: Grafana + Metabase mostrando métricas en tiempo real  
✅ **Google Workspace**: Gmail/Calendar/Drive integrados con AI agents  
✅ **Seguridad**: Todos los secrets en Vault con Transit encryption  

**Score Final**: 10/10 🚀

**Tiempo Estimado**: 3-5 días de implementación
