import { google } from 'googleapis'
import { getSecrets } from './secrets.js'

function getOAuth2Client() {
  const { google: googleSecrets } = getSecrets()
  const CLIENT_ID = googleSecrets?.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
  const CLIENT_SECRET = googleSecrets?.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET
  const REFRESH_TOKEN = googleSecrets?.GOOGLE_REFRESH_TOKEN || process.env.GOOGLE_REFRESH_TOKEN
  const REDIRECT_URI = googleSecrets?.GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI

  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error('Faltan credenciales de Google (Vault/env)')
  }
  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob'
  )
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })
  return oauth2Client
}

function normalizePerson(p) {
  const names = p.names?.[0]
  const emails = p.emailAddresses?.map(e => e.value) || []
  const phones = p.phoneNumbers?.map(p => p.value) || []
  const orgs = p.organizations?.map(o => ({ name: o.name, title: o.title })) || []
  const memberships = p.memberships?.map(m => m.contactGroupMembership?.contactGroupId) || []
  return {
    resourceName: p.resourceName,
    etag: p.etag,
    name: names?.displayName || names?.unstructuredName || null,
    givenName: names?.givenName || null,
    familyName: names?.familyName || null,
    emails,
    phones,
    organizations: orgs,
    groups: memberships
  }
}

export async function googleContactsLookup({ phone, email, name }) {
  const auth = getOAuth2Client()
  const people = google.people({ version: 'v1', auth })
  const query = phone || email || name
  const readMask = 'names,emailAddresses,phoneNumbers,organizations,memberships'

  const resp = await people.people.searchContacts({
    query,
    pageSize: 10,
    readMask
  })

  const results = resp.data.results || []
  const contacts = results
    .map(r => r.person)
    .filter(Boolean)
    .map(normalizePerson)

  // Simple heurística de mejor match
  let best = contacts[0] || null
  if (phone && contacts.length) {
    best = contacts.find(c => c.phones?.some(v => v.includes(phone))) || best
  }
  if (email && contacts.length) {
    best = contacts.find(c => c.emails?.some(v => v.toLowerCase() === email.toLowerCase())) || best
  }

  return { best, candidates: contacts }
}
