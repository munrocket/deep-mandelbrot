'use strict';

let vsource =
`precision mediump float;

uniform vec2 size;
uniform vec2 center;
//const float phi = 0.0;
const vec2 rot = vec2(0, 1.);//sin(phi), cos(phi));

attribute vec2 position;
varying vec2 p;

void main() {
  vec2 z = size * position;
  p = center + vec2(z.x * rot.y - z.y * rot.x, dot(z, rot));
  gl_Position = vec4(position, 0.0, 1.0);
}`;

let fsource = (scheme) => `
precision mediump float;

#define imax ${imax}
#define bailout ${bailout}.
#define DEFAULT ${scheme}
const float loglogB = log2(log2(bailout));

uniform vec4 orbit[imax];
uniform vec2 size;
varying vec2 p;

float interpolate(float s, float s1, float s2, float s3, float d) {
  float d2 = d * d, d3 = d * d2;
  return 0.5 * (s * (d3 - d2) + s1 * (d + 4.*d2 - 3.*d3) + s2 * (2. - 5.*d2 + 3.*d3) + s3 * (-d + 2.*d2 - d3));
}

void main() {
  float u = p.x, v = p.y, zz, time, temp;
  float s1, s2, s3, stripe;
  vec2 o = vec2(orbit[0].x, orbit[0].y);
  vec2 z = o + vec2(u,v), dz;
  vec3 col;

  for (int i = 1; i < imax; i++) {
    // calc derivative Z' -> 2*Z*Z' + 1
    temp = 2. * (z.x * dz.x - z.y * dz.y) + 1.;
    dz.y = 2. * (z.x * dz.y + z.y * dz.x);
    dz.x = temp;

    // next step: W -> W^2 + 2 * O * W + P
    temp = u * u - v * v + 2. * (u * o.x - v * o.y) + p.x;
    v = u * v + u * v + 2. * (v * o.x + u * o.y) + p.y;
    u = temp;

    // initilizing
    o = vec2(orbit[i].x, orbit[i].y);
    z = o + vec2(u,v);
    zz = dot(z,z);    
    
    #if DEFAULT
      // stripe average color 
      stripe += z.x * z.y / zz * step(1.0, time);
      s3 = s2; s2 = s1; s1 = stripe;
    #endif

    // loop in webgl1
    time += 1.;
    if (zz > bailout) { break; }
  }

  #if DEFAULT
    time += 1.0 + min(1.0, loglogB - log2(log2(zz)));
    col += 0.7 + 2.5 * (interpolate(stripe, s1, s2, s3, fract(time)) / min(200., time)) * (1.0 - 0.6 * step(float(imax), 1. + time));
    col = 0.5 + 0.5 * sin(col + vec3(4.0, 4.6, 5.2) + 50.0 * time / float(imax));
  #else
    // DEM/M = 2.0 * |Z / Z'| * ln(|Z|)
    float dem = sqrt(dot(z,z) / dot(dz,dz)) * log(dot(z,z));
    col += (1. - clamp(0., -log(dem / size.x * 500.), 1.)) * vec3(233, 202, 180) / 256.;
  #endif

  gl_FragColor = vec4(col, 1.);
}`;