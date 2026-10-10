// Bar e Choperia Esperança: interações leves, sem dependências.
(function () {
  var root = document.documentElement;
  root.classList.add("js");

  // Navegação entre as páginas (todas no mesmo arquivo): #inicio, #cardapio,
  // #a-casa, #contato. Âncoras internas (ex.: #menu-drinks) abrem a página certa.
  var routes = document.querySelectorAll("[data-route]");
  var navLinks = document.querySelectorAll(".nav__links a, .sheet__inner a");
  var currentRoute = null;
  function showRoute(id, target) {
    var route = document.getElementById(id);
    if (!route || !route.hasAttribute("data-route")) return false;
    var changed = currentRoute !== route;
    routes.forEach(function (r) { r.classList.toggle("is-active", r === route); });
    navLinks.forEach(function (a) {
      if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    document.title = route.getAttribute("data-title") || document.title;
    currentRoute = route;
    if (target) {
      target.scrollIntoView();
    } else if (changed) {
      window.scrollTo(0, 0);
      route.focus({ preventScroll: true });
    }
    return true;
  }
  function onHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    if (!id) return showRoute("inicio");
    var el = document.getElementById(id);
    if (!el) return showRoute("inicio");
    if (el.hasAttribute("data-route")) return showRoute(id);
    var parent = el.closest("[data-route]");
    if (parent) showRoute(parent.id, el);
  }
  window.addEventListener("hashchange", onHash);
  onHash();

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
  if (dock && hero && hero.querySelector(".hero__ctas") && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      dock.classList.toggle("is-hidden", entries[0].isIntersecting);
    }, { threshold: 0.25 }).observe(hero.querySelector(".hero__ctas"));
  }

  // Cardápio: destaca a categoria visível na barra de categorias.
  var cats = document.querySelectorAll("[data-cats] a");
  if (cats.length && "IntersectionObserver" in window) {
    var byId = {};
    cats.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        cats.forEach(function (a) { a.classList.remove("is-active"); a.removeAttribute("aria-current"); });
        var link = byId[entry.target.id];
        if (link) {
          link.classList.add("is-active");
          link.setAttribute("aria-current", "true");
          // Rola só a barra de categorias (na horizontal), nunca a página.
          var track = link.parentElement;
          track.scrollTo({ left: link.offsetLeft - track.clientWidth / 2 + link.offsetWidth / 2, behavior: "smooth" });
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll(".menu-cat").forEach(function (g) { spy.observe(g); });
  }

  // Cardápio: busca por nome, descrição ou categoria.
  var search = document.querySelector("[data-menu-search]");
  if (search) {
    var dishes = document.querySelectorAll(".dish");
    var menuCats = document.querySelectorAll(".menu-cat");
    var empty = document.querySelector("[data-menu-empty]");
    var norm = function (s) { return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); };
    dishes.forEach(function (d) { d.dataset.norm = norm(d.getAttribute("data-search")); });
    search.addEventListener("input", function () {
      var q = norm(search.value.trim());
      var any = false;
      dishes.forEach(function (d) { d.hidden = q !== "" && d.dataset.norm.indexOf(q) === -1; });
      menuCats.forEach(function (c) {
        var visible = c.querySelectorAll(".dish:not([hidden])").length > 0;
        c.hidden = !visible;
        if (visible) any = true;
      });
      empty.hidden = any;
    });
  }

  // Reserva: valida os campos e monta a mensagem para o WhatsApp.
  var form = document.querySelector("[data-reserve]");
  if (form) {
    var WA = window.WA_NUMBER || "5521984292033";
    var dateInput = form.querySelector("#f-data");
    var today = new Date();
    var iso = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    dateInput.min = iso;

    var showError = function (input, msg) {
      var err = document.getElementById(input.id + "-erro");
      if (msg) {
        input.setAttribute("aria-invalid", "true");
        err.innerHTML = '<svg class="i" aria-hidden="true"><use href="#i-warning"/></svg>' + msg;
        err.hidden = false;
      } else {
        input.removeAttribute("aria-invalid");
        err.hidden = true;
        err.textContent = "";
      }
    };

    var rules = {
      nome: function (v) { return v.trim().length < 2 ? "Digite seu nome." : ""; },
      data: function (v) {
        if (!v) return "Escolha a data.";
        return v < iso ? "Escolha uma data a partir de hoje." : "";
      },
      hora: function (v) {
        if (!v) return "Escolha o horário.";
        var h = parseInt(v.split(":")[0], 10);
        return (h >= 6 && h < 11) ? "Nesse horário a casa está fechada. Funcionamos das 11h às 6h." : "";
      },
      pessoas: function (v) {
        var n = parseInt(v, 10);
        if (!v || isNaN(n) || n < 1) return "Informe quantas pessoas.";
        return n > 60 ? "Para grupos acima de 60 pessoas, fale direto com a gente pelo WhatsApp." : "";
      }
    };

    var check = function (input) {
      var rule = rules[input.name];
      if (!rule) return true;
      var msg = rule(input.value);
      showError(input, msg);
      return !msg;
    };

    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      input.addEventListener("blur", function () { if (input.value) check(input); });
      input.addEventListener("input", function () { if (input.getAttribute("aria-invalid")) check(input); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      Object.keys(rules).forEach(function (name) {
        var input = form.elements[name];
        if (!check(input) && !firstBad) firstBad = input;
      });
      if (firstBad) { firstBad.focus(); return; }

      var d = form.elements.data.value.split("-");
      var lines = [
        "Olá! Quero reservar uma mesa no Bar Esperança.",
        "Nome: " + form.elements.nome.value.trim(),
        "Data: " + d[2] + "/" + d[1] + "/" + d[0],
        "Horário: " + form.elements.hora.value,
        "Pessoas: " + form.elements.pessoas.value
      ];
      var obs = form.elements.obs.value.trim();
      if (obs) lines.push("Observações: " + obs);
      var url = "https://wa.me/" + WA + "?text=" + encodeURIComponent(lines.join("\n"));

      var ok = form.querySelector("[data-reserve-ok]");
      form.querySelector("[data-reserve-link]").href = url;
      ok.hidden = false;
      window.open(url, "_blank", "noopener");
    });
  }

  // Vídeo da abertura: fica parado (mostrando a foto) para quem pede menos movimento.
  var heroVideo = document.querySelector("[data-hero-video]");
  if (heroVideo && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    heroVideo.removeAttribute("autoplay");
    heroVideo.pause();
  }

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
