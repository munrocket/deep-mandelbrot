'use strict';

// with double.js
function mandelbrotDouble(target, width, height) {
  pixelColorId = 0;
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {

      let iteration = 0, X = D.Zero, Y = D.Zero, XX = D.Zero, XY = D.Zero, YY = D.Zero;
      let CX = D.add22(D.sub22(D.clone(target.x), target.dx), D.div21(D.mul21(D.clone(target.dx), 2 * i), width));
      let CY = D.sub22(D.add22(D.clone(target.y), target.dy), D.div21(D.mul21(D.clone(target.dy), 2 * j), height));

      while (iteration++ < maxIteration && (!preventEscape || D.lt21(D.add22(D.clone(XX), YY), escapeSqr))) {
        X = D.add22(D.sub22(XX, YY), CX);
        Y = D.add22(D.add22(XY, XY), CY);
        XX = D.sqr2(D.clone(X)); YY = D.sqr2(D.clone(Y)); XY = D.mul22(X, Y);
      }

      colorizeNextPixel(iteration - 1, D.add22(XX, YY).toNumber(), X.toNumber(), Y.toNumber());
    }
  }
}

//perturbation theory
function mandelbrotPerturb(target, width, height) {
  
  let OX = [target.x], OY = [target.y];
  let OXOX = [OX[0].sqr()], OYOY = [OY[0].sqr()], OXOY = OX[0].mul(OY[0]);
  for (let i = 0; i < maxIteration - 1; i++) {
    OX.push(OXOX[i].sub(OYOY[i]).add(target.x));
    OY.push(OXOY.add(OXOY).add(target.y));
    OXOX.push(OX[i+1].sqr());
    OYOY.push(OY[i+1].sqr());
    OXOY = OX[i+1].mul(OY[i+1]);
  }
  let ox = [], oy = [], oxox = [], oyoy = [];
  for (let i = 0; i < OX.length; i++) {
    ox[i] = OX[i].toNumber();
    oy[i] = OY[i].toNumber();
    oxox[i] = OXOX[i].toNumber();
    oyoy[i] = OYOY[i].toNumber();
  }
  pixelColorId = 0;
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      let vx = target.dx.neg().add(target.dx.mul(2 * i).div(width)).toNumber();
      let vy = target.dy.sub(target.dy.mul(2 * j).div(height)).toNumber();
      
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

//z -> z^2 + 1/c
function drop(target, width, height) {
  pixelColorId = 0;
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {

      let iteration = 0, x = 0, y = 0, xx = 0, xy = 0, yy = 0;
      let temp = 0, dx = 0, dy = 0;
      let cx = target.x.sub(target.dx).add(target.dx.mul(2 * i).div(width)).toNumber() + 1.25;
      let cy = target.y.add(target.dy).sub(target.dy.mul(2 * j).div(height)).toNumber();
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
      let cx = target.x.sub(target.dx).add(target.dx.mul(2 * i).div(width)).toNumber();
      let cy = target.y.add(target.dy).sub(target.dy.mul(2 * j).div(height)).toNumber();
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
      let cx = target.x.sub(target.dx).add(target.dx.mul(2 * i).div(width)).toNumber();
      let cy = target.y.add(target.dy).sub(target.dy.mul(2 * j).div(height)).toNumber();

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
      let cx = target.x.sub(target.dx).add(target.dx.mul(2 * i).div(width)).toNumber();
      let cy = target.y.add(target.dy).sub(target.dy.mul(2 * j).div(height)).toNumber();

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
      let cx = target.y.add(target.dy).sub(target.dy.mul(2 * j).div(height)).toNumber();
      let cy = target.x.sub(target.dx).add(target.dx.mul(2 * i).div(width)).toNumber();
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
      let cx = target.x.add(target.dx).sub(target.dx.mul(2 * i).div(width)).toNumber();
      let cy = target.y.sub(target.dy).add(target.dy.mul(2 * j).div(height)).toNumber();
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
      let cx = target.x.sub(target.dx).add(target.dx.mul(2 * i).div(width)).toNumber();
      let cy = target.y.add(target.dy).sub(target.dy.mul(2 * j).div(height)).toNumber();

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