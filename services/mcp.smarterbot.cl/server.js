import express from 'express'
import morgan from 'morgan'
import pino from 'pino'
import crypto from 'crypto'
import { googleContactsLookup } from './mcp-tool-google-contacts.js'
import { chatwootWebhookHandler } from './mcp-webhook-chatwoot.js'
import { vaultLoginWithAppRole, vaultReadKV2 } from './vault.js'
import { setSecrets } from './secrets.js'

const app = express()
const logger = pino({ level: process.env.LOG_LEVEL || 'info' })

// Keep raw body for HMAC verification
app.use(express.json({
  limit: '1mb',
  verify: (req, res, buf) => {
    req.rawBody = buf
  }
}))
app.use(morgan('tiny'))

app.get('/health', (req, res) => {
  return res.json({ status: 'ok', service: 'mcp-smarterbot' })
})

// Secrets bootstrap from Vault
async function loadSecretsFromVault() {
  const roleId = process.env.VAULT_ROLE_ID
  const secretId = process.env.VAULT_SECRET_ID
  if (!process.env.VAULT_ADDR || !roleId || !secretId) {
    logger.warn('Vault env incomplete; running without external secrets')
    return
  }
  try {
    const token = await vaultLoginWithAppRole(roleId, secretId)
    const google = await vaultReadKV2('mcp/google-oauth', token)
    const chatwoot = await vaultReadKV2('mcp/chatwoot', token)
    const n8n = await vaultReadKV2('mcp/n8n', token)
    setSecrets({ google, chatwoot, n8n })
    logger.info({ googleKeys: Object.keys(google) }, 'Secrets loaded from Vault')
  } catch (err) {
    logger.error({ err }, 'Failed to load secrets from Vault')
  }
}

// Initial load and periodic refresh
await loadSecretsFromVault()
setInterval(loadSecretsFromVault, 10 * 60 * 1000)

// MCP Tools
app.post('/tools/google.contacts.lookup', async (req, res) => {
  try {
    const { phone, email, name } = req.body || {}
    if (!phone && !email && !name) {
      return res.status(400).json({ error: 'phone, email o name requerido' })
    }
    const result = await googleContactsLookup({ phone, email, name })
    return res.json({ ok: true, data: result })
  } catch (err) {
    logger.error({ err }, 'google.contacts.lookup failed')
    return res.status(500).json({ ok: false, error: err.message })
  }
})

// Chatwoot ↔ MCP webhook with HMAC verification wrapper
function verifyChatwootHmac(req, res, next) {
  const secret = process.env.CHATWOOT_WEBHOOK_SECRET
  const signature = req.get('X-Chatwoot-Signature')
  if (!secret || !signature) {
    return res.status(401).json({ ok: false, error: 'unauthorized' })
  }
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(req.rawBody || '')
  const digest = hmac.digest('hex')
  if (digest !== signature) {
    return res.status(401).json({ ok: false, error: 'invalid signature' })
  }
  return next()
}

app.post('/webhook/chatwoot', verifyChatwootHmac, chatwootWebhookHandler)

const port = process.env.PORT || 3100
app.listen(port, () => {
  logger.info({ port }, 'MCP Server listening')
})
