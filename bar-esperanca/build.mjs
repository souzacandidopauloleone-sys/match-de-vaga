// Monta o site em dist/index.html: um único arquivo com todas as páginas
// (Início, Cardápio, A casa, Contato), navegação interna por âncoras (#cardapio,
// #a-casa...) e CSS, JS, fontes e logo embutidos. Abre com dois cliques, mesmo
// sem extrair o zip, e também sobe em qualquer hospedagem.
// Uso: node build.mjs   (Node 18+, sem dependências)
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, "src");
const out = join(root, "dist");

const SITE = "https://barechoperiaesperanca.com.br";
const WA_NUMBER = "5521984292033";
const WA = `https://wa.me/${WA_NUMBER}?text=Ol%C3%A1!%20Quero%20fazer%20um%20pedido.`;

// Fotos reais da casa (cardápio digital oficial).
const DM = "https://digitalmenuart.com.br/uploads/empresa_55/";
// Imagens geradas por IA (só onde não há foto real): sem mar nem paisagem.
const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3FjM8DdHcxZCUrb8JPqKpFoJ3op/";
const IMG = {
  picanha: CDN + "hf_20261010_141121_cbb1c0e5-9b4d-4667-92d6-dab0910f3529.png",
  chope: CDN + "hf_20261010_141122_b55f9db8-50f8-46e0-bd89-dfb6872552f2.png",
  salao: CDN + "hf_20261010_141122_025280dc-2487-4b84-aaf3-19d0abd4cfc4.png",
  brasa: CDN + "hf_20261010_132901_5bf2ace7-76eb-4d72-aa9c-88225d0b73a7.png",
  balcao: CDN + "hf_20261010_132901_b63879fd-46a8-4c8d-925a-fd61951420f1.png",
  camarao: DM + "camar-ao-esperanca.jpg",
  picanhaReal: DM + "picanha-a-esperanca.jpg",
  coxinha: DM + "coxinha-arretada.jpg",
  caipirao: DM + "caipir-ao.jpg",
  mariaBonita: DM + "maria-bonita.jpg",
  lampiao: DM + "lampi-ao.jpg",
  banner: DM + "banner.webp",
};
// Vídeo da abertura (gerado a partir da foto da picanha, dentro do restaurante).
const VIDEO = {
  hero: CDN + "hf_20261010_140004_96b9ca75-87b9-4468-ba30-70b8c59780fa.mp4",
};

// Ordem das páginas: o primeiro é a página inicial.
const PAGES = ["index", "cardapio", "a-casa", "contato"];
const ROUTE = { index: "inicio", cardapio: "cardapio", "a-casa": "a-casa", contato: "contato" };

const read = (p) => readFileSync(join(src, p), "utf8");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const dataUri = (p, type) => `data:${type};base64,${readFileSync(join(src, p)).toString("base64")}`;

// ---------- Cardápio ----------
function renderMenu() {
  const data = JSON.parse(read("data/cardapio.json"));
  const nav = data.categorias
    .map((c) => `<a class="cats__link" href="#${esc(c.id)}">${esc(c.nome)}</a>`)
    .join("\n      ");
  const groups = data.categorias
    .map((c) => {
      const items = c.itens
        .map((it) => {
          const variants = (it.variacoes || [])
            .map((v) => `<li><span>${esc(v.nome)}</span><span>${esc(v.preco)}</span></li>`)
            .join("");
          const search = esc(`${it.nome} ${it.descricao || ""} ${c.nome}`.toLowerCase());
          return `<li class="dish" data-search="${search}">
          ${it.foto ? `<img class="dish__img" src="${esc(it.foto)}" alt="" loading="lazy" decoding="async" width="88" height="88">` : ""}
          <div class="dish__body">
            <div class="dish__top">
              <h3>${esc(it.nome)}</h3>
              ${it.preco ? `<span class="dish__price">${esc(it.preco)}</span>` : ""}
            </div>
            ${it.descricao ? `<p>${esc(it.descricao)}</p>` : ""}
            ${variants ? `<ul class="dish__variants">${variants}</ul>` : ""}
          </div>
        </li>`;
        })
        .join("\n        ");
      return `<section class="menu-cat" id="${esc(c.id)}" aria-labelledby="${esc(c.id)}-titulo">
      <header class="menu-cat__head">
        <h2 id="${esc(c.id)}-titulo">${esc(c.nome)}</h2>
        ${c.texto ? `<p>${esc(c.texto)}</p>` : ""}
      </header>
      <ul class="dishes">
        ${items}
      </ul>
    </section>`;
    })
    .join("\n    ");
  const total = data.categorias.reduce((n, c) => n + c.itens.length, 0);
  return { nav, groups, total };
}

// ---------- Recursos embutidos ----------
const css = read("assets/css/style.css").replace(/url\("\.\.\/fonts\/([^"]+)"\)/g, (_, f) => {
  const b64 = readFileSync(join(src, "assets/fonts", f)).toString("base64");
  return `url("data:font/woff2;base64,${b64}")`;
});
const js = read("assets/js/main.js");
const LOGO = dataUri("assets/img/logo.png", "image/png");
const FAVICON = dataUri("assets/img/favicon.png", "image/png");

// Links entre páginas viram âncoras internas.
const relink = (html) =>
  html
    .replace(/href="index\.html"/g, 'href="#inicio"')
    .replace(/href="cardapio\.html#([\w-]+)"/g, 'href="#$1"')
    .replace(/href="(cardapio|a-casa|contato)\.html"/g, 'href="#$1"');

// ---------- Montagem ----------
const layout = read("layout.html");
const partial = (n) => read(`partials/${n}.${n === "sprite" ? "svg" : "html"}`);
const menu = renderMenu();

let routes = "";
let home = null;
for (const page of PAGES) {
  const raw = read(`pages/${page}.html`);
  const m = raw.match(/^<!--meta (\{.*?\}) -->\n/s);
  if (!m) throw new Error(`Faltou o bloco <!--meta {...} --> em ${page}.html`);
  const meta = JSON.parse(m[1]);
  if (page === "index") home = meta;
  const id = ROUTE[page];
  const active = page === "index" ? " is-active" : "";
  routes += `\n<div class="route${active}" id="${id}" data-route data-title="${esc(meta.title)}" tabindex="-1">\n${raw.slice(m[0].length)}\n</div>\n`;
}

const vars = {
  title: esc(home.title),
  description: esc(home.description),
  site: SITE,
  wa: WA,
  menu: menu.groups,
  menu_nav: menu.nav,
  menu_total: String(menu.total),
  logo: LOGO,
  favicon: FAVICON,
};

let html = layout
  .replace(/\{\{> (\w+)\}\}/g, (_, n) => partial(n))
  .replace("{{content}}", () => routes);
html = relink(html)
  .replace(/\{\{video\.(\w+)\}\}/g, (_, k) => {
    if (!(k in VIDEO)) throw new Error(`Vídeo desconhecido: ${k}`);
    return VIDEO[k];
  })
  .replace(/\{\{img\.(\w+)\}\}/g, (_, k) => {
    if (!(k in IMG)) throw new Error(`Imagem desconhecida: ${k}`);
    return IMG[k];
  })
  .replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (!(k in vars)) throw new Error(`Variável desconhecida: {{${k}}}`);
    return vars[k];
  })
  .replace("<!--STYLES-->", () => `<style>\n${css}\n</style>`)
  .replace("<!--SCRIPTS-->", () => `<script>\nvar WA_NUMBER = "${WA_NUMBER}";\n${js}\n</script>`);

// Checagens: ids únicos e nenhuma âncora sem destino.
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]);
const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
if (dup.length) throw new Error("ids repetidos: " + [...new Set(dup)].join(", "));
const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map((x) => x[1]);
const missing = anchors.filter((a) => !ids.includes(a));
if (missing.length) throw new Error("âncoras sem destino: " + [...new Set(missing)].join(", "));
if (/href="[\w-]+\.html/.test(html)) throw new Error("ainda há link para outra página .html");

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "index.html"), html);
writeFileSync(
  join(out, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE}/</loc></url>\n</urlset>\n`
);
writeFileSync(join(out, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`Pronto: dist/index.html (${(html.length / 1024).toFixed(0)} KB, ${menu.total} itens no cardápio)`);
