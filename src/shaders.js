'use strict';

const vsource = `
attribute vec3 position;
void main() {
  gl_Position = vec4(position, 1.0);
}`;

const fsource =
` 
precision mediump float;

uniform vec2 center;
uniform vec2 delta;
uniform vec2 resolution;
uniform int imax;

void main() {
  float x, y, xx, yy, xy;
  vec2 c = center + delta * (gl_FragCoord.xy - resolution / 2.0) / resolution;

  for (int i = 0; i < 100000; i++) {
    x = xx - yy + c.x;
    y = xy + xy + c.y;

    xx = x * x;
    yy = y * y;
    xy = x * y;

    if (i > imax || xx + yy > 16.0) {
      float t = min(1.0, (float(i) + 2.0 - log2(log2(xx + yy))) / float(imax + 1));
      gl_FragColor = vec4(t, t, t, 1);
      break;
    }
  }
}
`;

function colorizeNextPixel() {
  if (preventEscape && iteration == iterations) {
    image.data[pixelColorId++] = 0; image.data[pixelColorId++] = 0; image.data[pixelColorId++] = 0;
  } else {
    switch (colorAlgo) {
      case 0: color = iteration; break;
      case 1: color = iteration + 1 + Math.log(logE / Math.log(rr)) / log2; break;
      case 2: color = -Math.log(Math.sqrt(rr / (dx*dx + dy*dy)) * Math.log(rr)); break;
      case 3: color = (Math.atan2(y, x) + Math.PI) * 32 / Math.PI; break;
      case 4: color = (Math.atan2(dy, dx) + Math.PI) * 32 / Math.PI; break;
      case 5: color = Math.log(dx*dx + dy*dy)/2; break;
      default: alert("error");
    }
    switch (palette) {
      case 0:
        let t = (colorStep * color / 256) % 6;
        image.data[pixelColorId++] = (2 - abs(t-5) + abs(t-4) + abs(t-2) - abs(t-1)) * 110 + 50;
        image.data[pixelColorId++] = (abs(t-4) - abs(t-3) - abs(t-1) + abs(t)) * 110 + 50;
        image.data[pixelColorId++] = (abs(t-6) - abs(t-5) - abs(t-3) + abs(t-2)) * 110 + 100;
        break;
      case 1:
        color = 256 * (iterations - (color * colorStep) % iterations) / iterations;
        image.data[pixelColorId++] = color;  image.data[pixelColorId++] = color;  image.data[pixelColorId++] = color;
        break;
      default: alert("error");
    }
  }
  image.data[pixelColorId++] = 255;
}

function mandelbrot(target, width, height) {
  pixelColorId = 0;
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      let iteration = 0, x = 0, y = 0, xx = 0, yy = 0, xy = 0, dx = 0, dy = 0;
      cx = target.x.sub(target.dx).add(target.dx.mul(2 * i).div(width)).toNumber();
      cy = target.y.add(target.dy).sub(target.dy.mul(2 * j).div(height)).toNumber();
      while (iteration++ < iterations && (!preventEscape || xx + yy < escapeSqr)) {
        x = xx - yy + cx;
        y = xy + xy + cy;
        xx = x * x;
        yy = y * y;
        xy = x * y;

        let temp = 2 * (x * dx - y * dy) + 1;
        dy = 2 * (x * dy + y * dx);
        dx = temp;
      }
      colorizeNextPixel(iteration - 1, xx + yy, x, y, dx, dy);
    }
  }
}

// with double.js
function mandelbrotDouble(target, width, height) {
  pixelColorId = 0;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {

      let iteration = 0, X = D.Zero, Y = D.Zero, XX = D.Zero, XY = D.Zero, YY = D.Zero;
      let CX = D.add22(D.sub22(D.clone(target.x), target.dx), D.div21(D.mul21(D.clone(target.dx), 2 * j), width));
      let CY = D.sub22(D.add22(D.clone(target.y), target.dy), D.div21(D.mul21(D.clone(target.dy), 2 * i), height));

      while (iteration++ < iterations && (!preventEscape || XX.toNumber() + YY.toNumber() < escapeSqr)) {
        X = D.add22(D.sub22(XX, YY), CX);
        Y = D.add22(D.add22(XY, XY), CY);
        XX = D.sqr2(D.clone(X)); YY = D.sqr2(D.clone(Y)); XY = D.mul22(X, Y);
      }

      colorizeNextPixel(iteration - 1, XX.toNumber() + YY.toNumber(), X.toNumber(), Y.toNumber());
    }
  }
}

//perturbation theory
function mandelbrotPerturb(target, width, height) {
  let ox = D.Zero, oy = D.Zero, oxox = D.Zero, oyoy = D.Zero, oxoy = D.Zero;
  let OX = [], OY = [], OXOX = [], OYOY = [];
  for (let i = 0; i < iterations; i++) {
    ox = oxox.sub(oyoy).add(target.x); oy = oxoy.add(oxoy).add(target.y);
    oxox = ox.sqr(); oyoy = oy.sqr(); oxoy = ox.mul(oy);
    OX.push(ox.toNumber()); OY.push(oy.toNumber()); OXOX.push(oxox.toNumber()); OYOY.push(oyoy.toNumber());
  }
  pixelColorId = 0;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      let vx = target.dx.neg().add(target.dx.mul(2 * j).div(width)).toNumber();
      let vy = target.dy.sub(target.dy.mul(2 * i).div(height)).toNumber();
      let dx = vx, dy = vy, rr = 0, n, dxdx, dydy, oxdx, oydy;
      for (n = 0; n < OX.length && rr < escapeSqr; n++) {
        dxdx = dx * dx; dydy = dy * dy; oxdx = OX[n] * dx; oydy = OY[n] * dy;
        dy = 2 * (OX[n] * dy + OY[n] * dx + dx * dy) + vy;
        dx = 2 * (oxdx - oydy) + dxdx - dydy + vx;
        rr = OXOX[n] + OYOY[n] + 2 * (oxdx + oydy) + dxdx + dydy;
      }
      colorizeNextPixel(n, rr, OX[n] + dx, OY[n] + dy, dx, dy);
    }
  }
}

//z -> z^2 + 1/c
function drop(target, width, height) {
  pixelColorId = 0;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {

      let iteration = 0, x = 0, y = 0, xx = 0, xy = 0, yy = 0;
      let temp = 0, dx = 0, dy = 0;
      let cx = target.x.sub(target.dx).add(target.dx.mul(2 * j).div(width)).toNumber() + 1.25;
      let cy = target.y.add(target.dy).sub(target.dy.mul(2 * i).div(height)).toNumber();
      temp = cx * cx + cy * cy;
      cx = cx / temp;
      cy = -cy / temp;

      while (iteration++ < iterations && (!preventEscape || xx + yy < escapeSqr)) {
        x = xx - yy + cx;
        y = xy + xy + cy;
        xx = x * x;
        yy = y * y;
        xy = x * y;

        if (colorAlgo > 1) {
          temp = 2 * (x * dx - y * dy) + 1;
          dy = 2 * (x * dy + y * dx);
          dx = temp;
        }
      }

      colorizeNextPixel(iteration - 1, xx + yy, x, y, dx, dy);
    }
  }
}

//z -> z^3 + 1/c
function eye(target, width, height) {
  pixelColorId = 0;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {

      let iteration = 0, x = 0, y = 0, xx = 0, yy = 0;
      let temp = 0, dx = 0, dy = 0;
      let cx = target.x.sub(target.dx).add(target.dx.mul(2 * j).div(width)).toNumber();
      let cy = target.y.add(target.dy).sub(target.dy.mul(2 * i).div(height)).toNumber();
      temp = cx * cx + cy * cy;
      cx = cx / temp;
      cy = -cy / temp;

      while (iteration++ < iterations && (!preventEscape || xx + yy < escapeSqr)) {
        temp = (xx - 3 * yy) * x + cx;
        y = 3 * xx * y - yy * y + cy;
        x = temp;
        xx = x * x;
        yy = y * y;

        if (colorAlgo > 1) {
          temp = 2 * (x * dx - y * dy) + 1;
          dy = 2 * (x * dy + y * dx);
          dx = temp;
        }
      }

      colorizeNextPixel(iteration - 1, xx + yy, x, y, dx, dy);
    }
  }
}

//julia z -> z^4 - 0.1 * c /z^4 at point (-2,2)
function necklace(target, width, height) {
  pixelColorId = 0;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {

      let iteration = 0, x = 0, y = 0, xx = 0, xy = 0, yy = 0;
      let temp = 0, dx = 0, dy = 0;
      let cx = target.x.sub(target.dx).add(target.dx.mul(2 * j).div(width)).toNumber();
      let cy = target.y.add(target.dy).sub(target.dy.mul(2 * i).div(height)).toNumber();

      if (true) {
        x = cx; y = cy;
        xx = cx*cx; xy = cx*cy; yy = cy*cy;
        cx = -2; cy = 2;
      }

      while (iteration++ < iterations && (!preventEscape || xx + yy < escapeSqr)) {
        temp = (xx - 3 * yy) * x;
        y = 3 * xx * y - yy * y;
        x = temp;

        temp = xx * xx - 6 * xy * xy + yy * yy - 0.1 * (cx * x + cy * y) / (x*x + y*y);
        y = 4 * (xx - yy) * xy - 0.1 * (cy * x - cx * y) / (x*x + y*y);
        x = temp;

        xx = x * x;
        yy = y * y;
        xy = x * y;

        if (colorAlgo > 1) {
          temp = 2 * (x * dx - y * dy) + 1;
          dy = 2 * (x * dy + y * dx);
          dx = temp;
        }
      }

      colorizeNextPixel(iteration - 1, xx + yy, x, y, dx, dy);
    }
  }
}

//julia z -> z^4 + 0.1/z^4
function mandelpinski(target, width, height) {
  pixelColorId = 0;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {

      let iteration = 0, x = 0, y = 0, xx = 0, xy = 0, yy = 0;
      let temp = 0, dx = 0, dy = 0;
      let cx = target.x.sub(target.dx).add(target.dx.mul(2 * j).div(width)).toNumber();
      let cy = target.y.add(target.dy).sub(target.dy.mul(2 * i).div(height)).toNumber();

      if (true) {
        x = cx; y = cy;
        xx = cx*cx; xy = cx*cy; yy = cy*cy;
        cx = 100; cy = 0;
      }

      while (iteration++ < iterations && (!preventEscape || xx + yy < escapeSqr)) {
        // temp = (xx - 3 * yy) * x;
        // y = 3 * xx * y - yy * y;
        // x = temp;

        temp = xx * xx - 6 * xy * xy + yy * yy + 0.001 * (cx * x + cy * y) / (x*x + y*y);
        y = 4 * (xx - yy) * xy + 0.001 * (cy * x - cx * y) / (x*x + y*y);
        x = temp;

        xx = x * x;
        yy = y * y;
        xy = x * y;

        if (colorAlgo > 1) {
          temp = 2 * (x * dx - y * dy) + 1;
          dy = 2 * (x * dy + y * dx);
          dx = temp;
        }
      }

      colorizeNextPixel(iteration - 1, xx + yy, x, y, dx, dy);
    }
  }
}

//z -> z^2 + 1/c - 1
function circle(target, width, height) {
  pixelColorId = 0;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {

      let iteration = 0, x = 0, y = 0, xx = 0, xy = 0, yy = 0;
      let temp = 0, dx = 0, dy = 0;
      let cx = target.y.add(target.dy).sub(target.dy.mul(2 * i).div(height)).toNumber();
      let cy = target.x.sub(target.dx).add(target.dx.mul(2 * j).div(width)).toNumber();
      temp = cx * cx + cy * cy;
      cx = cx / temp - 1;
      cy = -cy / temp;

      while (iteration++ < iterations && (!preventEscape || xx + yy < escapeSqr)) {
        x = (xx - yy) + cx;
        y = (xy + xy) + cy;
        xx = x * x;
        yy = y * y;
        xy = x * y;

        if (colorAlgo > 1) {
          temp = 2 * (x * dx - y * dy) + 1;
          dy = 2 * (x * dy + y * dx);
          dx = temp;
        }
      }

      colorizeNextPixel(iteration - 1, xx + yy, x, y, dx, dy);
    }
  }
}

//z -> z^2 + c + 0.02 / c
function bug(target, width, height) {
  pixelColorId = 0;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {

      let iteration = 0, x = 0, y = 0, xx = 0, xy = 0, yy = 0;
      let temp = 0, dx = 0, dy = 0;
      let cx = target.x.add(target.dx).sub(target.dx.mul(2 * j).div(width)).toNumber();
      let cy = target.y.sub(target.dy).add(target.dy.mul(2 * i).div(height)).toNumber();
      temp = cx * cx + cy * cy;
      cx = cx + 0.03 * cx / temp - 0.9;
      cy = cy - 0.03 * cy / temp;

      while (iteration++ < iterations && (!preventEscape || xx + yy < escapeSqr)) {
        x = xx - yy + cx;
        y = xy + xy + cy;
        xx = x * x;
        yy = y * y;
        xy = x * y;

        if (colorAlgo > 1) {
          temp = 2 * (x * dx - y * dy) + 1;
          dy = 2 * (x * dy + y * dx);
          dx = temp;
        }
      }

      colorizeNextPixel(iteration - 1, xx + yy, x, y, dx, dy);
    }
  }
}

function test(target, width, height) {
  pixelColorId = 0;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {

      let iteration = 0, x = 0, y = 0, x1, y1, x2, y2, u, v, p, q;
      let temp = 0, dx = 0, dy = 0;
      let cx = target.x.sub(target.dx).add(target.dx.mul(2 * j).div(width)).toNumber();
      let cy = target.y.add(target.dy).sub(target.dy.mul(2 * i).div(height)).toNumber();

      while (iteration++ < iterations && (!preventEscape || x * x + y * y < escapeSqr)) {
        x1 = x * x - y * y + cx;
        y1 = 2 * x * y + cy;
        x2 = x1 * x1 - y1 * y1 + cx;
        y2 = 2 * x1 * y1 + cy;
        u = x * x2 - y * y2 - x1 * x1 + y1 * y1;
        v = x * y2 + x2 * y - 2 * x1 * y1;
        p = x + x2 - 2 * x1;
        q = y + y2 - 2 * y1;
        temp = p * p + q * q;
        p = p / temp;
        q = -q / temp;
        x = u * p - v * q;
        y = u * q + v * p;
      }

      colorizeNextPixel(iteration - 1, x * x + y * y, x, y, 0, 0);
    }
  }
}

const trash =
`
precision mediump float;
#define PI 3.141592653589793238;
#define E 2.718281828459045235;

uniform int iterations;
uniform int palette;
uniform int colorAlgo;
uniform int colorStep;
uniform int preventEscape;
uniform float escapeSqr;

uniform vec2 resolution;
uniform vec2 center;
uniform vec2 delta;

void colorizePixel(int iter, vec2 z, vec2 dz) {
  // vec3 rgb = vec3(0.0);
  // float param;
  // if (iter != iterations || preventEscape != 0) {
  //   if (colorAlgo == 1) { param = iter + 1 + log(log(E) / log(dot(z, z))) / log(2); }
  //   else if (colorAlgo == 2) { param = -log(sqrt(dot(z, z) / (dot(dz, dz)) * log(dot(z, z))); }
  //   else if (colorAlgo == 3) { param = (atan(z) + PI) * 32 / PI; }
  //   else if (colorAlgo == 4) { param = (atan(dz) + PI) * 32 / PI; }
  //   else if (colorAlgo == 5) { param = log(dot(dz, dz)) / 2; };
  //   else param = iter;

  //   if (palette == 0) {
  //     float t = (colorStep * param / 256) % 6;
  //     rgb.x = (2 - abs(t-5) + abs(t-4) + abs(t-2) - abs(t-1)) * 110 + 50;
  //     rgb.y = (abs(t-4) - abs(t-3) - abs(t-1) + abs(t)) * 110 + 50;
  //     rgb.z = (abs(t-6) - abs(t-5) - abs(t-3) + abs(t-2)) * 110 + 100;
  //   } else if {
  //     rgb = vec3((iterations - floor(param * colorStep)) % iterations) / iterations);
  //   };
  // };
  //gl_FragColor = vec4(rgb, 1);
  gl_FragColor = vec4(vec3(float(iter) / float(iterations)), 1);
}

void main() {
  float x = 0.0, y = 0.0, xx = 0.0, yy = 0.0, xy = 0.0, dx = 0.0, dy = 0.0, temp;
  vec2 c = center + delta * (gl_FragCoord.xy - canvas / 2.0) / canvas;

  for (int i = 0; i < 256; i++) {
    x = xx - yy + c.x;
    y = xy + xy + c.y;

    temp = 2.0 * (x * dx - y * dy) + 1.0;
    dy = 2.0 * (x * dy + y * dx);
    dx = temp;

    xx = x * x;
    yy = y * y;
    xy = x * y;

    if (i > iterations || xx + yy > escapeSqr) {
      colorizePixel(i, vec2(x, y), vec2(dx, dy));
      break;
    }
  }
}
`;