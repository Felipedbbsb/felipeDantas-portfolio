float sdBox(vec3 p, vec3 bounds) {
  vec3 d = abs(p) - bounds;
  return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
}

float sdPyramid(vec3 p, float base, float height) {
  float halfHeight = height * 0.5;
  float side = max(abs(p.x), abs(p.z)) - base * (halfHeight - p.y) / height;
  float cap = max(-p.y - halfHeight, p.y - halfHeight);
  return max(side, cap);
}

float sdGear(vec3 p, float radius, float teeth) {
  float angle = atan(p.z, p.x);
  float tooth = smoothstep(0.18, 0.72, cos(angle * teeth));
  float outline = length(p.xz) - radius - tooth * 0.062;
  float hole = 0.15 - length(p.xz);
  return max(max(outline, hole), abs(p.y) - 0.075);
}

float sdDiamond(vec3 p, float size) {
  return (abs(p.x) + abs(p.y) + abs(p.z) - size) * 0.57735;
}

float formDistance(int index, vec3 p) {
  if (index == 0) return sdSphere(p, 0.40);
  if (index == 1) return sdTorus(vec3(p.x, p.z, p.y), vec2(0.34, 0.09));
  if (index == 2) return sdGear(vec3(p.x, p.z, p.y), 0.34, 8.0);
  if (index == 3) return sdBox(p, vec3(0.36));
  if (index == 4) return sdPyramid(p, 0.38, 0.70);
  if (index == 5) return sdDiamond(p, 0.66);
  return sdSphere(p, 0.40);
}

float randomValue(float seed) {
  return fract(sin(seed * 91.731) * 43758.5453);
}
