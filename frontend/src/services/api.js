// Backend URL:
//   - Local dev: Vite proxy handles /api → localhost:3001
//   - Production: set VITE_BACKEND_URL in Vercel env vars
const BASE = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}`
  : ''   // empty = relative path (Vite proxy in dev)

export async function sendToATC({ pilotText, scenarioId, history = [] }) {
  const res = await fetch(`${BASE}/api/atc`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pilotText, scenarioId, history }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Server error ${res.status}`)
  }

  return res.json()
  // Returns: { atcText, feedback, audioBase64, audioMime, updatedHistory }
}

export async function healthCheck() {
  const res = await fetch(`${BASE}/`)
  return res.json()
}

// Keep-alive: ping backend every 14 minutes so Render free tier stays awake
// Call this once from App.jsx on mount
export function startKeepAlive() {
  const BACKEND = import.meta.env.VITE_BACKEND_URL || '';
  if (!BACKEND) return; // dev mode — no need
  const ping = () => fetch(`${BACKEND}/ping`).catch(() => {});
  ping(); // immediate ping on load
  return setInterval(ping, 14 * 60 * 1000); // every 14 minutes
}
