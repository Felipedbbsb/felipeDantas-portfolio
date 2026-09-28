import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { mkdir, readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const output = join(root, 'dist');
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.jpg':'image/jpeg', '.png':'image/png' };
const server = createServer(async (request, response) => {
  try { const pathname = decodeURIComponent(request.url === '/' ? '/print.html' : request.url.split('?')[0]); const data = await readFile(join(root, pathname)); response.writeHead(200, {'Content-Type': mime[extname(pathname)] || 'application/octet-stream'}); response.end(data); }
  catch { response.writeHead(404); response.end(); }
});

await mkdir(output, { recursive: true });
await new Promise((resolve, reject) => server.listen(4174, resolve).on('error', reject));

try {
  const browser = await chromium.launch();
  for (const [language, query] of [['en',''], ['pt','?lang=pt']]) {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:4174/print.html${query}`, { waitUntil: 'networkidle' });
    await page.pdf({ path: join(output, `felipe-dantas-borges-${language}.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true, tagged: true });
    await page.close();
  }
  await browser.close(); server.close(); console.log('Generated dist/felipe-dantas-borges-en.pdf and dist/felipe-dantas-borges-pt.pdf');
} finally {
  server.close();
}
