'use strict';

let vert =
  `precision highp float;

  attribute vec2 position;
  uniform vec2 center;
  uniform vec2 size;
  uniform float phi;
  varying vec2 variation;

  void main() {
    vec2 rot = vec2(sin(phi), cos(phi));
    vec2 z = size * position;
    variation = center + vec2(z.x * rot.y - z.y * rot.x, dot(z, rot));
    gl_Position = vec4(position, 0.0, 1.0);
  }`;

let frag = (isJulia) => {
  return `
    precision highp float;

    #define imax ${imax}
    #define bailout ${bailout}.
    #define color_scheme ${colorScheme}
    #define is_julia ${isJulia}
    const float loglogB = log2(log2(bailout));

    uniform vec4 orbit[imax];
    uniform vec2 size;
    varying vec2 variation;

    float interpolate(float s, float s1, float s2, float s3, float d) {
      float d2 = d * d, d3 = d * d2;
      return 0.5 * (s * (d3 - d2) + s1 * (d + 4.*d2 - 3.*d3) + s2 * (2. - 5.*d2 + 3.*d3) + s3 * (-d + 2.*d2 - d3));
    }

    void main() {
      float u = variation.x, v = variation.y, zz, time, temp;
      float s1, s2, s3, stripe;
      vec2 o = vec2(orbit[0].x, orbit[0].y);
      vec2 z = o + vec2(u,v), dz = vec2(1, 0);
      vec3 col;

      #if is_julia
        if (length(z) > 2.) { gl_FragColor = vec4(0.); return; }
      #endif

      for (int i = 1; i < imax; i++) {
        // calc derivative:  Z' -> 2*Z*Z' + 1
        temp = 2. * (z.x * dz.x - z.y * dz.y) + 1.;
        dz.y = 2. * (z.x * dz.y + z.y * dz.x);
        dz.x = temp;

        // next step: W -> W^2 + 2 * O * W + V
        temp = u * u - v * v + 2. * (u * o.x - v * o.y); 
        v = u * v + u * v + 2. * (v * o.x + u * o.y);
        u = temp;
        #if !is_julia
          u += variation.x;  v += variation.y;
        #endif

        // initilizing:  Z = O + W
        o = vec2(orbit[i].x, orbit[i].y);
        z = o + vec2(u,v);
        zz = dot(z,z);    
        
        // stripe average color
        #if color_scheme == 0 
          stripe += z.x * z.y / zz * step(1.0, time);
          s3 = s2; s2 = s1; s1 = stripe;
        #endif

        // loop in webgl1
        time += 1.;
        if (zz > bailout) { break; }
      }

      #if color_scheme == 0
        time += 1.0 + min(1.0, loglogB - log2(log2(zz)));
        col += 0.7 + 2.5 * (interpolate(stripe, s1, s2, s3, fract(time)) / min(200., time)) * (1.0 - 0.6 * step(float(imax), 1. + time));
        col = 0.5 + 0.5 * sin(col + vec3(4.0, 4.6, 5.2) + 50.0 * time / float(imax));
      #else
        // DEM/M = 2.0 * |Z / Z'| * ln(|Z|)
        float dem = sqrt(zz / dot(dz,dz)) * log(zz);
        col += (1. - clamp(0., -log(dem / size.x * 500.), 1.)) * vec3(233, 202, 180) / 256.;
      #endif

      gl_FragColor = vec4(col, 1.);
    }`
  };