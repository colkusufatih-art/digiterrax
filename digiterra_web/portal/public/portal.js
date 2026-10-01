// Progressive enhancement only: every page works without this file.

// Copy a one-time secret (temporary passwords) to the clipboard.
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-copy]');
  if (!btn) return;
  const el = document.querySelector(btn.dataset.copy);
  if (!el || !navigator.clipboard) return;
  navigator.clipboard.writeText(el.textContent.trim()).then(() => {
    const label = btn.textContent;
    btn.textContent = 'Copied';
    setTimeout(() => { btn.textContent = label; }, 1800);
  });
});

// Ask before actions that sign someone out or replace their password.
document.addEventListener('submit', e => {
  const form = e.target.closest('form[data-confirm]');
  if (form && !window.confirm(form.dataset.confirm)) e.preventDefault();
});

// Close the account menu when clicking elsewhere or pressing Escape.
document.addEventListener('click', e => {
  document.querySelectorAll('details.usermenu[open]').forEach(d => { if (!d.contains(e.target)) d.open = false; });
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('details.usermenu[open]').forEach(d => { d.open = false; d.querySelector('summary').focus(); });
});
