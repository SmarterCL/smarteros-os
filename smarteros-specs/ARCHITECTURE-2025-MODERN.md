# =========================================================
# SMARTEROS - ARQUITECTURA MODERNA 2025
# =========================================================

## 🎯 Visión General

SmarterOS es una **plataforma de conectividad cognitiva** que permite a empresas conectar sus APIs existentes y conversar con ellas de forma natural, sin necesidad de SDKs ni integraciones complejas.

**No es un SaaS tradicional. Es un sistema operativo de negocio.**

---

## 🏗️ Arquitectura de Capas

### Capa 0: Identity & Zero Trust (Cloudflare One)

- **Cloudflare Access** protege todos los servicios críticos
- **AI Controls** para políticas de uso de IA
- **MCP Server Portals** registrados como aplicaciones SaaS
- **Linked Apps** para OAuth2 entre servicios

**Documentación:**
- [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/)
- [AI Controls](https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/)
- [MCP Server Portal](https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/linked-apps/)

### Capa 1: MCP (Cognitive Layer) - `mcp.smarterbot.cl`

**Rol:** Cerebro conectivo del sistema

**Funciones:**
- Recibe instrucciones de modelos de IA (ChatGPT, Claude, etc.)
- Mapea intenciones → capabilities → endpoints
- Gestiona contexto y state por tenant
- Coordina llamadas multi-API
- Normaliza respuestas

**Módulos activos:**
- `SmarterMCP` (tenant infrastructure)
- `smarteros-mcp-cloudflare` (DNS automation + Cloudflare Access)
- `mcp-capabilities` (registry de capacidades por tenant)

**Protección:**
- Cloudflare Access con OIDC/SSO
- AI Controls para logging y políticas
- Rate limiting por tenant

### Capa 2: API Gateway (Business Layer) - `api.smarterbot.store`

**Rol:** Capa transaccional y proxy inteligente

**Funciones:**
- Expone endpoints por tenant: `POST /tenant/{id}/orders/search`
- Proxy seguro hacia APIs reales de empresas
- Gestión de auth (API keys, OAuth, Bearer tokens)
- Rate limiting y logging
- Normalización de contratos API

**Endpoints principales:**
```
POST   /api/tenant/create
GET    /api/tenant/:id
POST   /api/tenant/activate-product
POST   /api/tenant/set-integration
POST   /api/tenant/provision-domain
GET    /api/system/info
```

**Protección:**
- Cloudflare Access para self-hosted apps
- JWT/Bearer tokens
- AI Gateway opcional para llamadas a proveedores de IA

### Capa 3: APIs de Empresas

**Modelo:** Las empresas NO suben código a SmarterOS

Las APIs viven donde la empresa quiera:
- On-premise
- Cloud privado
- SaaS existente

SmarterOS solo guarda:
- Base URL
- Esquema de autenticación
- Metadata (OpenAPI/JSON Schema opcional)

---

## 🗄️ Modelo de Datos (Supabase)

### Tenants

```sql
CREATE TABLE tenants (
    id uuid PRIMARY KEY,
    rut text UNIQUE,
    business_name text NOT NULL,
    contact_email text,
    type text NOT NULL,  -- 'infrastructure' | 'customer'
    status text NOT NULL DEFAULT 'trial',
    plan text,
    primary_domain text,
    trial_expires_at timestamptz,
    services_enabled jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```

**Tenant especial:**
- **SmarterMCP** (`type='infrastructure'`)
  - RUT: `00.000.000-0`
  - Email: `mcp@smarterbot.cl`
  - Plan: `infrastructure`
  - Dueño de la conectividad DNS y Cloudflare

### API Providers (Nuevas tablas)

```sql
-- Registro de APIs por empresa
CREATE TABLE api_providers (
    id uuid PRIMARY KEY,
    tenant_id uuid REFERENCES tenants(id),
    name text NOT NULL,  -- 'ERP', 'E-commerce', 'CRM'
    base_url text NOT NULL,
    category text,  -- 'erp', 'payments', 'ecommerce', 'custom'
    auth_type text,  -- 'api_key', 'bearer', 'oauth2', 'none'
    created_at timestamptz DEFAULT now()
);

-- Credenciales (solo server-side)
CREATE TABLE api_credentials (
    id uuid PRIMARY KEY,
    api_provider_id uuid REFERENCES api_providers(id),
    encrypted_secret text NOT NULL,
    metadata jsonb,  -- scopes, audience, refresh_token, etc.
    created_at timestamptz DEFAULT now()
);

-- Endpoints específicos
CREATE TABLE api_endpoints (
    id uuid PRIMARY KEY,
    api_provider_id uuid REFERENCES api_providers(id),
    path text NOT NULL,
    method text NOT NULL,  -- GET, POST, PUT, DELETE
    semantic_name text,  -- 'orders.list', 'customers.get'
    schema_in jsonb,
    schema_out jsonb,
    enabled boolean DEFAULT true
);

-- Capabilities (lo que MCP expone)
CREATE TABLE mcp_capabilities (
    id uuid PRIMARY KEY,
    tenant_id uuid REFERENCES tenants(id),
    capability_name text NOT NULL,  -- 'orders.search', 'stock.sync'
    backing_endpoint_id uuid REFERENCES api_endpoints(id),
    description text,
    created_at timestamptz DEFAULT now()
);
```

### Cloudflare Integration

```sql
CREATE TABLE cloudflare_linked_apps (
    id uuid PRIMARY KEY,
    tenant_id uuid REFERENCES tenants(id),
    access_app_id_mcp text,
    access_app_id_api text,
    policy_id_ai_controls text,
    team_name text,
    created_at timestamptz DEFAULT now()
);
```

---

## 🔄 Flujos Clave

### 1. Onboarding de Empresa

**Pasos:**
1. Admin entra a `mcp.smarterbot.cl`
2. Pasa Cloudflare Access (SSO/OIDC)
3. Crea tenant en Supabase
4. Registra primera API:
   - Nombre: "ERP Empresa X"
   - URL: `https://erp.empresax.com/api`
   - Auth: `Bearer token`
5. Sistema introspecciona y crea `api_endpoints`
6. SmarterMCP genera `mcp_capabilities` automáticamente
7. ✅ Empresa puede conversar con su API

### 2. Conversación Real (Cognitive Flow)

**Flujo:**
1. Modelo de IA consulta `mcp.smarterbot.cl`
2. SmarterMCP mapea:
   - Usuario → tenant
   - Intención → capability (`orders.search`)
3. MCP llama a `api.smarterbot.store`:
   ```
   POST /tenant/{id}/proxy/orders.search
   ```
4. API Gateway:
   - Busca `api_endpoints` del tenant
   - Recupera credenciales
   - Llama a la API real de la empresa
5. Respuesta vuelve normalizada
6. Cloudflare audita todo el flujo (Access + AI Controls)

---

## 🌐 Dominios y Roles

| Dominio | Rol | Protección | Tecnología |
|---------|-----|------------|------------|
| `mcp.smarterbot.cl` | Cerebro cognitivo | Cloudflare Access (MCP Portal) | Node.js + TypeScript |
| `api.smarterbot.store` | Gateway transaccional | Cloudflare Access (Self-hosted) | Next.js API Routes |
| `login.smarterbot.store` | Identity & Auth | Supabase Auth + Cloudflare | Next.js + Supabase |
| `app.smarterbot.store` | Dashboard clientes | Cloudflare Access | Next.js + React |
| `smarterbot.cl` | Landing público | Cloudflare Proxy | Static/Next.js |
| `odoo.smarterbot.cl` | ERP | Cloudflare + Dokploy | Odoo 19 |
| `chatwoot.smarterbot.cl` | CRM/Chat | Cloudflare + Dokploy | Chatwoot |
| `n8n.smarterbot.cl` | Automation | Cloudflare + Dokploy | n8n |

---

## 📦 Módulos y Repositorios

### Core Repositories

| Repo | Descripción | Estado |
|------|-------------|--------|
| `smarteros-os` | Specs y documentación central | ✅ Activo |
| `smarteros-agents` | MCP + workflows + agentes | ✅ Activo |
| `smarteros-mcp-cloudflare` | DNS automation + Access | ✅ Activado |
| `smarteros-tenant-api` | API Gateway (TypeScript) | ✅ Listo deploy |
| `login.smarterbot.store` | Identity portal | ✅ Producción |
| `app.smarterbot.store` | Dashboard | ✅ Producción |

### Infrastructure

```
/root/smarteros-core/          # Core engine
/root/smarteros-api-gateway/   # API Gateway implementation
/root/smarteros-mcp-cloudflare/# Cloudflare MCP module
/root/smarteros-os-docs/       # Documentación
/root/smarteros-modules/       # Módulos adicionales
```

---

## 🔧 Componentes Técnicos

### MCP Cloudflare Module

**Ubicación:** `/root/smarteros-mcp-cloudflare`

**Funciones:**
```typescript
class CloudflareMCP {
  async createTenantSubdomain(request: SubdomainRequest): Promise<SubdomainResponse>
  async deleteTenantSubdomain(tenantId: string, subdomain: string): Promise<SubdomainResponse>
  async validateDomain(subdomain: string, domain: string): Promise<DomainValidation>
  async listTenantDomains(tenantId: string): Promise<TenantDomain[]>
  async healthCheck(): Promise<{ healthy: boolean; message: string }>
}
```

**Configuración:**
```env
CLOUDFLARE_API_TOKEN=***
CLOUDFLARE_ZONE_ID=2cd9e927c040cd0351c908068f81b069
CLOUDFLARE_ZONE_ID_STORE=81f7371c0a9d1e1a6fa9f6ff77eac8b0
PRIMARY_DOMAIN=smarterbot.cl
```

**Activación:**
```bash
cd /root/smarteros-mcp-cloudflare
./activate.sh
```

---

## 📊 Estado del Sistema (Telemetría)

### Infraestructura VPS

- **26 contenedores activos**
- **11 dominios configurados**
- **9 productos**
- **3 tenants** (SMARTERBOT, SmarterMCP, DEMO)
- **197 MB backup externo**
- **87% del sistema completo**

### Servicios Core

| Servicio | Estado | URL | Versión |
|----------|--------|-----|---------|
| Caddy | ✅ Running | - | 2.8.4 |
| Dokploy | ✅ Running | dokploy.smarterbot.cl | Latest |
| Odoo | ✅ Running | odoo.smarterbot.cl | 19.0 |
| Chatwoot | ✅ Running | chatwoot.smarterbot.cl | Latest |
| n8n | ✅ Running | n8n.smarterbot.cl | 1.121.3 |
| Supabase | ✅ Cloud | rjfcmmzjlguiititkmyh.supabase.co | Cloud |
| Cloudflare | ✅ Active | 2 zones | API v4 |

---

## ✅ Completado (2025-11-30)

- [x] Arquitectura multi-tenant (Supabase)
- [x] API Gateway (5 endpoints TypeScript)
- [x] MCP Cloudflare (DNS automation)
- [x] Cloudflare Access configurado
- [x] 26 contenedores en producción
- [x] Login portal operativo
- [x] Dashboard clientes
- [x] Documentación completa (+3.300 líneas)
- [x] Backup system (smarterbot.cl/nov.zip)

---

## 🚀 Próximos 4 Pasos

### 1. Deploy API a Vercel/Producción

```bash
cd /root/smarteros-tenant-api
npm install
npm run build
vercel deploy --prod
```

**Variables requeridas:**
```
SUPABASE_URL=https://rjfcmmzjlguiititkmyh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=***
NEXT_PUBLIC_SUPABASE_URL=https://rjfcmmzjlguiititkmyh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=***
```

### 2. Activar Cloudflare MCP

```bash
cd /root/smarteros-mcp-cloudflare
export CLOUDFLARE_API_TOKEN=tLFHLAQnpmC0y9xfEVQhRQ0xISSCYohGdQRtJoHw
./activate.sh
```

### 3. Importar Workflow n8n

- Entrar a `n8n.smarterbot.cl`
- Import JSON desde `/root/smarteros-agents/workflows/`
- Conectar:
  - Supabase (SERVICE_ROLE_KEY)
  - Chatwoot API
  - Odoo API
  - Meta/Telegram
- Activar cron (cada 1 minuto)

### 4. Conectar Store con API

```bash
cd /root/smarterbot.store
echo "NEXT_PUBLIC_SMARTEROS_API_URL=https://api.smarterbot.store" >> .env.production
npm run build
vercel deploy --prod
```

---

## 📝 Diferencia con Modelo Tradicional

### ❌ Modelo Vercel + ChatGPT App (tradicional)

- App aislada con ChatGPT embebido
- Código custom por integración
- SDKs y librerías específicas
- Escalabilidad limitada
- Sin multi-tenant real

### ✅ Modelo SmarterOS (moderno)

- **Capa de conectividad cognitiva** entre empresas y APIs
- Empresas **no suben código**, solo exponen APIs existentes
- **Conversación directa** con APIs mediante MCP
- **Multi-tenant nativo** con aislamiento por empresa
- **Escalabilidad horizontal** ilimitada
- **Zero Trust** con Cloudflare Access

---

## 🎓 Conceptos Clave

### MCP (Model Context Protocol)

Protocolo que permite a modelos de IA interactuar con herramientas externas de forma estandarizada.

**En SmarterOS:**
- MCP traduce intenciones → acciones API
- Sin necesidad de fine-tuning
- Context awareness por tenant

### Capabilities

Abstracciones semánticas que mapean a endpoints reales:

```
Capability: "orders.search"
  ↓
Endpoint: GET /api/orders?status={status}
  ↓
API Real: https://erp.empresax.com/api/orders
```

### Zero Trust Architecture

**Principio:** Nunca confiar, siempre verificar

**Implementación:**
- Cloudflare Access en todos los servicios
- No hay "red interna confiable"
- Autenticación por solicitud
- Logging y auditoría completos

---

## 📖 Referencias

- [Cloudflare One](https://developers.cloudflare.com/cloudflare-one/)
- [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/)
- [AI Controls](https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/)
- [MCP Server Portals](https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/linked-apps/)
- [Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

---

## 🏁 Versión del Sistema

**Versión:** v2025.11.30  
**Estado:** Production Ready  
**Actualizado:** 2025-11-30 14:57 UTC  

---

**SmarterOS** - El sistema operativo para negocios conectados 🚀
