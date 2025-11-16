# 🎯 SmarterOS — Resumen de Servicios Front

**Actualizado**: 2025-11-16  
**Total de subdominios configurados**: **3**

---

## 📊 Servicios Activos

| # | Subdominio | Tipo | Repo | Puerto | Container |
|---|------------|------|------|--------|-----------|
| 1 | **mkt.smarterbot.cl** | Marketing/Blog | [BlogBowl/BlogBowl](https://github.com/BlogBowl/BlogBowl) | 3010 | `mkt-blogbowl` |
| 2 | **call.smarterbot.cl** | Call Center AI | [microsoft/call-center-ai](https://github.com/microsoft/call-center-ai) | 3020 | `smarter-callcenter` |
| 3 | **fulldaygo.smarterbot.cl** | Marketplace | [SmarterCL/fulldaygo.smarterbot.cl](https://github.com/SmarterCL/fulldaygo.smarterbot.cl) | 3030 | `fulldaygo-marketplace` |

---

## 🔐 Autenticación Compartida (SSO)

**Todos los servicios comparten login via Supabase**:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

**Configuración en Supabase**:
- Cross-domain JWT habilitado
- Allowed Origins: `https://*.smarterbot.cl`
- Same Organization Session activo

---

## 🐳 Docker Compose

**Archivo**: `dkcompose/docker-compose.mkt-call.yml`

**Servicios definidos**: 3
- `mkt-blogbowl` (Node.js 20, volumen a `front/mkt.smarterbot.cl`)
- `callcenter` (Build custom, código en `services/call.smarterbot.cl`)
- `fulldaygo` (Node.js 20, volumen a `front/fulldaygo.smarterbot.cl`)

**Redes**: `smarter-net`, `dokploy-network`  
**Proxy**: Traefik (SSL automático vía Let's Encrypt)

---

## 📂 Estructura de Carpetas

```
/Users/mac/dev/2025/
├── front/
│   ├── mkt.smarterbot.cl/          (BlogBowl - por clonar)
│   └── fulldaygo.smarterbot.cl/    (Full Day Go - por clonar)
├── services/
│   └── call.smarterbot.cl/         (Call Center AI - por clonar)
├── dkcompose/
│   └── docker-compose.mkt-call.yml (3 servicios configurados)
├── scripts/
│   └── setup-mkt-call.sh           (Clona + levanta los 3)
└── smarteros-specs/
    └── services/
        ├── mkt.smarterbot.cl.yml
        ├── call.smarterbot.cl.yml
        └── fulldaygo.smarterbot.cl.yml
```

---

## 🚀 Deployment Rápido

### 1. Clonar los 3 repositorios
```bash
cd ~/dev/2025

# BlogBowl
cd front/mkt.smarterbot.cl
git clone https://github.com/BlogBowl/BlogBowl .

# Call Center AI
cd ../../services/call.smarterbot.cl
git clone https://github.com/microsoft/call-center-ai .

# Full Day Go
cd ../../front/fulldaygo.smarterbot.cl
git clone https://github.com/SmarterCL/fulldaygo.smarterbot.cl .
```

### 2. Ejecutar setup automático
```bash
cd ~/dev/2025
bash scripts/setup-mkt-call.sh
```

Este script:
- ✅ Crea directorios si faltan
- ✅ Clona repos automáticamente
- ✅ Levanta los 3 contenedores con Traefik

### 3. Configurar DNS (Cloudflare)
```
mkt.smarterbot.cl      → CNAME → tu-vps.hostinger.com
call.smarterbot.cl     → CNAME → tu-vps.hostinger.com
fulldaygo.smarterbot.cl → CNAME → tu-vps.hostinger.com
```

### 4. Verificar endpoints
```bash
curl -I https://mkt.smarterbot.cl
curl -I https://call.smarterbot.cl
curl -I https://fulldaygo.smarterbot.cl
```

---

## 🔧 Variables de Entorno Requeridas

Crear archivo `.env` en `dkcompose/`:

```bash
# Supabase (compartido por los 3 servicios)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Azure (solo para Call Center)
AZURE_SPEECH_KEY=xxx
AZURE_SPEECH_REGION=eastus
```

---

## 📋 Checklist de Implementación

### Antes del deploy
- [ ] Clonar los 3 repositorios en sus carpetas
- [ ] Crear `.env` en `dkcompose/` con variables de Supabase
- [ ] Configurar DNS en Cloudflare (3 CNAMEs)
- [ ] Verificar que Traefik esté corriendo en `dokploy-network`

### Durante el deploy
- [ ] Ejecutar `bash scripts/setup-mkt-call.sh`
- [ ] Verificar logs: `docker logs -f mkt-blogbowl`
- [ ] Verificar logs: `docker logs -f smarter-callcenter`
- [ ] Verificar logs: `docker logs -f fulldaygo-marketplace`

### Post-deploy
- [ ] Probar login en cada subdominio
- [ ] Verificar SSO cross-domain (login en uno = login en todos)
- [ ] Configurar Supabase Allowed Origins si falla CORS
- [ ] Probar flujo completo de cada servicio

---

## 🛡️ Seguridad

### ✅ Protecciones activas
- `.gitignore` excluye `.env` y `docker-compose.yml`
- READMEs de servicios SÍ versionados (instrucciones públicas)
- Secrets en variables de entorno, NO en código
- HTTPS forzado vía Traefik + Let's Encrypt

### ⚠️ Puntos de atención
- Rotar `SUPABASE_SERVICE_ROLE_KEY` cada 90 días
- No exponer endpoints `/admin` sin auth
- Configurar rate limiting en Traefik para APIs públicas

---

## 🎯 MCP Providers Asociados

Los 3 servicios tienen MCP providers en el registry (`smarteros-specs/agents/mcp-registry.yml`):

- **blogbowl-filesystem**: Acceso a contenido (Copilot + Gemini)
- **callcenter-conversation**: Transcripciones y análisis (Gemini + Codex)
- **callcenter-speech**: Azure Speech Services (Gemini)

**Total de providers MCP**: 28  
**Total de tiers**: 6

---

## 📞 Soporte

- **Repo principal**: https://github.com/SmarterCL/SmarterOS
- **Docs**: `/Users/mac/dev/2025/docs/`
- **Scripts**: `/Users/mac/dev/2025/scripts/`
- **Specs**: `/Users/mac/dev/2025/smarteros-specs/services/`

---

**Última actualización**: 2025-11-16 19:30 CLT  
**Commit**: `4e37ea9` (feat: add fulldaygo.smarterbot.cl)
