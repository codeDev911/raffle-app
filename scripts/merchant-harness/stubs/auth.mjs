// Stub of @/lib/auth for the node harness (only session helpers are used by lib/merchants/session).
export async function encrypt(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url")
}

export async function decrypt(token) {
  try {
    return JSON.parse(Buffer.from(String(token), "base64url").toString("utf8"))
  } catch {
    return null
  }
}

export async function getSession() {
  return null
}
