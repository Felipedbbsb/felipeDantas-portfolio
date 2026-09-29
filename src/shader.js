// Edit only this block to art-direct the background without touching the GLSL.
// Values are intentionally exposed: 0.0 is off, 1.0 is strong.
export const SHADER_CONFIG = {
  speed: 0.072,
  scrollSpeed: 1.65,
  flamingoStrength: 0.52,
  intensity: 0.48,
  warp: 0.92,
  contrast: 1.28,
  grain: 0.018,
  palette: {
    deep: [0.002, 0.004, 0.012],
    violet: [0.42, 0.012, 0.22],
    cyan: [0.0, 0.50, 0.64],
    acid: [0.94, 0.30, 0.035],
    flamingo: [1.0, 0.24, 0.46]
  }
};

// Lets you inspect or tune the live configuration from DevTools.
if (typeof window !== 'undefined') window.PORTFOLIO_SHADER_CONFIG = SHADER_CONFIG;

const canvas = document.querySelector('#shader-canvas');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const gl = canvas?.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'high-performance' });

if (gl) {
  const vertex = `attribute vec2 position; void main(){ gl_Position=vec4(position,0.0,1.0); }`;
  const fragment = `precision mediump float;
    uniform vec2 resolution; uniform float time; uniform float scroll;
    #define SPEED ${SHADER_CONFIG.speed.toFixed(4)}
    #define SCROLL_SPEED ${SHADER_CONFIG.scrollSpeed.toFixed(4)}
    #define FLAMINGO_STRENGTH ${SHADER_CONFIG.flamingoStrength.toFixed(4)}
    #define INTENSITY ${SHADER_CONFIG.intensity.toFixed(4)}
    #define WARP ${SHADER_CONFIG.warp.toFixed(4)}
    #define CONTRAST ${SHADER_CONFIG.contrast.toFixed(4)}
    #define GRAIN ${SHADER_CONFIG.grain.toFixed(4)}
    #define DEEP vec3(${SHADER_CONFIG.palette.deep.join(',')})
    #define VIOLET vec3(${SHADER_CONFIG.palette.violet.join(',')})
    #define CYAN vec3(${SHADER_CONFIG.palette.cyan.join(',')})
    #define ACID vec3(${SHADER_CONFIG.palette.acid.join(',')})
    #define FLAMINGO vec3(${SHADER_CONFIG.palette.flamingo.join(',')})
    float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123); }
    float noise(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y); }
    float fbm(vec2 p){ float value=0.; float amplitude=.5; for(int i=0;i<5;i++){ value+=amplitude*noise(p); p=p*2.02+vec2(17.1,9.2); amplitude*=.5; } return value; }
    vec3 palette(float t, float scrollAmount){ t=clamp(t,0.,1.); vec3 c=mix(DEEP,VIOLET,smoothstep(0.,.38,t)); c=mix(c,CYAN,smoothstep(.28,.72,t)); c=mix(c,ACID,smoothstep(.72,1.,t)); float pink=smoothstep(.08,.92,scrollAmount)*FLAMINGO_STRENGTH; return mix(c,FLAMINGO,pink); }
    void main(){
      vec2 uv=(gl_FragCoord.xy-.5*resolution.xy)/min(resolution.x,resolution.y); float t=time*SPEED+scroll*SCROLL_SPEED;
      vec2 p=uv+vec2(sin(scroll*3.2)*.12,scroll*.22); vec2 q=vec2(fbm(p*1.8+t*.18),fbm(p*1.8+vec2(4.2,1.7)-t*.14)); p+= (q-.5)*WARP;
      float field=fbm(p*2.25+vec2(t*.35,-t*.22)); float flow=fbm(p*4.0+q*2.4-vec2(t*.5,-t*.32));
      float radius=length(p); float angle=atan(p.y,p.x); float rings=sin(radius*17.0-flow*3.5-t*2.2+sin(angle*5.0+t)*.55)*.5+.5;
      float filament=smoothstep(.72,.98,fbm(p*3.5+vec2(sin(t),cos(t)))); float signal=clamp(field*.58+flow*.22+rings*.12+filament*.12,0.,1.);
      float glow=exp(-radius*1.8)*.28; vec3 color=palette(signal+glow,scroll); color*=1.-smoothstep(.62,1.12,radius)*.32; color=pow(max(color,0.),vec3(1.0/CONTRAST));
      float grain=(hash(gl_FragCoord.xy+time)-.5)*GRAIN; gl_FragColor=vec4(max(color+grain,0.)*INTENSITY,.48);
    }`;
  const compile = (type, source) => { const shader=gl.createShader(type); gl.shaderSource(shader,source); gl.compileShader(shader); if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(shader)); return shader; };
  const program=gl.createProgram(); gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex)); gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment)); gl.linkProgram(program);
  const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'position'); const resolution=gl.getUniformLocation(program,'resolution'); const time=gl.getUniformLocation(program,'time'); const scrollUniform=gl.getUniformLocation(program,'scroll'); const start=performance.now(); let scrollTarget=0; let scrollValue=0;
  const resize=()=>{ const dpr=Math.min(devicePixelRatio||1,1.5); canvas.width=innerWidth*dpr; canvas.height=innerHeight*dpr; gl.viewport(0,0,canvas.width,canvas.height); };
  const updateScroll=()=>{ const maxScroll=Math.max(1,document.documentElement.scrollHeight-innerHeight); scrollTarget=Math.min(1,scrollY/maxScroll); };
  const render=(now)=>{ gl.useProgram(program); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0); gl.uniform2f(resolution,canvas.width,canvas.height); scrollValue += (scrollTarget-scrollValue)*.06; gl.uniform1f(scrollUniform,scrollValue); gl.uniform1f(time,reducedMotion?0:(now-start)/1000); gl.drawArrays(gl.TRIANGLE_STRIP,0,4); if(!reducedMotion) requestAnimationFrame(render); };
  addEventListener('resize',resize); addEventListener('scroll',updateScroll,{passive:true}); resize(); updateScroll(); render(start);
}
