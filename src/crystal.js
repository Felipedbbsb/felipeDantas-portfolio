const canvas = document.querySelector('#crystal-canvas');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const gl = canvas?.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false, powerPreference: 'high-performance' });
const quad = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
const sdfForms = [
  ['SPHERE', 'float sdSphere(vec3 p, float radius) {\n  return length(p) - radius;\n}'],
  ['TORUS', 'float sdTorus(vec3 p, vec2 torus) {\n  vec2 q = vec2(length(p.xz) - torus.x, p.y);\n  return length(q) - torus.y;\n}'],
  ['GEAR', 'float sdGear(vec3 p, float radius, float teeth) {\n  float angle = atan(p.z, p.x);\n  float tooth = smoothstep(0.18, 0.72, cos(angle * teeth));\n  float outline = length(p.xz) - radius - tooth * 0.062;\n  float hole = 0.15 - length(p.xz);\n  return max(max(outline, hole), abs(p.y) - 0.075);\n}'],
  ['CUBE', 'float sdBox(vec3 p, vec3 bounds) {\n  vec3 d = abs(p) - bounds;\n  return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));\n}'],
  ['PYRAMID', 'float sdPyramid(vec3 p, float base, float height) {\n  float halfHeight = height * 0.5;\n  float side = max(abs(p.x), abs(p.z)) - base * (halfHeight - p.y) / height;\n  float cap = max(-p.y - halfHeight, p.y - halfHeight);\n  return max(side, cap);\n}']
  ,['DIAMOND', 'float sdDiamond(vec3 p, float size) {\n  return (abs(p.x) + abs(p.y) + abs(p.z) - size) * 0.57735;\n}']
];
const sdfCode = document.querySelector('#sdf-code');
const sdfCallout = sdfCode?.closest('.crystal-sdf-callout');
const sdfArrow = document.querySelector('.sdf-arrow');
const crystalGeometry = document.querySelector('.hero-geometry');
const heroCopy = document.querySelector('.hero-copy');
let lastSdfIndex = -1;
const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const highlightSdf = (source) => escapeHtml(source).replace(/\b(float|vec2|vec3|int)\b/g, '<span class="sdf-token-type">$1</span>').replace(/\b(return|const|if|max|min)\b/g, '<span class="sdf-token-keyword">$1</span>').replace(/\b(sdSphere|sdTorus|sdGear|sdBox|sdPyramid|sdDiamond|length|atan|cos|pow|abs|sin|smoothstep|mix|dot)\b/g, '<span class="sdf-token-function">$1</span>').replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="sdf-token-number">$1</span>').replace(/([{}(),.;])/g, '<span class="sdf-token-punctuation">$1</span>');
const updateSdfArrow = () => {
  if (!sdfCallout || !sdfArrow || !crystalGeometry) return;
  const calloutRect = sdfCallout.getBoundingClientRect();
  const crystalRect = crystalGeometry.getBoundingClientRect();
  const calloutCenterX = calloutRect.left + calloutRect.width * 0.5;
  const calloutCenterY = calloutRect.top + calloutRect.height * 0.5;
  const endX = crystalRect.left + crystalRect.width * 0.5;
  const endY = crystalRect.top + crystalRect.height * 0.5;
  const directionX = endX - calloutCenterX;
  const directionY = endY - calloutCenterY;
  const halfWidth = Math.max(1, calloutRect.width * 0.5);
  const halfHeight = Math.max(1, calloutRect.height * 0.5);
  const edgeScale = 1 / Math.max(Math.abs(directionX) / halfWidth, Math.abs(directionY) / halfHeight);
  const startX = calloutCenterX + directionX * edgeScale;
  const startY = calloutCenterY + directionY * edgeScale;
  const length = Math.min(240, Math.hypot(endX - startX, endY - startY));
  const angle = Math.atan2(endY - startY, endX - startX);
  sdfArrow.style.left = `${(startX - calloutRect.left).toFixed(2)}px`;
  sdfArrow.style.top = `${(startY - calloutRect.top).toFixed(2)}px`;
  sdfArrow.style.transform = `translateY(-50%) rotate(${angle.toFixed(4)}rad)`;
  sdfArrow.style.setProperty('--sdf-arrow-length', `${length.toFixed(2)}px`);
};
let lastSdfPlacement = '';
let placementFrame = 0;
const updateSdfPlacement = () => {
  if (!sdfCallout) return;
  if (matchMedia('(max-width: 700px)').matches) {
    const mobilePlacement = 'mobile';
    if (lastSdfPlacement !== mobilePlacement) {
      sdfCallout.style.left = '50%';
      sdfCallout.style.top = 'auto';
      sdfCallout.style.bottom = '-58px';
      sdfCallout.style.transform = 'translate3d(-50%,0,0)';
      lastSdfPlacement = mobilePlacement;
    }
    return;
  }
  const protectedRects = [heroCopy].filter(Boolean).map((element) => element.getBoundingClientRect());
  const parentRect = sdfCallout.parentElement.getBoundingClientRect();
  const crystalRect = crystalGeometry.getBoundingClientRect();
  const calloutRect = sdfCallout.getBoundingClientRect();
  const calloutWidth = calloutRect.width;
  const calloutHeight = calloutRect.height;
  const crystalCenterX = crystalRect.left + crystalRect.width * 0.5;
  const crystalCenterY = crystalRect.top + crystalRect.height * 0.5;
  const sdfCenterDistance = 300;
  const leftOffset = crystalCenterX - parentRect.left - calloutWidth * 0.5 - sdfCenterDistance;
  const belowOffset = crystalCenterY - parentRect.top - calloutHeight * 0.5 + sdfCenterDistance;
  const candidates = [
    { key: 'left', left: `${leftOffset.toFixed(2)}px`, top: `${(crystalCenterY - parentRect.top - calloutHeight * 0.5).toFixed(2)}px`, transform: 'translate3d(0,0,0)' },
    { key: 'below', left: `${(crystalCenterX - parentRect.left - calloutWidth * 0.5).toFixed(2)}px`, top: `${belowOffset.toFixed(2)}px`, transform: 'translate3d(0,0,0)' }
  ];
  const overlaps = (rect) => protectedRects.some((other) => rect.left < other.right && rect.right > other.left && rect.top < other.bottom && rect.bottom > other.top);
  const measureCandidate = (item) => {
    const probe = sdfCallout.cloneNode(true);
    probe.style.left = item.left;
    probe.style.top = item.top;
    probe.style.bottom = 'auto';
    probe.style.transform = item.transform;
    probe.style.visibility = 'hidden';
    probe.style.transition = 'none';
    probe.style.pointerEvents = 'none';
    sdfCallout.parentElement.append(probe);
    const rect = probe.getBoundingClientRect();
    probe.remove();
    return rect;
  };
  const leftCandidate = candidates[0];
  const candidate = !overlaps(measureCandidate(leftCandidate))
    ? leftCandidate
    : candidates[1];
  if (lastSdfPlacement !== candidate.key || sdfCallout.style.left !== candidate.left) {
    sdfCallout.style.left = candidate.left;
    sdfCallout.style.top = candidate.top;
    sdfCallout.style.bottom = 'auto';
    sdfCallout.style.transform = candidate.transform;
    lastSdfPlacement = candidate.key;
  }
};
const randomValue = (seed) => {
  const value = Math.sin(seed * 91.731) * 43758.5453;
  return value - Math.floor(value);
};

const compile = (type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
};

const start = async () => {
  if (!gl) {
    canvas?.parentElement?.classList.add('crystal-fallback');
    return;
  }
  const [vertex, fragmentTemplate, shapes] = await Promise.all([
    fetch(new URL('./shaders/quad.vert', import.meta.url)).then((response) => response.text()),
    fetch(new URL('./shaders/crystal.frag?rev=19', import.meta.url), { cache: 'no-store' }).then((response) => response.text()),
    fetch(new URL('./shaders/crystal-shapes.glsl?rev=8', import.meta.url), { cache: 'no-store' }).then((response) => response.text())
  ]);
  const fragment = fragmentTemplate.replace('__SHAPES__', shapes);
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  const resolution = gl.getUniformLocation(program, 'resolution');
  const time = gl.getUniformLocation(program, 'time');
  const scrollUniform = gl.getUniformLocation(program, 'scroll');
  const shapeCurrent = gl.getUniformLocation(program, 'shapeCurrent');
  const shapeNext = gl.getUniformLocation(program, 'shapeNext');
  const shapeBlend = gl.getUniformLocation(program, 'shapeBlend');
  const startedAt = performance.now();
  let scrollTarget = 0;
  let scrollValue = 0;
  const getShapeState = (elapsed, scroll) => {
    const sequence = elapsed * 0.21 + scroll * 0.39;
    const cycle = Math.floor(sequence);
    const progress = sequence - cycle;
    const blend = progress * progress * progress * (progress * (progress * 6 - 15) + 10);
    const shapeOrder = [2, 5, 0, 4, 1, 3];
    return {
      cycle,
      index: shapeOrder[cycle % shapeOrder.length],
      next: shapeOrder[(cycle + 1) % shapeOrder.length],
      blend
    };
  };
  const updateSdfCallout = ({ index }) => {
    if (!sdfCode || index === lastSdfIndex) return;
    const source = sdfForms[index][1];
    const lines = source.split('\n');
    const longestLine = Math.max(...lines.map((line) => line.length));
    const width = Math.max(160, Math.min(252, (34 + longestLine * 6.2) * 0.765));
    const charsPerLine = Math.max(24, Math.floor((width - 26) / 6.2));
    const visualLines = lines.reduce((total, line) => total + Math.max(1, Math.ceil(line.length / charsPerLine)), 0);
    const height = Math.round((62 + visualLines * 18) * 0.85);
    lastSdfIndex = index;
    sdfCode.innerHTML = highlightSdf(source);
    sdfCallout?.style.setProperty('--sdf-width', `${width}px`);
    sdfCallout?.style.setProperty('--sdf-height', `${height}px`);
    sdfCallout?.setAttribute('data-shape', sdfForms[index][0]);
    cancelAnimationFrame(placementFrame);
    placementFrame = requestAnimationFrame(updateSdfPlacement);
  };

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.25);
    const width = Math.round(canvas.clientWidth || canvas.offsetWidth || 320);
    const height = Math.round(canvas.clientHeight || canvas.offsetHeight || width);
    const size = Math.max(1, Math.min(width, height));
    canvas.width = Math.max(1, Math.round(size * dpr));
    canvas.height = canvas.width;
    gl.viewport(0, 0, canvas.width, canvas.height);
    cancelAnimationFrame(placementFrame);
    placementFrame = requestAnimationFrame(updateSdfPlacement);
  };
  const updateScroll = () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    scrollTarget = Math.min(1, scrollY / maxScroll);
  };
  let renderFrame = 0;
  const render = (now) => {
    gl.useProgram(program);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(resolution, canvas.width, canvas.height);
    scrollValue += (scrollTarget - scrollValue) * 0.06;
    gl.uniform1f(scrollUniform, scrollValue);
    const elapsed = reducedMotion ? 0 : (now - startedAt) / 1000;
    gl.uniform1f(time, elapsed);
    const shapeState = getShapeState(elapsed, scrollValue);
    gl.uniform1f(shapeCurrent, shapeState.index);
    gl.uniform1f(shapeNext, shapeState.next);
    gl.uniform1f(shapeBlend, shapeState.blend);
    updateSdfCallout({ index: shapeState.blend > 0.001 ? shapeState.next : shapeState.index });
    if (sdfCallout) updateSdfArrow();
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    canvas.parentElement?.classList.add('crystal-ready');
    if (!reducedMotion && !document.hidden) renderFrame = requestAnimationFrame(render);
  };

  let resizeFrame = 0;
  const scheduleResize = () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(resize);
  };
  addEventListener('resize', scheduleResize, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(scheduleResize).observe(canvas.parentElement || canvas);
  addEventListener('scroll', updateScroll, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !reducedMotion) {
      cancelAnimationFrame(renderFrame);
      renderFrame = requestAnimationFrame(render);
    }
  });
  resize();
  updateScroll();
  render(startedAt);
};

start().catch((error) => {
  canvas?.parentElement?.classList.add('crystal-fallback');
  console.error('Crystal shader failed to load:', error);
});
