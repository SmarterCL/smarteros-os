# SmarterOS - Repositorios y Módulos Activos

**Fecha:** 2025-11-30  
**Versión:** v2025.11.30

---

## 📁 Estructura de Repositorios

### GitHub Organization: SmarterCL

```
SmarterCL/
├── smarteros-os/              # ← Este repositorio (monorepo principal)
├── smarteros-agents/          # Agentes y reglas MCP
├── smarteros-specs/           # Especificaciones técnicas (deprecated, movido a smarteros-os)
└── [otros repos privados]
```

---

## 🗂️ Contenido de smarteros-os/

```
smarteros-os/
├── README.md                           # ← Documentación principal
├── .gitmodules                         # Git submodules
├── smarteros-specs/                    # ← Especificaciones
│   ├── ARCHITECTURE-2025-MODERN.md    # Arquitectura moderna
│   ├── SYSTEM-STATUS.md               # Estado del sistema
│   └── REPOS-AND-MODULES.md           # Este archivo
│
├── app.smarterbot.cl/                 # Dashboard principal
├── chatwoot.smarterbot.cl/            # Chatwoot config
├── smarterbot.cl/                     # Landing page
│
├── dkcompose/                         # Docker Compose configs
├── scripts/                           # Scripts de automatización
├── services/                          # Service configs
├── docs/                              # Docs técnicos existentes
└── front/                             # Frontend apps
```

---

## 🔧 Módulos en VPS (/root/)

### APIs y Servicios

| Directorio | Propósito | Estado | Deploy |
|------------|-----------|--------|--------|
| `/root/smarteros-tenant-api/` | API REST para tenants | ✅ Completo | 🚧 Pendiente Vercel |
| `/root/smarteros-mcp-cloudflare/` | Módulo Cloudflare + MCP | ✅ Completo | ⏸️ Pre-activación |
| `/root/smarteros-cli/` | CLI administración | 🚧 En desarrollo | - |
| `/root/smarteros-agents-unified/` | Agentes unificados | 🚧 En desarrollo | - |

### Infraestructura

| Directorio | Propósito | Estado |
|------------|-----------|--------|
| `/root/dkcompose/` | Docker Compose configs | ✅ Activo |
| `/root/smarteros-caddy/` | Caddy reverse proxy | ✅ Activo |
| `/root/docker-compose-*.yml` | Servicios individuales | ✅ Activo |

### Datos y Backups

| Directorio | Propósito | Estado |
|------------|-----------|--------|
| `/root/backups/` | Backups locales | ✅ Activo |
| `/root/smarteros-backup-nov-2025.tar.gz` | Backup completo VPS | ✅ Completo |
| `https://smarterbot.cl/nov.zip` | Backup público | ✅ Activo (197 MB) |

---

## 🌐 Repositorios Externos Conectados

### Supabase
- **URL:** https://rjfcmmzjlguiititkmyh.supabase.co
- **Project ID:** rjfcmmzjlguiititkmyh
- **Database:** PostgreSQL 15
- **Schema:** Multi-tenant completo

### Vercel (pendiente deploy)
- **smarteros-tenant-api** → api.smarterbot.store
- **smarterbot.store** → smarterbot.cl

### Cloudflare
- **DNS Management:** 11 dominios
- **Access:** Pre-configurado
- **AI Controls:** Pre-configurado

---

## 📦 Dependencias entre Módulos

```
smarteros-os (monorepo)
  ↓
  ├─→ smarteros-tenant-api
  │     ├─→ Supabase (tenants, products, integrations)
  │     └─→ Vercel (deploy target)
  │
  ├─→ smarteros-mcp-cloudflare
  │     ├─→ Cloudflare API (DNS + Access)
  │     ├─→ Supabase (cloudflare_linked_apps)
  │     └─→ mcp.smarterbot.cl (deploy target)
  │
  ├─→ smarteros-agents
  │     ├─→ MCP Protocol
  │     ├─→ n8n workflows
  │     └─→ manifest.json (reglas precocinadas)
  │
  └─→ smarteros-cli
        ├─→ smarteros-tenant-api (consume)
        ├─→ smarteros-mcp-cloudflare (consume)
        └─→ Dokploy API (control infraestructura)
```

---

## 🚀 Comandos Principales

### Sincronizar desde GitHub
```bash
cd /root/repos/smarteros-os
git pull origin main
git submodule update --init --recursive
```

### Actualizar smarteros-specs
```bash
cd /root/repos/smarteros-os/smarteros-specs
# Editar archivos
cd ..
git add smarteros-specs/
git commit -m "Update specs"
git push origin main
```

### Deploy API
```bash
cd /root/smarteros-tenant-api
npm install
npm run build
vercel deploy --prod
```

### Activar MCP Cloudflare
```bash
export CLOUDFLARE_API_TOKEN="tu_token"
cd /root/smarteros-mcp-cloudflare
npm install
npm run build
node dist/index.js testAccessConnection
```

### CLI
```bash
cd /root/smarteros-cli
npm install
npm link
smarteros --help
```

---

## 📊 Estado de Módulos

| Módulo | Progreso | LOC | Tests | Deploy |
|--------|----------|-----|-------|--------|
| smarteros-os | 100% | - | - | GitHub ✅ |
| smarteros-tenant-api | 100% | ~500 | ❌ | Vercel 🚧 |
| smarteros-mcp-cloudflare | 100% | ~400 | ❌ | Pre-activ ⏸️ |
| smarteros-agents | 60% | ~300 | ❌ | GitHub 🚧 |
| smarteros-cli | 40% | ~200 | ❌ | Local 🚧 |

**Total estimado:** ~1.400 LOC + 3.300 líneas de documentación

---

## 🔐 Secrets y Configuración

### Environment Variables Requeridas

**smarteros-tenant-api:**
```bash
SUPABASE_URL=https://rjfcmmzjlguiititkmyh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=***
NEXT_PUBLIC_SUPABASE_URL=***
NEXT_PUBLIC_SUPABASE_ANON_KEY=***
```

**smarteros-mcp-cloudflare:**
```bash
CLOUDFLARE_API_TOKEN=***
CLOUDFLARE_ZONE_ID=***
CLOUDFLARE_ACCOUNT_ID=***
```

**smarteros-cli:**
```bash
SMARTEROS_API_URL=https://api.smarterbot.store
DOKPLOY_API_URL=https://dokploy.smarterbot.cl
DOKPLOY_API_KEY=***
```

---

## 🎯 Checklist de Deploy Completo

### Fase 1: Preparación ✅
- [x] Schema Supabase
- [x] Tenants base (3)
- [x] API desarrollada
- [x] MCP module desarrollado
- [x] Documentación completa
- [x] Backup externo

### Fase 2: Deploy API 🚧
- [ ] Vercel login
- [ ] Configurar env vars
- [ ] Deploy production
- [ ] Test endpoints
- [ ] Conectar Store

### Fase 3: Activar MCP 🚧
- [ ] Obtener Cloudflare token
- [ ] Configurar Access Apps
- [ ] Habilitar AI Controls
- [ ] Test DNS automation
- [ ] Vincular mcp.smarterbot.cl

### Fase 4: Workflows n8n 🚧
- [ ] Importar n8n_onboarding_smarteros
- [ ] Configurar credenciales
- [ ] Test provisioning
- [ ] Activar webhooks

### Fase 5: Integración Final 🚧
- [ ] Conectar Store → API
- [ ] Test flow completo
- [ ] Onboarding real
- [ ] Primer cliente

---

## 📞 Contacto y Mantenimiento

**Responsable:** Sistema SmarterOS  
**Email:** mcp@smarterbot.cl  
**Repos:** https://github.com/SmarterCL

**Última sincronización:** 2025-11-30 14:44 UTC  
**Próxima revisión:** 2025-12-01

---

*Este documento es parte de smarteros-os/smarteros-specs/ y se mantiene sincronizado con el estado real del sistema.*
