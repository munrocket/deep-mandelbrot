'use strict';

let vert = `
  precision highp float;

  attribute vec2 a_position;
  uniform vec2 rotator;
  uniform vec2 center;
  uniform vec2 size;

  varying vec2 delta;

  void main() {

    /*  window coordinates with new origin in complex space  */
    vec2 z = size * a_position;
    delta = center + vec2(z.x * rotator.y - z.y * rotator.x, dot(z, rotator));
    
    gl_Position = vec4(a_position, 0.0, 1.0);
  }`;

let frag = (isJulia) => `
    precision highp float;

    #define imax ${imax}
    #define square_radius ${squareRadius}.
    #define super_sampling ${superSampling}
    #define color_scheme ${colorScheme}
    #define is_julia ${isJulia}
    const float logLogRR = log2(log2(square_radius));

    varying vec2 delta;
    uniform vec2 rotator;
    uniform vec2 size;
    uniform vec2 pixelsize;
    uniform float texsize;
    uniform highp sampler2D orbittex;

    vec4 unpackOrbit(int i) {
      float fi = float(i);
      vec2 texcoord = vec2(mod(fi, texsize), floor(fi / texsize)) / texsize;
      return texture2D(orbittex, texcoord);
    }

    float interpolate(float s, float s1, float s2, float s3, float d) {
      float d2 = d * d, d3 = d * d2;
      return 0.5 * (s * (d3 - d2) + s1 * (d + 4.*d2 - 3.*d3) + s2 * (2. - 5.*d2 + 3.*d3) + s3 * (-d + 2.*d2 - d3));
    }

    struct result {
      float time;
      float zz;
      float dzdz;
      float stripe;
    };

    /*  fractal calculator with perturbation theory for mandelbrot & julia set */
    result calculator(vec2 AA) {
      float u = delta.x + AA.x, v = delta.y + AA.y;
      float zz, time, temp, du = 0., dv = 0.;
      float stripe, s1, s2, s3;
      vec2 z, dz, O, dO;

      for (int i = 0; i < imax; i++) {
        /*  Recall global coordinates: Z = O + W, Z' = O' + W'  */
        vec4 values = unpackOrbit(i);
        O = values.xy;
        dO = values.zw;
        z = O + vec2(u, v);
        dz = dO + vec2(du, dv);
        zz = dot(z, z);

        /*  Calc derivative:  dW'(u,v) -> 2 * (O' * W + Z * W')  */
        temp = 2. * (dO.x * u - dO.y * v + z.x * du - z.y * dv);
        dv =   2. * (dO.x * v + dO.y * u + z.x * dv + z.y * du);
        du = temp;

        /*  Next step in the iterative process:  W(u,v) -> W^2 + 2 * O * W + <delta>  */
        temp = u * u - v * v + 2. * (u * O.x - v * O.y); 
        v =    u * v + u * v + 2. * (v * O.x + u * O.y);
        u = temp;
        #if (!is_julia)
          u += delta.x;
          v += delta.y;
        #endif
        
        /*  Stripe average, a color algo based on statistcs  */
        #if (color_scheme == 0)
          stripe += z.x * z.y / zz * step(0.0, time);
          s3 = s2; s2 = s1; s1 = stripe;
        #endif

        /*  Loop in webgl1  */
        time += 1.;
        if (zz > square_radius) { break; }
      }

      time += clamp(1.0 + logLogRR - log2(log2(zz)), 0., 1.);
      #if (color_scheme == 0)
        stripe = interpolate(stripe, s1, s2, s3, fract(time));
      #endif
      return result(time, zz, dot(dz,dz), stripe);
    }

    void main() {
      /*  Get result  */
      result R = calculator(vec2(0));

      /*  DEM (Distance Estimation) = 2 * |Z / Z'| * ln(|Z|)  */
      float dem = sqrt(R.zz / R.dzdz) * log(R.zz);
      float dem_weight = 800. / min(size.x, size.y);

      /*  Adaptive supersampling with additional 4 points in SSAAx4 pattern */
      #if (super_sampling == 1 && color_scheme != 1)
        if (-log(dem * dem_weight) > 0.5) {
          R.time /= 5.;
          R.zz /= 5.;
          R.dzdz /= 5.;
          R.stripe /= 5.;
          for (int i = 0; i < 4; i++) {
            vec2 offset = pixelsize * vec2(vec4(-1., 3., 3., 1.)[i], vec4(-3., -1., 1., 3.)[i]) / 4.;
            offset = vec2(offset.x * rotator.y - offset.y * rotator.x, dot(offset, rotator));
            result RI = calculator(offset);
            R.time += RI.time / 5.;
            R.zz += RI.zz / 5.;
            R.dzdz += RI.dzdz / 5.;
            R.stripe += RI.stripe / 5.;
          }
        }
      #endif

      /*  Final coloring  */
      vec3 color;
      #if (color_scheme == 0)
        color += 0.7 + 2.5 * (R.stripe / clamp(R.time, 0., 200.)) * (1.0 - 0.6 * step(float(imax), 1. + R.time));
        color = 0.5 + 0.5 * sin(color + vec3(4.0, 4.6, 5.2) + 50.0 * R.time / float(imax));
      #else
        color += 1.0 - clamp(-log(dem * dem_weight), 0., 1.);
      #endif

      gl_FragColor = vec4(color, 1.);
    }`;