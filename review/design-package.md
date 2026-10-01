# DIGITERRA Horizon: Design Package

Tier 2, chained journey. Three 6-second segments, one per product layer, joined into one 18-second scrub.
Language: German, Swiss spelling (ss, no ß). Every line of copy below ships verbatim.

---

## 0. Producer

| Item | Plan |
|---|---|
| Tier | 2, chained journey, 3 segments (about 18 s of footage, about 1000vh of hero scroll) |
| Starting frame | Nano Banana Pro, 16:9, 2k: **2 credits** |
| Video, per segment (6 s, 1080p, no audio) | Seedance 2.0: **54** / Veo 3.1 Fast: **24** / Kling 3.0 Pro: **10.5** |
| Three segments | Seedance 2.0: **162** / Veo 3.1 Fast: **72** / Kling 3.0 Pro: **31.5** |
| Supporting stills | up to 2 × Nano Banana Pro: **up to 4 credits** |
| Total | Seedance 2.0: **168** / Veo 3.1 Fast: **78** / Kling 3.0 Pro: **37.5** |
| Left of 280 after that | 112 / 202 / 242.5 |
| A re-roll costs | one segment's price (54 / 24 / 10.5) |
| Real assets (ship untouched) | DIGITERRA logo (SVG), Vega account mockup, askvega AI mockup |
| Free assets from the approved film | poster, ending frame, one frame per layer for the use-case tabs |
| Mobile | Static hero on phones and reduced motion: the ending frame with the static copy block (section 5). The rest of the page animates everywhere. |

All prices were preflighted with `higgsfield generate cost` (free). Nothing has been spent.

## 0b. Researcher

Buyers: heads of digital, CIOs and product owners at Swiss and German-speaking banks.
Recurring pains, in their words: the core system feels like a corset, they feel tied to one vendor, development is slow ("time to market"), interfaces are missing, and cost comes first. Nearly 9 in 10 banks want APIs to plug in other products. On AI: data protection and control over which providers get access. The deepest fear about any change: customers notice, and the bank is not fully working on Monday.

**The one call to action:** Gespräch vereinbaren.

---

## 1. Brand premise

**Oben neu. Unten stabil.** Every bank stands on a foundation it cannot simply swap: its core banking system. DIGITERRA Horizon puts two layers on top of it. Meridian connects everything, Vega is what customers see. Because the layers are decoupled, the bank can change the top quickly while the foundation stays still. The whole site teaches that one idea, *Entkopplung*: the hero descends through the layers, the diagram separates them, the interactive moment swaps the foundation while the app does not move, and the closing line asks which layer the bank wants to start with.

## 2. Palette (direction now, final values sampled from the approved film)

```css
:root{
  --canvas:#0E1616;        /* DIGITERRA teal-black, never pure black */
  --panel:#142222;         /* cards and raised surfaces */
  --accent:#49ABA5;        /* DIGITERRA teal: CTA, focus, rare emphasis (6.7:1 on canvas) */
  --accent-hover:#62C3BC;  /* 8.8:1 */
  --accent-muted:rgba(73,171,165,.22); /* whisper: borders, glows, particles */
  --text-secondary:#9FB5B3;/* 8.5:1 on canvas */
  --text-primary:#EFF4F4;  /* DIGITERRA pale mint, 16.5:1 */
  --line:#4E7F7B;          /* interactive borders, at least 3:1 (verified at build) */
}
```

Brand carve-out, said out loud: dark teal-black with a teal accent sits close to a banned default look, but here it IS the subject's own world (Digiterra's real brand and the real Vega app). The page earns it with the film's own tones, the node-line signature, and no stock layout.

## 3. Type trio

- **Display:** Outfit 300, 500, 600 (Digiterra's own brand face)
- **Body:** IBM Plex Sans 400, 500
- **Labels:** IBM Plex Mono 400, 500 (API, MCP, layer names, readouts)

## 4. Storyboard and band map

Camera rule for all three segments: a steady straight-down descent, camera tilted about 30 degrees below horizontal, same speed, same grade. Every seam lands inside motion, in dark atmosphere between layers (the seam law).

| Segment | World | Motion | Boundary crossed, lens moment | Final frame |
|---|---|---|---|---|
| 1 · Vega | High in calm teal-black air, a thin translucent sheet of teal light far below | Descends onto and through the sheet | Ripple of light washes over the lens, soft teal blur, a few glints | Mid-descent below the sheet, the thread net faintly visible far below |
| 2 · Meridian | A vast woven net of glowing threads, bright nodes, pulses travelling to the nodes | Continues down, through the net | Threads slide past close to the lens, brief flare, beat of blur | Mid-descent below the net, a massive dark surface with faint light lines appearing far below |
| 3 · Fundament | A vast polished dark stone foundation inlaid with a grid of teal light lines | Slows and comes to rest | none | **Rest:** hovering just above the foundation, surface calm to the horizon, soft teal glow along the horizon, calm dark teal sky above (the settle text lives there) |

Hero side readout (chip, right edge): three nodes labelled VEGA · MERIDIAN · CORE that light up as each layer is passed.

| Band | Range (starting point) | Footage moment | Copy (verbatim) | Entrance |
|---|---|---|---|---|
| 1 | 0.00 to 0.13 | High above, particles drifting, the Vega sheet glowing far below | Kicker: `DIGITERRA Horizon` / H1: **Ihr digitaler Bankkanal. Bereit für jede KI.** | Drift-down (words settle as the descent begins), one-time load ramp |
| 2 | 0.17 to 0.31 | Approaching and passing through the Vega sheet | Kicker: `Schicht 1 · Vega` / **Vega. Was Ihre Kunden sehen.** / Ein Frontend für iOS, Android und Web. In Ihrem Design. | Weave (characters arrive from above and below, like the ripple) |
| 3 | 0.35 to 0.48 | Dark gap, the thread net rising into view | Kicker: `Schicht 2 · Meridian` / **Meridian. Hier läuft alles zusammen.** / Daten und Services aus all Ihren Systemen, gebündelt an einer Stelle. | Scatter (characters gather like signals reaching a node) |
| 4 | 0.52 to 0.64 | Passing through the net, pulses racing along threads | **Offen für jede KI.** / Über das Model Context Protocol binden Sie KI-Anbieter an. Welche, bestimmen Sie. | Grid snap-align (letters slide into line like threads) |
| 5 | 0.68 to 0.82 | Calm below the net, the foundation emerging | Kicker: `Das Fundament` / **Ihr Kernbankensystem bleibt, wo es ist.** / Kein Big Bang. Kein Eingriff in den laufenden Betrieb. | Approach-from-depth (the line grows toward the camera as the ground does) |
| 6 | 0.86 to 1.00 | Arrival, resting above the foundation | **Oben neu. Unten stabil.** / Modernisieren Sie Ihren digitalen Kanal Schritt für Schritt, auf Ihrem bestehenden Kernbankensystem. / [Gespräch vereinbaren] [Horizon entdecken] | Word-by-word rise into a staged settle |

Captions alternate left and right thirds; the settle is centered in the calm sky above the horizon. Final positions follow the delivered footage.

## 5. Static-hero copy block

- Kicker: `DIGITERRA Horizon`
- H1: **Ihr digitaler Bankkanal. Bereit für jede KI.**
- Subline: Oben neu, unten stabil: Horizon modernisiert Ihr Mobile und Web Banking auf Ihrem bestehenden Kernbankensystem.
- CTA: **Gespräch vereinbaren**

## 6. Below-fold outline (verbatim)

Nav: logo · Horizon · Anwendungsfälle · Über uns · [Gespräch vereinbaren]

### S1 · Ausgangslage (statement left, three pain lines on a vertical node line right)
- Kicker: `Die Ausgangslage`
- H2: **Ihre Kunden erwarten mehr. Ihr System gibt den Takt vor.**
- Body: Ihre Kunden vergleichen Ihre Banking-App mit den besten Apps auf ihrem Handy. Sie erwarten Services, die einfach, schnell und jederzeit funktionieren. Ihr Kernbankensystem ist dafür ein stabiles Fundament. Für dieses Tempo wurde es nicht gebaut.
- Lines: Neue Funktionen warten auf den nächsten Release. / Jede neue Anbindung wird zum eigenen Projekt. / Jeder neue KI-Anbieter heisst: wieder von vorne integrieren.
- Image: generated still, a strained knot of dull light threads in the hero's world.

### S2 · Horizon (3D layer stack that separates as you scroll, labels alternating sides)
- Kicker: `DIGITERRA Horizon`
- H2: **Drei Schichten. Jede in ihrem eigenen Tempo.**
- Lede: Horizon legt zwei Schichten über Ihr Kernbankensystem. So bauen Sie oben neu, ohne unten etwas anzufassen.
- `Vega · Das Frontend`: Mobile und Web aus einer Codebasis. Gestaltet nach Ihrem Corporate Design.
- `Meridian · Die Orchestrierung`: Verbindet Ihre Kanäle über bestehende Schnittstellen mit Ihren Systemen. Und öffnet sie für KI.
- `Kernbankensystem · Das Fundament`: Bleibt, wie es ist. Ihre Investitionen bleiben geschützt.

### S3 · Vega (real app screenshot floating in 3D left, text and fact rows right)
- Kicker: `DIGITERRA Vega`
- H2: **Ihre App. In Ihrem Design. Auf jedem Gerät.**
- Body: Vega ist kein starres Standardprodukt. Sie passen Customer Journeys, Oberflächen, Inhalte und Funktionen an Ihre Strategie und Ihr Corporate Design an. Eigene Komponenten und externe Services binden Sie Schritt für Schritt ein.
- Facts: `Basis` Flutter · `Kanäle` iOS, Android, Web · `Codebasis` Eine für alle
- Line: Weniger Entwicklungsaufwand. Neue Funktionen auf allen Kanälen gleichzeitig.

### S4 · Meridian (hub node in the middle, lines draw out to four tiles)
- Kicker: `DIGITERRA Meridian`
- H2: **Die Schicht zwischen Ihrer App und Ihren Systemen.**
- Lede: Statt Ihre App direkt mit vielen Backend-Systemen zu verknüpfen, bündelt Meridian Daten und Services an einer Stelle und bereitet sie passend für das Frontend auf.
- `Entkopplung`: Frontend und Backend entwickeln sich unabhängig voneinander.
- `Orchestrierung`: Daten und Services werden zentral gebündelt und passend aufbereitet.
- `Performance`: Weniger komplexe Backend-Abfragen, schnellere mobile Prozesse.
- `Sicherheit`: Sicherheitsmechanismen greifen an einer zentralen Stelle.

### S5 · KI (askvega screenshot right with its glowing ring, example requests appear as chips left)
- Kicker: `Conversational Banking`
- H2: **Fragen statt suchen.**
- Body: Über das Model Context Protocol (MCP) verbinden Sie kompatible KI-Plattformen mit ausgewählten Funktionen und Daten Ihrer Bank. MCP ist ein offener Standard, unterstützt unter anderem von OpenAI, Anthropic, Google und Microsoft.
- Control line: Sie entscheiden, welche Anwendungsfälle live gehen, welche Daten eine KI sehen darf und in welchem Tempo es weitergeht.
- Example chips: Wie viel habe ich im März ausgegeben? / Zeig mir meine letzten Zahlungen.
- Footnote: `* Mockup`

### S6 · The interactive moment: Der Stossdämpfer (centered 3D layer stack, hold button)
- Kicker: `Probieren Sie es aus`
- H2: **Das Kernbankensystem wechseln. Ohne dass Ihre Kunden es merken.**
- Hint: Halten Sie den Knopf gedrückt.
- Button: `Gedrückt halten zum Wechseln`
- Readout chip while holding: `App: stabil · Kunden betroffen: 0`
- Behaviour: holding slides the old foundation out and a new one in, Meridian's lines flex and absorb, Vega does not move a pixel. Releasing early eases back. Completing lights the readout and reveals the result line.
- Done: **Gewechselt. Ihre App lief die ganze Zeit weiter.**
- Explainer: Meridian wirkt wie ein Stossdämpfer: Es übersetzt zwischen den Systemen, und der digitale Kanal nutzt weiterhin dieselben Schnittstellen.
- Reduced motion: final state shown, no hold needed.

### S7 · Anwendungsfälle (three numbered tabs, detail panel with a frame from the film per tab)
- Kicker: `Anwendungsfälle`
- H2: **Drei Wege zur Modernisierung. Sie wählen den Einstieg.**
- Tab 1 `Frontend erneuern` · **Neue App, bewährtes Fundament.**
  - Szenario: Die Bank will ihren Kunden ein modernes Frontend bieten, ohne das laufende Kernbankensystem anzufassen.
  - Meridian im Einsatz: Meridian verbindet das neue Frontend über bestehende Schnittstellen mit dem Kernbankensystem.
  - Der Effekt: Frontend und Kernbankensystem entwickeln sich unabhängig weiter. Weniger Aufwand, weniger Risiko, kürzere Projekte.
  - Was die Bank gewinnt: Ein modernes Kundenerlebnis auf der bestehenden Systembasis. Investitionen bleiben geschützt.
- Tab 2 `KI anbinden` · **KI anbinden, ohne jedes Mal neu zu bauen.**
  - Szenario: Jeder neue KI-Anbieter bedeutet bisher ein eigenes Integrationsprojekt, mit hohem Entwicklungs- und Wartungsaufwand.
  - Meridian im Einsatz: Meridian macht Banking-Funktionen über einen MCP-Server für kompatible KI-Plattformen zugänglich.
  - Der Effekt: Neue KI-Funktionen lassen sich gezielt testen und schrittweise ausrollen, statt bei null zu starten.
  - Was die Bank gewinnt: Schnellere Markteinführung und mehr Freiheit bei der Wahl künftiger KI-Anbieter.
- Tab 3 `Kernbankensystem wechseln` · **Neues Kernbankensystem. Der digitale Kanal bleibt ruhig.**
  - Szenario: Die Bank migriert auf ein neues Kernbankensystem oder betreibt übergangsweise mehrere parallel.
  - Meridian im Einsatz: Meridian übersetzt zwischen den Systemen. Der digitale Kanal nutzt weiterhin dieselben Schnittstellen.
  - Der Effekt: Kundensegmente lassen sich schrittweise migrieren. Das Frontend muss nicht bei jeder Backend-Anpassung mitziehen.
  - Was die Bank gewinnt: Die digitale Kundenschnittstelle bleibt während der ganzen Transformation stabil und vertraut.

### S8 · Proof: AKB (fact strip with counters, two-column story, process line)
- Kicker: `Co-Creation in der Praxis`
- H2: **Gemeinsam mit der Aargauischen Kantonalbank.**
- Facts: `Gegründet` 1913 · `Hauptsitz` Aarau · `Geschäftsstellen` 32 · `Mitarbeitende` 1000+
- Body: Die AKB hat ihre Mobile-Banking-App grundlegend neu gedacht. Das Ziel: eine intuitive App mit einem zeitgemässen Kundenerlebnis und mehr Freiheit für neue digitale Services.
- Body: Entstanden ist DIGITERRA Vega als neues Frontend der AKB, mit Meridian als Schicht für Integration und Orchestrierung. Bestehende Systeme, externe Services und neue Angebote hängen an einer gemeinsamen Ebene.
- Process line: Analyse → Konzeption → UX- und UI-Design → Umsetzung in 2-Wochen-Sprints, with the note: Nutzertests und Reviews in jedem Schritt.
- No testimonial is invented. If a real, approved AKB quote exists, it slots in here.

### S9 · Über uns (horizontal timeline, the line draws itself and lights each year)
- Kicker: `Über uns`
- H2: **30 Jahre Banking-Erfahrung. Gebaut für die nächsten.**
- Body: DIGITERRA baut auf 30 Jahren Banking-Kompetenz von CREALOGIX auf. Wir verbinden technisches Können mit einem tiefen Verständnis für regulierte Finanzinstitute. Für Ihre Bank heisst das: Verlässlichkeit im Alltag und mehr Spielraum für neue digitale Services.
- Timeline: 1996/97 CREALOGIX, Pionier im E-Banking · 2003 Mobile Banking im Fokus · 2011 Digital Banking wächst weiter · 2026 30 Jahre Banking-Kompetenz · Heute Mit DIGITERRA in die nächste Generation

### S10 · FAQ (sticky heading left, accordion right)
- Kicker: `Häufige Fragen`
- H2: **Was Banken uns zuerst fragen.**
- **Müssen wir unser Kernbankensystem ersetzen?** Nein. Meridian verbindet Ihre Kanäle über die Schnittstellen, die Sie heute schon haben. Ihr Kernbankensystem bleibt das Fundament. Und wenn Sie später wechseln wollen, macht Meridian auch das leichter.
- **Was bedeutet die Umstellung für den laufenden Betrieb?** Sie modernisieren Schritt für Schritt statt mit einem Big Bang. Frontend und Backend sind entkoppelt, eine Änderung oben greift also nicht in den Betrieb unten ein.
- **Machen wir uns damit von DIGITERRA abhängig?** Meridian arbeitet mit Ihren bestehenden Schnittstellen, und KI binden Sie über MCP an, einen offenen Standard. Welche Anbieter, Services und eigenen Komponenten dazukommen, entscheiden Sie.
- **Wer kontrolliert, was eine KI sehen und tun darf?** Sie. In Meridian legen Sie fest, welche Funktionen und Daten eine KI nutzen darf und welche Anwendungsfälle live gehen. Sicherheitsmechanismen greifen an einer zentralen Stelle.
- **Passt Vega zu unserem Corporate Design?** Ja. Customer Journeys, Oberflächen, Inhalte und Funktionen passen Sie an Ihre Marke und Ihre Kunden an.
- **Wie läuft ein Projekt ab?** Mit der AKB haben wir von der Analyse über das Design bis zur Umsetzung in zweiwöchigen Sprints gearbeitet, mit Nutzertests und regelmässigen Reviews. Wo Ihre Bank startet, klären wir im ersten Gespräch.

### S11 · Kontakt, the one CTA (headline left, form panel right, ending frame glowing behind)
- Kicker: `Kontakt`
- H2: **Welcher Weg passt zu Ihrer Bank?**
- Body: Ob App, KI oder Kernbankensystem: Wir schauen gemeinsam auf Ihre Ausgangslage und zeigen Ihnen, wo Horizon bei Ihnen ansetzt.
- Labels / placeholders: Name / Vorname Nachname · Bank oder Institut / z. B. Musterbank AG · E-Mail / name@bank.ch · Worum geht es? / App modernisieren, KI anbinden, Kernbankensystem wechseln, Noch offen · Nachricht (optional) / Erzählen Sie uns kurz von Ihrem Vorhaben.
- Button: **Gespräch vereinbaren**
- Success state: written to match the handling choice (asked at approval).
- Secondary: Lieber zuerst folgen? DIGITERRA auf LinkedIn

### Footer
Logo · powered by CREALOGIX · Horizon · Anwendungsfälle · Über uns · Kontakt · Datenschutzrichtlinie · Nutzungsbedingungen · Impressum (linked to the existing pages on digiterra.com) · LinkedIn · © DIGITERRA 2026. Alle Rechte vorbehalten. (Plus the AI-imagery note, if chosen.)

## 7. Vector layer plan

- **Signature, the node line:** thin teal lines with glowing nodes built from the logo's network geometry. They draw themselves on scroll (section dividers, the S1 pain line, the S4 hub spokes, the S8 process line, the S9 timeline); each node lights as the line reaches it.
- **Hero readout:** VEGA · MERIDIAN · CORE depth gauge on a chip, hidden on short screens.
- **3D layer stack:** CSS perspective planes in S2 (separate on scroll) and S6 (the hold interaction), transform and opacity only.
- **Environment layer:** one fixed background: slow teal glow drift (70 s cycle), fine grain, about 24 whisper-level particles.
- **One living element per section:** node pulse, ring glow on askvega, soft line shimmer; all 4 s or longer, negative delays, paused off-screen and on hidden tabs.
- Reduced motion: every line drawn, every counter at target, the hold completed, all drives stopped.

## 8. Engineering list

Streamed Blob fetch with the loading ring and 20 s watchdog (chained video over 8 MB), poster first, dt-normalized lerp in a resting rAF loop, gated seeks with the error escape, delta-gated DOM writes, band pacing in vh with the flick test (120 / 240 / 360 px), the four-layer legibility system with the worst-frame audit at 3.5:1 or better, the five static-hero gates identical in CSS and JS and kept live with change listeners, complete without the video, reduced motion live in both directions, overflow-x clip on html and body, and the full quality floor. Plus the whole-site-animated standard: every section eases in with its own entrance.

## 9. Copy gate

Every viewer-facing line above ships verbatim. Before anyone sees the page: zero em dashes, zero stock words (leverage, seamless, empower, unlock, robust, actionable, data-driven, solutions), and the body-copy sweep for AI tells. Deliberate devices stay: "Oben neu. Unten stabil.", "Kein Big Bang. Kein Eingriff in den laufenden Betrieb."
