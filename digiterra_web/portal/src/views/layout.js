import { html, raw } from './html.js';
import { SECTIONS } from '../content.js';

const svg = body => raw(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`);

export const icons = {
  home: svg('<path d="M4 11.5 12 5l8 6.5"/><path d="M6.5 10v9h11v-9"/>'),
  book: svg('<path d="M5 4.5h9.5A2.5 2.5 0 0 1 17 7v12.5H7.5A2.5 2.5 0 0 1 5 17z"/><path d="M5 17a2.5 2.5 0 0 1 2.5-2.5H17"/><path d="M9 8.5h4.5"/>'),
  plug: svg('<path d="M9 3.5v4M15 3.5v4"/><path d="M6.5 7.5h11v3a5.5 5.5 0 0 1-11 0z"/><path d="M12 16v4.5"/>'),
  gauge: svg('<path d="M4.5 16a7.5 7.5 0 1 1 15 0"/><path d="M12 16l3.5-4.5"/><path d="M4.5 19.5h15"/>'),
  helm: svg('<circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.3"/><path d="M12 3.5v3.5M12 17v3.5M3.5 12H7M17 12h3.5M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'),
  receipt: svg('<path d="M6.5 3.5h11v17l-2.2-1.4-1.9 1.4-1.9-1.4-1.9 1.4-1.9-1.4-2.2 1.4z"/><path d="M9.5 8h5M9.5 11.5h5M9.5 15h3"/>'),
  page: svg('<path d="M7 3.5h7l4 4v13H7z"/><path d="M14 3.5v4h4"/><path d="M9.5 12h6M9.5 15.5h6"/>'),
  pdf: svg('<path d="M7 3.5h7l4 4v13H7z"/><path d="M14 3.5v4h4"/><path d="M9.5 16.5v-4h1.4a1.2 1.2 0 0 1 0 2.4H9.5"/><path d="M13.5 12.5v4h.8a2 2 0 0 0 0-4z"/>'),
  spec: svg('<path d="M8.5 7 4 12l4.5 5M15.5 7 20 12l-4.5 5"/><path d="M13.5 5.5l-3 13"/>'),
  chart: svg('<path d="M12 3.5 19.5 7.8v8.4L12 20.5l-7.5-4.3V7.8z"/><path d="M12 12l7.5-4.2M12 12v8.5M12 12 4.5 7.8"/>'),
  archive: svg('<rect x="4" y="4.5" width="16" height="4" rx="1"/><path d="M5.5 8.5v11h13v-11"/><path d="M10 12.5h4"/>'),
  document: svg('<path d="M7 3.5h7l4 4v13H7z"/><path d="M14 3.5v4h4"/>'),
  text: svg('<path d="M7 3.5h7l4 4v13H7z"/><path d="M14 3.5v4h4"/><path d="M9.5 12h6M9.5 15.5h4"/>'),
  file: svg('<path d="M7 3.5h7l4 4v13H7z"/><path d="M14 3.5v4h4"/>'),
  download: svg('<path d="M12 4v11"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M5 19.5h14"/>'),
  open: svg('<path d="M13.5 4.5h6v6"/><path d="M19.5 4.5 11 13"/><path d="M17 13.5v5a1 1 0 0 1-1 1H5.5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h5"/>'),
  arrow: svg('<path d="M5 12h14"/><path d="m13.5 6.5 5.5 5.5-5.5 5.5"/>'),
  user: svg('<circle cx="12" cy="8.5" r="3.5"/><path d="M5 19.5a7 7 0 0 1 14 0"/>'),
  users: svg('<circle cx="9" cy="9" r="3"/><path d="M3.5 18.5a5.5 5.5 0 0 1 11 0"/><path d="M15.5 6.2a3 3 0 0 1 0 5.6M17 13.3a5.5 5.5 0 0 1 3.5 5.2"/>'),
  lock: svg('<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'),
  chevron: svg('<path d="m7 10 5 5 5-5"/>')
};

function head(title) {
  return html`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0E1616">
<title>${title} · DIGITERRA Client Portal</title>
<link rel="icon" href="/portal/static/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Outfit:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/portal/static/portal.css">
<script src="/portal/static/portal.js" defer></script>
</head>`;
}

// The site's legal pages are German; their names stay German in the English portal.
export function legalLinks() {
  return html`<p class="legal"><a href="/datenschutzrichtlinie/">Datenschutzrichtlinie</a><a href="/nutzungsbedingungen/">Nutzungsbedingungen</a><a href="/impressum/">Impressum</a></p>`;
}

export function csrfField(csrf) {
  return html`<input type="hidden" name="_csrf" value="${csrf}">`;
}

export function flashBox(flash) {
  if (!flash) return '';
  if (flash.kind === 'secret') {
    return html`<div class="flash flash-secret" role="status">
      <p>${flash.text}</p>
      <div class="secret"><code id="secret-value">${flash.secret}</code><button type="button" class="btn btn-ghost btn-sm" data-copy="#secret-value">Copy</button></div>
      <p class="muted">Share it through a secure channel, never in the same email as the address. The user must choose a new password at first sign-in.</p>
    </div>`;
  }
  return html`<div class="flash flash-${flash.kind}" role="status"><p>${flash.text}</p></div>`;
}

// Screens without the portal navigation: sign-in and the forced password change.
export function bare({ title, body }) {
  return html`${head(title)}
<body class="bare">
<main id="main" class="bare-main">${body}</main>
</body>
</html>`;
}

// The signed-in portal: top bar, section navigation, content.
export function app({ title, user, csrf, active, body }) {
  const first = user.name.split(' ')[0];
  const nav = [
    { href: '/portal', key: 'overview', label: 'Overview', icon: 'home' },
    ...SECTIONS.map(s => ({ href: '/portal/docs/' + s.slug, key: s.slug, label: s.title, icon: s.icon }))
  ];
  return html`${head(title)}
<body class="app">
<a class="skip" href="#main">Skip to content</a>
<header class="topbar">
  <a class="brand" href="/portal" aria-label="DIGITERRA Client Portal, overview">
    <img src="/portal/static/logo.svg" alt="" width="134" height="30">
    <span class="brand-label">Client Portal</span>
  </a>
  <details class="usermenu">
    <summary><span class="avatar" aria-hidden="true">${first.slice(0, 1).toUpperCase()}</span><span class="who"><b>${user.name}</b><small>${user.company || user.email}</small></span>${icons.chevron}</summary>
    <div class="menu">
      <a href="/portal/account">${icons.user}Account</a>
      ${user.role === 'admin' ? html`<a href="/portal/admin/users">${icons.users}Users</a>` : ''}
      <form method="post" action="/portal/logout">${csrfField(csrf)}<button type="submit">${icons.lock}Sign out</button></form>
    </div>
  </details>
</header>
<div class="shell">
  <nav class="sidenav" aria-label="Portal sections">
    <ul>
      ${nav.map(n => html`<li><a href="${n.href}"${n.key === active ? raw(' aria-current="page"') : ''}>${icons[n.icon]}<span>${n.label}</span></a></li>`)}
    </ul>
    ${legalLinks()}
  </nav>
  <main id="main" class="content" tabindex="-1">${body}</main>
</div>
</body>
</html>`;
}
