# Bar e Choperia Esperança: novo site

Recriação do site https://barechoperiaesperanca.com.br/ como página única, estática e rápida.

## Estrutura

```
bar-esperanca/
  index.html            página (SEO, Open Graph, dados estruturados schema.org BarOrPub)
  assets/css/style.css  tokens de cor (escuro e claro), layout e animações
  assets/js/main.js     menu mobile, troca de tema, revelação ao rolar, marquee
  assets/fonts/         Bricolage Grotesque + Geist (OFL, hospedadas no próprio site)
```

Sem build e sem dependências. Para testar localmente:

```bash
cd bar-esperanca && python3 -m http.server 8000
# abrir http://localhost:8000
```

Publica em qualquer hospedagem estática (Hostinger, Netlify, Vercel, GitHub Pages).

## Antes de publicar

1. **Fotos reais.** As imagens atuais foram geradas por IA e servem só como provisórias, carregadas de um CDN externo. Troque pelas fotos do bar (as do Instagram são ótimas), salve em `assets/img/` em `.webp` com ~1600px no lado maior e atualize os `src` no `index.html`.
2. **Confirmar dados** (coletados de fontes públicas):
   - Horário: 11h às 6h todos os dias (Instagram). O Apple Maps mostra 11h à 0h.
   - WhatsApp: (21) 97012-5975. Telefone fixo: (21) 3104-6126.
   - Endereço: Rua Esperança, 12, Parque União, Maré. O CEP diverge entre as fontes e ficou de fora.
   - Números: nota 4,9 com mais de 5 mil avaliações (Restaurant Guru) e 349 mil seguidores.
   - Descrições dos pratos e o depoimento do Tripadvisor.
3. **Cardápio com preços.** Se quiserem o cardápio completo no site, envie a lista para criar a página.
