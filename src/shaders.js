'use strict';

const vsource = `
precision mediump float;
attribute vec2 position;
varying vec2 v_position;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
  v_position = position;
}`;

const fsource =
` 
precision mediump float;

#define imax ${imax}
#define bailout 5000.
const float loglogB = log2(log2(bailout));
varying vec2 v_position;

uniform vec2 center;
uniform vec2 size;
uniform vec3 orbit[imax];

float interpolate(float s, float s1, float s2, float s3, float d) {
  float d2 = d * d, d3 = d * d2;
  return 0.5 * (s * (d3 - d2) + s1 * (d + 4.*d2 - 3.*d3) + s2 * (2. - 5.*d2 + 3.*d3) + s3 * (-d + 2.*d2 - d3));
}

void main() {
  vec2 c = center + size * v_position;
  vec3 o, col;
  float x = c.x, y = c.y, xx, yy, xy, ox, oy, xox, xoy, yox, yoy, ww, time;
  float stripe, s1, s2, s3; 
  float u, v;

  for (int i = 0; i < imax; i++) {

    // initilizing
    o = orbit[i]; xx = x * x; yy = y * y; xy = x * y; u = o.x + x; v = o.y + y;
    xox = x * (o.x + o.x); xoy = x * (o.y + o.y); yox = y * (o.x + o.x);  yoy = y * (o.y + o.y);
    
    // stripe average color 
    if (i < 200 && i > 1) stripe += u * v / (u * u + v * v); s3 = s2; s2 = s1; s1 = stripe;

    // calc result |W|^2 = |O + Z|^2
    ww = o.z + xox + yoy + xx + yy;

    // next step Z -> Z^2 + 2*O*Z + C
    x = xx - yy + xox - yoy + c.x;
    y = xy + xy + yox + xoy + c.y;

    // loop in webgl1
    if (ww > bailout) { break; }
    else { time += 1.; }
  }

  time += 1.0 + min(1.0, loglogB - log2(log2(ww)));
  col += 0.7 + 2.5 * (interpolate(stripe, s1, s2, s3, fract(time)) / min(time, 200.));
  col = 0.5 + 0.5 * sin(col + vec3(4.0, 4.6, 5.2) + 50.0 * time / float(imax));

  gl_FragColor = vec4(col, 1.);
}
`;

const fsource0 =
` 
#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif

#define imax ${imax}
#define bailout 5000.
const float loglogB = log2(log2(bailout));
varying vec2 v_position;

uniform vec2 center;
uniform vec2 size;
uniform vec3 orbit[imax];

// vec2 unpack(vec4 color) { return vec2(color.r / 255.0 + color.b, color.g / 255.0 + color.a); }
// vec4 pack(vec2 pos)     { return vec4(fract(pos * 255.0), floor(pos * 255.0) / 255.0); }

float interpolate(float s, float s1, float s2, float s3, float d) {
  float d2 = d * d, d3 = d * d2;
  return 0.5 * (s * (d3 - d2) + s1 * (d + 4.*d2 - 3.*d3) + s2 * (2. - 5.*d2 + 3.*d3) + s3 * (-d + 2.*d2 - d3));
}

void main() {
  vec2 c = center + size * v_position + vec2(orbit[0]);
  vec3 o;
  float x, y, t, time;
  float dx, dy;
  float z2, de;

  for (int i = 0; i < 3000; i++) {
    // Z' -> 2*Z*Z' + 1
    t = 2. * (x * dx - y * dy);
    dy = 2. * (x * dy + y * dx);
    dx = t;

    // Z -> Z^2 + C
    t = x * x - y * y + c.x;
    y = x * y + x * y + c.y;
    x = t;

    if (x * x + y * y > 2000.0) break;
    else time += 1.0;
  }
  time += 1.0 + min(1.0, loglogB - log2(log2(x*x+y*y)));
  float q = 1. - fract(time);

  // DE(Z) = 2.0 * |Z / Z'| * ln(|Z|)
  de = sqrt((x * x + y * y) / (dx * dx + dy * dy)) * log(x * x + y * y);
  //float a = 0.5; float b = 0.5; float c0 = 0.5; float d = 0.5; float col = atan(a ∗ de / 5.) + c0 / (1 + d ∗ h)) / (3.1415926535 * 0.5);
  
  gl_FragColor = vec4(vec3(cos(-log(de))), 1.);
}
`;