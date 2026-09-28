import { projects } from './data.js';

const grid = document.querySelector('#project-grid');

grid.innerHTML = projects.map((project, index) => `
  <article class="project-card ${index === 0 ? 'project-card-featured' : ''}">
    <a class="project-image" href="${project.links[0]?.url || '#contact'}" target="_blank" rel="noreferrer">
      <img src="public/assets/projects/${project.image}" alt="Imagem do projeto ${project.title}" loading="lazy" />
      <span class="project-arrow">↗</span>
    </a>
    <div class="project-meta"><span>${project.year}</span><span>${project.type}</span></div>
    <h3>${project.title}</h3>
    <p>${project.description}</p>
    <div class="tag-list">${project.tags.map(tag => `<span>${tag}</span>`).join('')}</div>
    <div class="project-links">${project.links.map(link => `<a href="${link.url}" target="_blank" rel="noreferrer">${link.label} ↗</a>`).join('')}</div>
  </article>
`).join('');
