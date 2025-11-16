# 🌐 Cloudflare DNS MCP - Setup Guide

**Fecha:** 16 de noviembre de 2025  
**Servidor MCP:** [Cloudflare DNS Analytics](https://github.com/cloudflare/mcp-server-cloudflare/tree/main/apps/dns-analytics)  
**Tier:** 5 (DevOps/Infrastructure)

---

## 📋 Resumen

Este documento detalla la integración del servidor MCP oficial de Cloudflare para gestión de DNS y analytics en SmarterOS.

**¿Qué es?**
- Servidor MCP oficial desarrollado por Cloudflare
- Interfaz conversacional para gestionar DNS records
- Analytics y optimizaciones de DNS automáticas
- Integración nativa con AI agents

**¿Para qué sirve?**
- Crear/actualizar/eliminar registros DNS via AI
- Análisis de tráfico DNS y optimizaciones
- Automatización de DNS durante deployments
- Soporte para subdominios dinámicos

---

## 🔧 Setup Rápido

### 1. Obtener API Token de Cloudflare

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click en tu perfil → **API Tokens**
3. **Create Token** → Use template "Edit zone DNS"
4. Permisos necesarios:
   - `Zone:Zone:Read`
   - `Zone:DNS:Edit`
5. Zone Resources: `Include → Specific zone → smarterbot.cl`
6. Click **Continue to summary** → **Create Token**
7. **Copia el token** (solo se muestra una vez)

### 2. Obtener Zone ID

1. En Cloudflare Dashboard, selecciona el dominio `smarterbot.cl`
2. En la barra lateral derecha, copia el **Zone ID**
3. Ejemplo: `abc123def456...`

### 3. Guardar Credenciales en Vault

```bash
# Conectar a Vault (si no está conectado)
export VAULT_ADDR="https://vault.smarterbot.cl"
export VAULT_TOKEN="tu-vault-token"

# Guardar credenciales de Cloudflare
vault kv put smarteros/mcp/cloudflare \
  api_token="tu-cloudflare-api-token" \
  email="tu@email.com" \
  zone_id="zone-id-de-smarterbot-cl"

# Verificar
vault kv get smarteros/mcp/cloudflare
```

### 4. Aplicar Vault Policy

```bash
cd ~/dev/2025/smarteros-specs

# Aplicar policy para acceso MCP
vault policy write mcp-cloudflare-dns-read \
  vault/policies/mcp-cloudflare-dns-read.hcl

# Verificar
vault policy read mcp-cloudflare-dns-read
```

### 5. Configurar en Claude Desktop / Cline

Edita el archivo de configuración MCP de tu cliente:

**Claude Desktop** (`~/Library/Application\ Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "cloudflare-dns": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://dns-analytics.mcp.cloudflare.com/mcp"]
    }
  }
}
```

**Cline** (`.vscode/settings.json` o settings globales):
```json
{
  "cline.mcpServers": {
    "cloudflare-dns": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://dns-analytics.mcp.cloudflare.com/mcp"]
    }
  }
}
```

### 6. Reiniciar Cliente y Autenticar

1. Reinicia Claude Desktop / VS Code
2. Al conectar por primera vez, se abrirá un browser para OAuth
3. Autoriza el acceso a tu cuenta de Cloudflare
4. Las herramientas estarán disponibles inmediatamente

---

## 🎯 Uso Inmediato

### Crear Registros DNS para Servicios

**Problema actual:**
```
mkt.smarterbot.cl  → DNS_PROBE_FINISHED_NXDOMAIN ❌
call.smarterbot.cl → DNS_PROBE_FINISHED_NXDOMAIN ❌
```

**Solución con MCP:**

```
Prompt al AI agent (Claude/Cline):

"Lista las zonas de mi cuenta Cloudflare y luego crea estos registros DNS:

1. Tipo A para mkt.smarterbot.cl apuntando a 216.198.79.1 con proxy activado
2. Tipo A para call.smarterbot.cl apuntando a 216.198.79.1 con proxy activado
3. Tipo A para fulldaygo.smarterbot.cl apuntando a 216.198.79.1 con proxy activado"
```

El agente ejecutará:
1. `zones_list` → Obtiene zone_id de smarterbot.cl
2. `dns_records_create` → Crea mkt.smarterbot.cl
3. `dns_records_create` → Crea call.smarterbot.cl  
4. `dns_records_create` → Crea fulldaygo.smarterbot.cl
5. `dns_records_list` → Verifica creación

---

## 🛠️ Herramientas Disponibles

### DNS Management (Codex)

| Tool | Descripción | Ejemplo |
|------|-------------|---------|
| `zones_list` | Listar todas las zonas | "Lista mis zonas de Cloudflare" |
| `dns_records_list` | Listar registros de una zona | "Muestra todos los registros DNS de smarterbot.cl" |
| `dns_records_create` | Crear nuevo registro | "Crea un A record para api.smarterbot.cl a 1.2.3.4" |
| `dns_records_update` | Actualizar registro | "Actualiza mkt.smarterbot.cl para activar el proxy" |
| `dns_records_delete` | Eliminar registro | "Elimina el registro DNS [record_id]" |

### Analytics (Gemini - Read Only)

| Tool | Descripción | Ejemplo |
|------|-------------|---------|
| `dns_analytics_report` | Reporte de tráfico DNS | "Muestra el tráfico DNS de los últimos 7 días" |
| `dns_settings_get` | Obtener configuración DNS | "¿Cuáles son mis configuraciones DNS?" |
| `dns_optimization_suggest` | Sugerencias de optimización | "¿Cómo puedo optimizar mi DNS?" |

---

## 📝 Ejemplos de Prompts

### Crear Subdominios
```
"Crea registros A para estos subdominios en smarterbot.cl:
- mkt → 216.198.79.1
- call → 216.198.79.1
- api → 216.198.79.1
Todos con proxy Cloudflare activado"
```

### Actualizar Registros
```
"Actualiza el registro de app.smarterbot.cl para que apunte a 1.1.1.1 
y desactiva el proxy de Cloudflare"
```

### Análisis y Optimización
```
"Analiza el tráfico DNS de smarterbot.cl en los últimos 30 días 
y dame recomendaciones de optimización"
```

### Verificar Configuración
```
"Muestra todos los registros DNS de smarterbot.cl y dime 
cuáles tienen el proxy activado"
```

---

## 🔒 Seguridad

### Vault Policy

La policy `mcp-cloudflare-dns-read` permite:
- ✅ Leer credenciales de `smarteros/mcp/cloudflare`
- ✅ Listar providers MCP
- ✅ Leer configuraciones de zona (verificación)
- ❌ NO permite write en Vault

### API Token Permissions

El token debe tener **mínimos permisos**:
- ✅ `Zone:Zone:Read` (leer zonas)
- ✅ `Zone:DNS:Edit` (crear/editar/eliminar DNS records)
- ❌ NO necesita permisos de billing, analytics, workers, etc.

### Best Practices

1. **Un token por entorno:** dev, staging, production
2. **Rotación de tokens:** cada 90 días
3. **Audit logs:** revisar cambios DNS mensualmente
4. **Approval workflow:** cambios en producción requieren aprobación
5. **Proxy activado:** para servicios web (oculta IP origen)

---

## 🚀 Casos de Uso

### 1. Deployment Automation

**Workflow:**
1. Nuevo servicio deploye en VPS
2. GitHub Action trigger → Codex agent
3. Codex usa Cloudflare MCP para crear DNS record
4. Service ready en `https://nuevo-servicio.smarterbot.cl`

### 2. Blue-Green Deployments

**Workflow:**
1. Deploy nueva versión en IP diferente
2. Codex crea `v2.service.smarterbot.cl` apuntando a nueva IP
3. Testing en v2
4. Codex actualiza `service.smarterbot.cl` a nueva IP
5. Rollback instantáneo si hay issues

### 3. Multi-Region Load Balancing

**Workflow:**
1. Deploy service en múltiples regiones (US, EU, APAC)
2. Codex crea registros geolocation-based
3. Cloudflare enruta tráfico a región más cercana
4. Monitoring de latency vía DNS analytics

---

## 📊 Monitoring

### Health Check

```bash
# Verificar conectividad MCP
npx @modelcontextprotocol/inspector@latest

# Conectar a:
https://dns-analytics.mcp.cloudflare.com/mcp

# Debería listar 9 tools disponibles
```

### Metrics Dashboard

En Cloudflare Dashboard → Analytics → DNS:
- Query volume by record type
- Response codes distribution
- Query latency percentiles
- Top queried records

### Alerting

Configurar alerts en Cloudflare para:
- DNS query rate anomalies
- High error rates (NXDOMAIN, SERVFAIL)
- Latency spikes
- Unauthorized DNS modifications

---

## 🐛 Troubleshooting

### Error: "No zones found"

**Causa:** API token no tiene permisos de Zone:Read  
**Solución:** Recrear token con permiso `Zone:Zone:Read`

### Error: "Insufficient permissions"

**Causa:** Token no tiene Zone:DNS:Edit  
**Solución:** Agregar permiso `Zone:DNS:Edit` al token

### Error: "Zone ID not found"

**Causa:** Zone ID incorrecto en Vault  
**Solución:**
```bash
# Verificar zone_id
vault kv get smarteros/mcp/cloudflare

# Actualizar si es necesario
vault kv put smarteros/mcp/cloudflare \
  api_token="xxx" \
  email="xxx" \
  zone_id="CORRECT_ZONE_ID"
```

### MCP no aparece en cliente

**Causa:** Configuración incorrecta o mcp-remote no instalado  
**Solución:**
```bash
# Instalar mcp-remote globalmente
npm install -g mcp-remote

# Verificar config JSON (debe ser válido)
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .

# Reiniciar cliente
```

---

## 📚 Referencias

- [Cloudflare MCP Server Repo](https://github.com/cloudflare/mcp-server-cloudflare)
- [DNS Analytics App](https://github.com/cloudflare/mcp-server-cloudflare/tree/main/apps/dns-analytics)
- [Cloudflare API Docs](https://developers.cloudflare.com/api/)
- [Model Context Protocol Spec](https://modelcontextprotocol.io/)
- [MCP Remote Package](https://www.npmjs.com/package/mcp-remote)

---

## ✅ Checklist

Antes de usar en producción:

- [ ] API token creado con permisos mínimos
- [ ] Credenciales guardadas en Vault
- [ ] Vault policy aplicada
- [ ] MCP configurado en cliente AI
- [ ] OAuth flow completado
- [ ] Test de conexión exitoso (`zones_list`)
- [ ] Registro de prueba creado y verificado
- [ ] Audit logging activado en Cloudflare
- [ ] Backup de configuración DNS actual
- [ ] Workflow de approval documentado

---

**¿Listo para usar?**

Prueba ahora:
```
"Lista las zonas de mi cuenta Cloudflare"
```

Si ves la zona `smarterbot.cl`, ¡estás listo! 🎉
