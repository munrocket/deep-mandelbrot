'use strict';

let fractal, maxIteration, preventEscape, escapeSqr, palette, colorAlgo, colorStep;
let canvas, image, pixelColorId, savedMousePos, target = { x: -0.5, y: 0, dx: 3, dy: 2 };

function mandelbrot(target, width, height) {
  pixelColorId = 0;
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {

      let iteration = 0, x = 0, y = 0, xx = 0, xy = 0, yy = 0;
      let temp = 0, dx = 0, dy = 0, d2x = 0, d2y = 0;
      let cx = target.x - target.dx + 2 * target.dx * i / width;
      let cy = target.y + target.dy - 2 * target.dy * j / height;

      // if (!preventEscape || 256 * (cx*cx + cy*cy) * (cx*cx + cy*cy) - 96 * (cx*cx + cy*cy) + 32 * cx - 3 < 0) {
      //   colorizeNextPixel(maxIteration-1, xx + yy, x, y, dx, dy);
      //   continue;
      // }

      let q = 0;
      while (iteration++ < maxIteration && (!preventEscape || xx + yy < escapeSqr)) {
        x = xx - yy + cx;
        y = xy + xy + cy;
        xx = x * x;
        yy = y * y;
        xy = x * y;

        temp = 2 * (x * dx - y * dy) + 1;
        dy = 2 * (x * dy + y * dx);
        dx = temp;

        temp = 2 * (x * d2x - y * d2y + dx * dx - dy * dy);
        d2y = 2 * (x * d2y + y * d2x + 2 * dx * dy);
        d2x = temp;
      }

      colorizeNextPixel(iteration - 1, xx + yy, x, y, dx, dy, d2x, d2y);
    }
  }
}

let color;
let abs = Math.abs;
let log2 = Math.log(2);
let logE = Math.log(escapeSqr);

function colorizeNextPixel(iteration, rr, x, y, dx, dy, d2x, d2y) {
  if (preventEscape && iteration == maxIteration) {
   image.data[pixelColorId++] = 0; image.data[pixelColorId++] = 0; image.data[pixelColorId++] = 0;
  } else {
    switch (colorAlgo) {
      case 0: color = iteration; break;
      case 1: color = iteration + 1 + Math.log(logE / Math.log(rr)) / log2; break;
      case 2: color = -Math.log(Math.sqrt(rr / (dx*dx + dy*dy)) * Math.log(rr)); break;
      case 3: color = (Math.atan2(y, x) + Math.PI) * 32 / Math.PI; break;
      case 4: color = (Math.atan2(dy, dx) + Math.PI) * 32 / Math.PI; break;
      case 5: color = Math.log(dx*dx + dy*dy)/2; break;
      case 6: color = Math.log(d2x*d2x + d2y*d2y); break;
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
        color = 256 * (maxIteration - (color * colorStep) % maxIteration) / maxIteration;
        image.data[pixelColorId++] = color;  image.data[pixelColorId++] = color;  image.data[pixelColorId++] = color;
        break;
      default: alert("error");
    }
  }
  image.data[pixelColorId++] = 255;
}

function draw(fractal) {
  let context = canvas.getContext('2d');
  fractal(target, canvas.width, canvas.height);
  context.putImageData(image, 0, 0);
  context.font='10px Verdana';
  context.fillStyle = (!palette) ? '#777' : '#FFF';
  context.fillText(`(${target.x}, ${target.y}) with ${Math.floor(1.5 / target.dx)}x zoom`, 5, canvas.height - 5);
}

function updateSettings() {
  switch (document.getElementById('fractal').selectedIndex) {
    case 0: fractal = mandelbrot; break;
    case 1: fractal = mandelbrotApprox; break;
    case 2: if (fractal != drop) { fractal = drop; target = { x: 0, y: 0, dx: 3, dy: 2 } }; break;
    case 3: if (fractal != eye) { fractal = eye; target = { x: 0, y: 0, dx: 3, dy: 2 } }; break;
    case 4: if (fractal != necklace) { fractal = necklace; target = { x: 0, y: 0, dx: 3, dy: 2 } }; break;
    case 5: if (fractal != mandelpinski) { fractal = mandelpinski; target = { x: 0, y: 0, dx: 3, dy: 2 } }; break;
    case 6: if (fractal != circle) { fractal = circle; target = { x: 0, y: 0, dx: 6, dy: 4 } }; break;
    case 7: if (fractal != strap) { fractal = strap; target = { x: 0, y: 0, dx: 3, dy: 2 } }; break;
  }
  maxIteration = parseInt(document.getElementById('maxIteration').value);
  preventEscape = document.getElementById('preventEscape').checked;
  escapeSqr = Math.pow(document.getElementById('escapeRadius').value, 2);
  logE = Math.log(escapeSqr);
  palette = document.getElementById('palette').selectedIndex;
  colorAlgo = document.getElementById('colorAlgo').selectedIndex;
  colorStep = document.getElementById('colorStep').value;
  canvas = (canvas) ? canvas : document.getElementById('canvas');
  image = (image) ? image : canvas.getContext('2d').createImageData(canvas.width, canvas.height);
}

window.onload = function() {
  updateSettings();
  draw(fractal);
};