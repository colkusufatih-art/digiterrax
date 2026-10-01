# Portal content

Each folder is one section of the client portal. Files dropped here appear in the portal immediately, no restart needed.

| Folder | Section |
|---|---|
| `product-docs/` | Product documentation |
| `interfaces-apis/` | Interfaces & APIs |
| `operations/` | Operations |
| `helm-charts/` | Helm charts |
| `six-ebill/` | SIX eBill |

How files are shown:

- **Markdown (`.md`)** opens as a page in the portal. The title comes from `title:` in front matter or the first `# Heading`.
- **PDF** opens in the browser and can be downloaded.
- **Everything else** (OpenAPI `.yaml`/`.json`, Helm `.tgz`, `.zip`, Office files) is offered as a download.
- **One level of subfolders** becomes a group heading inside the section, for example `product-docs/vega/`.
- Files starting with `.` or `_`, and `README.md`, are never shown.

Signed-in customers can see every document. Every view and download is written to the audit log.
