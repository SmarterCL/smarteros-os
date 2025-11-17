# n8n Workflow: smarteros.ocr_classify

**Tag:** `[N8N-WF:OCR]`  
**Descripción:** Procesamiento de imágenes con OCR y clasificación de intención usando lógica condicional (Google Vision API, Document AI, Gemini Vision)

**Trigger:** Chatwoot webhook (message_created con adjunto de imagen)

---

## Nodos del Workflow

### 1. Webhook (Chatwoot → n8n)

**Tipo:** Webhook  
**Método:** POST  
**URL:** `https://n8n.smarterbot.cl/webhook/chatwoot-ocr`  
**Autenticación:** Header `X-Chatwoot-Signature` (HMAC-SHA256)

**Input esperado:**
```json
{
  "event": "message_created",
  "conversation_id": 12345,
  "message_id": 67890,
  "content": "Adjunto factura",
  "attachments": [
    {
      "id": 111,
      "file_type": "image/jpeg",
      "data_url": "https://chatwoot.smarterbot.cl/rails/active_storage/blobs/.../factura.jpg",
      "file_size": 245678
    }
  ],
  "sender": {
    "email": "cliente@example.com",
    "phone": "+56912345678"
  }
}
```

---

### 2. IF - Validar Adjunto

**Tipo:** IF  
**Condición:** `{{ $json.attachments.length > 0 && $json.attachments[0].file_type.startsWith('image/') }}`

**TRUE branch:** Continuar a OCR  
**FALSE branch:** Responder "No se detectó imagen adjunta" → Fin

---

### 3. Download Imagen

**Tipo:** HTTP Request  
**Método:** GET  
**URL:** `{{ $json.attachments[0].data_url }}`  
**Opciones:**
- Response Format: `File`
- Binary Data: `true`

**Output:** `imageBuffer` (buffer binario)

---

### 4. IF - Clasificar Tipo de Documento

**Tipo:** IF  
**Variables:**
```javascript
const fileName = $json.attachments[0].file_name || '';
const fileSize = $json.attachments[0].file_size || 0;
const contentType = $json.attachments[0].file_type;

// Heurística de decisión
const isStructuredDoc = fileName.toLowerCase().includes('factura') 
  || fileName.toLowerCase().includes('form') 
  || fileName.toLowerCase().includes('rut');
  
const isLargeOrComplex = fileSize > 500000 || contentType === 'image/png'; // Screenshots complejos

return {
  method: isStructuredDoc ? 'document_ai' 
    : isLargeOrComplex ? 'gemini_vision' 
    : 'vision_api'
};
```

**Branches:**
- `method === 'document_ai'` → Nodo 5A
- `method === 'gemini_vision'` → Nodo 5C
- `method === 'vision_api'` → Nodo 5B (default)

---

### 5A. Google Document AI (Form Parser)

**Tipo:** HTTP Request  
**Método:** POST  
**URL:** `https://documentai.googleapis.com/v1/projects/{{ $credentials.googleCloud.projectId }}/locations/us/processors/{{ $credentials.googleCloud.formProcessorId }}:process`  
**Headers:**
- `Authorization: Bearer {{ $credentials.googleServiceAccount.token }}`
- `Content-Type: application/json`

**Body:**
```json
{
  "rawDocument": {
    "content": "{{ $binary.data.toString('base64') }}",
    "mimeType": "{{ $json.attachments[0].file_type }}"
  }
}
```

**Output mapping:**
```javascript
const doc = $response.json.document;
const text = doc.text;
const entities = doc.entities || [];

// Extraer campos estructurados
const fields = entities.reduce((acc, entity) => {
  acc[entity.type] = entity.mentionText;
  return acc;
}, {});

return {
  extracted_text: text,
  structured_fields: fields,
  ocr_method: 'document_ai',
  confidence: doc.pages?.[0]?.detectedLanguages?.[0]?.confidence || 0
};
```

---

### 5B. Google Vision API (TEXT_DETECTION)

**Tipo:** HTTP Request  
**Método:** POST  
**URL:** `https://vision.googleapis.com/v1/images:annotate`  
**Headers:**
- `Authorization: Bearer {{ $credentials.googleServiceAccount.token }}`
- `Content-Type: application/json`

**Body:**
```json
{
  "requests": [
    {
      "image": {
        "content": "{{ $binary.data.toString('base64') }}"
      },
      "features": [
        {
          "type": "TEXT_DETECTION",
          "maxResults": 1
        }
      ]
    }
  ]
}
```

**Output mapping:**
```javascript
const response = $response.json.responses[0];
const text = response.textAnnotations?.[0]?.description || '';
const locale = response.textAnnotations?.[0]?.locale || 'es';

return {
  extracted_text: text,
  ocr_method: 'vision_api',
  language: locale
};
```

---

### 5C. Gemini Vision (Multimodal LLM)

**Tipo:** HTTP Request  
**Método:** POST  
**URL:** `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent`  
**Headers:**
- `Authorization: Bearer {{ $credentials.googleServiceAccount.token }}`
- `Content-Type: application/json`

**Body:**
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Extrae TODO el texto visible en esta imagen. Si es una factura, identifica: monto total, fecha, proveedor. Si es un formulario, lista todos los campos. Responde solo con el texto extraído, sin explicaciones."
        },
        {
          "inlineData": {
            "mimeType": "{{ $json.attachments[0].file_type }}",
            "data": "{{ $binary.data.toString('base64') }}"
          }
        }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 0.1,
    "maxOutputTokens": 2048
  }
}
```

**Output mapping:**
```javascript
const candidate = $response.json.candidates[0];
const text = candidate.content.parts[0].text;
const finishReason = candidate.finishReason;

return {
  extracted_text: text,
  ocr_method: 'gemini_vision',
  finish_reason: finishReason
};
```

---

### 6. Merge OCR Outputs

**Tipo:** Merge  
**Fuentes:** Nodo 5A, 5B, 5C (salida de cualquiera de los branches)

**Output consolidado:**
```javascript
return {
  conversation_id: $('Webhook').item.json.conversation_id,
  message_id: $('Webhook').item.json.message_id,
  extracted_text: $json.extracted_text,
  ocr_method: $json.ocr_method,
  structured_fields: $json.structured_fields || {},
  timestamp: new Date().toISOString()
};
```

---

### 7. IF - Requiere Clasificación LLM

**Tipo:** IF  
**Condición:**
```javascript
const text = $json.extracted_text;
const needsLLM = text.length > 500 
  || /quiero|necesito|solicito|urgente|problema|error/i.test(text);

return { needs_llm: needsLLM };
```

**TRUE branch:** Nodo 8A (Gemini LLM)  
**FALSE branch:** Nodo 8B (Keywords)

---

### 8A. Gemini LLM - Clasificar Intención

**Tipo:** HTTP Request  
**Método:** POST  
**URL:** `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent`  
**Headers:**
- `Authorization: Bearer {{ $credentials.googleServiceAccount.token }}`
- `Content-Type: application/json`

**Body:**
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Clasifica la siguiente solicitud en UNA de estas categorías: soporte_tecnico, consulta_producto, facturacion, reclamo, otro.\n\nResponde SOLO con la categoría, sin explicaciones.\n\nTexto:\n\"{{ $json.extracted_text }}\""
        }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 0.0,
    "maxOutputTokens": 20
  }
}
```

**Output mapping:**
```javascript
const intent = $response.json.candidates[0].content.parts[0].text.trim().toLowerCase();

return {
  intent,
  classification_method: 'gemini_llm'
};
```

---

### 8B. Keyword Matching (Simple)

**Tipo:** Function  
**Código:**
```javascript
const text = $json.extracted_text.toLowerCase();
let intent = 'otro';

if (/factura|pago|cobro|boleta/i.test(text)) {
  intent = 'facturacion';
} else if (/error|falla|problema|no funciona|bug/i.test(text)) {
  intent = 'soporte_tecnico';
} else if (/precio|costo|cotizar|cuanto cuesta/i.test(text)) {
  intent = 'consulta_producto';
} else if (/reclamo|queja|devolucion|reembolso/i.test(text)) {
  intent = 'reclamo';
}

return {
  intent,
  classification_method: 'keywords'
};
```

---

### 9. Merge Classification Outputs

**Tipo:** Merge  
**Fuentes:** Nodo 8A, 8B

**Output consolidado:**
```javascript
return {
  conversation_id: $('Merge OCR Outputs').item.json.conversation_id,
  message_id: $('Merge OCR Outputs').item.json.message_id,
  extracted_text: $('Merge OCR Outputs').item.json.extracted_text,
  ocr_method: $('Merge OCR Outputs').item.json.ocr_method,
  intent: $json.intent,
  classification_method: $json.classification_method,
  timestamp: new Date().toISOString(),
  rag_identity: 'smarterbotcl@gmail.com'
};
```

---

### 10. POST a MCP (Actualizar Conversación)

**Tipo:** HTTP Request  
**Método:** POST  
**URL:** `https://mcp.smarterbot.cl/tools/chatwoot.update_conversation`  
**Headers:**
- `Content-Type: application/json`
- `X-Chatwoot-Signature: {{ $credentials.chatwoot.hmacSecret }}`
- `X-SMOS-Identity: smarterbotcl@gmail.com`

**Body:**
```json
{
  "conversation_id": {{ $json.conversation_id }},
  "custom_attributes": {
    "ocr_text": "{{ $json.extracted_text.substring(0, 500) }}",
    "ocr_method": "{{ $json.ocr_method }}",
    "intent": "{{ $json.intent }}",
    "classification_method": "{{ $json.classification_method }}"
  }
}
```

---

### 11. Responder en Chatwoot

**Tipo:** HTTP Request  
**Método:** POST  
**URL:** `https://api.chatwoot.smarterbot.cl/api/v1/accounts/{{ $credentials.chatwoot.accountId }}/conversations/{{ $json.conversation_id }}/messages`  
**Headers:**
- `api_access_token: {{ $credentials.chatwoot.apiToken }}`
- `Content-Type: application/json`

**Body:**
```json
{
  "content": "✅ Imagen procesada.\n\n📄 **Texto extraído:** {{ $json.extracted_text.substring(0, 200) }}...\n\n🎯 **Intención detectada:** {{ $json.intent }}\n\n🔬 **Método:** {{ $json.ocr_method }} + {{ $json.classification_method }}",
  "message_type": "outgoing",
  "private": false
}
```

---

### 12. Log Auditoría (Redpanda)

**Tipo:** HTTP Request  
**Método:** POST  
**URL:** `https://kafka.smarterbot.cl/topics/smarteros.audit.ocr`  
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {{ $credentials.redpanda.apiToken }}`

**Body:**
```json
{
  "key": "{{ $json.conversation_id }}",
  "value": {
    "event": "ocr_processed",
    "conversation_id": {{ $json.conversation_id }},
    "message_id": {{ $json.message_id }},
    "ocr_method": "{{ $json.ocr_method }}",
    "classification_method": "{{ $json.classification_method }}",
    "intent": "{{ $json.intent }}",
    "text_length": {{ $json.extracted_text.length }},
    "timestamp": "{{ $json.timestamp }}",
    "rag_identity": "smarterbotcl@gmail.com",
    "tag": "[RAG-AUDIT:SMARTERBOTCL]"
  }
}
```

---

## Configuración de Credenciales en n8n

### Google Service Account (googleServiceAccount)

**Tipo:** Google Service Account  
**Scopes:**
- `https://www.googleapis.com/auth/cloud-platform`
- `https://www.googleapis.com/auth/cloud-vision`

**JSON Key:** Leer desde Vault (`secret/n8n/google-sa`)

### Chatwoot (chatwoot)

**Tipo:** Header Auth  
**Fields:**
- `accountId`: ID de cuenta Chatwoot
- `apiToken`: Token de API Chatwoot (Vault: `secret/mcp/chatwoot`)
- `hmacSecret`: Secreto HMAC para webhooks (mismo que MCP)

### Redpanda (redpanda)

**Tipo:** Header Auth  
**Fields:**
- `apiToken`: Token de Redpanda HTTP API
- `brokers`: `kafka.smarterbot.cl:9092`

---

## Métricas y Monitoring

**KPIs:**
- **Latencia promedio:** < 5s (Vision API) | < 10s (Document AI) | < 15s (Gemini Vision)
- **Accuracy de clasificación:** > 85% (validado con set de 100 imágenes de prueba)
- **Costo por imagen:**
  - Vision API: $0.0015/imagen
  - Document AI: $0.05/página
  - Gemini Vision: $0.00030/imagen (incluye input text + output)
- **Throughput:** max 10 imágenes/min (rate limit de Vision API)

**Alertas:**
- Si error rate > 5% en 1 hora → Slack #alerts
- Si costo mensual > $500 → email a `smarterbotcl@gmail.com`
- Si latencia > 30s → revisar timeout de n8n (default 300s)

---

## Testing

**Casos de prueba:**
1. **Factura chilena:** imagen JPEG 800x600, texto simple → Vision API → intent `facturacion`
2. **Formulario RUT:** PDF convertido a imagen → Document AI → campos estructurados (nombre, RUT, dirección)
3. **Screenshot con handwriting:** PNG 1920x1080 → Gemini Vision → texto manuscrito + intent `reclamo`
4. **Imagen sin texto:** foto de producto → Gemini Vision → descripción del producto
5. **Imagen corrupta:** archivo dañado → error handling → respuesta en Chatwoot "Imagen no válida"

**Comandos de prueba (curl):**
```bash
# Simular webhook desde Chatwoot
curl -X POST https://n8n.smarterbot.cl/webhook/chatwoot-ocr \
  -H "Content-Type: application/json" \
  -H "X-Chatwoot-Signature: $(echo -n '{"event":"message_created",...}' | openssl dgst -sha256 -hmac "$CHATWOOT_WEBHOOK_SECRET" | awk '{print $2}')" \
  -d '{
    "event": "message_created",
    "conversation_id": 12345,
    "message_id": 67890,
    "attachments": [
      {
        "file_type": "image/jpeg",
        "data_url": "https://example.com/test-invoice.jpg",
        "file_size": 200000
      }
    ]
  }'
```

---

**Próximo paso:** Importar este workflow en n8n (JSON export) y probar con imágenes reales de Chatwoot.
