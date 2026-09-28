import { chromium } from 'playwright';
import { resolve } from 'node:path';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png' };
const server = createServer(async (req, res) => { try { const file = join(root, decodeURIComponent(req.url === '/' ? '/print.html' : req.url)); const data = await readFile(file); res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' }); res.end(data); } catch { res.writeHead(404); res.end(); } });
server.listen(4174, async () => { const browser = await chromium.launch(); const page = await browser.newPage(); await page.goto('http://127.0.0.1:4174/print.html', { waitUntil: 'networkidle' }); await page.pdf({ path: join(root, 'felipe-dantas-borges.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true }); await browser.close(); server.close(); console.log('PDF gerado em felipe-dantas-borges.pdf'); });
