# Felipe Dantas Borges — Portfolio

<https://felipedbbsb.github.io/felipeDantas-portfolio/>

## Add a project

1. Add an image to `public/assets/projects/`.
2. Add a project entry to `src/data.js`.
3. Run `npm run check`.
4. Commit and push. GitHub Pages publishes automatically.

```js
{
  title: bilingual('My Game', 'Meu Jogo'),
  media: media('my-game.jpg'),
  description: bilingual('Short English description.', 'Descrição curta em português.'),
  tags: ['Unity', 'C#'],
  links: [{ label: 'Itch.io', url: 'https://itch.io/...' }]
}
```

Provide both localized strings. Use `links: []` when there are no links. Add `printSource` or `printPosition` to `media()` only when the PDF needs a different crop.

## Commands

```bash
npm run serve  # local preview
npm run check  # validate projects
npm run pdf    # generate both PDFs
```

## Main files

| File | Purpose |
| --- | --- |
| `src/data.js` | Content, projects, and localization |
| `src/styles.css` | Site styling |
| `src/print.css` | PDF styling |
| `docs/project-template.js` | Full project template |
