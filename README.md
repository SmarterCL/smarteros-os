# SmarterOS

**El Sistema Operativo Digital para Negocios Chilenos**

SmarterOS es una plataforma multi-tenant que unifica Chat, ERP y Automatización en un único ecosistema integrado. Construido sobre Odoo, n8n, Chatwoot, Supabase y tecnología MCP (Model Context Protocol).

---

## 🎯 Visión

SmarterOS transforma la operación digital de empresas permitiendo:

- **Captura** → Conversaciones inteligentes (WhatsApp, Telegram, Web)
- **Activación** → Onboarding automatizado y provisionamiento instant
- **Operación** → ERP completo con gestión comercial
- **Venta** → Funnels, e-commerce y pagos integrados
- **Servicio** → CRM y soporte unificado
- **IA** → Inteligencia artificial por tenant

Todo bajo un modelo de **suscripción por producto** con trials automáticos y gestión multi-tenant nativa.

---

## 🏗️ Arquitectura

### Componentes Core

```
┌─────────────────────────────────────────────────────────────┐
│                      SmarterOS Core                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Identity Layer (Supabase Auth + Clerk)                     │
│  ├─ Multi-tenant database                                    │
│  ├─ OAuth2 providers (Google, GitHub, Slack)                │
│  └─ Phone verification (WhatsApp, Telegram)                 │
│                                                               │
│  MCP Layer (mcp.smarterbot.cl)                              │
│  ├─ SmarterMCP (tenant infrastructure)                      │
│  ├─ Cloudflare Access + AI Controls                         │
│  └─ Capability registry per tenant                          │
│                                                               │
│  API Gateway (api.smarterbot.store)                         │
│  ├─ Tenant API endpoints                                     │
│  ├─ Product activation                                       │
│  ├─ Integration management                                   │
│  └─ Proxy to enterprise APIs                                │
│                                                               │
│  Services Layer                                              │
│  ├─ Chatwoot (CRM/Chat)                                     │
│  ├─ Odoo 19 (ERP/E-commerce)                                │
│  ├─ n8n (Automation)                                         │
│  ├─ Metabase (Analytics)                                     │
│  └─ Ollama (AI local)                                        │
│                                                               │
│  Infrastructure                                              │
│  ├─ Caddy (Reverse Proxy + SSL)                            │
│  ├─ Dokploy (Orchestration)                                 │
│  ├─ PostgreSQL + Redis                                       │
│  └─ Cloudflare (DNS + Access + AI)                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Arquitectura Moderna 2025

SmarterOS implementa un modelo de **conectividad cognitiva** donde cada empresa conecta sus APIs existentes sin subir código:

**mcp.smarterbot.cl** (Capa Cognitiva)
- MCP Server protegido por Cloudflare Access
- Portal de capabilities por tenant
- AI Controls para auditoría y políticas
- Conecta modelos de IA con APIs empresariales

**api.smarterbot.store** (Capa Transaccional)
- API Gateway para operaciones de negocio
- Normalización de contratos entre sistemas
- Proxy seguro hacia APIs de empresas
- Rate limiting y logging centralizado

**Flujo de conversación lado a lado:**
```
Modelo IA → MCP → Capability → API Gateway → API Empresa → Respuesta
```

---

## 📦 Productos

### Chat (Chatwoot + Meta + Telegram)
- Inbox multi-canal
- Respuestas automáticas con IA
- Integración WhatsApp Cloud API
- Telegram Bot nativo

### ERP (Odoo 19)
- Gestión comercial completa
- Inventario y productos
- Facturación electrónica (SII Chile)
- E-commerce integrado

### Automation (n8n)
- Workflows visuales
- 400+ conectores nativos
- Triggers y webhooks
- Integraciones personalizadas

---

## 🗂️ Estructura del Monorepo

```
smarteros-os/
├── app.smarterbot.cl/        # Dashboard principal
├── chatwoot.smarterbot.cl/   # Configuración Chatwoot
├── smarterbot.cl/            # Landing page
├── dkcompose/                # Docker Compose configs
├── scripts/                  # Automation scripts
├── services/                 # Service configs
├── docs/                     # Documentación técnica
├── smarteros-specs/          # Especificaciones del sistema
└── front/                    # Frontend apps
```

---

## 🚀 Estado Actual del Sistema

**Versión:** v2025.11.30  
**Estado:** Production Ready (87% completo)

### Infraestructura Activa
- ✅ 26 contenedores en producción
- ✅ 11 dominios configurados
- ✅ 3 tenants activos (SMARTERBOT, DEMO, SmarterMCP)
- ✅ SSL automático con Caddy
- ✅ Backup externo (197 MB - smarterbot.cl/nov.zip)

### Módulos Operativos
- ✅ Supabase multi-tenant schema
- ✅ Tenant API (TypeScript + Supabase)
- ✅ n8n workflows (provisioning + onboarding)
- ✅ Chatwoot integration
- ✅ Odoo 19 deployment
- ✅ Cloudflare MCP module (preparado)

### Capacidades Actuales
- Crear tenants desde Store, API, n8n, CLI
- Activar/desactivar productos por tenant
- Gestionar trials y suscripciones
- Provisionar integraciones automáticamente
- Asignar subdominios dinámicos
- Control de infraestructura vía Dokploy

---

## 📋 Módulos y Repositorios

| Módulo | Ubicación | Estado | Propósito |
|--------|-----------|--------|-----------|
| `smarteros-tenant-api` | `/root/smarteros-tenant-api` | ✅ Completo | API REST para gestión de tenants |
| `smarteros-mcp-cloudflare` | `/root/smarteros-mcp-cloudflare` | ✅ Completo | Integración Cloudflare + MCP |
| `smarteros-agents` | GitHub: SmarterCL/smarteros-agents | 🚧 En desarrollo | Agentes y reglas precocinadas |
| `smarteros-specs` | `/root/repos/smarteros-specs` | ✅ Completo | Especificaciones técnicas |
| `smarteros-cli` | `/root/smarteros-cli` | 🚧 En desarrollo | CLI para administración |

---

## 🔧 4 Pasos Pendientes

### 1. Deploy API a Vercel
```bash
cd /root/smarteros-tenant-api
vercel login
vercel deploy --prod
```

### 2. Activar Cloudflare MCP
```bash
export CLOUDFLARE_API_TOKEN="tu_token"
smarteros mcp cloudflare test
```

### 3. Importar Workflow n8n
- Workflow: `n8n_onboarding_smarteros`
- Endpoint: `https://n8n.smarterbot.cl/webhook/auth-signup`
- Función: Provisioning automático de tenants

### 4. Conectar Store con API
```bash
# En smarterbot.store
NEXT_PUBLIC_SMARTEROS_API_URL=https://api.smarterbot.cl
```

---

## 📊 Base de Datos Multi-Tenant

### Schema Supabase

**Tablas Core:**
- `tenants` - Información de empresas
- `tenant_products` - Productos activos (chat, erp, automation)
- `tenant_domains` - Dominios asignados
- `tenant_integrations` - Conexiones externas (Chatwoot, Odoo, n8n)
- `trials` - Gestión de trials por producto

**Tablas MCP (nuevas):**
- `api_providers` - APIs registradas por empresa
- `api_credentials` - Credenciales encriptadas
- `api_endpoints` - Endpoints disponibles
- `mcp_capabilities` - Capabilities conversacionales
- `cloudflare_linked_apps` - Apps vinculadas en Cloudflare Access

**Vistas:**
- `v_tenant_overview` - Estado consolidado de tenants

**Funciones:**
- `create_tenant_minimal()` - Creación rápida de tenant
- `activate_default_products_for_tenant()` - Activación de productos

---

## 🌐 Dominios y Servicios

| Dominio | Servicio | Puerto | Estado |
|---------|----------|--------|--------|
| smarterbot.cl | Landing + Backup | 80/443 | ✅ |
| login.smarterbot.store | Portal de autenticación | 443 | ✅ |
| app.smarterbot.store | Dashboard principal | 443 | ✅ |
| api.smarterbot.store | API Gateway | 443 | 🚧 |
| mcp.smarterbot.cl | MCP Server | 443 | 🚧 |
| odoo.smarterbot.cl | Odoo ERP | 443 | ✅ |
| chatwoot.smarterbot.cl | Chatwoot CRM | 443 | ✅ |
| n8n.smarterbot.cl | n8n Workflows | 443 | ✅ |
| metabase.smarterbot.cl | Analytics | 443 | ✅ |

---

## 🔐 Seguridad

- **Cloudflare Access** para todos los servicios administrativos
- **Supabase Row Level Security (RLS)** por tenant
- **JWT tokens** para autenticación API
- **Service Role Keys** solo en backend
- **SSL automático** vía Caddy + Let's Encrypt
- **Secrets** gestionados vía environment variables

---

## 📚 Documentación

### Guides
- [Deployment Guide](./docs/DEPLOY-CHATWOOT-VERCEL.md)
- [Chatwoot Integration](./docs/CHATWOOT-INTEGRATION.md)
- [MCP Setup](./docs/SMARTERMCP-SETUP.md)
- [Cloudflare DNS MCP](./docs/CLOUDFLARE-DNS-MCP-SETUP.md)

### Architecture
- [Multi-Cloud Architecture](./docs/MULTI-CLOUD-ARCHITECTURE.md)
- [Monorepo Consolidado](./docs/MONOREPO-CONSOLIDADO.md)
- [Identity Audit Spec](./docs/IDENTITY-AUDIT-SPEC.md)

### Workflows
- [n8n OCR Classify](./docs/n8n-workflow-ocr-classify.md)
- [Chatwoot Automation](./docs/chatwoot-smarteros-automation.json)

---

## 🤝 Contribuir

Este es un sistema en producción. Para contribuir:

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

---

## 📞 Soporte

- **Sitio Web:** https://smarterbot.cl
- **Panel Admin:** https://app.smarterbot.store
- **ERP:** https://odoo.smarterbot.cl
- **Email:** mcp@smarterbot.cl

---

## 📄 Licencia

Copyright © 2025 SmarterOS Chile. Todos los derechos reservados.

---

## 🎯 Roadmap

### Q1 2025
- [ ] Landing page comercial completa
- [ ] Panel de cliente premium
- [ ] Integración Stripe/Transbank
- [ ] Motor IA por tenant
- [ ] Marketplace de integraciones

### Q2 2025
- [ ] Webhooks y eventos en tiempo real
- [ ] API pública para partners
- [ ] SDK JavaScript/Python
- [ ] Extensiones Shopify/WooCommerce
- [ ] Certificación SII Chile

---

**SmarterOS** - El sistema operativo que conecta negocios, ventas, pagos y automatización en un único flujo.

*Versión del sistema: v2025.11.30 | Estado: Production Ready*
