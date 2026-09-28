import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects } from '../src/data.js';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const errors = [];
const requiredText = (value) => value && value.en?.trim() && value.pt?.trim();

projects.forEach((project, index) => {
  const label = `Project ${index + 1} (${project.title?.en || 'untitled'})`;
  if (!project.year || !requiredText(project.title) || !requiredText(project.type) || !requiredText(project.description)) errors.push(`${label}: missing year, title, type or bilingual description`);
  if (!project.image || !existsSync(resolve(root, 'public/assets/projects', project.image))) errors.push(`${label}: image not found: ${project.image}`);
  project.links?.forEach((link) => { try { new URL(link.url); } catch { errors.push(`${label}: invalid link: ${link.url}`); } });
});

if (errors.length) { console.error(errors.map((error) => `✗ ${error}`).join('\n')); process.exit(1); }
console.log(`✓ ${projects.length} projects validated`);
