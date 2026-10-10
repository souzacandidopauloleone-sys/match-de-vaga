# Bar e Choperia Esperança: site

Site completo com 5 páginas: Início, Cardápio, A casa, Contato e reservas, e a página 404.

## Como abrir

Abra `dist/index.html` com dois cliques. Cada página já traz o CSS, o JavaScript e as fontes
embutidos, então funciona sem servidor e sem instalar nada.

Para publicar, envie o conteúdo de `dist/` para qualquer hospedagem (Hostinger, Netlify, Vercel,
GitHub Pages). `sitemap.xml` e `robots.txt` já estão incluídos.

## Estrutura

```
build.mjs              monta o site em dist/ (node build.mjs)
src/layout.html        esqueleto comum a todas as páginas (SEO, Open Graph)
src/partials/          cabeçalho, rodapé e ícones (Phosphor)
src/pages/             conteúdo de cada página
src/data/cardapio.json pratos, descrições e preços
src/assets/            CSS, JavaScript e fontes (Bricolage Grotesque + Geist, licença OFL)
dist/                  site pronto (gerado, não editar à mão)
```

## Como editar

1. Altere os arquivos em `src/` (por exemplo, `src/data/cardapio.json` para o cardápio).
2. Rode `node build.mjs` (Node 18 ou mais novo).
3. O site atualizado sai em `dist/`.

No cardápio, use `"preco": "R$ 89,90"` para mostrar o preço. Com `null`, aparece "Preço no WhatsApp".

## Recursos

- Tema escuro e claro (segue o aparelho, com botão para alternar).
- Formulário de reserva: valida nome, data, horário (bloqueia das 6h às 11h, quando a casa está
  fechada) e número de pessoas. Depois abre o WhatsApp com a mensagem pronta.
- Cardápio com barra de categorias que acompanha a rolagem.
- Barra fixa "Pedir no WhatsApp" no celular.
- Animações de entrada respeitam a opção "reduzir movimento" do sistema.
- Lighthouse: Desempenho 98, Acessibilidade 100, SEO 100.

## Antes de publicar

1. **Fotos reais.** As imagens atuais foram geradas por IA e são provisórias. Salve as fotos do
   bar em `src/assets/img/` e troque os endereços no objeto `IMG` em `build.mjs`.
2. **Confirmar dados** (coletados de fontes públicas):
   - Horário: 11h às 6h todos os dias (Instagram). O Apple Maps mostra 11h à 0h.
   - WhatsApp (21) 97012-5975 e telefone (21) 3104-6126.
   - Se a casa aceita reservas pelo WhatsApp (formulário da página Contato).
   - Números da página inicial: nota 4,9 com mais de 5 mil avaliações (Restaurant Guru) e 349 mil seguidores.
3. **Cardápio completo.** Preencha `src/data/cardapio.json` com todos os pratos e preços.
