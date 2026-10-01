import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects } from '../src/data.js';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const errors = [];
const requiredText = (value) => value && value.en?.trim() && value.pt?.trim();

projects.forEach((project, index) => {
  const label = `Project ${index + 1} (${project.title?.en || 'untitled'})`;
  if (!requiredText(project.title) || !requiredText(project.description)) errors.push(`${label}: missing title or bilingual description`);
  const media = project.media;
  if (!media?.source || !existsSync(resolve(root, 'public/assets/projects', media.source))) errors.push(`${label}: web image not found: ${media?.source || 'missing'}`);
  if (!media?.printSource || !existsSync(resolve(root, 'public/assets/projects', media.printSource))) errors.push(`${label}: print image not found: ${media?.printSource || 'missing'}`);
  if (!['cover', 'contain'].includes(media?.fit) || !['cover', 'contain'].includes(media?.printFit)) errors.push(`${label}: invalid media fit`);
  if (!media?.position || !media?.printPosition) errors.push(`${label}: missing media position`);
  project.links?.forEach((link) => { try { new URL(link.url); } catch { errors.push(`${label}: invalid link: ${link.url}`); } });
});

if (errors.length) { console.error(errors.map((error) => `✗ ${error}`).join('\n')); process.exit(1); }
console.log(`✓ ${projects.length} projects validated`);
