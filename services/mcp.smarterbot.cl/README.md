# mcp.smarterbot.cl (MCP Server mínimo)

Servicio HTTP mínimo que expone herramientas ("MCP tools") como endpoints REST y maneja webhooks desde Chatwoot.

- `POST /tools/google.contacts.lookup` → Busca contacto en Google Contacts (People API)
- `POST /webhook/chatwoot` → Recibe eventos de Chatwoot (message_created, conversation_created, etc.) con verificación HMAC

> Nota: Este servidor no implementa el wire del protocolo MCP-WebSocket; provee endpoints HTTP pensados para las automations de Chatwoot y para orquestación. Puedes envolverlo en un MCP formal más adelante si lo requieres.

## Zero-Trust (Vault + AppRole)

El servidor arranca con `.env` mínimo y obtiene secretos desde Vault en runtime.

`.env` (mínimo):
```
VAULT_ADDR=https://vault.smarterbot.cl
VAULT_ROLE_ID=...
VAULT_SECRET_ID=...
CHATWOOT_WEBHOOK_SECRET=...
PORT=3100
LOG_LEVEL=info
RAG_IDENTITY=smarterbotcl@gmail.com
```

Secretos en Vault (KV v2):
- `secret/mcp/google-oauth` → `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_REDIRECT_URI=https://mcp.smarterbot.cl/oauth2/callback`
- `secret/mcp/chatwoot` → `CHATWOOT_API_TOKEN` (para usos futuros desde MCP)
- `secret/mcp/n8n` → `N8N_API_KEY`

Política Vault sugerida (`mcp`):
```
path "secret/data/mcp/*" {
  capabilities = ["read", "list"]
}
```

## Uso local

```bash
cd services/mcp.smarterbot.cl
cp .env.example .env
pnpm i --ignore-scripts
pnpm dev
# GET http://localhost:3100/health → { status: 'ok', service: 'mcp-smarterbot' }
```

Probar tool:
```bash
curl -s -X POST http://localhost:3100/tools/google.contacts.lookup \
  -H 'Content-Type: application/json' \
  -d '{ "email": "juan@example.com" }' | jq
```

## Seguridad Webhook (Chatwoot → MCP)
- Configura `CHATWOOT_WEBHOOK_SECRET` en `.env` (no en Git).
- Chatwoot debe firmar el body con HMAC-SHA256.
- MCP valida `X-Chatwoot-Signature` antes de procesar. Si no coincide → 401.

## Despliegue en VPS (Dokploy)
- Compose: `dkcompose/mcp.smarterbot.cl.yml` (Traefik + TLS, redes pública/interna)
- Deploy: `scripts/smos deploy mcp`

## Chatwoot Automations
Importa `docs/chatwoot-smarteros-automation.json`.

- Enriquecimiento Google Contacts al crear conversación (WhatsApp)
- Clasificación de intención (placeholder)
- Respuesta de bienvenida (tenant)
