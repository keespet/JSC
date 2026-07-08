const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;
const WEBHOOK_TOKEN = import.meta.env.VITE_N8N_WEBHOOK_TOKEN;

export function isSyncConfigured() {
  return Boolean(WEBHOOK_URL);
}

// Stuurt het volledige formulier naar de n8n-webhook. Gooit bij een niet-ok
// antwoord, zodat de aanroeper een foutmelding aan de gebruiker kan tonen.
export async function sendToN8n(draft) {
  if (!WEBHOOK_URL) {
    throw new Error("Geen n8n-webhook geconfigureerd (VITE_N8N_WEBHOOK_URL ontbreekt).");
  }

  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(WEBHOOK_TOKEN ? { "x-jsc-token": WEBHOOK_TOKEN } : {}),
    },
    body: JSON.stringify({
      savedAt: new Date().toISOString(),
      draft,
    }),
  });

  if (!response.ok) {
    throw new Error(`n8n gaf status ${response.status}`);
  }

  return response.json().catch(() => ({}));
}
