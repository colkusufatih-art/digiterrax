// Tagged template that escapes every interpolated value unless it is already trusted markup.
class Safe {
  constructor(s) { this.s = s; }
  toString() { return this.s; }
}

export const raw = s => new Safe(String(s));

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escape = v => String(v).replace(/[&<>"']/g, c => ESC[c]);

const render = v =>
  v == null || v === false ? '' :
  v instanceof Safe ? v.s :
  Array.isArray(v) ? v.map(render).join('') :
  escape(v);

export function html(strings, ...values) {
  let out = strings[0];
  values.forEach((v, i) => { out += render(v) + strings[i + 1]; });
  return new Safe(out);
}
