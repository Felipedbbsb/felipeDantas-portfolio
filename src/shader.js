export const SHADER_CONFIG = {
  speed: 0.072,
  scrollSpeed: 1.65,
  flamingoStrength: 0.52,
  intensity: 0.48,
  warp: 0.92,
  contrast: 1.28,
  kuwaharaStrength: 0.58,
  kuwaharaRadius: 0.23,
  palette: {
    deep: [0.002, 0.004, 0.012],
    violet: [0.38, 0.035, 0.24],
    cyan: [0.0, 0.50, 0.64],
    flamingo: [0.902, 0.145, 0.498]
  }
};

const canvas = document.querySelector('#shader-canvas');
const gl = canvas?.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'high-performance' });
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const quad = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

const shaderValues = {
  SPEED: SHADER_CONFIG.speed,
  SCROLL_SPEED: SHADER_CONFIG.scrollSpeed,
  FLAMINGO_STRENGTH: SHADER_CONFIG.flamingoStrength,
  INTENSITY: SHADER_CONFIG.intensity,
  WARP: SHADER_CONFIG.warp,
  CONTRAST: SHADER_CONFIG.contrast,
  KUWAHARA_STRENGTH: SHADER_CONFIG.kuwaharaStrength,
  KUWAHARA_RADIUS: SHADER_CONFIG.kuwaharaRadius,
  DEEP: SHADER_CONFIG.palette.deep.join(','),
  VIOLET: SHADER_CONFIG.palette.violet.join(','),
  CYAN: SHADER_CONFIG.palette.cyan.join(','),
  FLAMINGO: SHADER_CONFIG.palette.flamingo.join(',')
};

const loadShader = async () => {
  const response = await fetch(new URL('./shaders/background.frag', import.meta.url), { cache: 'no-store' });
  const template = await response.text();
  return Object.entries(shaderValues).reduce((source, [name, value]) => {
    const replacement = typeof value === 'number' ? value.toFixed(4) : value;
    return source.replaceAll(`__${name}__`, replacement);
  }, template);
};

const compileShader = (type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
};

const createProgram = (fragmentSource) => {
  const vertexSource = 'attribute vec2 position; void main(){ gl_Position=vec4(position,0.0,1.0); }';
  const program = gl.createProgram();
  gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  return program;
};

const start = async () => {
  if (!gl) return;
  const program = createProgram(await loadShader());
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
  gl.clearColor(0, 0, 0, 0);
  const position = gl.getAttribLocation(program, 'position');
  const resolution = gl.getUniformLocation(program, 'resolution');
  const time = gl.getUniformLocation(program, 'time');
  const scroll = gl.getUniformLocation(program, 'scroll');
  const shaderUniforms = {
    speed: gl.getUniformLocation(program, 'speed'),
    scrollSpeed: gl.getUniformLocation(program, 'scrollSpeed'),
    flamingoStrength: gl.getUniformLocation(program, 'flamingoStrength'),
    intensity: gl.getUniformLocation(program, 'intensity'),
    warp: gl.getUniformLocation(program, 'warp'),
    contrast: gl.getUniformLocation(program, 'contrast'),
    kuwaharaStrength: gl.getUniformLocation(program, 'kuwaharaStrength'),
    kuwaharaRadius: gl.getUniformLocation(program, 'kuwaharaRadius'),
    deep: gl.getUniformLocation(program, 'deep'),
    violet: gl.getUniformLocation(program, 'violet'),
    cyan: gl.getUniformLocation(program, 'cyan'),
    flamingo: gl.getUniformLocation(program, 'flamingo')
  };
  const startedAt = performance.now();
  let scrollTarget = 0;
  let scrollValue = 0;
  let frame = 0;

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.0);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  const updateScroll = () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    scrollTarget = Math.min(1, scrollY / maxScroll);
  };

  const render = (now) => {
    gl.useProgram(program);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(resolution, canvas.width, canvas.height);
    gl.uniform1f(shaderUniforms.speed, SHADER_CONFIG.speed);
    gl.uniform1f(shaderUniforms.scrollSpeed, SHADER_CONFIG.scrollSpeed);
    gl.uniform1f(shaderUniforms.flamingoStrength, SHADER_CONFIG.flamingoStrength);
    gl.uniform1f(shaderUniforms.intensity, SHADER_CONFIG.intensity);
    gl.uniform1f(shaderUniforms.warp, SHADER_CONFIG.warp);
    gl.uniform1f(shaderUniforms.contrast, SHADER_CONFIG.contrast);
    gl.uniform1f(shaderUniforms.kuwaharaStrength, SHADER_CONFIG.kuwaharaStrength);
    gl.uniform1f(shaderUniforms.kuwaharaRadius, SHADER_CONFIG.kuwaharaRadius);
    gl.uniform3fv(shaderUniforms.deep, SHADER_CONFIG.palette.deep);
    gl.uniform3fv(shaderUniforms.violet, SHADER_CONFIG.palette.violet);
    gl.uniform3fv(shaderUniforms.cyan, SHADER_CONFIG.palette.cyan);
    gl.uniform3fv(shaderUniforms.flamingo, SHADER_CONFIG.palette.flamingo);
    scrollValue += (scrollTarget - scrollValue) * 0.06;
    gl.uniform1f(scroll, scrollValue);
    gl.uniform1f(time, reducedMotion ? 0 : (now - startedAt) / 1000);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!reducedMotion && !document.hidden) frame = requestAnimationFrame(render);
  };

  addEventListener('resize', resize, { passive: true });
  addEventListener('scroll', updateScroll, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !reducedMotion) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(render);
    }
  });
  resize();
  updateScroll();
  render(startedAt);
};

start().catch((error) => console.error('Background shader failed to load:', error));
