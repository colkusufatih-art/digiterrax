import fs from 'node:fs';
import path from 'node:path';
import { Marked } from 'marked';
import { config } from './config.js';

// The portal's sections. Each one maps to a folder in the content directory.
export const SECTIONS = [
  {
    slug: 'product-docs',
    title: 'Product documentation',
    summary: 'Functional and technical documentation for DIGITERRA Horizon, Vega and Meridian.',
    icon: 'book'
  },
  {
    slug: 'interfaces-apis',
    title: 'Interfaces & APIs',
    summary: 'Interface descriptions and API specifications for connecting your systems to DIGITERRA Meridian.',
    icon: 'plug'
  },
  {
    slug: 'operations',
    title: 'Operations',
    summary: 'Guides for installing, running, monitoring and updating DIGITERRA in your environment.',
    icon: 'gauge'
  },
  {
    slug: 'helm-charts',
    title: 'Helm charts',
    summary: 'Helm charts and values files for deploying DIGITERRA on Kubernetes.',
    icon: 'helm'
  },
  {
    slug: 'six-ebill',
    title: 'SIX eBill',
    summary: 'Documentation for the SIX eBill integration.',
    icon: 'receipt'
  }
];
export const sectionBySlug = slug => SECTIONS.find(s => s.slug === slug);

const KIND = {
  '.md': 'page', '.pdf': 'pdf',
  '.yaml': 'spec', '.yml': 'spec', '.json': 'spec',
  '.tgz': 'chart', '.gz': 'archive', '.zip': 'archive',
  '.docx': 'document', '.xlsx': 'document', '.pptx': 'document', '.txt': 'text'
};
const KIND_LABEL = {
  page: 'Page', pdf: 'PDF', spec: 'Specification', chart: 'Helm chart', archive: 'Archive', document: 'Document', text: 'Text', file: 'File'
};

const prettify = name => name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
  .replace(/^\w/, c => c.toUpperCase());

function markdownTitle(file) {
  const head = fs.readFileSync(file, 'utf8').slice(0, 4000);
  const fm = head.match(/^---\s*\n([\s\S]*?)\n---/);
  const t = fm && fm[1].match(/^title:\s*(.+)$/m);
  if (t) return t[1].trim().replace(/^['"]|['"]$/g, '');
  const h1 = head.match(/^#\s+(.+)$/m);
  return h1 ? h1[1].trim() : null;
}

function describe(sectionDir, rel) {
  const abs = path.join(sectionDir, rel);
  const st = fs.statSync(abs);
  const ext = path.extname(rel).toLowerCase();
  const kind = KIND[ext] || 'file';
  return {
    rel,
    name: path.basename(rel),
    group: rel.includes('/') ? prettify(rel.split('/')[0]) : '',
    kind,
    kindLabel: KIND_LABEL[kind],
    title: (kind === 'page' && markdownTitle(abs)) || prettify(path.basename(rel)),
    size: st.size,
    updated: st.mtimeMs
  };
}

const visible = name => !name.startsWith('.') && !name.startsWith('_') && name.toLowerCase() !== 'readme.md';

// Files in a section folder, plus one level of subfolders shown as groups.
export function listDocuments(slug) {
  const dir = path.join(config.contentDir, slug);
  if (!sectionBySlug(slug) || !fs.existsSync(dir)) return [];
  const docs = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!visible(entry.name)) continue;
    if (entry.isFile()) docs.push(describe(dir, entry.name));
    else if (entry.isDirectory()) {
      for (const sub of fs.readdirSync(path.join(dir, entry.name), { withFileTypes: true })) {
        if (sub.isFile() && visible(sub.name)) docs.push(describe(dir, entry.name + '/' + sub.name));
      }
    }
  }
  return docs.sort((a, b) => a.group.localeCompare(b.group) || a.title.localeCompare(b.title));
}

// A document is only reachable if it is in the listing, so paths can never leave the section folder.
export function findDocument(slug, rel) {
  const doc = listDocuments(slug).find(d => d.rel === rel);
  return doc ? { ...doc, abs: path.join(config.contentDir, slug, doc.rel) } : null;
}

export function recentDocuments(limit = 6) {
  return SECTIONS.flatMap(s => listDocuments(s.slug).map(d => ({ ...d, section: s })))
    .sort((a, b) => b.updated - a.updated)
    .slice(0, limit);
}

const slugify = s => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';

// Documentation is written by DIGITERRA staff and treated as trusted content;
// the portal's Content-Security-Policy still blocks any inline script it might contain.
export function renderMarkdown(file) {
  // The page header shows the title, so a leading "# Title" line is dropped here.
  const src = fs.readFileSync(file, 'utf8').replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '').replace(/^\s*#\s+.+\n/, '');
  const toc = [];
  const used = new Map();
  const md = new Marked({ gfm: true });
  md.use({
    renderer: {
      heading({ tokens, depth, text }) {
        let id = slugify(text);
        const n = used.get(id) || 0;
        used.set(id, n + 1);
        if (n) id += '-' + n;
        if (depth === 2 || depth === 3) toc.push({ id, depth, text: text.replace(/[*_`]/g, '') });
        return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
      }
    }
  });
  const htmlOut = md.parse(src);
  return { html: htmlOut, toc };
}

export function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

export function formatDate(ms) {
  return new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
