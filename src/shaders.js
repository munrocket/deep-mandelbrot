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
const float logB = log2(bailout);
varying vec2 v_position;

uniform vec2 center;
uniform vec2 size;
uniform vec3 orbit[imax];

vec2 unpack(vec4 color) { return vec2(color.r / 255.0 + color.b, color.g / 255.0 + color.a); }
vec4 pack(vec2 pos)     { return vec4(fract(pos * 255.0), floor(pos * 255.0) / 255.0); }

float interpolate(float s, float s1, float s2, float s3, float d) {
  float d2 = d * d, d3 = d * d2;
  return 0.5 * (s * (d3 - d2) + s1 * (d + 4.*d2 - 3.*d3) + s2 * (2. - 5.*d2 + 3.*d3) + s3 * (-d + 2.*d2 - d3));
}

void main() {
  vec2 c = center + size * v_position;
  vec3 o, col;
  float x = c.x, y = c.y, xx, yy, xy, ox, oy, xox, xoy, yox, yoy, ww, time;
  float stripe, s1, s2, s3; 

  for (int i = 0; i < imax; i++) {

    // initilizing
    o = orbit[i]; xx = x * x; yy = y * y; xy = x * y;
    xox = x * (o.x + o.x); xoy = x * (o.y + o.y); yox = y * (o.x + o.x);  yoy = y * (o.y + o.y);
    
    // stripe average color algo
    if (i < 100 && i > 1) stripe += 0.5 + 0.5 * sin(2.0 * atan(o.y + y, o.x + x)); s3 = s2; s2 = s1; s1 = stripe;

    // calc result |W|^2 = |O + Z|^2
    ww = o.z + xox + yoy + xx + yy;

    // next step f(Z): Z -> Z^2 + 2*O*Z + C
    x = xx - yy + xox - yoy + c.x;
    y = xy + xy + yox + xoy + c.y;

    // loop in webgl
    if (ww > bailout) { break; }
    else { time += 1.; }
  }

  time += 1.0 + min(1.0, log2(logB / log2(ww)));
  col += 3. * interpolate(stripe, s1, s2, s3, fract(time)) / min(time, 100.);
  col = 0.5 + 0.5 * sin(col + 4.2 + 68.1 * time / float(imax) + vec3(-0.2, 0.4, 1.0));

  gl_FragColor = vec4(col, 1.);
}
`;