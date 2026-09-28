import { projects, translations } from './data.js';

const lang = document.documentElement.dataset.lang || 'en';
const base = document.body.dataset.base || '';
const copy = translations[lang];
document.querySelectorAll('[data-i18n]').forEach((element) => { const value = copy[element.dataset.i18n]; if (value) element.innerHTML = value; });
const grid = document.querySelector('#project-grid');
if (grid) grid.innerHTML = projects.map((project, index) => `
  <article class="project-card ${index === 0 ? 'project-card-featured' : ''}">
    <a class="project-image" href="${project.links[0]?.url || '#contact'}" target="_blank" rel="noreferrer"><img src="${base}public/assets/projects/${project.image}" alt="${project.title[lang]}" loading="lazy"><span class="project-arrow">↗</span></a>
    <div class="project-meta"><span>${project.year}</span><span>${project.type[lang]}</span></div><h3>${project.title[lang]}</h3><p>${project.description[lang]}</p>
    <div class="tag-list">${project.tags.map(tag => `<span>${tag}</span>`).join('')}</div><div class="project-links">${project.links.map(link => `<a href="${link.url}" target="_blank" rel="noreferrer">${link.label} ↗</a>`).join('')}</div>
  </article>`).join('');
