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
  vec3 o;
  vec2 c = center + size * v_position;
  const float logB = log2(bailout);
  float x = c.x, y = c.y, xx, yy, xy, ox, oy, xox, xoy, yox, yoy, ww, time, branching;
  // vec2 w, w1, w2, w3; float trianineq, lc, lw, m; float curvature; vec2 ca, cb, cab;

  for (int i = 0; i < imax; i++) {

    // initilizing
    o = orbit[i];  xx = x * x;  yy = y * y;  xy = x * y;
    ox = o.x + o.x;  oy = o.y + o.y;  xox = x * ox;  xoy = x * oy;  yox = y * ox;  yoy = y * oy;
    branching += 0.5 + 0.5 * sin(1.0 * atan(o.y + y, o.x + x));

    // calc result |W|^2 = |O + Z|^2
    ww = o.z + xox + yoy + xx + yy;

    // next step f(Z): Z -> Z^2 + 2*O*Z + C
    x = xx - yy + xox - yoy + c.x;
    y = xy + xy + yox + xoy + c.y;
    
    // statistic color algorithms
    // w3 = w2; w2 = w1; w1 = w; w.x = o.x + x; w.y = o.y + y;
    // ca = w - w1; cb = w1 - w2; cab = vec2(dot(ca, cb), ca.y * cb.x - ca.x * cb.y) / dot(cb, cb); if (i > 1) { curvature += atan(abs(cab.y), abs(cab.x)); }
    // lc = length(c + vec2(o.x, o.y)); lw = length(w1); m = abs(lw - lc); if (i > 1) { trianineq += (length(w) - m) / (lw + lc - m); }

    // loop in webgl
    if (ww > bailout) { break; }
    else { time += 1.; }

  }

  // calculete pallete
  // trianineq /= time; vec3 col = vec3(trianineq);
  // curvature /= time-1.; vec3 col = 0.5 + 0.5 * cos(4. * curvature + vec3(0.2,-0.7, 0.2));
  branching /= time; //vec3 col = 0.5 + 0.5 * cos(2. + 3. * branching + vec3(0.2,-0.7, 0.2));
  time += 1.0 + min(1.0, log2(logB / log2(ww))); vec3 col = 0.5 + 0.5 * cos(3. + 2.*branching + 24.8 * time / float(imax) + vec3(-0.2,0.4,1.0));

  gl_FragColor = vec4(col, 1.0);
}
`;