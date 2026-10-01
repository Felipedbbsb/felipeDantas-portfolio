import { renderProjectCard } from './project-card.js';

const cleanText = (value) => String(value)
  .replace(/\b(?:19|20)\d{2}(?:[—-]\d{2,4})?\b/g, '')
  .replace(/Since September 2026, /g, '')
  .replace(/Desde setembro de 2026, /g, '')
  .replace(/\s{2,}/g, ' ')
  .trim();

const translateLinkLabel = (label, language) => {
  if (language !== 'pt') return label;
  return {
    'View Steam': 'Ver Steam',
    'View Xbox': 'Ver Xbox',
    'Demo': 'Demonstração'
  }[label] || label;
};

const renderFact = (label, value) => `
  <div class="print-fact">
    <strong>${label}</strong>
    <span>${value}</span>
  </div>`;

const projectPages = (projects, size = 6) => projects.reduce((pages, project, index) => {
  const page = Math.floor(index / size);
  if (!pages[page]) pages[page] = [];
  pages[page].push(project);
  return pages;
}, []);

export const renderPrintDocument = ({ projects, translation, language }) => {
  const t = translation;
  const portuguese = language === 'pt';
  const facts = [
    renderFact(t['print.education'], t['about.education']),
    renderFact(t['print.autonomous'], t['about.work']),
    renderFact(t['print.fira'], t['about.fira']),
    renderFact(t['print.teaching'], t['about.teaching'])
  ].join('');
  const projectGroups = projectPages(projects);

  return `
    <header class="print-header">
      <div>
        <p class="print-kicker">${t['nav.pdf']}</p>
        <h1>Felipe Dantas<br><em>Borges.</em></h1>
        <p class="print-alias">aka <strong>Dooma</strong></p>
        <p class="print-lede">${t['hero.lede']}</p>
        <a class="print-site-link" href="https://felipedbbsb.github.io/felipeDantas-portfolio/">${t['print.siteCta']}</a>
        <p class="print-contact"><a href="mailto:doomadev@gmail.com">doomadev@gmail.com</a> · <a href="https://x.com/DoomaDoomz">@DoomaDoomz</a></p>
      </div>
      <img class="print-profile" src="public/assets/fotoLegal.jpeg" alt="${portuguese ? 'Felipe Dantas Borges' : 'Felipe Dantas Borges'}">
    </header>

    <section class="print-section print-about">
      <div class="print-section-label">${t['section.about']}</div>
      <div>
        <h2>${t['about.title']}</h2>
        <p class="print-body print-lead">${t['about.body']}</p>
        <div class="print-facts">${facts}</div>
      </div>
    </section>

    <section class="print-section print-projects">
      <div class="print-section-label">${t['section.projects']}</div>
      <div>
        <h2>${t['projects.title']}</h2>
        <div class="print-project-pages">${projectGroups.map((group) => `<div class="print-project-page"><div class="print-project-grid">${group.map((project) => renderProjectCard(project, { language, variant: 'print', descriptionTransform: cleanText, labelForLink: translateLinkLabel })).join('')}</div></div>`).join('')}</div>
      </div>
    </section>

    <section class="print-section print-tools">
      <div class="print-section-label">${t['section.tools']}</div>
      <div class="print-tool-grid">
        <div><h3>${t['skills.languages']}</h3><p>${t['print.languages']}</p></div>
        <div><h3>${t['skills.development']}</h3><p>${t['print.development']}</p></div>
        <div><h3>${t['skills.languagesSpoken']}</h3><p>${t['skills.spoken']}</p></div>
      </div>
    </section>

    <section class="print-section print-contact-final">
      <div class="print-section-label">${t['section.contact']}</div>
      <div class="print-contact-layout">
        <div>
          <h2>${t['contact.title']}</h2>
          <p class="print-body print-lead">${t['contact.lede']}</p>
          <div class="print-contact-links"><a href="mailto:doomadev@gmail.com">doomadev@gmail.com</a><a href="https://felipedbbsb.github.io/felipeDantas-portfolio/">${t['print.site']}</a></div>
          <div class="print-contact-socials"><a href="https://github.com/Felipedbbsb/felipeDantas-portfolio" aria-label="GitHub"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.55 9.55 0 0 1 12 7.01c.85 0 1.71.11 2.51.33 1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85v2.64c0 .26.18.57.69.47A10 10 0 0 0 12 2Z"/></svg></a><a href="https://www.linkedin.com/in/felipe-dantas-b432b424/" aria-label="LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 3.5A1.7 1.7 0 1 1 1.8 3.5a1.7 1.7 0 0 1 3.4 0ZM2.1 8h3.2v10H2.1V8Zm5.2 0h3v1.4h.1A3.3 3.3 0 0 1 13.4 8c3.2 0 3.8 2.1 3.8 4.8V18H14v-4.6c0-1.1 0-2.5-1.5-2.5s-1.7 1.2-1.7 2.4V18H7.3V8Z"/></svg></a><a href="https://x.com/DoomaDoomz" aria-label="X / Twitter"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723 10.02 10.02 0 0 1-3.127 1.195 4.92 4.92 0 0 0-8.384 4.482A13.978 13.978 0 0 1 1.67 3.15a4.92 4.92 0 0 0 1.523 6.574 4.903 4.903 0 0 1-2.229-.616v.061a4.922 4.922 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.224.084 4.93 4.93 0 0 0 4.6 3.419A9.868 9.868 0 0 1 .96 19.54a13.906 13.906 0 0 0 7.548 2.212c9.057 0 14.01-7.507 14.01-14.01 0-.213-.005-.425-.014-.636a10.012 10.012 0 0 0 2.46-2.548z"/></svg></a><a href="https://doomadoom.itch.io/" aria-label="Itch.io"><img src="public/assets/icons/itchio.svg" alt=""></a></div>
        </div>
        <div class="print-contact-photo"><img src="public/assets/fotoLegal.jpeg" alt="Felipe Dantas Borges"></div>
      </div>
    </section>
  `;
};
