let secretsCache = {
  google: null,
  chatwoot: null,
  n8n: null
}

export function setSecrets(newSecrets) {
  secretsCache = { ...secretsCache, ...newSecrets }
}

export function getSecrets() {
  return secretsCache
}
