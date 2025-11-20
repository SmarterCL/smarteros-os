# Instrucciones para completar SmarterAgent con MCP y WhatsApp

## 1. Agregar Memory (Memoria)
1. Haz clic en el nodo **Agent**
2. Haz clic en el botón **+** junto a "Memory"
3. Selecciona **"Window Buffer Memory"**
4. Configura:
   - Context Window Length: 10

## 2. Agregar Herramientas MCP

### A) GitHub Code Search Tool
1. Haz clic en **Agent** → botón **+** junto a "Tools"
2. Selecciona **"Code Tool"** o **"HTTP Request Tool"**
3. Configura:
   - Name: `github_search`
   - Description: `Search code across GitHub repositories`
   - URL: `https://api.github.com/search/code?q={{ $json.query }}`
   - Method: GET
   - Authentication: None (o agrega GitHub token)

### B) Web Search Tool
1. **Agent** → **+** Tools → **"HTTP Request Tool"**
2. Configura:
   - Name: `web_search`
   - Description: `Search the web for current information`
   - URL: `https://api.tavily.com/search` (o usa Google Custom Search API)

### C) Filesystem Tool
1. **Agent** → **+** Tools → **"Read/Write Files from Disk"**
2. Configura:
   - Name: `read_files`
   - Description: `Read files from workspace`
   - Operation: Read File

## 3. Agregar WhatsApp Webhook

### Opción A: Webhook directo
1. Agrega un nodo **Webhook** al inicio
2. Configura:
   - HTTP Method: POST
   - Path: `whatsapp-webhook`
3. Conecta Webhook → Agent

### Opción B: Usar Evolution API (recomendado)
1. En tu servidor Evolution API, configura webhook:
   ```
   Webhook URL: https://n8n.smarterbot.cl/webhook/whatsapp
   Events: message.received
   ```
2. Agrega nodo **Webhook** en N8N
3. Extrae el mensaje con **Set** node:
   ```javascript
   {{ $json.data.message.conversation || $json.data.message.extendedTextMessage.text }}
   ```

## 4. Actualizar System Message del Agent

Reemplaza el system message con:

```
You are SmarterAgent, an AI assistant with access to powerful tools:

**GitHub Search**: Search code, repositories, and issues across GitHub
**Web Search**: Find current information and recent developments
**Filesystem**: Read and search files in the workspace
**WhatsApp**: You receive messages via WhatsApp webhook

Capabilities:
- Search for code examples and implementations
- Find current events and documentation
- Access local project files
- Respond to WhatsApp messages in real-time

Always:
- Use the appropriate tool for each task
- Be concise and helpful
- Cite sources when using web search
- Format code properly when sharing examples
```

## 5. Configurar modelo GPT-4

En el nodo **OpenAI Model**:
- Model: `gpt-4o` o `gpt-4-turbo`
- Temperature: 0.7
- Max Tokens: 4000

## 6. Activar el Workflow

1. Haz clic en el botón **Active** en la esquina superior derecha
2. Prueba enviando un mensaje por WhatsApp
3. URL del webhook: `https://n8n.smarterbot.cl/webhook/whatsapp-webhook`

## Testing

Prueba con estos mensajes:
- "Busca ejemplos de código React en GitHub"
- "¿Cuáles son las últimas noticias sobre IA?"
- "Lee el archivo README.md"

