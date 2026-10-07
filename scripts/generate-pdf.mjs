import { chromium } from 'playwright';
import { mkdir, readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const output = join(root, 'public', 'downloads');
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.jpg':'image/jpeg', '.png':'image/png', '.svg':'image/svg+xml' };

await mkdir(output, { recursive: true });

const browser = await chromium.launch();
try {
  for (const [language, query] of [['en',''], ['pt','?lang=pt']]) {
    const page = await browser.newPage();
    await page.route('http://portfolio.local/**', async (route) => {
      const pathname = decodeURIComponent(new URL(route.request().url()).pathname);
      const path = resolve(root, `.${pathname}`);
      if (!path.startsWith(`${root}/`)) return route.fulfill({ status: 403 });
      try {
        const body = await readFile(path);
        await route.fulfill({ body, contentType: mime[extname(path)] || 'application/octet-stream' });
      } catch {
        await route.fulfill({ status: 404 });
      }
    });
    await page.goto(`http://portfolio.local/print.html${query}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => Promise.all(Array.from(document.images, (image) => image.decode().catch(() => {}))));
    await page.pdf({ path: join(output, `felipe-dantas-borges-${language}.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true, tagged: true });
    await page.close();
  }
  console.log('Generated public/downloads/felipe-dantas-borges-en.pdf and public/downloads/felipe-dantas-borges-pt.pdf');
} finally {
  await browser.close();
}
