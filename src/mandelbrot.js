'use strict';

let fractal, maxIteration, preventEscape, escapeSqr, palette, colorAlgo, colorStep;
let canvas, image, pixelColorId, savedMousePos, target = { x: new D(-0.5), y: new D(0), dx: new D(3), dy: new D(2) };

function calc(obj) {
  obj.x = obj.xx - obj.yy + obj.cx;
  obj.y = obj.xy + obj.xy + obj.cy;
  obj.xx = obj.x * obj.x;
  obj.yy = obj.y * obj.y;
  obj.xy = obj.x * obj.y;

  let temp = 2 * (obj.x * obj.dx - obj.y * obj.dy) + 1;
  obj.dy = 2 * (obj.x * obj.dy + obj.y * obj.dx);
  obj.dx = temp;
}

function mandelbrot(target, width, height) {
  pixelColorId = 0;
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      let iteration = 0, obj = { x: 0, y: 0, xx: 0, yy: 0, xy:0, dx:0, dy:0 };
      obj.cx = target.x.sub(target.dx).add(target.dx.mul(2 * i).div(width)).toNumber();
      obj.cy = target.y.add(target.dy).sub(target.dy.mul(2 * j).div(height)).toNumber();
      while (iteration++ < maxIteration && (!preventEscape || obj.xx + obj.yy < escapeSqr)) calc(obj)
      colorizeNextPixel(iteration - 1, obj.xx + obj.yy, obj.x, obj.y, obj.dx, obj.dy);
    }
  }
}

let color;
let abs = Math.abs;
let log2 = Math.log(2);
let logE = Math.log(escapeSqr);

function colorizeNextPixel(iteration, rr, x, y, dx, dy) {
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
  context.fillText(`(${target.x.toNumber()}, ${target.y.toNumber()}) with ${Math.floor(1.5 * target.dx.inv().toNumber())}x zoom`, 5, canvas.height - 5);
}

function updateSettings() {
  switch (document.getElementById('fractal').selectedIndex) {
    case 0: fractal = mandelbrot; break;
    case 1: fractal = mandelbrotDouble; break;
    case 2: fractal = mandelbrotPerturb; break;
    case 3: fractal = mandelbrotApprox; break;
    case 4: if (fractal != drop) { fractal = drop; target = { x: new D(0), y: new D(0), dx: new D(3), dy: new D(2) } }; break;
    case 5: if (fractal != eye) { fractal = eye; target = { x: new D(0), y: new D(0), dx: new D(3), dy: new D(2) } }; break;
    case 6: if (fractal != necklace) { fractal = necklace; target = { x: new D(0), y: new D(0), dx: new D(3), dy: new D(2) } }; break;
    case 7: if (fractal != mandelpinski) { fractal = mandelpinski; target = { x: new D(0), y: new D(0), dx: new D(3), dy: new D(2) } }; break;
    case 8: if (fractal != circle) { fractal = circle; target = { x: new D(0), y: new D(0), dx: new D(6), dy: new D(4) } }; break;
    case 9: if (fractal != bug) { fractal = bug; target = { x: new D(0), y: new D(0), dx: new D(3), dy: new D(2) } }; break;
    default: window.alert("error");
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