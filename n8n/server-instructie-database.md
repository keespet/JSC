# Serverinstructie – Database voor JSC-app (NocoDB + PostgreSQL)

**Voor:** de beheerder van onze eigen server (`aimza.nl`)
**Doel:** een self-hosted, open-source database naast onze bestaande n8n plaatsen,
zodat de trainingsschema's uit de JSC-app duurzaam worden opgeslagen én
bekeken kunnen worden.

---

## 1. Context (wat er al draait)

- Op de server draait al **n8n** op `https://n8n.aimza.nl` (Docker).
- Er staat een actieve workflow **"JSC – Schema opslaan"** die via een webhook
  (`POST /webhook/jsc-schema`) de formuliergegevens ontvangt.
- Op dit moment landt die data alleen in de **n8n Executions-log** (tijdelijk,
  wordt automatisch opgeruimd). We willen dit vervangen door een echte database.
- **Belangrijk:** deze n8n blokkeert schrijven naar het lokale bestandssysteem
  (`N8N_RESTRICT_FILE_ACCESS`). De opslag moet dus via een database/API lopen,
  niet via bestanden op schijf.

## 2. Wat we willen (gewenste eindsituatie)

Een open-source **NocoDB** (Airtable-achtige tabel-UI) met een **PostgreSQL**
database eronder, in Docker, náást n8n. n8n schrijft elke inzending als een rij
in een tabel; wij kunnen de schema's in de browser bekijken, filteren en
exporteren.

```
JSC-app  →  n8n webhook (bestaat al)  →  NocoDB "Create record"  →  PostgreSQL
                                                     ↑
                              wij bekijken de data in de NocoDB-UI
```

## 3. Te installeren: NocoDB + PostgreSQL (Docker Compose)

Graag onderstaande als aparte compose-stack (of toevoegen aan de bestaande),
op een eigen Docker-netwerk **dat n8n kan bereiken**.

```yaml
services:
  nocodb-db:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_DB: nocodb
      POSTGRES_USER: nocodb
      POSTGRES_PASSWORD: "VERVANG_DOOR_STERK_WACHTWOORD"
    volumes:
      - nocodb_db_data:/var/lib/postgresql/data
    networks:
      - jsc

  nocodb:
    image: nocodb/nocodb:latest
    restart: unless-stopped
    depends_on:
      - nocodb-db
    environment:
      NC_DB: "pg://nocodb-db:5432?u=nocodb&p=VERVANG_DOOR_STERK_WACHTWOORD&d=nocodb"
      # Publieke URL waarop de NocoDB-UI bereikbaar wordt (voor de reverse proxy):
      NC_PUBLIC_URL: "https://nocodb.aimza.nl"
    ports:
      - "8080:8080"   # eventueel weglaten als alles via de reverse proxy loopt
    volumes:
      - nocodb_data:/usr/app/data
    networks:
      - jsc

volumes:
  nocodb_db_data:
  nocodb_data:

networks:
  jsc:
    driver: bridge
```

### Netwerk (belangrijk)
n8n moet NocoDB **intern** kunnen bereiken. Zorg dat de n8n-container en de
`nocodb`-container op **hetzelfde Docker-netwerk** zitten, zodat n8n NocoDB kan
benaderen via `http://nocodb:8080`. (Als n8n in een andere compose-stack draait:
voeg het `jsc`-netwerk als `external` toe aan de n8n-service.)

### Reverse proxy / HTTPS
Graag de NocoDB-UI achter HTTPS zetten op een subdomein, bijv.
**`https://nocodb.aimza.nl`** (zelfde aanpak als n8n). De UI is met een account
beveiligd; de eerste keer inloggen maakt het admin-account aan.

### Beveiliging
- **PostgreSQL niet publiek** exposen (alleen intern op het Docker-netwerk).
- Sterke wachtwoorden gebruiken (de `VERVANG_...`-plekken hierboven).
- Reguliere **back-up** van het volume `nocodb_db_data` (daar staat álle data in).

## 4. Eenmalige inrichting in NocoDB

1. Ga naar `https://nocodb.aimza.nl`, maak het admin-account aan.
2. Maak een **Base** (project) aan met de naam: **`JSC`**.
3. Maak daarin een **Table** met de naam: **`schemas`** en de volgende kolommen:

   | Kolomnaam  | Type                        | Toelichting                                  |
   |------------|-----------------------------|----------------------------------------------|
   | `savedAt`  | DateTime (of SingleLineText)| tijdstip van opslaan                         |
   | `athlete`  | SingleLineText              | naam sporter                                 |
   | `date`     | SingleLineText (of Date)    | datum van het schema                         |
   | `phase`    | Number                      | fase (1–6)                                   |
   | `bodyFat`  | SingleLineText              | vetpercentage                                |
   | `payload`  | LongText                    | het volledige formulier als JSON (belangrijk)|

   > `payload` bevat de complete inzending, ook alle oefeningen/slots. De losse
   > kolommen zijn voor snel overzicht/filteren; `payload` is de volledige bron.

4. Maak een **API-token** aan: rechtsboven op je account → **Tokens** →
   *Create new token*. Kopieer de tokenwaarde.

## 5. Wat we van je terug nodig hebben

Stuur ons deze 4 dingen (het token graag via een veilig kanaal):

1. **Interne URL** waarop n8n NocoDB bereikt (verwacht: `http://nocodb:8080`) —
   of bevestiging dat n8n en NocoDB op hetzelfde Docker-netwerk zitten.
2. **Publieke URL** van de NocoDB-UI (verwacht: `https://nocodb.aimza.nl`).
3. Het **API-token** uit stap 4.
4. Bevestiging dat de **Base `JSC`** en **Table `schemas`** bestaan (stap 4).

## 6. Wat wij daarna doen

Wij koppelen in n8n de NocoDB-credential (host + token) en breiden de bestaande
workflow uit met een **"Create record"-node** die naar `JSC → schemas` schrijft.
Daarna wordt elke inzending vanuit de app automatisch als rij in NocoDB
opgeslagen en is die in de UI te bekijken. Aan de app zelf hoeft niets te
veranderen.

---

## Bijlage – Alternatief: kale PostgreSQL (zonder NocoDB-UI)

Wil je liever géén NocoDB en alleen een database? Dan volstaat een PostgreSQL-
container op het gedeelde netwerk. Lever dan terug: host/poort, databasenaam,
gebruiker + wachtwoord, en zorg dat n8n de host kan bereiken. Wij maken dan de
tabel aan en laten n8n er via de Postgres-node naartoe schrijven. Bekijken gaat
dan via een los tool (bijv. Adminer/pgAdmin). NocoDB heeft onze voorkeur omdat
het meteen een bruikbaar overzicht geeft.
```
services:
  jsc-postgres:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_DB: jsc
      POSTGRES_USER: jsc
      POSTGRES_PASSWORD: "VERVANG_DOOR_STERK_WACHTWOORD"
    volumes:
      - jsc_pg_data:/var/lib/postgresql/data
    networks:
      - jsc
volumes:
  jsc_pg_data:
networks:
  jsc:
    driver: bridge
```
