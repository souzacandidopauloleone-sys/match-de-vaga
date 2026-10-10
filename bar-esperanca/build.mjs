// Monta o site em dist/: junta layout + partes + páginas, gera o cardápio a partir
// de src/data/cardapio.json e embute CSS, JS e fontes em cada página. O resultado
// abre com dois cliques (sem servidor) e também sobe em qualquer hospedagem.
// Uso: node build.mjs   (Node 18+, sem dependências)
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, "src");
const out = join(root, "dist");

const SITE = "https://barechoperiaesperanca.com.br";
const WA = "https://wa.me/5521970125975?text=Ol%C3%A1!%20Quero%20fazer%20um%20pedido.";

// Fotos provisórias (geradas por IA). Troque pelas fotos reais do bar:
// salve em src/assets/img e use, por exemplo, "assets/img/picanha.webp".
const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3FjM8DdHcxZCUrb8JPqKpFoJ3op/";
const IMG = {
  picanha: CDN + "hf_20261010_132901_f4ac8fb9-7472-4d5c-ac1f-a29dbd0fd54f.png",
  tilapia: CDN + "hf_20261010_132920_7638a504-296a-46b1-a8aa-9c5425c27262.png",
  brasa: CDN + "hf_20261010_132901_5bf2ace7-76eb-4d72-aa9c-88225d0b73a7.png",
  chope: CDN + "hf_20261010_132920_4641b441-edb8-47c4-bfaf-bbd1943d5811.png",
  drinks: CDN + "hf_20261010_132937_5408e154-0359-45fb-b7dc-45cc580d7092.png",
  ambiente: CDN + "hf_20261010_132937_e8f47ea6-9ebf-4f6c-a38f-327a5356babd.png",
  porcoes: CDN + "hf_20261010_132901_c03adcc1-3440-447b-85a7-b86f6dec7ea4.png",
  balcao: CDN + "hf_20261010_132901_b63879fd-46a8-4c8d-925a-fd61951420f1.png",
};

// Vídeo da abertura (gerado a partir da foto da picanha). O pôster é a própria foto.
const VIDEO = {
  hero: CDN + "hf_20261010_140004_96b9ca75-87b9-4468-ba30-70b8c59780fa.mp4",
};

const read = (p) => readFileSync(join(src, p), "utf8");
const dataUri = (p, type) => `data:${type};base64,${readFileSync(join(src, p)).toString("base64")}`;
const LOGO = dataUri("assets/img/logo.png", "image/png");
const FAVICON = dataUri("assets/img/favicon.png", "image/png");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// ---------- Cardápio ----------
function renderMenu() {
  const data = JSON.parse(read("data/cardapio.json"));
  const nav = data.categorias
    .map((c) => `<a class="cats__link" href="#${esc(c.id)}">${esc(c.nome)}</a>`)
    .join("\n    ");
  const groups = data.categorias
    .map((c) => {
      const items = c.itens
        .map((it) => {
          const price = it.preco
            ? `<span class="menu-item__price">${esc(it.preco)}</span>`
            : `<span class="menu-item__price menu-item__price--ask">Preço no WhatsApp</span>`;
          const flag = it.destaque ? `<span class="menu-item__flag">Carro-chefe</span>` : "";
          return `<li class="menu-item reveal">
          <h3>${flag}${esc(it.nome)}</h3>
          ${price}
          ${it.descricao ? `<p>${esc(it.descricao)}</p>` : ""}
        </li>`;
        })
        .join("\n        ");
      const img = IMG[c.imagem] || c.imagem;
      return `<section class="menu-group" id="${esc(c.id)}" aria-labelledby="${esc(c.id)}-titulo">
    <div class="menu-group__aside reveal">
      <h2 id="${esc(c.id)}-titulo">${esc(c.nome)}</h2>
      ${c.texto ? `<p>${esc(c.texto)}</p>` : ""}
    </div>
    <div class="menu-group__main">
      ${img ? `<figure class="menu-group__img reveal"><img src="${esc(img)}" loading="lazy" decoding="async" alt="${esc(c.nome)}"></figure>` : ""}
      <ul class="menu-items">
        ${items}
      </ul>
    </div>
  </section>`;
    })
    .join("\n  ");
  return { nav, groups };
}

// ---------- Recursos embutidos ----------
function inlineCss() {
  let css = read("assets/css/style.css");
  css = css.replace(/url\("\.\.\/fonts\/([^"]+)"\)/g, (_, f) => {
    const b64 = readFileSync(join(src, "assets/fonts", f)).toString("base64");
    return `url("data:font/woff2;base64,${b64}")`;
  });
  return `<style>\n${css}\n</style>`;
}
const css = inlineCss();
const js = `<script>\n${read("assets/js/main.js")}\n</script>`;

// ---------- Páginas ----------
const layout = read("layout.html");
const partials = Object.fromEntries(
  readdirSync(join(src, "partials")).map((f) => [f.replace(/\.\w+$/, ""), read("partials/" + f)])
);
const menu = renderMenu();

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const pages = readdirSync(join(src, "pages")).filter((f) => f.endsWith(".html"));
const sitemap = [];

for (const file of pages) {
  const raw = read("pages/" + file);
  const m = raw.match(/^<!--meta (\{.*?\}) -->\n/s);
  if (!m) throw new Error(`Faltou o bloco <!--meta {...} --> em ${file}`);
  const meta = JSON.parse(m[1]);
  const content = raw.slice(m[0].length);

  let html = layout.replace(/\{\{> (\w+)\}\}/g, (_, n) => {
    if (!(n in partials)) throw new Error(`Parte não encontrada: ${n}`);
    return partials[n];
  });
  html = html.replace("{{content}}", () => content);

  const vars = {
    title: esc(meta.title),
    description: esc(meta.description),
    path: meta.path,
    nav: meta.nav,
    site: SITE,
    wa: WA,
    menu: menu.groups,
    menu_nav: menu.nav,
    logo: LOGO,
    favicon: FAVICON,
  };
  html = html
    .replace(/\{\{video\.(\w+)\}\}/g, (_, k) => {
      if (!(k in VIDEO)) throw new Error(`Vídeo desconhecido: ${k} em ${file}`);
      return VIDEO[k];
    })
    .replace(/\{\{img\.(\w+)\}\}/g, (_, k) => {
      if (!(k in IMG)) throw new Error(`Imagem desconhecida: ${k} em ${file}`);
      return IMG[k];
    })
    .replace(/\{\{(\w+)\}\}/g, (_, k) => {
      if (!(k in vars)) throw new Error(`Variável desconhecida: {{${k}}} em ${file}`);
      return vars[k];
    });

  if (meta.nav) {
    html = html.replaceAll(`data-nav="${meta.nav}"`, `data-nav="${meta.nav}" aria-current="page"`);
  }
  html = html.replace("<!--STYLES-->", () => css).replace("<!--SCRIPTS-->", () => js);

  writeFileSync(join(out, file), html);
  if (file !== "404.html") sitemap.push(`${SITE}/${meta.path}`);
  console.log("ok", file);
}

writeFileSync(
  join(out, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap
    .map((u) => `  <url><loc>${u}</loc></url>`)
    .join("\n")}\n</urlset>\n`
);
writeFileSync(join(out, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`Pronto: ${pages.length} páginas em dist/`);
