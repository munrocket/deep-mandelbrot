'use strict';

let canvas, savedMousePos, image, iterations, color, colorScheme, colorStep, colorId, smooth;
let target = { Re: -0.5, Im: 0, dRe: 1.5, dIm: 1 };

function mandelbrot(target, width, height) {
  colorId = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {

      let i = 0, zRe = 0, zIm = 0, zReSqr = 0, zImSqr = 0;
      let cRe = target.Re - target.dRe + 2 * target.dRe * x / width;
      let cIm = target.Im + target.dIm - 2 * target.dIm * y / height;

      while (zReSqr + zImSqr < 4 && i++ < iterations) {
        zIm = (zRe + zIm) * (zRe + zIm) - zReSqr - zImSqr + cIm;
        zRe = zReSqr - zImSqr + cRe;
        zImSqr = zIm * zIm;
        zReSqr = zRe * zRe;
      }

      colorizeNext(i - 1, zReSqr + zImSqr);
    }
  }
}

let abs = Math.abs;
let log2 = Math.log(2);
function colorizeNext(i, rSqr) {
  switch (colorScheme) {
    case 0:
      if (i == iterations) {
        image.data[colorId++] = 0; image.data[colorId++] = 0; image.data[colorId++] = 0;
      } else {
        color = (smooth) ? i + 2 - Math.log(Math.log(rSqr) / 2) / log2 : i;
        let t = (colorStep * color / 256) % 6;
        image.data[colorId++] = (2 - abs(t-5) + abs(t-4) + abs(t-2) - abs(t-1)) * 127.5;
        image.data[colorId++] = (abs(t-4) - abs(t-3) - abs(t-1) + abs(t)) * 127.5;
        image.data[colorId++] = (abs(t-6) - abs(t-5) - abs(t-3) + abs(t-2)) * 127.5;
      }
      break;
    case 1:
      if (i == iterations) {
        image.data[colorId++] = 0; image.data[colorId++] = 0; image.data[colorId++] = 0;
      } else {
        color = (smooth) ? i + 2 - Math.log(Math.log(rSqr) / log2 * 2) : i;
        color = 256 * (iterations - (color * colorStep) % iterations) / iterations;
        image.data[colorId++] = color;  image.data[colorId++] = color;  image.data[colorId++] = color;
      }
      break;
  }
  image.data[colorId++] = 255;
}

function draw(mandelbrot) {
  canvas = (canvas) ? canvas : document.getElementById('canvas');
  let context = canvas.getContext('2d');
  colorStep = document.getElementById('colorStep').value;
  colorScheme = document.getElementById('colorizing').selectedIndex;
  iterations = document.getElementById('iterations').value;
  smooth = document.getElementById('smooth').selectedIndex;
  image = (image) ? image : context.createImageData(canvas.width, canvas.height);
  mandelbrot(target, canvas.width, canvas.height);
  context.putImageData(image, 0, 0);
  context.font='10px Verdana';
  context.fillStyle = (!colorScheme) ? '#777' : '#FFF';
  context.fillText(`(${target.Re}, ${target.Im}) with ${Math.floor(1.5 / target.dRe)}x zoom`, 5, canvas.height - 5);
}

window.onload = function() {
  draw(mandelbrot);
};