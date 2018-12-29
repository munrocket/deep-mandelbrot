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

float interpolate(float s, float s1, float s2, float s3, float d) {
  float d2 = d * d, d3 = d * d2;
  return .5 * (s * (d3 - d2) + s1 * (d + 4.*d2 - 3.*d3) + s2 * (2. - 5.*d2 + 3.*d3) + s3 * (-d + 2.*d2 - d3));
}

void main() {
  vec3 o;
  vec2 c = center + size * v_position;
  const float logB = log2(bailout);
  float x = c.x, y = c.y, xx, yy, xy, ox, oy, xox, xoy, yox, yoy, ww, time;
  float stripe, s1, s2, s3;
  //float curvature, c1, c2, c3; vec2 ca, cb, cab; vec2 w, w1, w2, w3;
  //float triangle, tc, tw, tw1, t1, t2, t3;

  for (int i = 0; i < imax; i++) {
    // initilizing
    o = orbit[i]; xx = x * x; yy = y * y; xy = x * y;
    xox = x * (o.x + o.x); xoy = x * (o.y + o.y); yox = y * (o.x + o.x);  yoy = y * (o.y + o.y);
    
    // color algo: stripe average
    if (i > 1) stripe += 0.5 + 0.5 * sin(2.0 * atan(o.y + y, o.x + x)); s3 = s2; s2 = s1; s1 = stripe;

    // calc result |W|^2 = |O + Z|^2
    ww = o.z + xox + yoy + xx + yy;

    // next step f(Z): Z -> Z^2 + 2*O*Z + C
    x = xx - yy + xox - yoy + c.x;
    y = xy + xy + yox + xoy + c.y;
    
    // color algo: curvature average
    // w3 = w2; w2 = w1; w1 = w; w.x = o.x + x; w.y = o.y + y;
    // if (i > 1) {
    //   ca = w - w1; cb = w1 - w2; cab = vec2(dot(ca, cb), ca.y * cb.x - ca.x * cb.y) / dot(cb, cb);
    //   curvature += atan(abs(cab.y), abs(cab.x)); c3 = c2; c2 = c1; c1 = curvature;
    // };
    // color algo: triangle inequality
    // tw1 = tw; tw = length(vec2(o.x + x, o.y + y)); tc = length(vec2(o.x, o.y) + c);
    // if (i > 1) { triangle += (tw - abs(tw1 - tc)) / (tw1 + tc - abs(tw1 - tc)); t3 = t2; t2 = t1; t1 = triangle;}

    // loop in webgl
    if (ww > bailout) { break; }
    else { time += 1.; }
  }

  time += 1.0 + min(1.0, log2(logB / log2(ww)));
  float s = stripe, d = fract(time), d2 = d * d, d3 = d * d2;
  stripe = .5 * (s * (d3 - d2) + s1 * (d + 4.*d2 - 3.*d3) + s2 * (2. - 5.*d2 + 3.*d3) + s3 * (-d + 2.*d2 - d3)); //inline interpolation
  stripe /= time;

  // calculete pallete
  //  triangle /= time; //interpolate(triangle, t1, t2, t3, fract(time));
  //  vec3 col = vec3(triangle);
  // curvature = interpolate(curvature, c1, c2, c3, fract(time));
  // curvature /= time-1.; vec3 col = 0.5 + 0.5 * cos(4. * curvature + vec3(0.2,-0.7, 0.2));

  vec3 col = 0.5 + 0.5 * sin(4.2 + 3. * stripe + 68.1 * time / float(imax) + vec3(-0.2,0.4,1.0));

  gl_FragColor = vec4(col, 1.0);
}
`;