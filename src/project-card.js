const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

const normalizeMedia = (project) => ({
  source: project.media?.source,
  printSource: project.media?.printSource || project.media?.source,
  fit: project.media?.fit || 'cover',
  printFit: project.media?.printFit || project.media?.fit || 'cover',
  position: project.media?.position || 'center',
  printPosition: project.media?.printPosition || project.media?.position || 'center'
});

const renderLinks = (links, language, className, labelForLink) => links.map((link) => (
  `<a class="${className}" href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(labelForLink(link.label, language))}</a>`
)).join('');

const renderTags = (tags, className) => `<div class="${className}">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>`;

const mediaStyle = (media, variant) => {
  const fit = variant === 'print' ? media.printFit : media.fit;
  const position = variant === 'print' ? media.printPosition : media.position;
  return `--project-image-fit:${escapeHtml(fit)};--project-image-position:${escapeHtml(position)}`;
};

export const renderProjectCard = (project, {
  language,
  variant = 'web',
  assetBase = '',
  index = 0,
  detailsLabel = 'Details',
  descriptionTransform = (value) => value,
  labelForLink = (label) => label
}) => {
  const media = normalizeMedia(project);
  const source = variant === 'print' ? media.printSource : media.source;
  const imageUrl = `${assetBase}public/assets/projects/${source}`;
  const title = project.title[language];
  const description = descriptionTransform(project.description[language]);
  const firstLink = project.links[0]?.url || '#contact';
  const tone = `tone-${project.tone || 'default'}`;
  const style = mediaStyle(media, variant);

  if (variant === 'print') {
    return `
      <article class="print-project ${tone}" style="${style}">
        <a class="print-project-media" href="${escapeHtml(firstLink)}" target="_blank" rel="noreferrer" aria-label="Open ${escapeHtml(title)}">
          <img src="${imageUrl}" alt="${escapeHtml(title)}">
        </a>
        <div class="print-project-content">
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(description)}</p>
          ${renderTags(project.tags, 'print-tags')}
          <div class="print-links">${renderLinks(project.links, language, 'print-link', labelForLink)}</div>
        </div>
      </article>`;
  }

  return `
    <article class="project-card reveal ${tone} ${index === 0 ? 'project-card-featured' : ''}" style="${style}">
      <div class="project-image">
        <a class="project-image-link" href="${escapeHtml(firstLink)}" target="_blank" rel="noreferrer" aria-label="Open ${escapeHtml(title)}">
          <img src="${imageUrl}" alt="${escapeHtml(title)}" loading="lazy">
        </a>
        <div class="project-overlay">
          <h3>${escapeHtml(title)}</h3>
          <button class="project-details-toggle" type="button" aria-expanded="false">${escapeHtml(detailsLabel)} <span aria-hidden="true">+</span></button>
          <p>${escapeHtml(description)}</p>
          ${renderTags(project.tags, 'tag-list')}
          <div class="project-links">${renderLinks(project.links, language, 'button button-small', labelForLink)}</div>
        </div>
      </div>
    </article>`;
};
