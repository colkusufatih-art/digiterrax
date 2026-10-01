# DIGITERRA Website und Client Portal

Zwei Teile in einem Projekt:

- **Website** (`index.html`, `assets/`): One-Page-Website mit scroll-gesteuertem 3D-Hero (WebGL). Reines HTML, CSS und JavaScript.
- **Client Portal** (`portal/`): geschützter Kundenbereich unter `/portal` mit eigenen Konten. Kunden lesen und laden dort Produktdokumentation, Interfaces & APIs, Operations-Unterlagen, Helm Charts und SIX-eBill-Dokumentation. Sprache: Englisch.

Ein kleiner Node.js-Server liefert beides aus: die Website unter `/`, das Portal unter `/portal`.

## Lokal starten

Voraussetzung: Node.js 24 oder neuer.

```bash
cd portal
npm install
npm start
```

Danach http://localhost:5180 (Website) und http://localhost:5180/portal (Portal) öffnen.

Nur die Website ohne Portal geht weiterhin mit jedem statischen Server, zum Beispiel `npx http-server . -p 5173 -c-1`.

## Konten verwalten

Konten legt ihr an, Kunden registrieren sich nicht selbst. Neue Konten bekommen ein Einmal-Passwort, das beim ersten Login geändert werden muss.

Erstes Administratorkonto anlegen:

```bash
cd portal
npm run user:create -- --email vorname.nachname@crealogix.com --name "Vorname Nachname" --company DIGITERRA --role admin
```

Danach verwalten Administratoren alle Konten im Portal unter **Users**: anlegen, Passwort zurücksetzen, sperren und entsperren. Ein Passwort lässt sich auch per Kommandozeile zurücksetzen:

```bash
npm run user:reset -- --email kunde@bank.ch
```

## Dokumente hinzufügen

Dateien kommen in `portal/content/<rubrik>/` und erscheinen sofort im Portal. Details stehen in [portal/content/README.md](portal/content/README.md).

- Markdown (`.md`) wird als Seite angezeigt.
- PDFs öffnen im Browser.
- Alle anderen Dateien (OpenAPI, Helm `.tgz`, ZIP, Office) werden zum Download angeboten.

## Sicherheit

- Passwörter werden mit scrypt gehasht, nie im Klartext gespeichert. Mindestlänge 12 Zeichen.
- Nach 5 Fehlversuchen pro Konto (oder 30 pro Adresse) ist die Anmeldung 15 Minuten gesperrt.
- Sitzungen laufen nach 2 Stunden Inaktivität und spätestens nach 12 Stunden ab. Sitzungs-IDs liegen nur gehasht in der Datenbank.
- Formulare sind gegen CSRF geschützt, fremde Origins werden abgewiesen.
- Strikte Content-Security-Policy im Portal, keine Seiten im Cache.
- Dokumente sind nur über die Portal-Liste erreichbar, Pfade ausserhalb der Rubrik-Ordner sind unmöglich.
- Anmeldungen, Aufrufe und Downloads landen im Audit-Log (`audit_log` in der Datenbank).

## Betrieb

Das Projekt läuft als Container:

```bash
docker build -t digiterra-web .
docker run -p 8080:8080 -v digiterra-data:/data digiterra-web
```

| Variable | Bedeutung | Standard |
|---|---|---|
| `PORT` | Port des Servers | `8080` im Container, sonst `5180` |
| `DATA_DIR` | Ordner für die SQLite-Datenbank (Konten, Sitzungen, Audit-Log). Muss dauerhaft gespeichert werden. | `/data` im Container |
| `CONTENT_DIR` | Ordner mit den Dokumenten | `portal/content` |
| `TRUST_PROXY` | Hinter einem Reverse Proxy oder Ingress setzen, z. B. `1` | aus |
| `COOKIE_SECURE` | Cookies nur über HTTPS senden | an im Container |
| `SESSION_IDLE_MINUTES`, `SESSION_MAX_HOURS` | Sitzungsdauer | `120`, `12` |

Wichtig für den Livegang:

- Das Portal muss über **HTTPS** laufen.
- Das Datenverzeichnis (`/data`) braucht ein dauerhaftes Volume und ein Backup.
- Die Datenbank ist für **eine** Instanz ausgelegt. Für mehrere Instanzen später auf eine gemeinsame Datenbank wechseln.
- Passwort-vergessen per E-Mail gibt es noch nicht. Bis dahin setzt ein Administrator das Passwort zurück.

## Vor dem Livegang der Website

- `og:image` und `og:url` in `index.html` (Kommentar `DEPLOY STEP`) auf die absolute Live-URL setzen.
- Das Kontaktformular öffnet eine E-Mail an info@crealogix.com (mailto).

Die abstrakten 3D-Visualisierungen sind mit KI erstellt (Higgsfield, Nano Banana Pro).
