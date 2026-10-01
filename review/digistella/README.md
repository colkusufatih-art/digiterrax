# DigiStella — KI-Avatar für die Video-Tutorials

Fiktiver Charakter, kein echtes Foto verwendet. Trainiert als Higgsfield Soul (Typ: soul_cinematic).

- **Soul-ID:** 9ea9f63b-ed55-46c3-8c00-c961db777333
- **Name in Higgsfield:** DigiStella
- **Beschreibung:** 24 Jahre, blond, blaue Augen, langes blondes Haar, Business-Casual-Stil

## Verwendung in künftigen Generierungen

```bash
higgsfield generate create soul_cinematic --soul-id 9ea9f63b-ed55-46c3-8c00-c961db777333 \
  --aspect_ratio 16:9 --quality 2k --prompt "..." --wait
```

Für Standbilder/Vorschauen eignet sich auch `text2image_soul_v2` mit derselben `--soul-id`.

## Referenzbilder (Trainingsset)

`raw/anchor.png`, `raw/v2.png` … `raw/v6.png` — sechs konsistente Porträts, verschiedene
Winkel, Beleuchtung und zwei Outfits. Nicht löschen, falls später ein zweites Soul-Training
(z. B. eine andere Variante) gebraucht wird.

## Kosten

| Schritt | Credits |
|---|---|
| Ankerporträt | 2 |
| 5 weitere Referenzbilder | 10 |
| Soul-Training | 25 |
| Testbild | 0.12 |
| **Gesamt** | **37.12** |
