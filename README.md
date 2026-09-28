# Felipe Dantas Borges — Portfolio

Static portfolio for game development, programming and design. English is the default version at `/`; Portuguese is available at `/pt/`. Project content lives in `src/data.js`; images extracted from the reference PDF live in `public/assets/`.

## Local preview

```bash
npm run serve
```

Open <http://localhost:4173>. The PDF page is available at `/print.html` and `/print.html?lang=pt`. To create a PDF automatically, install the dependencies and run:

```bash
npm install
npx playwright install chromium
npm run pdf
```

The PDF uses real HTML `<a>` elements, preserving clickable hyperlinks. `print.html` can also be printed directly from the browser with `Ctrl/Cmd + P`.

## Add a project

Add a project object to `src/data.js` with English and Portuguese text, then place its image in `public/assets/projects/`. The card will appear automatically on both language versions and in the PDF.

## GitHub Pages

The repository contains `.github/workflows/deploy-pages.yml`, which deploys the static site after every push to `master`. In the repository settings, set Pages > Build and deployment > Source to **GitHub Actions**. GitHub Pages supports this workflow through `configure-pages`, `upload-pages-artifact` and `deploy-pages`.

## Next adjustments

- Replace placeholder links with the final GitHub, Steam, Itch.io and YouTube URLs.
- Confirm the main image for Retro Arsenal and secondary galleries for each project.
