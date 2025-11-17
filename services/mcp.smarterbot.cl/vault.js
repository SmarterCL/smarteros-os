// Simple Vault client using AppRole + KV v2 via native fetch (Node 20)

const VAULT_ADDR = process.env.VAULT_ADDR

export async function vaultLoginWithAppRole(roleId, secretId) {
  if (!VAULT_ADDR) throw new Error('VAULT_ADDR is required')
  const url = new URL('/v1/auth/approle/login', VAULT_ADDR)
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role_id: roleId, secret_id: secretId })
  })
  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`Vault AppRole login failed: ${resp.status} ${text}`)
  }
  const data = await resp.json()
  return data?.auth?.client_token
}

export async function vaultReadKV2(path, token) {
  if (!VAULT_ADDR) throw new Error('VAULT_ADDR is required')
  const url = new URL(`/v1/secret/data/${path}`, VAULT_ADDR)
  const resp = await fetch(url, {
    headers: { 'X-Vault-Token': token }
  })
  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`Vault read failed (${path}): ${resp.status} ${text}`)
  }
  const json = await resp.json()
  return json?.data?.data || {}
}
