'use strict';

//perturbation theory
function mandelbrotPerturb(target, width, height) {
  
  let ox = [target.x], oy = [target.y];
  let oxox = [ox[0] * ox[0]], oyoy = [oy[0] * oy[0]], oxoy = ox[0] * oy[0];
  for (let i = 0; i < maxIteration - 1; i++) {
    ox.push(oxox[i] - oyoy[i] + target.x);
    oy.push(oxoy + oxoy + target.y);
    oxox.push(ox[i+1] * ox[i+1]);
    oyoy.push(oy[i+1] * oy[i+1]);
    oxoy = ox[i+1] * oy[i+1];
  }
   pixelColorId = 0;
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      let vx = -target.dx + 2 * target.dx * i / width;
      let vy = target.dy - 2 * target.dy * j / height;
      
      let dx = vx, dy = vy, rr = 0, n = -1;
      let zx, zy, dxdx, dydy, oxdx, oydy, oxn, oyn;
      while (n++ < ox.length && rr < escapeSqr) {
        oxn = ox[n]; oyn = oy[n]; dxdx = dx * dx; dydy = dy * dy; oxdx = oxn * dx; oydy = oyn * dy;
        dy = oxn * dy + oyn * dx + dx * dy; dy = dy + dy + vy;
        dx = oxdx - oydy; dx = dx + dx + dxdx - dydy + vx;
        zx = oxn + dx; zy = oyn + dy;
        rr = oxox[n] + oxdx + oxdx + dxdx + oyoy[n] + oydy + oydy + dydy;
      }
      colorizeNextPixel(n - 1, rr, zx, zy, dx, dy);
    }
  }
}

// with double.js
function mandelbrotDouble(target, width, height) {
  pixelColorId = 0;
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {

      let iteration = 0, X = D.Zero, Y = D.Zero, XX = D.Zero, XY = D.Zero, YY = D.Zero;
      let TX = new D(target.x), TY = new D(target.y), TDX = new D(target.dx), TDY = new D(target.dy);
      let CX = D.add22(D.sub22(TX, TDX), D.div21(D.mul21(TDX, 2 * i), width));
      let CY = D.sub22(D.add22(TY, TDY), D.div21(D.mul21(TDY, 2 * j), height));
      while (iteration++ < maxIteration && (!preventEscape || D.lt21(D.add22(D.clone(XX), YY), escapeSqr))) {
        X = D.add22(D.sub22(XX, YY), CX);
        Y = D.add22(D.add22(XY, XY), CY);
        XX = D.sqr2(D.clone(X)); YY = D.sqr2(D.clone(Y)); XY = D.mul22(X, Y);
      }

      colorizeNextPixel(iteration - 1, D.add22(XX, YY).toNumber(), X.toNumber(), Y.toNumber());
    }
  }
}

//z -> z^2 + 1/c
function drop(target, width, height) {
  pixelColorId = 0;
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {

      let iteration = 0, x = 0, y = 0, xx = 0, xy = 0, yy = 0;
      let temp = 0, dx = 0, dy = 0;
      let cx = target.x - target.dx + 2 * target.dx * i / width + 1.25;
      let cy = target.y + target.dy - 2 * target.dy * j / height;
      temp = cx * cx + cy * cy;
      cx = cx / temp;
      cy = -cy / temp;

      while (iteration++ < maxIteration && (!preventEscape || xx + yy < escapeSqr)) {
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
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {

      let iteration = 0, x = 0, y = 0, xx = 0, yy = 0;
      let temp = 0, dx = 0, dy = 0;
      let cx = target.x - target.dx + 2 * target.dx * i / width;
      let cy = target.y + target.dy - 2 * target.dy * j / height;
      temp = cx * cx + cy * cy;
      cx = cx / temp;
      cy = -cy / temp;

      while (iteration++ < maxIteration && (!preventEscape || xx + yy < escapeSqr)) {
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
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {

      let iteration = 0, x = 0, y = 0, xx = 0, xy = 0, yy = 0;
      let temp = 0, dx = 0, dy = 0;
      let cx = target.y + target.dy - 2 * target.dy * j / height;
      let cy = target.x - target.dx + 2 * target.dx * i / width;

      if (true) {
        x = cx; y = cy;
        xx = cx*cx; xy = cx*cy; yy = cy*cy;
        cx = -2; cy = 2;
      }

      while (iteration++ < maxIteration && (!preventEscape || xx + yy < escapeSqr)) {
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
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {

      let iteration = 0, x = 0, y = 0, xx = 0, xy = 0, yy = 0;
      let temp = 0, dx = 0, dy = 0;
      let cx = target.y + target.dy - 2 * target.dy * j / height;
      let cy = target.x - target.dx + 2 * target.dx * i / width;

      if (true) {
        x = cx; y = cy;
        xx = cx*cx; xy = cx*cy; yy = cy*cy;
        cx = 100; cy = 0;
      }

      while (iteration++ < maxIteration && (!preventEscape || xx + yy < escapeSqr)) {
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
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {

      let iteration = 0, x = 0, y = 0, xx = 0, xy = 0, yy = 0;
      let temp = 0, dx = 0, dy = 0;
      let cx = target.y + target.dy - 2 * target.dy * j / height;
      let cy = target.x - target.dx + 2 * target.dx * i / width;
      temp = cx * cx + cy * cy;
      cx = cx / temp - 1;
      cy = -cy / temp;

      while (iteration++ < maxIteration && (!preventEscape || xx + yy < escapeSqr)) {
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
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {

      let iteration = 0, x = 0, y = 0, xx = 0, xy = 0, yy = 0;
      let temp = 0, dx = 0, dy = 0;
      let cx = target.x - target.dx + 2 * target.dx * i / width;
      let cy = target.y + target.dy - 2 * target.dy * j / height;
      temp = cx * cx + cy * cy;
      cx = cx + 0.03 * cx / temp - 0.9;
      cy = cy - 0.03 * cy / temp;

      while (iteration++ < maxIteration && (!preventEscape || xx + yy < escapeSqr)) {
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
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {

      let iteration = 0, x = 0, y = 0, x1, y1, x2, y2, u, v, p, q;
      let temp = 0, dx = 0, dy = 0;
      let cx = target.x - target.dx + 2 * target.dx * i / width;
      let cy = target.y + target.dy - 2 * target.dy * j / height;

      while (iteration++ < maxIteration && (!preventEscape || x * x + y * y < escapeSqr)) {
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