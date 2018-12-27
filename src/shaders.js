'use strict';

const vsource = `
precision highp float;
attribute vec2 position;
varying vec2 v_position;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
  v_position = position;
}`;
const fsource =
` 
precision highp float;

#define imax ${imax}
#define bailout 5000.
varying vec2 v_position;

uniform vec2 center;
uniform vec2 size;
uniform vec3 orbit[imax];

void main() {
  vec3 o, col;
  vec2 c = center + size * v_position;
  const float logB = log2(bailout);
  float x = c.x, y = c.y, xx, yy, xy, xox, xoy, yox, yoy, ozoz, param;

  for (int i = 0; i < imax; i++) {
    o = orbit[i];
    xx = x * x;
    yy = y * y;
    xy = x * y;

    o += o;
    xox = x * o.x;
    xoy = x * o.y;
    yox = y * o.x;
    yoy = y * o.y;

    x = xx - yy + xox - yoy + c.x;    // Z -> Z^2 + 2*O*Z + C
    y = xy + xy + yox + xoy + c.y;

    ozoz = o.z + xox + yoy + xx + yy;  // |O + Z|^2 = |O|^2 + 2*(O, Z) + |Z|^2
    
    if (ozoz > bailout) { break; }
    else { param += 1.; }
  }

  param += 1.0 + min(1.0, log2(logB / log2(ozoz)));
  col = 0.5 + 0.5 * cos(3. + 24.8 * param / float(imax) + vec3(-0.2,0.4,1.0));
  gl_FragColor = vec4(col, 1.0);
}
`;
