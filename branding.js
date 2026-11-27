window.VinculaMarca = function () {
  try {
    var d = JSON.parse(localStorage.getItem('vincula_escritorio') || 'null');
    if (!d) return;
    var put = function (sel, txt) { if (txt) document.querySelectorAll(sel).forEach(function (el) { el.textContent = txt; }); };
    put('[data-esc-nome]', d.nome);
    put('[data-user-nome]', d.usuario);
    put('[data-user-cargo]', d.cargo);
    if (d.usuario) put('[data-user-ini]', d.usuario.split(' ').filter(function (w) { return w.length > 1; }).slice(0, 2).map(function (w) { return w[0].toUpperCase(); }).join(''));
    if (d.logo) document.querySelectorAll('[data-esc-logo]').forEach(function (el) { el.innerHTML = ''; var i = document.createElement('img'); i.src = d.logo; i.alt = ''; i.style.cssText = 'width:100%;height:100%;object-fit:contain'; el.appendChild(i); });
  } catch (e) {}
};
window.VinculaMarca();
