precision highp float;

uniform vec2 resolution;
uniform float time;
uniform float scroll;
uniform float shapeCurrent;
uniform float shapeNext;
uniform float shapeBlend;

#define CYAN vec3(0.0, 0.86, 0.98)
#define MAGENTA vec3(1.0, 0.02, 0.58)
#define WHITE vec3(0.96, 0.98, 1.0)
#define BLACK vec3(0.004, 0.006, 0.012)

mat2 rot(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

float sdSphere(vec3 p, float radius) {
  return length(p) - radius;
}

float sdTorus(vec3 p, vec2 torus) {
  vec2 q = vec2(length(p.xz) - torus.x, p.y);
  return length(q) - torus.y;
}

__SHAPES__

float shapeDistance(vec3 p) {
  float first = formDistance(int(shapeCurrent), p);
  float second = formDistance(int(shapeNext), p);
  return mix(first, second, shapeBlend);
}

float map(vec3 p) {
  float yaw = 3.14159265 + sin(time * 0.42) * 0.72 + sin(time * 0.19 + 1.4) * 0.16 + scroll * 0.12;
  float pitch = sin(time * 0.34 + 0.7) * 0.42 + sin(time * 0.15) * 0.10;
  float roll = sin(time * 0.28 + 2.1) * 0.26;
  p.xy = rot(pitch) * p.xy;
  p.xz = rot(yaw) * p.xz;
  p.yz = rot(roll) * p.yz;
  float shape = shapeDistance(p);
  float bound = length(p) - 0.62;
  return max(shape, bound);
}

vec3 getNormal(vec3 p) {
  vec2 e = vec2(0.0015, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)
  ));
}

vec3 hueColor(float hue) {
  return 0.5 + 0.5 * cos(6.2831853 * (hue + vec3(0.0, 0.3333, 0.6666)));
}

float grain(vec2 point, float seed) {
  return fract(sin(dot(point + seed, vec2(12.9898, 78.233))) * 43758.5453);
}

float raymarch(vec3 origin, vec3 direction, out vec3 hitPosition) {
  float travel = 0.0;
  hitPosition = origin;
  for (int i = 0; i < 72; i++) {
    hitPosition = origin + direction * travel;
    float distanceToSurface = map(hitPosition);
    if (distanceToSurface < 0.0009) return travel;
    travel += max(distanceToSurface * 0.48, 0.0012);
    if (travel > 8.0) break;
  }
  return -1.0;
}

float raymarchExit(vec3 origin, vec3 direction, out vec3 hitPosition) {
  float travel = 0.0;
  hitPosition = origin;
  for (int i = 0; i < 32; i++) {
    hitPosition = origin + direction * travel;
    float distanceToSurface = map(hitPosition);
    if (distanceToSurface > 0.001) return travel;
    travel += max(abs(distanceToSurface) * 0.52, 0.0015);
    if (travel > 2.0) break;
  }
  return -1.0;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);
  uv *= 1.08;
  vec3 origin = vec3(0.0, 0.0, 3.15);
  vec3 direction = normalize(vec3(uv, -2.55));
  vec3 position;
  float travel = raymarch(origin, direction, position);
  float hit = step(0.0, travel);
  vec3 color = BLACK;
  float faceAlpha = 0.0;

  if (hit > 0.5) {
    vec3 normal = getNormal(position);
    vec3 viewDirection = normalize(-direction);
    vec3 lightDirection = normalize(vec3(
      -0.50 + sin(time * 0.38) * 0.28,
      0.75 + cos(time * 0.29) * 0.20,
      1.0 + sin(time * 0.24 + 1.8) * 0.24
    ));
    float diffuse = max(dot(normal, lightDirection), 0.0);
    float facing = max(dot(normal, viewDirection), 0.0);
    float light = 0.32 + 0.68 * diffuse;
    vec3 halfVector = normalize(lightDirection + viewDirection);
    float specular = pow(max(dot(normal, halfVector), 0.0), 64.0);
    float rim = pow(1.0 - facing, 1.45);
    vec3 lightColor = mix(CYAN, MAGENTA, 0.5 + 0.5 * sin(time * 0.22));
    float fresnel = pow(1.0 - facing, 2.0);
    vec3 refractedRed = refract(direction, normal, 0.92);
    vec3 refractedGreen = refract(direction, normal, 0.96);
    vec3 refractedBlue = refract(direction, normal, 1.00);
    float redChannel = 0.5 + 0.5 * dot(refractedRed, lightDirection);
    float greenChannel = 0.5 + 0.5 * dot(refractedGreen, lightDirection);
    float blueChannel = 0.5 + 0.5 * dot(refractedBlue, lightDirection);
    float refraction = (redChannel + greenChannel + blueChannel) / 3.0;
    float dispersion = clamp(fresnel * 0.72 + refraction * 0.28, 0.0, 1.0);
    vec3 chroma = mix(CYAN, MAGENTA, 0.5 + 0.5 * sin(position.y * 7.0 + position.x * 4.0));
    vec3 spectral = vec3(redChannel, greenChannel, blueChannel);
    vec3 faceHue = hueColor(time * 0.035 + scroll * 0.24 + position.y * 0.28 + position.x * 0.12);
    float edge = smoothstep(0.30, 0.80, rim);
    float outline = smoothstep(0.62, 0.96, rim);
    float innerRim = pow(1.0 - abs(dot(normal, -direction)), 2.4);
    color = mix(WHITE, faceHue, 0.42) * (light + fresnel * 0.42);
    color *= 0.78 + fresnel * 0.22;
    color += chroma * (0.28 + dispersion * 0.28);
    color += spectral * vec3(0.20, 0.10, 0.22);
    color += lightColor * specular * 0.34;
    color += WHITE * specular * 0.46;
    color += WHITE * rim * 0.42;
    color = mix(color, WHITE, edge * 0.98);
    color += WHITE * outline * 1.72;
    color += WHITE * innerRim * 0.32;
    color += (grain(gl_FragCoord.xy, floor(time * 12.0) * 0.17) - 0.5) * 0.004;
    faceAlpha = 0.62 + light * 0.12 + fresnel * 0.26;
    vec3 backPosition;
    float backTravel = raymarchExit(position + direction * 0.006, direction, backPosition);
    if (backTravel > 0.0) {
      vec3 backNormal = getNormal(backPosition);
      float backEdge = pow(1.0 - abs(dot(backNormal, direction)), 1.8);
      color += WHITE * backEdge * 1.05;
      faceAlpha += backEdge * 0.12;
    }
  }

  gl_FragColor = vec4(color, hit * faceAlpha);
}
