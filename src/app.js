import { projects, translations } from './data.js';
import { renderProjectCard } from './project-card.js';

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!window.location.hash) window.scrollTo(0, 0);

const language = document.documentElement.dataset.lang || 'en';
const assetBase = document.body.dataset.base || '';
const defaultCopy = {
  en: {
    'nav.about': 'Info',
    'nav.projects': 'Work',
    'nav.contact': 'Contact',
    'nav.pdf': 'Download PDF',
    'hero.lede': 'I make games, creative tools and artcode.',
    'hero.roles': 'game development · design · computer graphics',
    'hero.cta': 'Enter the work <span aria-hidden="true" class="arrow arrow-down"></span>',
    'hero.contact': 'Say Hello :) <span aria-hidden="true" class="arrow arrow-up"></span>',
    'contact.title': 'Let’s make<br><em>something playable.</em>',
    'contact.lede': 'Open to freelance work, collaborations, and conversations about creative technology and real-time graphics.',
    'about.body': 'I am a Computer Science graduate from the University of Brasília (UnB) working across creative technology and game development. I was the principal programmer and game designer on Dream Delirio’s and XIII — A Final Game of Tarot with Death, with games released on Steam. I build gameplay systems, Unity and Godot projects, custom C++ and SDL2 engines, shaders and procedural graphics, with experience in FMOD, Wwise and performance optimization. I also teach Computer Graphics at UnB as a volunteer professor.',
  },
  pt: {
    'nav.about': 'Info',
    'nav.projects': 'Trabalhos',
    'nav.contact': 'Falar',
    'nav.pdf': 'Baixar PDF',
    'hero.lede': 'Faço jogos, ferramentas criativas e artcode.',
    'hero.roles': 'desenvolvimento de jogos · design · computação gráfica',
    'hero.cta': 'Ver o trabalho <span aria-hidden="true" class="arrow arrow-down"></span>',
    'hero.contact': 'Chama aí!! <span aria-hidden="true" class="arrow arrow-up"></span>',
    'contact.title': 'Vamos fazer<br><em>algo jogável.</em>',
    'contact.lede': 'Aberto a trabalhos freelance, colaborações e conversas sobre tecnologia criativa e gráficos em tempo real.',
    'about.body': 'Sou formado em Ciência da Computação pela Universidade de Brasília (UnB) e atuo entre tecnologia criativa e desenvolvimento de jogos. Fui o principal programador e game designer de Dream Delirio’s e XIII — A Final Game of Tarot with Death, com jogos lançados na Steam. Desenvolvo sistemas de gameplay, projetos em Unity e Godot, engines próprias em C++ e SDL2, shaders e gráficos procedurais, além de trabalhar com FMOD, Wwise e otimização de performance. Também ministro aulas de Computação Gráfica na UnB como professor voluntário.',
  }
};

const copy = { ...translations[language], ...defaultCopy[language] };

const addBrandPhoto = () => {
  const brand = document.querySelector('.brand');
  if (!brand) return;
  brand.insertAdjacentHTML('afterbegin', `<img class="brand-photo" src="${assetBase}public/assets/fotoLegal.jpeg" alt="Felipe Dantas Borges">`);
};

const applyCopy = () => {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const value = copy[element.dataset.i18n];
    if (value) element.innerHTML = value;
  });
};

const renderProjects = () => {
  const grid = document.querySelector('#project-grid');
  const detailsLabel = language === 'pt' ? 'Detalhes' : 'Details';
  if (grid) grid.innerHTML = projects.map((project, index) => renderProjectCard(project, { language, assetBase, index, detailsLabel })).join('');
};

const setupProjectDetails = () => {
  document.querySelectorAll('.project-details-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.project-card');
      const expanded = card?.classList.toggle('is-expanded');
      button.setAttribute('aria-expanded', String(expanded));
      button.querySelector('span').textContent = expanded ? '−' : '+';
    });
  });
};

const revealProjects = () => {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  items.forEach((item) => observer.observe(item));
};

addBrandPhoto();
applyCopy();
renderProjects();
setupProjectDetails();
revealProjects();
