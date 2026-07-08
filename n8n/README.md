# n8n – Schema opslaan

Workflow die het JSC-formulier ontvangt, het token controleert en de inzending
bewaart. **Staat live en actief** op `https://n8n.aimza.nl` (workflow-id
`gvJkXVdnwpWiMGwU`), aangemaakt via de n8n API.

## Flow

```
Webhook (POST /webhook/jsc-schema)
      → Token geldig?  ──ja──> Formulierdata bewaren → Antwoord 200 {"ok":true,"stored":true}
                        └nee─> Antwoord 401 {"ok":false,"error":"unauthorized"}
```

- **Token**: de app stuurt header `x-jsc-token`; die wordt vergeleken met de
  waarde in de node *Token geldig?* (nu hardcoded, zelfde als
  `VITE_N8N_WEBHOOK_TOKEN` in `.env.local`).
- **CORS**: geregeld door de Webhook-node (`allowedOrigins: *`), preflight
  getest en werkend.

## Waar staat de data nu?

Elke inzending wordt bewaard in de **Executions-log** van n8n (Executions →
workflow "JSC – Schema opslaan"). De volledige `draft` is daar per uitvoering
te bekijken. Reden: schrijven naar schijf is op deze server geblokkeerd
(`N8N_RESTRICT_FILE_ACCESS`), dus lokale JSON-bestanden zijn geen optie.

> Let op: n8n kan oude executions opruimen (pruning). Voor langdurige/echt
> bruikbare opslag → koppel een externe bestemming (hieronder).

## Upgraden naar een echte bestemming (Google Sheets / database)

Voeg tussen *Formulierdata bewaren* en *Antwoord 200* een opslag-node toe:

- **Google Sheets** → *Append row* (mooiste voor een trainer: open/filter/deel)
- **Postgres / MySQL** → *Insert*
- **Airtable** → *Create record*

Deze nodes hebben een **credential** nodig die je één keer in de n8n-UI
koppelt (OAuth-login of API-key). Dat kan ik niet op afstand voor je doen.
Geef aan welke bestemming je wilt en koppel de credential, dan bouw ik die
node erin.

## Testen

```bash
curl -X POST https://n8n.aimza.nl/webhook/jsc-schema \
  -H "Content-Type: application/json" \
  -H "x-jsc-token: <JSC_WEBHOOK_TOKEN>" \
  -d '{"savedAt":"2026-07-08T10:00:00Z","draft":{"athlete":"Test"}}'
```

Verwacht: `{"ok":true,"stored":true}`. Met een fout token: `401`.

## Bestand

`jsc-schema-workflow.json` is een kopie van wat er live staat en kun je
opnieuw importeren via **Workflows → ⋯ → Import from File**.
