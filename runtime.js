/* Mini runtime do protótipo Vincula (versão independente) */
class DCLogic {
  constructor(p) { this.props = p || {}; this.state = {}; }
  setState(s) { Object.assign(this.state, typeof s === 'function' ? s(this.state) : s); if (!DC.silent) DC.render(); }
  forceUpdate() { DC.render(); }
}
const DC = {
  get(ctx, path) {
    path = String(path).trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    let v = ctx;
    for (const k of path.split('.')) { if (v == null) return undefined; v = v[k]; }
    return v;
  },
  holeOnly(s) { const m = String(s).match(/^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/); return m ? m[1] : null; },
  interp(s, ctx) { return String(s).replace(/\{\{\s*([^}]+?)\s*\}\}/g, (m, p) => { const v = this.get(ctx, p); return v == null ? '' : String(v); }); },
  walk(node, ctx) { for (const ch of Array.from(node.childNodes)) this.proc(ch, ctx); },
  proc(n, ctx) {
    if (n.nodeType === 3) { if (n.nodeValue.indexOf('{{') >= 0) n.nodeValue = this.interp(n.nodeValue, ctx); return; }
    if (n.nodeType !== 1) return;
    if (n.tagName === 'TEMPLATE' && n.hasAttribute('data-for')) {
      const list = this.get(ctx, n.getAttribute('data-for')) || [];
      const as = n.getAttribute('data-as');
      const frag = document.createDocumentFragment();
      list.forEach((it, i) => {
        const c = Object.create(ctx); c[as] = it; c.$index = i;
        const part = n.content.cloneNode(true); this.walk(part, c); frag.appendChild(part);
      });
      n.replaceWith(frag); return;
    }
    if (n.tagName === 'TEMPLATE' && n.hasAttribute('data-if')) {
      if (this.get(ctx, n.getAttribute('data-if'))) { const part = n.content.cloneNode(true); this.walk(part, ctx); n.replaceWith(part); }
      else n.remove();
      return;
    }
    for (const a of Array.from(n.attributes)) {
      if (a.value.indexOf('{{') < 0) continue;
      if (/^on/i.test(a.name)) {
        const fn = this.get(ctx, this.holeOnly(a.value));
        n.removeAttribute(a.name);
        const ev = a.name.slice(2).toLowerCase();
        if (typeof fn !== 'function') continue;
        if (ev === 'change' && n.tagName === 'INPUT' && n.type !== 'checkbox' && n.type !== 'radio') {
          n.addEventListener('input', fn);
        } else n.addEventListener(ev, fn);
        continue;
      }
      const v = this.interp(a.value, ctx);
      n.setAttribute(a.name, v);
      if (a.name === 'value' && 'value' in n) n.value = v;
    }
    this.walk(n, ctx);
    if (n.tagName === 'SELECT' && n.hasAttribute('value')) n.value = n.getAttribute('value');
  },
  render() {
    const root = document.getElementById('dc-root');
    if (!root || !this.comp) return;
    const act = document.activeElement;
    let path = null, s0 = null, s1 = null;
    if (act && act !== root && root.contains(act)) {
      path = []; let n = act;
      while (n && n !== root) { path.unshift(Array.prototype.indexOf.call(n.parentNode.childNodes, n)); n = n.parentNode; }
      try { s0 = act.selectionStart; s1 = act.selectionEnd; } catch (x) {}
    }
    const part = document.getElementById('dc-tpl').content.cloneNode(true);
    this.walk(part, this.comp.renderVals());
    root.replaceChildren(part);
    if (path) {
      let n = root;
      for (const i of path) { n = n && n.childNodes[i]; }
      if (n && n.focus && (n.tagName === 'INPUT' || n.tagName === 'TEXTAREA' || n.tagName === 'SELECT')) {
        n.focus();
        try { if (s0 != null) n.setSelectionRange(s0, s1); } catch (x) {}
      }
    }
  },
  start(C) { this.comp = new C({}); this.render(); }
};
