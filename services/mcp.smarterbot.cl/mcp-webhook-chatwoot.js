import pino from 'pino'
const logger = pino({ level: process.env.LOG_LEVEL || 'info' })

// Handler básico para eventos de Chatwoot
// Referencia: https://www.chatwoot.com/developers/webhooks
export async function chatwootWebhookHandler(req, res) {
  try {
    const event = req.body?.event
    logger.info({ event, ragIdentity: process.env.RAG_IDENTITY, tag: '[RAG-AUDIT:SMARTERBOTCL]' }, 'Chatwoot webhook recibido')

    switch (event) {
      case 'message_created': {
        return res.json({ ok: true })
      }
      case 'conversation_created': {
        return res.json({ ok: true })
      }
      case 'contact_updated': {
        return res.json({ ok: true })
      }
      default: {
        return res.json({ ok: true, note: 'event not handled' })
      }
    }
  } catch (err) {
    logger.error({ err }, 'webhook error')
    return res.status(500).json({ ok: false, error: err.message })
  }
}
