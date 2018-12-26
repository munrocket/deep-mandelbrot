'use strict';

const vsource = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const fsource =
` 
precision highp float;
#define imax 200
#define bailout 16.0
#define logB log2(bailout)

uniform vec2 neworigin;
uniform vec2 size;
uniform vec2 resolution;
uniform vec3 orbit[imax];

void main() {
  vec2 d = neworigin + size * (gl_FragCoord.xy / resolution - 0.5); vec3 z;
  float u = d.x, v = d.y, uu, vv, xu, yv, xv, yu, zz, param;

  for (int i = 0; i < imax; i++) {
    uu = u * u;
    vv = v * v;

    z = orbit[i];
    xu = z.x * u;
    yv = z.y * v;
    xv = z.x * v;
    yu = z.y * u;

    v = 2.0 * (xv + yu + u * v) + d.y;
    u = 2.0 * (xu - yv) + uu - vv + d.x;
    zz = z.z + 2.0 * (xu + yv) + uu + vv;

    if (zz > bailout) { break; }
    else { param += 1.0; }
  }

  param = min(1.0, (param + 1.0 + log2(logB / log2(zz))) / float(200));
  gl_FragColor = vec4(vec3(param), 1.0);
}
`;
