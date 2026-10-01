import { html, raw } from './html.js';
import { app, bare, csrfField, flashBox, icons, legalLinks } from './layout.js';
import { SECTIONS, formatDate, formatSize } from '../content.js';

const docPath = (slug, rel) => slug + '/' + rel.split('/').map(encodeURIComponent).join('/');
const docHref = (slug, doc) => '/portal/docs/' + docPath(slug, doc.rel);
const fileHref = (slug, doc, inline = false) => '/portal/files/' + docPath(slug, doc.rel) + (inline ? '?inline=1' : '');

/* ---------------------------------------------------------------- */
/* Sign-in                                                          */
/* ---------------------------------------------------------------- */
export function loginPage({ csrf, error, notice, email = '', next = '' }) {
  return bare({
    title: 'Sign in',
    body: html`
<section class="auth">
  <div class="auth-card">
    <img class="auth-logo" src="/portal/static/logo.svg" alt="DIGITERRA" width="160" height="36">
    <p class="kicker">Client Portal</p>
    <h1>Sign in</h1>
    <p class="muted">Documentation, APIs and deployment resources for DIGITERRA customers.</p>
    ${notice ? html`<div class="flash flash-success" role="status"><p>${notice}</p></div>` : ''}
    ${error ? html`<div class="flash flash-error" role="alert"><p>${error}</p></div>` : ''}
    <form method="post" action="/portal/login" class="form" novalidate>
      ${csrfField(csrf)}
      <input type="hidden" name="next" value="${next}">
      <div class="field">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" autocomplete="username" value="${email}" required autofocus>
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required>
      </div>
      <button class="btn btn-primary btn-block" type="submit">Sign in</button>
    </form>
    <p class="help">Forgot your password or need access? Contact your DIGITERRA representative.</p>
  </div>
  <a class="back" href="/">${icons.arrow}<span>Back to the DIGITERRA website</span></a>
  ${legalLinks()}
</section>`
  });
}

/* ---------------------------------------------------------------- */
/* Password change (forced after a temporary password, or voluntary) */
/* ---------------------------------------------------------------- */
function passwordForm({ csrf, forced, error, email }) {
  return html`
    ${error ? html`<div class="flash flash-error" role="alert"><p>${error}</p></div>` : ''}
    <form method="post" action="/portal/account/password" class="form" novalidate>
      ${csrfField(csrf)}
      <input type="text" name="username" autocomplete="username" value="${email}" hidden readonly>
      ${forced ? '' : html`<div class="field">
        <label for="current">Current password</label>
        <input id="current" name="current" type="password" autocomplete="current-password" required>
      </div>`}
      <div class="field">
        <label for="new">New password</label>
        <input id="new" name="new" type="password" autocomplete="new-password" minlength="12" required aria-describedby="pw-rule">
        <p class="hint" id="pw-rule">At least 12 characters. A short sentence you can remember works well.</p>
      </div>
      <div class="field">
        <label for="confirm">Repeat new password</label>
        <input id="confirm" name="confirm" type="password" autocomplete="new-password" minlength="12" required>
      </div>
      <button class="btn btn-primary ${forced ? 'btn-block' : ''}" type="submit">${forced ? 'Save and continue' : 'Change password'}</button>
    </form>`;
}

export function passwordPage({ user, csrf, forced, error }) {
  if (forced) {
    return bare({
      title: 'Set a new password',
      body: html`
<section class="auth">
  <div class="auth-card">
    <img class="auth-logo" src="/portal/static/logo.svg" alt="DIGITERRA" width="160" height="36">
    <p class="kicker">Welcome, ${user.name.split(' ')[0]}</p>
    <h1>Set a new password</h1>
    <p class="muted">You signed in with a temporary password. Choose your own password to continue.</p>
    ${passwordForm({ csrf, forced, error, email: user.email })}
  </div>
</section>`
    });
  }
  return app({
    title: 'Change password', user, csrf, active: '',
    body: html`
<nav class="crumbs" aria-label="Breadcrumb"><a href="/portal/account">Account</a><span aria-hidden="true">/</span><span>Change password</span></nav>
<header class="page-head"><h1>Change password</h1></header>
<div class="panel narrow">${passwordForm({ csrf, forced, error, email: user.email })}</div>`
  });
}

/* ---------------------------------------------------------------- */
/* Overview                                                         */
/* ---------------------------------------------------------------- */
function docRow(section, d, { showSection = false } = {}) {
  const actions = d.kind === 'page'
    ? html`<a class="btn btn-ghost btn-sm" href="${docHref(section.slug, d)}">Read</a>`
    : d.kind === 'pdf'
      ? html`<a class="btn btn-ghost btn-sm" href="${fileHref(section.slug, d, true)}" target="_blank" rel="noopener">${icons.open}Open</a>
             <a class="btn btn-ghost btn-sm" href="${fileHref(section.slug, d)}">${icons.download}Download</a>`
      : html`<a class="btn btn-ghost btn-sm" href="${fileHref(section.slug, d)}">${icons.download}Download</a>`;
  const titleHref = d.kind === 'page' ? docHref(section.slug, d) : d.kind === 'pdf' ? fileHref(section.slug, d, true) : fileHref(section.slug, d);
  return html`<li class="doc">
    <span class="doc-ico">${icons[d.kind] || icons.file}</span>
    <div class="doc-main">
      <a class="doc-title" href="${titleHref}"${d.kind === 'pdf' ? raw(' target="_blank" rel="noopener"') : ''}>${d.title}</a>
      <span class="doc-meta">${showSection ? html`${section.title} · ` : ''}${d.kindLabel}${d.kind === 'page' ? '' : html` · ${formatSize(d.size)}`} · Updated ${formatDate(d.updated)}</span>
    </div>
    <div class="doc-actions">${actions}</div>
  </li>`;
}

export function dashboardPage({ user, csrf, counts, recent }) {
  return app({
    title: 'Overview', user, csrf, active: 'overview',
    body: html`
<header class="page-head">
  <p class="kicker">Client Portal</p>
  <h1>Welcome, ${user.name.split(' ')[0]}</h1>
  <p class="lede">Documentation, interfaces and deployment resources for DIGITERRA customers.</p>
</header>
<ul class="cards">
  ${SECTIONS.map(s => html`<li><a class="card" href="/portal/docs/${s.slug}">
    <span class="card-ico">${icons[s.icon]}</span>
    <span class="card-title">${s.title}</span>
    <span class="card-text">${s.summary}</span>
    <span class="card-count">${counts[s.slug] ? `${counts[s.slug]} ${counts[s.slug] === 1 ? 'document' : 'documents'}` : 'No documents yet'}${icons.arrow}</span>
  </a></li>`)}
</ul>
<section class="block">
  <h2>Recently updated</h2>
  ${recent.length
    ? html`<ul class="docs">${recent.map(d => docRow(d.section, d, { showSection: true }))}</ul>`
    : html`<div class="empty">${icons.page}<p class="empty-title">Nothing published yet</p><p class="muted">New and updated documents will appear here.</p></div>`}
</section>
<aside class="support">
  <p><b>Need help?</b> Contact your DIGITERRA representative.</p>
</aside>`
  });
}

/* ---------------------------------------------------------------- */
/* Section                                                          */
/* ---------------------------------------------------------------- */
export function sectionPage({ user, csrf, section, docs }) {
  const groups = [];
  for (const d of docs) {
    let g = groups.find(x => x.name === d.group);
    if (!g) groups.push(g = { name: d.group, docs: [] });
    g.docs.push(d);
  }
  return app({
    title: section.title, user, csrf, active: section.slug,
    body: html`
<nav class="crumbs" aria-label="Breadcrumb"><a href="/portal">Overview</a><span aria-hidden="true">/</span><span>${section.title}</span></nav>
<header class="page-head with-ico">
  <span class="head-ico">${icons[section.icon]}</span>
  <div><h1>${section.title}</h1><p class="lede">${section.summary}</p></div>
</header>
${docs.length
  ? groups.map(g => html`<section class="block">
      ${g.name ? html`<h2>${g.name}</h2>` : ''}
      <ul class="docs">${g.docs.map(d => docRow(section, d))}</ul>
    </section>`)
  : html`<div class="empty">
      ${icons[section.icon]}
      <p class="empty-title">No documents yet</p>
      <p class="muted">Documents for ${section.title} will appear here as soon as they are published.</p>
      ${user.role === 'admin' ? html`<p class="admin-hint"><b>Admin:</b> add files to <code>content/${section.slug}/</code> on the server. Markdown files (.md) open as pages, PDFs open in the browser, all other files are offered as downloads. Subfolders become groups.</p>` : ''}
    </div>`}`
  });
}

/* ---------------------------------------------------------------- */
/* Document (Markdown page)                                         */
/* ---------------------------------------------------------------- */
export function docPage({ user, csrf, section, doc, rendered }) {
  return app({
    title: doc.title, user, csrf, active: section.slug,
    body: html`
<nav class="crumbs" aria-label="Breadcrumb"><a href="/portal">Overview</a><span aria-hidden="true">/</span><a href="/portal/docs/${section.slug}">${section.title}</a><span aria-hidden="true">/</span><span>${doc.title}</span></nav>
<div class="doc-layout">
  <article class="prose">
    <h1>${doc.title}</h1>
    <p class="doc-meta">Updated ${formatDate(doc.updated)}</p>
    ${raw(rendered.html)}
  </article>
  ${rendered.toc.length > 1 ? html`<aside class="toc" aria-label="On this page">
    <p class="kicker">On this page</p>
    <ul>${rendered.toc.map(t => html`<li class="d${t.depth}"><a href="#${t.id}">${t.text}</a></li>`)}</ul>
  </aside>` : ''}
</div>`
  });
}

/* ---------------------------------------------------------------- */
/* Account                                                          */
/* ---------------------------------------------------------------- */
export function accountPage({ user, csrf, flash }) {
  return app({
    title: 'Account', user, csrf, active: '',
    body: html`
<header class="page-head"><h1>Account</h1></header>
${flashBox(flash)}
<div class="panel narrow">
  <dl class="facts">
    <div><dt>Name</dt><dd>${user.name}</dd></div>
    <div><dt>Email</dt><dd>${user.email}</dd></div>
    ${user.company ? html`<div><dt>Company</dt><dd>${user.company}</dd></div>` : ''}
    <div><dt>Role</dt><dd>${user.role === 'admin' ? 'Administrator' : 'Customer'}</dd></div>
  </dl>
  <div class="row-actions">
    <a class="btn btn-ghost" href="/portal/account/password">${icons.lock}Change password</a>
    <form method="post" action="/portal/logout">${csrfField(csrf)}<button class="btn btn-ghost" type="submit">Sign out</button></form>
  </div>
</div>`
  });
}

/* ---------------------------------------------------------------- */
/* Admin: users                                                     */
/* ---------------------------------------------------------------- */
export function adminUsersPage({ user, csrf, list, flash, form = {}, error }) {
  return app({
    title: 'Users', user, csrf, active: '',
    body: html`
<header class="page-head">
  <p class="kicker">Administration</p>
  <h1>Users</h1>
  <p class="lede">Create customer accounts and manage access. New accounts get a temporary password.</p>
</header>
${flashBox(flash)}
<section class="panel">
  <h2>Add a user</h2>
  ${error ? html`<div class="flash flash-error" role="alert"><p>${error}</p></div>` : ''}
  <form method="post" action="/portal/admin/users" class="form grid-form" novalidate>
    ${csrfField(csrf)}
    <div class="field"><label for="u-name">Name</label><input id="u-name" name="name" value="${form.name || ''}" required autocomplete="off"></div>
    <div class="field"><label for="u-email">Email</label><input id="u-email" name="email" type="email" value="${form.email || ''}" required autocomplete="off"></div>
    <div class="field"><label for="u-company">Company</label><input id="u-company" name="company" value="${form.company || ''}" autocomplete="off" placeholder="e.g. Aargauische Kantonalbank"></div>
    <div class="field"><label for="u-role">Role</label>
      <select id="u-role" name="role"><option value="customer"${form.role !== 'admin' ? raw(' selected') : ''}>Customer</option><option value="admin"${form.role === 'admin' ? raw(' selected') : ''}>Administrator</option></select></div>
    <div class="field field-submit"><button class="btn btn-primary" type="submit">Create user</button></div>
  </form>
</section>
<section class="block">
  <h2>All users <span class="count">${list.length}</span></h2>
  <div class="table-wrap">
  <table class="table">
    <thead><tr><th scope="col">Name</th><th scope="col">Company</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col">Last sign-in</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead>
    <tbody>
      ${list.map(u => html`<tr class="${u.disabled ? 'is-disabled' : ''}">
        <td><b>${u.name}</b><small>${u.email}</small></td>
        <td>${u.company || html`<span class="muted">Not set</span>`}</td>
        <td>${u.role === 'admin' ? 'Administrator' : 'Customer'}</td>
        <td>${u.disabled ? html`<span class="tag tag-off">Disabled</span>` : u.must_change_password ? html`<span class="tag tag-wait">Temporary password</span>` : html`<span class="tag tag-on">Active</span>`}</td>
        <td>${u.last_login_at ? formatDate(u.last_login_at) : html`<span class="muted">Never</span>`}</td>
        <td class="actions">${u.id === user.id ? html`<span class="muted">You</span>` : html`
          <form method="post" action="/portal/admin/users/${u.id}/reset" data-confirm="Create a new temporary password for ${u.email}? Their current password stops working.">${csrfField(csrf)}<button class="btn btn-ghost btn-sm" type="submit">Reset password</button></form>
          <form method="post" action="/portal/admin/users/${u.id}/${u.disabled ? 'enable' : 'disable'}"${u.disabled ? '' : html` data-confirm="Disable ${u.email}? They are signed out immediately."`}>${csrfField(csrf)}<button class="btn btn-ghost btn-sm" type="submit">${u.disabled ? 'Enable' : 'Disable'}</button></form>`}
        </td>
      </tr>`)}
    </tbody>
  </table>
  </div>
</section>`
  });
}

/* ---------------------------------------------------------------- */
/* Errors                                                           */
/* ---------------------------------------------------------------- */
export function errorPage({ status, title, message, user, csrf }) {
  const body = html`
<div class="empty error">
  <p class="kicker">Error ${status}</p>
  <h1>${title}</h1>
  <p class="muted">${message}</p>
  <a class="btn btn-ghost" href="/portal">${icons.home}Go to the overview</a>
</div>`;
  return user ? app({ title, user, csrf, active: '', body }) : bare({ title, body: html`<section class="auth"><div class="auth-card">${body}</div></section>` });
}
