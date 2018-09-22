'use strict';

// with double.js
function mandelbrotDouble(target, width, height) {
  pixelColorId = 0;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {

      let iteration = 0, X = D.Zero, Y = D.Zero, XX = D.Zero, XY = D.Zero, YY = D.Zero;
      let CX = D.add22(D.sub22(D.clone(target.x), target.dx), D.div21(D.mul21(D.clone(target.dx), 2 * j), width));
      let CY = D.sub22(D.add22(D.clone(target.y), target.dy), D.div21(D.mul21(D.clone(target.dy), 2 * i), height));

      while (iteration++ < maxIteration && (!preventEscape || XX.toNumber() + YY.toNumber() < escapeSqr)) {
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
  for (let i = 0; i < maxIteration; i++) {
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

//series approx
function mandelbrotApprox(target, width, height) {
  let approxOrder = 5;
  let ox = D.Zero, oy = D.Zero, oxox = D.Zero, oyoy = D.Zero, oxoy = D.Zero;
  let OX = [], OY = [], OXOX = [], OYOY = [];
  for (let i = 0; i < maxIteration && ox.lt(1e50); i++) {
    ox = oxox.sub(oyoy).add(target.x); oy = oxoy.add(oxoy).add(target.y);
    oxox = ox.sqr(); oyoy = oy.sqr(); oxoy = ox.mul(oy);
    OX.push(ox); OY.push(oy); OXOX.push(oxox); OYOY.push(oyoy);
  }
  console.log("1");
  let CX = [], CY = [];
  for (let m = 0; m < approxOrder; m++) {
    CX[m] = (m == 0) ? [D.One] : [D.Zero]; CY[m] = [D.Zero];
  }
  for (let i = 0; i < OX.length; i++) {
    let ox = OX[i], oy = OY[i];
    for (let m = approxOrder - 1; m >= 0; m--) {
      let cx = CX[m][i], cy = CX[m][i], temp;
      temp = ox.mul(cx).sub(oy.mul(cy)).mul(2);
      cy = ox.mul(cy).add(oy.mul(cx)).mul(2); cx = temp;
      if (m == 1) cx = cx.add(1);
      for (let k = 0; k < m - 1; k++) {
        temp = cx.add(CX[k][i].mul(CX[approxOrder - k - 1][i]).sub(CY[k][i].mul(CY[approxOrder - k - 1][i])));
        cy = cy.add(CX[k][i].mul(CY[approxOrder - k - 1][i]).add(CY[k][i].mul(CX[approxOrder - k - 1][i]))); cx = temp;
      }
      CX[m].push(cx); CY[m].push(cy);
    }
  }
  console.log("2");
  for (let i = 0; i < OX.length; i++) {
    OX[i] = OX[i].toNumber(); OY[i] = OY[i].toNumber();
    OXOX[i] = OXOX[i].toNumber(); OYOY[i] = OYOY[i].toNumber();
    for (let m = 0; m < approxOrder; m++) {
      CX[m][i] = CX[m][i].toNumber(); CY[m][i] = CY[m][i].toNumber();
    }
  }
  console.log("ox, cx", OX, CX);
  pixelColorId = 0;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      let VX = [target.dx.neg().add(target.dx.mul(2 * j).div(width))];
      let VY = [target.dy.sub(target.dy.mul(2 * i).div(height))];
      for (let m = 0; m < approxOrder-1; m++) {
        VX.push(VX[m].sqr().sub(VY[m].sqr()));
        VY.push(VX[m].mul(VY[m]).mul(2));
      }
      for (let m = 0; m < approxOrder; m++) {
        VX[m] = VX[m].toNumber(); VY[m] = VY[m].toNumber();
      }
      let n, rr = 0, dx = 0, dy = 0;
      for (n = 0; n < OX.length && rr < escapeSqr; n++) {
        for (let m = 0; m < approxOrder; m++) {
          dx += CX[m][n] * VX[m] - CX[m][n] * VY[m];
          dy += CX[m][n] * VY[m] + CX[m][n] * VX[m];
        }
        rr = OXOX[n] + OYOY[n] + 2 * (OX[n] * dx + OY[n] * dy) + dx * dx + dy * dy;
      }
      colorizeNextPixel(n, rr, OX[n] + dx, OY[n] + dy, dx, dy);
    }
  }
  console.log("3")
}

// //series approx
// function mandelbrotApprox(target, width, height) {
//   let ox = D.Zero, oy = D.Zero, oxox = D.Zero, oyoy = D.Zero, oxoy = D.Zero;
//   let OX = [], OY = [], OXOX = [], OYOY = [];
//   for (let i = 0; i < maxIteration; i++) {
//     ox = oxox.sub(oyoy).add(target.x); oy = oxoy.add(oxoy).add(target.y);
//     oxox = ox.sqr(); oyoy = oy.sqr(); oxoy = ox.mul(oy);
//     OX.push(ox); OY.push(oy); OXOX.push(oxox.toNumber()); OYOY.push(oyoy.toNumber());
//   }
//   let ax = D.Zero, ay = ax, bx = ax, by = ax, cx = ax, cy = ax, dx = ax, dy = ax, temp;
//   let AX = [], AY = [], BX = [], BY = [], CX = [], CY = [], DX = [], DY = [];
//   for (let i = 0; i < maxIteration-1; i++) {
//     let ox = OX[i], oy = OY[i];
//     temp = ox.mul(dx).sub(oy.mul(dy)).add(ax.mul(cx)).sub(ay.mul(cy)).mul(2).add(bx.sqr().sub(by.sqr()));
//     dy = ox.mul(dy).add(oy.mul(dx)).add(ax.mul(cy)).add(ay.mul(cx)).add(bx.mul(by)).mul(2); dx = temp;
//     temp = ox.mul(cx).sub(oy.mul(cy)).add(ax.mul(bx)).sub(ay.mul(by)).mul(2);
//     cy = ox.mul(cy).add(oy.mul(cx)).add(ax.mul(by)).add(ay.mul(bx)).mul(2); cx = temp;
//     temp = ox.mul(bx).sub(oy.mul(by)).mul(2).add(ax.sqr()).sub(ay.sqr());
//     by = ox.mul(by).add(oy.mul(bx)).add(ax.mul(ay)).mul(2); bx = temp;
//     temp = (ox.mul(ax).sub(oy.mul(ay))).mul(2).add(1);
//     ay = ox.mul(ay).add((oy).mul(ax)).mul(2); ax = temp;
//     AX.push(ax.toNumber()); AY.push (ay.toNumber());
//     BX.push(bx.toNumber()); BY.push(by.toNumber());
//     CX.push(cx.toNumber()); CY.push(cy.toNumber());
//     DX.push(dx.toNumber()); DY.push(dy.toNumber());
//     OX[i] = ox.toNumber(); OY[i] = oy.toNumber();
//   }
//   console.log("AX,BX,CX,DX",AX,BX,CX,DX);
//   pixelColorId = 0;
//   for (let i = 0; i < height; i++) {
//     for (let j = 0; j < width; j++) {
//       let vx = target.dx.neg().add(target.dx.mul(2 * j).div(width));
//       let vy = target.dy.sub(target.dy.mul(2 * i).div(height));
//       let vx2 = vx.sqr().sub(vy.sqr()), vy2 = vx.mul(vy).mul(2);
//       let vx3 = vx.mul(vx2).sub(vy.mul(vy2)), vy3 = vx.mul(vy2).add(vy.mul(vx2));
//       let vx4 = vx2.sqr().sub(vy2.sqr()), vy4 = vx2.mul(vy2).mul(2);
//       vx = vx.toNumber(); vy = vy.toNumber(); vx2 = vx2.toNumber(); vy2 = vy2.toNumber();
//       vx3 = vx3.toNumber(); vy3 = vy3.toNumber(); vx4 = vx4.toNumber(); vy4 = vy4.toNumber();
//       let rr = 0, n, dx, dy, zx, zy;
//       for(n = 0; n < maxIteration && rr < escapeSqr; n++) {
//         dx = AX[n] * vx - AY[n] * vy + BX[n] * vx2 - BY[n] * vy2 + CX[n] * vx3 - CY[n] * vy3 + DX[n] * vx4 - DX[n] * vy4;
//         dy = AX[n] * vy + AY[n] * vx + BX[n] * vy2 + BY[n] * vx2 + CX[n] * vy3 + CY[n] * vx3 + DX[n] * vy4 + DX[n] * vx4;
//         zx = OX[n + 1] + 2 * (OX[n] * dx - OY[n] * dy) + dx * dx - dy * dy + vx;
//         zy = OY[n + 1] + 2 * (OX[n] * dy + OY[n] * dx) + dx * dy + dy * dx + vy;
//         rr = zx * zx + zy * zy;
//       }
//       colorizeNextPixel(n, rr, OX[n] + dx, OY[n] + dy, dx, dy);
//     }
//   }
//   console.log("3")
// }

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
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {

      let iteration = 0, x = 0, y = 0, xx = 0, yy = 0;
      let temp = 0, dx = 0, dy = 0;
      let cx = target.x.sub(target.dx).add(target.dx.mul(2 * j).div(width)).toNumber();
      let cy = target.y.add(target.dy).sub(target.dy.mul(2 * i).div(height)).toNumber();
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
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {

      let iteration = 0, x = 0, y = 0, xx = 0, xy = 0, yy = 0;
      let temp = 0, dx = 0, dy = 0;
      let cx = target.y.add(target.dy).sub(target.dy.mul(2 * i).div(height)).toNumber();
      let cy = target.x.sub(target.dx).add(target.dx.mul(2 * j).div(width)).toNumber();
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
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {

      let iteration = 0, x = 0, y = 0, xx = 0, xy = 0, yy = 0;
      let temp = 0, dx = 0, dy = 0;
      let cx = target.x.add(target.dx).sub(target.dx.mul(2 * j).div(width)).toNumber();
      let cy = target.y.sub(target.dy).add(target.dy.mul(2 * i).div(height)).toNumber();
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
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {

      let iteration = 0, x = 0, y = 0, x1, y1, x2, y2, u, v, p, q;
      let temp = 0, dx = 0, dy = 0;
      let cx = target.x.sub(target.dx).add(target.dx.mul(2 * j).div(width)).toNumber();
      let cy = target.y.add(target.dy).sub(target.dy.mul(2 * i).div(height)).toNumber();

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