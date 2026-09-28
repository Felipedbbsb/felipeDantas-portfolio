const canvas = document.querySelector('#shader-canvas');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const gl = canvas?.getContext('webgl', { alpha: true, antialias: false });

if (gl) {
  const vertex = `attribute vec2 position; void main(){ gl_Position = vec4(position,0.0,1.0); }`;
  const fragment = `precision mediump float; uniform vec2 resolution; uniform float time;
    float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y); }
    void main(){ vec2 uv=gl_FragCoord.xy/resolution.xy; uv.x*=resolution.x/resolution.y; float t=time*.08; float n=noise(uv*3.0+vec2(t,-t)); float wave=sin(uv.x*3.0+sin(uv.y*4.0+t)*.7+t)+cos(uv.y*4.0-t); vec3 ink=vec3(.004,.006,.004); vec3 acid=vec3(.14,.18,.015); float glow=smoothstep(.15,.9,n+wave*.08); vec3 color=mix(ink,acid,glow*.10); gl_FragColor=vec4(color,.30); }`;
  const compile = (type, source) => { const shader = gl.createShader(type); gl.shaderSource(shader, source); gl.compileShader(shader); return shader; };
  const program = gl.createProgram(); gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex)); gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment)); gl.linkProgram(program);
  const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position'); const resolution = gl.getUniformLocation(program, 'resolution'); const time = gl.getUniformLocation(program, 'time'); const start = performance.now();
  const resize = () => { const dpr=Math.min(window.devicePixelRatio||1,1.5); canvas.width=innerWidth*dpr; canvas.height=innerHeight*dpr; canvas.style.width='100vw'; canvas.style.height='100vh'; gl.viewport(0,0,canvas.width,canvas.height); };
  const render = (now) => { gl.useProgram(program); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0); gl.uniform2f(resolution,canvas.width,canvas.height); gl.uniform1f(time,reducedMotion?0:(now-start)/1000); gl.drawArrays(gl.TRIANGLE_STRIP,0,4); if(!reducedMotion) requestAnimationFrame(render); };
  addEventListener('resize', resize); resize(); render(start);
}
