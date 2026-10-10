// Bar e Choperia Esperança: interações leves, sem dependências.
(function () {
  var root = document.documentElement;
  root.classList.add("js");

  // Tema: alterna claro/escuro e lembra a escolha (opcional, falha em silêncio).
  var themeBtn = document.querySelector("[data-theme-toggle]");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var current = root.dataset.theme ||
        (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
      var next = current === "light" ? "dark" : "light";
      root.dataset.theme = next;
      try { localStorage.setItem("esperanca-theme", next); } catch (e) {}
    });
  }

  // Menu mobile.
  var menuBtn = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-menu]");
  function setMenu(open) {
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    menu.hidden = !open;
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) { setMenu(false); menuBtn.focus(); }
    });
  }

  // Revela as seções ao entrar na tela, com pequeno escalonamento por grupo.
  var reveals = document.querySelectorAll(".reveal");
  var groups = new Map();
  reveals.forEach(function (el) {
    var parent = el.parentElement;
    var n = groups.get(parent) || 0;
    el.style.setProperty("--i", n);
    groups.set(parent, n + 1);
  });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  // Marquee contínuo: duplica a faixa de fotos para o loop não ter emenda.
  var track = document.querySelector(".marquee__track");
  if (track) {
    var clone = track.cloneNode(true);
    clone.setAttribute("data-clone", "");
    track.parentElement.appendChild(clone);
  }

  // Esconde a barra fixa de pedido enquanto o hero (que já tem o botão) está visível.
  var dock = document.querySelector("[data-dock]");
  var hero = document.querySelector(".hero");
  if (dock && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      dock.classList.toggle("is-hidden", entries[0].isIntersecting);
    }, { threshold: 0.25 }).observe(hero.querySelector(".hero__ctas"));
  }

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
