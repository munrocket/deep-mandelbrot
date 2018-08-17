'use strict';

let canvas, savedMousePos, image, maxIteration, color, colorScheme, colorStep, pixelColor, smooth;
let target = { x: -0.5, y: 0, dx: 1.5, dy: 1 };

function mandelbrot(target, width, height) {
  pixelColor = 0;
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {

      let iteration = 0, x = 0, y = 0, xx = 0, yy = 0;
      let p = target.x - target.dx + 2 * target.dx * i / width;
      let q = target.y + target.dy - 2 * target.dy * j / height;

      while (xx + yy < 4 && iteration++ < maxIteration) {
        y = (x + y) * (x + y) - xx - yy + q;
        x = xx - yy + p;
        yy = y*y;
        xx = x*x;
      }

      colorizeNextPixel(iteration - 1, xx + yy);
    }
  }
}

let abs = Math.abs;
let log2 = Math.log(2);
function colorizeNextPixel(iteration, rr) {
  switch (colorScheme) {
    case 0:
      if (iteration == maxIteration) {
        image.data[pixelColor++] = 0; image.data[pixelColor++] = 0; image.data[pixelColor++] = 0;
      } else {
        color = (smooth) ? iteration + 2 - Math.log(Math.log(rr) / 2) / log2 : iteration;
        let t = (colorStep * color / 256) % 6;
        image.data[pixelColor++] = (2 - abs(t-5) + abs(t-4) + abs(t-2) - abs(t-1)) * 127.5;
        image.data[pixelColor++] = (abs(t-4) - abs(t-3) - abs(t-1) + abs(t)) * 127.5;
        image.data[pixelColor++] = (abs(t-6) - abs(t-5) - abs(t-3) + abs(t-2)) * 127.5;
      }
      break;
    case 1:
      if (iteration == maxIteration) {
        image.data[pixelColor++] = 0; image.data[pixelColor++] = 0; image.data[pixelColor++] = 0;
      } else {
        color = (smooth) ? iteration + 2 - Math.log(Math.log(rr) / log2 * 2) : iteration;
        color = 256 * (maxIteration - (color * colorStep) % maxIteration) / maxIteration;
        image.data[pixelColor++] = color;  image.data[pixelColor++] = color;  image.data[pixelColor++] = color;
      }
      break;
  }
  image.data[pixelColor++] = 255;
}

function draw(mandelbrot) {
  canvas = (canvas) ? canvas : document.getElementById('canvas');
  let context = canvas.getContext('2d');
  colorStep = document.getElementById('colorStep').value;
  colorScheme = document.getElementById('colorizing').selectedIndex;
  maxIteration = document.getElementById('maxIteration').value;
  smooth = document.getElementById('smooth').selectedIndex;
  image = (image) ? image : context.createImageData(canvas.width, canvas.height);
  mandelbrot(target, canvas.width, canvas.height);
  context.putImageData(image, 0, 0);
  context.font='10px Verdana';
  context.fillStyle = (!colorScheme) ? '#777' : '#FFF';
  context.fillText(`(${target.x}, ${target.y}) with ${Math.floor(1.5 / target.dx)}x zoom`, 5, canvas.height - 5);
}

window.onload = function() {
  draw(mandelbrot);
};