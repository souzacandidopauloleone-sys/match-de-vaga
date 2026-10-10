# Bar e Choperia Esperança: site

Site completo em **um único arquivo**: `dist/index.html`. Ele traz quatro páginas (Início, Cardápio,
A casa, Contato) com navegação interna (`#cardapio`, `#a-casa`, `#contato`). CSS, JavaScript, fontes
e logo já vêm embutidos, então o site abre com dois cliques, mesmo direto de dentro do zip.

## Conteúdo (fontes oficiais)

- **Cardápio:** 359 itens em 17 categorias, com preços, variações e fotos, tirados do cardápio
  digital oficial (digitalmenuart.com.br/esperanca). Tem busca por nome e barra de categorias.
- **História:** texto do site oficial e da Wikifavelas. Começou em 1993 como Bar do Sorriso, do seu
  Ednaldo; virou Bar Esperança em 2006 com Rondinele; foi ampliado em 2018 com o antigo restaurante
  Resumo 2. Hoje tem rooftop e música ao vivo.
- **Contatos:** Rua Esperança, 12, Praça do Parque União, Maré. Telefone (21) 3104-6126, WhatsApp
  (21) 98429-2033, contato@barechoperiaesperanca.com.br. Restaurante das 11h às 6h e delivery das
  11h às 2h, todos os dias.
- **Depoimentos:** avaliações reais do Google publicadas no site antigo.
- **Logo:** arquivo oficial do site antigo.

## Imagens

- Fotos reais dos pratos e drinks vêm do cardápio digital oficial.
- A foto e o vídeo da abertura, a foto do salão e a do chope foram geradas por IA, sem mar nem
  paisagem. Para trocar, edite o objeto `IMG` em `build.mjs`.

## Estrutura

```
build.mjs              monta dist/index.html (node build.mjs)
src/layout.html        esqueleto (SEO, Open Graph)
src/partials/          cabeçalho, rodapé e ícones (Phosphor)
src/pages/             conteúdo de cada página
src/data/cardapio.json cardápio oficial (edite aqui pratos e preços)
src/assets/            CSS, JavaScript, fontes (Bricolage Grotesque + Geist, OFL) e logo
dist/                  site pronto (gerado, não editar à mão)
```

## Como editar

1. Altere os arquivos em `src/`.
2. Rode `node build.mjs` (Node 18 ou mais novo). O build avisa se algum link interno ficar quebrado.
3. O site atualizado sai em `dist/index.html`.

## Recursos

- Tema escuro e claro, com botão para alternar.
- Vídeo em loop na abertura, que fica parado para quem pede menos movimento.
- Formulário de reserva: valida os campos, bloqueia horários com a casa fechada e abre o WhatsApp
  com a mensagem pronta.
- Barra fixa "Pedir no WhatsApp" no celular.
- Lighthouse: Acessibilidade 100, SEO 100. Desempenho 100 no computador e 90 no celular.

## A confirmar com a casa

- Se aceitam reservas pelo WhatsApp (formulário da página Contato).
- Números da página inicial: nota 4,9 com mais de 5 mil avaliações (Restaurant Guru) e 349 mil seguidores.
