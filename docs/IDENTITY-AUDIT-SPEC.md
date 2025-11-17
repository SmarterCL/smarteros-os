# Identity Audit Spec — SmarterOS

Etiqueta oficial: [RAG-AUDIT:SMARTERBOTCL]
Identidad corporativa única permitida: smarterbotcl@gmail.com

Cualquier otra identidad (correo) está prohibida en código, repos, scripts, MCP, envs o documentación. El sistema de RAG debe reportarlo como incidente.

---

## Scope cubierto
- **Google Cloud:**
  - People API, Contacts API, OAuth 2.0, Refresh Tokens, Workspace
  - Vision API (OCR), Document AI, Gemini LLM (Vertex AI)
  - Service Accounts (JSON keys para n8n workflows)
- **Azure:**
  - Azure AD (Microsoft Identity Platform) para login corporativo
  - Azure Container Apps (n8n deployment)
  - Azure Key Vault (alternativa a HashiCorp Vault)
  - Azure Cognitive Services (Form Recognizer, Computer Vision)
- **GitHub:**
  - GitHub Actions (CI/CD)
  - GitHub API (issues, PRs, repos)
  - Personal Access Tokens (PATs) en workflows n8n
- **MCP:** Tools y Webhooks (mcp.smarterbot.cl)
- **n8n:** Workflows, credenciales multi-cloud, secrets en Vault
- **Chatwoot:** Automations y Webhooks
- **Infra:** `dkcompose`, Vault, Redpanda, Postgres, Redis

## Reglas
- **Identidad única permitida:** `smarterbotcl@gmail.com` en **todos los clouds**:
  - Google: OAuth 2.0, Service Accounts con dominio `@smarterbot.cl` (alias de `smarterbotcl@gmail.com`)
  - Microsoft: cuenta Azure AD asociada a `smarterbotcl@gmail.com` (login corporativo)
  - GitHub: usuario `smarterbotcl` con email `smarterbotcl@gmail.com`
- **Prohibido:** cualquier otra dirección de correo en:
  - nombres de variables, valores de variables, comentarios, docs, commits, issues, PRs, logs
  - credenciales de Azure Service Principal, GitHub PATs, Google Service Accounts
- **Credenciales Google (obligatorias para MCP):**
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`
  - `GOOGLE_REDIRECT_URI=https://mcp.smarterbot.cl/oauth2/callback`
- **Credenciales Azure (obligatorias para n8n en ACA):**
  - Azure Service Principal con Client ID + Secret asociado a tenant de `smarterbotcl@gmail.com`
  - Almacenado en Vault: `secret/n8n/azure`
- **Credenciales GitHub:**
  - Personal Access Token (PAT) fine-grained del usuario `smarterbotcl`
  - Scopes: `repo`, `workflow`, `issues:write`
  - Almacenado en Vault: `secret/n8n/github`
- **Almacenamiento de secretos:**
  - Nunca en Git/repo/commits
  - `.env` en VPS solo temporal (máx 24h) → migrar a Vault
  - **Facebook login:** ELIMINADO (no usar API keys de Facebook)
- **Etiquetado RAG en runtime:**
  - Variable de entorno `RAG_IDENTITY=smarterbotcl@gmail.com` en todos los servicios
  - Tag `[RAG-AUDIT:SMARTERBOTCL]` en logs de MCP, n8n, Chatwoot
  - Header `X-SMOS-Identity: smarterbotcl@gmail.com` en requests entre servicios

## Auditoría diaria (RAG)
- Código (paths):
  - `services/**`, `smarteros-specs/**`, `dkcompose/**`, `docs/**`, `app.smarterbot.cl/**`, `chatwoot.smarterbot.cl/**`
- Artefactos sensibles: `.env*`, YAML/JSON de configs, CI workflows
- Logs/Tráfico:
  - MCP inbound/outbound
  - Webhooks de Chatwoot
  - Triggers de n8n
  - Auditoría de Vault
  - Headers en bus de datos Redpanda (`X-SMOS-Tenant`, etiquetas RAG)
- Tópicos Redpanda:
  - `smarteros.audit.identity` → eventos de hallazgos

### Criterios de hallazgo
- Si aparece cualquier correo distinto de `smarterbotcl@gmail.com` o alias `@smarterbot.cl` →
  - **EXCEPTION:** correos de usuarios finales en Chatwoot (contactos legítimos)
  - **EXCEPTION:** ejemplos en docs con placeholder `example@domain.com`
- Si aparece Facebook App ID/Secret en código → `RAG ALERT: Facebook deprecated`
- Si Service Account Google no pertenece a proyecto de `smarterbotcl@gmail.com` →
  - Reportar: `RAG ALERT: Unauthorized Google Service Account detected.`
  - Severidad: Alta
  - Acción: bloqueo de deploy (si en CI) o ticket automático
- Si Azure Service Principal no asociado a tenant de `smarterbotcl@gmail.com` →
  - Reportar: `RAG ALERT: Unauthorized Azure identity detected.`
- Si GitHub PAT no pertenece a usuario `smarterbotcl` →
  - Reportar: `RAG ALERT: Unauthorized GitHub token detected.`

## Implementación recomendada

### 1) Scans locales/CI
Comandos de verificación rápidos:

```bash
# Buscar correos no permitidos (excluye el oficial)
grep -RInE "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+" \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude=pnpm-lock.yaml \
  . | grep -v "smarterbotcl@gmail.com" || true

# Buscar tokens/secretos en texto (heurístico)
grep -RInE "(SECRET|TOKEN|API_KEY|CLIENT_ID|CLIENT_SECRET)\s*=\s*['\"]?[^'\"\s]+" \
  --exclude-dir=node_modules --exclude-dir=.git . || true
```

CI (GitHub Actions) — regla mínima:
- Step que ejecute los grep anteriores; si hay resultados → `exit 1` + comentario con `RAG ALERT`.

### 2) MCP — enforce de identidad
- `services/mcp.smarterbot.cl/.env` debe incluir `RAG_IDENTITY=smarterbotcl@gmail.com`.
- Logs deben incluir `[RAG-AUDIT:SMARTERBOTCL]` y `RAG_IDENTITY`.
- Validar que cualquier integración Google use ese contexto.

### 3) Vault
- Tras el deploy inicial con `.env` en VPS, migrar a Vault:
  - Path sugerido: `secret/data/mcp/google`
  - Policies: solo lectura por el servicio MCP.
  - Rotación: Refresh Token y Client Secret según política trimestral.

## Políticas de repositorio
- Nunca commitear `.env` ni credenciales.
- Prohibidos correos personales o de pruebas.
- PR checklist:
  - [ ] ¿Aparece algún correo ≠ `smarterbotcl@gmail.com`?
  - [ ] ¿Se filtró algún secreto?
  - [ ] ¿Se actualizó la doc si cambió el flujo de identidad?

## Respuesta ante incidentes
- Alerta: `RAG ALERT: Unauthorized identity reference detected.`
- Acciones:
  1) Bloquear merge/deploy (si aplica).
  2) Abrir issue con contexto del hallazgo y paths.
  3) Remediar (reemplazo, borrado, reemisión de tokens si hubo exposición).
  4) Post-mortem corto y actualización de reglas si corresponde.

## Checklist de despliegue (MCP)
- VPS `.env`:
  - `GOOGLE_CLIENT_ID`/`SECRET`/`REFRESH_TOKEN` → emitidos para `smarterbotcl@gmail.com`.
  - `GOOGLE_REDIRECT_URI=https://mcp.smarterbot.cl/oauth2/callback`.
  - `RAG_IDENTITY=smarterbotcl@gmail.com`.
- Despliegue:
  - `scripts/smos deploy mcp` → verificar `/health`.
- Post-deploy:
  - Migrar secretos a Vault y retirar `.env` plano cuanto antes.
  - Activar tarea RAG diaria (CI o cron en VPS) y publicar resultados en `smarteros.audit.identity`.
