'use strict';

let vert = `
  precision highp float;

  attribute vec2 position;
  uniform vec2 center;
  uniform vec2 size;
  uniform float phi;

  varying vec2 delta;

  void main() {
    vec2 rot = vec2(sin(phi), cos(phi));

    /*  size of window in complex coord  */
    vec2 z = size * position;

    /*  translating and rotating window */
    delta = center + vec2(z.x * rot.y - z.y * rot.x, dot(z, rot));

    /*  webgl viewport position  */
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

    varying vec2 delta;
    uniform vec4 orbit[imax];
    uniform vec2 size;

    /*  Catmull–Rom interpolation  */
    float interpolate(float s, float s1, float s2, float s3, float d) {
      float d2 = d * d, d3 = d * d2;
      return 0.5 * (s * (d3 - d2) + s1 * (d + 4.*d2 - 3.*d3) + s2 * (2. - 5.*d2 + 3.*d3) + s3 * (-d + 2.*d2 - d3));
    }

    void main() {
      float u = delta.x, v = delta.y, du = 0., dv = 0.;
      float zz, time, temp;
      float s1, s2, s3, stripe;

      /*  taking new origin in a delta: Z = O + W, Z' = O' + W'  */
      vec2 O = vec2(orbit[0].x, orbit[0].y);
      vec2 dO = vec2(orbit[0].z, orbit[0].w);
      vec2 z = O + delta;
      vec2 dz = dO + vec2(du, dv);

      /*  making julia minimap transporent  */
      #if is_julia
        if (length(z) > 2.) { gl_FragColor = vec4(0.); return; }
      #endif

      /*  calculating perturbation regarding main orbit for mandelbrot or julia set */
      for (int i = 1; i < imax; i++) {

        /*  calc derivative:  dW'(u,v) -> 2 * (O' * W + Z * W')  */
        temp = 2. * (dO.x * u - dO.y * v + z.x * du - z.y * dv);
        dv =   2. * (dO.x * v + dO.y * u + z.x * dv + z.y * du);
        du = temp;

        /*  next step in the iterative process:  W(u,v) -> W^2 + 2 * O * W + delta  */
        temp = u * u - v * v + 2. * (u * O.x - v * O.y); 
        v =    u * v + u * v + 2. * (v * O.x + u * O.y);
        u = temp;
        #if !is_julia
          u += delta.x;
          v += delta.y;
        #endif

        /*  recall global coordinates  */
        O = vec2(orbit[i].x, orbit[i].y);
        dO = vec2(orbit[i].z, orbit[i].w);
        z = O + vec2(u, v);
        dz = dO + vec2(du, dv);
        zz = dot(z, z);
        
        /*  stripe average, a color algo based on statistcs  */
        #if color_scheme == 0 
          stripe += z.x * z.y / zz * step(1.0, time);
          s3 = s2; s2 = s1; s1 = stripe;
        #endif

        /*  loop in webgl1  */
        time += 1.;
        if (zz > bailout) { break; }
      }
           
      /*  exterior distance estimation = 2.0 * |Z / Z'| * ln(|Z|)  */
      float dem = sqrt(zz / dot(dz,dz)) * log(zz);
      vec3 col;

      /*  final coloring  */
      #if color_scheme == 0
        time += clamp(1.0 + loglogB - log2(log2(zz)), 0.0, 4.0);
        col += 0.7 + 2.5 * (interpolate(stripe, s1, s2, s3, fract(time)) / clamp(time, 0., 200.)) * (1.0 - 0.6 * step(float(imax), 1. + time));
        col = 0.5 + 0.5 * sin(col + vec3(4.0, 4.6, 5.2) + 50.0 * time / float(imax));
      #else
        time += 1.0 + clamp(loglogB - log2(log2(zz)), -1., 0.);
        col += 1.0 - clamp(0., -log(dem / size.x * 500.), 1.);
        // col += 0.5 + 0.5 * sin(atan(z.y, z.x) + vec3(4.0, 4.6, 5.2));
        // col *= 0.5 + 0.5 * sin(col + vec3(4.0, 4.6, 5.2) + 50.0 * time / float(imax));
      #endif

      gl_FragColor = vec4(col, 1.);
    }`
  };