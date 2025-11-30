# SmarterOS - Arquitectura Moderna 2025

**Fecha:** 2025-11-30  
**Versión:** v2025.11.30  
**Estado:** Production Ready (87% completo)

---

## 🎯 Filosofía de Diseño

SmarterOS no es un SaaS tradicional con apps aisladas. Es un **Sistema Operativo Digital** que funciona como **capa de conectividad cognitiva** entre empresas y sus sistemas existentes.

### Principios Fundamentales

1. **Sin código para conectar** - Las empresas exponen sus APIs, no suben código
2. **Conversación lado a lado** - Los modelos de IA hablan directamente con las APIs empresariales
3. **Tenant por diseño** - Cada empresa es un tenant con su propio espacio aislado
4. **Módulos como reglas** - El sistema opera con reglas n8n, no con módulos rígidos
5. **MCP como protocolo** - Model Context Protocol es el lenguaje común

---

## 🏗️ Arquitectura de Tres Capas

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA 0: IDENTITY & ZERO TRUST                │
│  Cloudflare One + Access + AI Controls                          │
│  ├─ OAuth2 (Google, GitHub, Slack)                             │
│  ├─ Phone Auth (WhatsApp, Telegram)                            │
│  ├─ Policies + SSO                                              │
│  └─ AI Controls + Audit                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA 1: MCP COGNITIVO                        │
│  mcp.smarterbot.cl - SmarterMCP Infrastructure                  │
│  ├─ MCP Server Portal (Cloudflare Access)                      │
│  ├─ Capability Registry por tenant                             │
│  ├─ Semantic mapping (intención → endpoint)                    │
│  └─ Orquestación de llamadas multi-API                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  CAPA 2: API GATEWAY                            │
│  api.smarterbot.store - Transactional Layer                     │
│  ├─ Tenant API Registry                                         │
│  ├─ Auth normalization (API keys, OAuth, Bearer)               │
│  ├─ Rate limiting + Logging                                     │
│  └─ Proxy seguro hacia APIs empresariales                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  CAPA 3: APIS EMPRESARIALES                     │
│  On-premise, Cloud, SaaS (donde vivan)                          │
│  ├─ ERP custom                                                   │
│  ├─ E-commerce                                                   │
│  ├─ CRM propio                                                   │
│  └─ Sistemas legacy                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🌐 Dominios y Responsabilidades

### mcp.smarterbot.cl - Cerebro Conectivo

**Propósito:** Portal cognitivo que mapea conversaciones a capabilities

**Tecnología:**
- MCP Server registrado en Cloudflare One
- Protegido por Cloudflare Access (SSO/OIDC)
- AI Controls para auditoría y políticas
- Linked Apps para integración OAuth

**Responsabilidades:**
- Recibir instrucciones de modelos de IA
- Identificar tenant y permisos
- Resolver capabilities a endpoints
- Orquestar llamadas multi-sistema
- Normalizar respuestas

**Ejemplo de flujo:**
```
ChatGPT: "Lista las órdenes pendientes de Empresa X"
  ↓
mcp.smarterbot.cl identifica:
  - tenant: empresa-x-uuid
  - capability: orders.list
  - backing endpoint: GET /orders?status=pending
  ↓
Llama a api.smarterbot.store
```

**Referencias Cloudflare:**
- [MCP Server Portal](https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/linked-apps/)
- [Access for SaaS](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/saas-apps/)
- [AI Controls](https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/)

---

### api.smarterbot.store - Gateway Transaccional

**Propósito:** Capa de negocio que normaliza y ejecuta operaciones reales

**Tecnología:**
- Self-hosted App detrás de Cloudflare Access
- TypeScript + Next.js API Routes
- Supabase para metadata
- Cloudflare AI Gateway (opcional)

**Responsabilidades:**
- Registrar APIs de empresas
- Gestionar credenciales (encriptadas)
- Aplicar autenticación por API
- Rate limiting y quotas
- Logging y observabilidad
- Proxy hacia sistemas reales

**Endpoints principales:**
```
POST /api/tenant/create
GET  /api/tenant/:id
POST /api/tenant/activate-product
POST /api/tenant/set-integration
POST /api/tenant/:id/proxy/:capability
GET  /api/system/info
```

**Ejemplo de proxy:**
```
POST /api/tenant/abc-123/proxy/orders.search
  ↓
api.smarterbot.store:
  1. Valida tenant abc-123
  2. Busca capability "orders.search"
  3. Resuelve a api_endpoint real
  4. Obtiene credenciales de api_credentials
  5. Construye request a API de empresa:
     POST https://empresa.com/api/v2/orders
     Authorization: Bearer xyz...
  6. Recibe respuesta
  7. Normaliza formato
  8. Retorna al MCP
```

---

## 🗄️ Modelo de Datos (Supabase)

### Schema Multi-Tenant Core

#### tenants
```sql
CREATE TABLE public.tenants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    rut text UNIQUE NOT NULL,
    business_name text NOT NULL,
    contact_email text NOT NULL,
    clerk_user_id text,
    
    -- Nuevo: tipo de tenant
    type text NOT NULL DEFAULT 'customer', -- 'infrastructure' | 'customer'
    
    status text NOT NULL DEFAULT 'trial',
    plan text,
    primary_domain text,
    trial_expires_at timestamptz,
    
    services_enabled jsonb DEFAULT '{}'::jsonb,
    notes jsonb DEFAULT '{}'::jsonb,
    
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```

**Tenants especiales:**
- **SMARTERBOT** (type=infrastructure) - Tenant raíz del sistema
- **SmarterMCP** (type=infrastructure) - Dueño de la capa cognitiva
- **CLIENTE DEMO** (type=customer) - Tenant de prueba

---

#### tenant_products
```sql
CREATE TABLE public.tenant_products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_code text NOT NULL, -- 'chat' | 'erp' | 'automation'
    status text NOT NULL DEFAULT 'trial',
    plan text,
    trial_expires_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, product_code)
);
```

---

#### tenant_domains
```sql
CREATE TABLE public.tenant_domains (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    domain text NOT NULL,
    subdomain text,
    domain_type text NOT NULL DEFAULT 'primary',
    verified boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```

---

#### tenant_integrations
```sql
CREATE TABLE public.tenant_integrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    integration_type text NOT NULL,
    external_id text,
    external_ref jsonb,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```

---

### Schema MCP Avanzado (Nuevo)

#### api_providers
```sql
CREATE TABLE public.api_providers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name text NOT NULL,
    base_url text NOT NULL,
    category text NOT NULL, -- 'erp' | 'payments' | 'ecommerce' | 'custom'
    auth_type text NOT NULL, -- 'api_key' | 'bearer' | 'basic' | 'oauth2' | 'none'
    created_by uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```

#### api_credentials
```sql
CREATE TABLE public.api_credentials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    api_provider_id uuid NOT NULL REFERENCES api_providers(id) ON DELETE CASCADE,
    encrypted_secret text NOT NULL, -- Vault o pg_crypto
    metadata jsonb, -- scopes, audience, refresh_token, etc.
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```

#### api_endpoints
```sql
CREATE TABLE public.api_endpoints (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    api_provider_id uuid NOT NULL REFERENCES api_providers(id) ON DELETE CASCADE,
    path text NOT NULL,
    method text NOT NULL, -- 'GET' | 'POST' | 'PUT' | 'DELETE'
    semantic_name text NOT NULL, -- 'list_orders' | 'get_customer' | 'update_stock'
    schema_in jsonb,
    schema_out jsonb,
    enabled boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```

#### mcp_capabilities
```sql
CREATE TABLE public.mcp_capabilities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    capability_name text NOT NULL, -- 'orders.search' | 'stock.sync'
    backing_endpoint_id uuid NOT NULL REFERENCES api_endpoints(id),
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, capability_name)
);
```

#### cloudflare_linked_apps
```sql
CREATE TABLE public.cloudflare_linked_apps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    access_app_id_mcp text,
    access_app_id_api text,
    policy_id_ai_controls text,
    team_name text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```

---

## 🔄 Flujos Completos

### 1. Onboarding de Empresa

```
1. Admin entra a mcp.smarterbot.cl
   ↓
2. Cloudflare Access valida identidad (SSO)
   ↓
3. Crea tenant en Supabase
   → rut, nombre, email
   ↓
4. En api.smarterbot.store registra primera API:
   → Nombre: "ERP Principal"
   → Base URL: https://empresa.com/api
   → Auth: Bearer Token
   → (Opcional) OpenAPI/JSON Schema
   ↓
5. Sistema introspecciona y crea api_endpoints:
   → GET /orders → "list_orders"
   → GET /customers/:id → "get_customer"
   ↓
6. SmarterMCP crea mcp_capabilities:
   → "orders.list" → backed by "list_orders"
   → "customer.get" → backed by "get_customer"
   ↓
7. Empresa lista para conversación
```

---

### 2. Conversación Real (Lado a Lado)

```
Usuario: "¿Cuántas órdenes tengo pendientes en Empresa X?"
  ↓
Modelo IA → mcp.smarterbot.cl
  ↓
SmarterMCP:
  1. Identifica tenant_id (Empresa X)
  2. Mapea intención → capability: "orders.list"
  3. Busca backing_endpoint_id
  4. Construye request:
     POST api.smarterbot.store/tenant/{id}/proxy/orders.list
     Body: { "status": "pending" }
  ↓
API Gateway (api.smarterbot.store):
  1. Valida tenant_id
  2. Busca api_provider de ese tenant
  3. Obtiene api_credentials
  4. Resuelve endpoint real:
     GET https://empresa.com/api/orders?status=pending
  5. Aplica autenticación (Bearer xyz...)
  6. Ejecuta request
  7. Recibe respuesta:
     { "orders": [...], "total": 23 }
  8. Normaliza formato
  9. Retorna a MCP
  ↓
SmarterMCP:
  1. Procesa respuesta
  2. Genera resumen legible:
     "Tienes 23 órdenes pendientes"
  3. Retorna al modelo
  ↓
Modelo IA → Usuario
```

**Observabilidad:**
- Cloudflare Access audita cada request
- AI Controls registra uso de IA
- API Gateway logea llamadas
- Supabase guarda metadata

---

### 3. Provisioning Automático de Tenant

```
Store (smarterbot.store):
  Cliente crea cuenta
  ↓
login.smarterbot.store:
  OAuth2 (Google/GitHub) + Phone
  ↓
Supabase Auth:
  Webhook → n8n.smarterbot.cl/webhook/auth-signup
  ↓
n8n workflow (n8n_onboarding_smarteros):
  1. POST api.smarterbot.store/api/tenant/create
     → Crea tenant en Supabase
  2. Recibe tenant_id
  3. Crea inbox en Chatwoot
     → Guarda external_id
  4. Crea company en Odoo
     → Guarda external_id
  5. Crea project en n8n
     → Guarda external_id
  6. POST api.smarterbot.store/api/tenant/set-integration
     → type: chatwoot, external_id: inbox_id
     → type: odoo, external_id: company_id
     → type: n8n, external_id: project_id
  7. Envía WhatsApp/Telegram:
     "¡Bienvenido! Tu cuenta está lista"
  8. Marca provisioning_queue: done
  ↓
Cliente:
  Accede a app.smarterbot.store
  Ve productos activos
  Entra a Chatwoot/Odoo/n8n
```

---

## 🛠️ Módulos y Componentes

### smarteros-tenant-api
**Ubicación:** `/root/smarteros-tenant-api`  
**Estado:** ✅ Completo  
**Tecnología:** TypeScript + Next.js API Routes + Supabase

**Endpoints:**
- `POST /api/tenant/create` - Crear tenant
- `GET /api/tenant/:id` - Obtener tenant
- `POST /api/tenant/activate-product` - Activar producto
- `POST /api/tenant/set-integration` - Registrar integración
- `GET /api/system/info` - Estado del sistema

**Deploy:** Vercel (pendiente)

---

### smarteros-mcp-cloudflare
**Ubicación:** `/root/smarteros-mcp-cloudflare`  
**Estado:** ✅ Completo (pre-activación)  
**Tecnología:** TypeScript + Node.js + Cloudflare API

**Funciones:**
- `createTenantSubdomain(tenantId, subdomain)` - Crear DNS
- `deleteTenantSubdomain(tenantId)` - Eliminar DNS
- `validateDomain(domain)` - Validar formato
- `testAccessConnection()` - Test Cloudflare Access
- `listPolicies()` - Listar políticas AI

**Activación:** Requiere `CLOUDFLARE_API_TOKEN`

---

### smarteros-agents
**Ubicación:** GitHub SmarterCL/smarteros-agents  
**Estado:** 🚧 En desarrollo  
**Tecnología:** TypeScript + MCP Protocol

**Contenido:**
- Agentes conversacionales
- Reglas n8n precocinadas
- Templates de workflows
- manifest.json con módulos

---

### smarteros-cli
**Ubicación:** `/root/smarteros-cli`  
**Estado:** 🚧 En desarrollo  
**Tecnología:** Node.js CLI

**Comandos:**
```bash
smarteros sync --tenant=<id>
smarteros tenant create <rut> <name> <email>
smarteros domain create <subdomain> --tenant=<id>
smarteros rules install --tenant=<id>
smarteros mcp cloudflare test
```

---

## 📊 Estado del Sistema (Telemetría)

**Fecha:** 2025-11-30  
**Progreso:** 87% completo

### Infraestructura
- ✅ 26 contenedores activos
- ✅ 11 dominios configurados
- ✅ Caddy reverse proxy operativo
- ✅ Dokploy orchestration activo
- ✅ SSL automático funcionando

### Datos
- ✅ 3 tenants activos
  - SMARTERBOT (root)
  - CLIENTE DEMO (trial)
  - SmarterMCP (infrastructure)
- ✅ 9 productos asignados (3 por tenant)
- ✅ 6 integraciones configuradas
- ✅ Schema Supabase completo

### Backup
- ✅ 197 MB backup externo
- ✅ Accesible en: https://smarterbot.cl/nov.zip
- ✅ Última actualización: 2025-11-30

---

## ✅ 4 Pasos Pendientes para Completar

### 1. Deploy API a Vercel/Producción
```bash
cd /root/smarteros-tenant-api
npm install
npm run build
vercel login
vercel link
vercel deploy --prod

# Configurar env vars en Vercel:
SUPABASE_URL=https://rjfcmmzjlguiititkmyh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=***
NEXT_PUBLIC_SUPABASE_URL=***
NEXT_PUBLIC_SUPABASE_ANON_KEY=***
```

---

### 2. Activar Cloudflare MCP
```bash
# Obtener API Token de Cloudflare:
# Permisos: Zone Read + DNS Write

export CLOUDFLARE_API_TOKEN="tu_token_aquí"

cd /root/smarteros-mcp-cloudflare
npm install
npm run build

# Test
node dist/index.js testAccessConnection
```

**Configurar en Cloudflare One:**
- Crear Access App para mcp.smarterbot.cl
- Crear Access App para api.smarterbot.store
- Habilitar AI Controls
- Vincular como MCP Server Portal

---

### 3. Importar Workflow n8n
**Workflow:** `n8n_onboarding_smarteros`

**Pasos:**
1. Entrar a https://n8n.smarterbot.cl
2. Crear nuevo workflow
3. Import from URL o JSON
4. Configurar nodos:
   - Webhook Trigger: `/webhook/auth-signup`
   - Supabase Node: credenciales con SERVICE_ROLE_KEY
   - HTTP Request: a api.smarterbot.store
   - WhatsApp/Telegram: credenciales Meta/Bot
5. Activar workflow

**Endpoints:**
- `https://n8n.smarterbot.cl/webhook/auth-signup`
- `https://n8n.smarterbot.cl/webhook/chat-response`

---

### 4. Conectar Store con API
```bash
cd /root/smarteros-store # o smarterbot.store repo

# Agregar env var:
NEXT_PUBLIC_SMARTEROS_API_URL=https://api.smarterbot.cl

# O si usas Vercel:
NEXT_PUBLIC_SMARTEROS_API_URL=https://smarteros-tenant-api.vercel.app

# Actualizar lib/api.ts:
const API_URL = process.env.NEXT_PUBLIC_SMARTEROS_API_URL

export async function createTenant(data) {
  return fetch(`${API_URL}/api/tenant/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}

# Deploy:
npm run build
vercel deploy --prod
```

---

## 🎯 Roadmap

### Completar Sistema (13% restante)
- [ ] Deploy API a producción
- [ ] Activar Cloudflare MCP
- [ ] Importar workflows n8n
- [ ] Conectar Store

### Q1 2025
- [ ] Landing page comercial
- [ ] Panel cliente premium
- [ ] Integración pagos (Stripe/Transbank)
- [ ] Motor IA por tenant
- [ ] Marketplace integraciones

### Q2 2025
- [ ] Webhooks real-time
- [ ] API pública partners
- [ ] SDK JS/Python
- [ ] Extensiones Shopify/WooCommerce
- [ ] Certificación SII Chile

---

## 🔗 Referencias Técnicas

### Cloudflare
- [Access for SaaS](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/saas-apps/)
- [MCP Server Portal](https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/linked-apps/)
- [AI Controls](https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/)
- [HTTP Policies](https://developers.cloudflare.com/cloudflare-one/policies/gateway/http-policies/)

### Supabase
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Auth Providers](https://supabase.com/docs/guides/auth/social-login)
- [Edge Functions](https://supabase.com/docs/guides/functions)

### MCP Protocol
- [Model Context Protocol Spec](https://github.com/anthropics/mcp)
- [MCP Servers](https://github.com/modelcontextprotocol/servers)

---

## 📞 Contacto

**SmarterOS Chile**  
Email: mcp@smarterbot.cl  
Web: https://smarterbot.cl  
Panel: https://app.smarterbot.store

---

**Versión:** v2025.11.30  
**Estado:** Production Ready (87% completo)  
**Última actualización:** 2025-11-30 14:44 UTC
