'use strict';

const vsource = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const fsource =
` 
#define imax 200
#define bailout 16.0
#define logB log2(bailout)
precision highp float;

uniform vec2 center;
uniform vec2 size;
uniform vec2 resolution;

uniform float ox[imax];
uniform float oy[imax];
uniform float oxx[imax];
uniform float oyy[imax];

void main() {
  vec2 d = center - vec2(ox[0], oy[0]) + size * (gl_FragCoord.xy / resolution - 0.5);
  float u = d.x, v = d.y, uu, vv, xu, yv, xv, yu, zz, param;

  for (int i = 0; i < imax; i++) {
    uu = u * u;
    vv = v * v;
    xu = ox[i] * u;
    yv = oy[i] * v;
    xv = ox[i] * v;
    yu = oy[i] * u;

    v = 2.0 * (xv + yu + u * v) + d.y;
    u = 2.0 * (xu - yv) + uu - vv + d.x;
    zz = oxx[i] + oyy[i] + 2.0 * (xu + yv) + uu + vv;

    if (zz > bailout) { break; }
    else { param += 1.0; }
  }

  param = min(1.0, (param + 1.0 + log2(logB / log2(zz))) / float(imax));
  gl_FragColor = vec4(vec3(param), 1.0);
}
`;
