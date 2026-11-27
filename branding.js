(function () {
  try {
    var d = JSON.parse(localStorage.getItem('vincula_escritorio') || 'null');
    if (!d) return;
    if (d.nome) document.querySelectorAll('[data-esc-nome]').forEach(function (el) { el.textContent = d.nome; });
    if (d.logo) document.querySelectorAll('[data-esc-logo]').forEach(function (el) { el.innerHTML = ''; var i = document.createElement('img'); i.src = d.logo; i.alt = ''; i.style.cssText = 'width:100%;height:100%;object-fit:contain'; el.appendChild(i); });
  } catch (e) {}
})();
