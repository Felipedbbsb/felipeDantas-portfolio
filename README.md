# Felipe Dantas Borges — Portfolio

Portfólio estático de game development, programming e design. O conteúdo dos projetos fica em `src/data.js`; imagens extraídas do PDF de referência ficam em `public/assets/`.

## Uso local

```bash
npm run serve
```

Abra <http://localhost:4173>. Para criar o PDF automaticamente, instale as dependências e execute:

```bash
npm install
npx playwright install chromium
npm run pdf
```

O PDF é gerado usando elementos HTML `<a>`, preservando hyperlinks clicáveis. A página `print.html` também pode ser impressa diretamente pelo navegador com `Ctrl/Cmd + P`.

## Adicionar projeto

Adicione um objeto em `src/data.js` e coloque a imagem correspondente em `public/assets/projects/`. O card aparecerá automaticamente na página principal e na versão PDF.

## Próximos ajustes

- Substituir os links genéricos pelos links definitivos de GitHub, Steam, Itch.io e YouTube.
- Confirmar a imagem principal de Retro Arsenal e as galerias secundárias de cada projeto.
- Configurar GitHub Actions para publicar no GitHub Pages e gerar o PDF no build.
