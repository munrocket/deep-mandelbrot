'use strict';

let canvas, savedMousePos, imageData, iterations, colorScheme, colorStep, colorId;
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

      colorizeNext(i);
    }
  }
}

function colorizeNext(i) {
  switch (colorScheme) {
    case 0:
      let color = 255 * (iterations - i) / iterations ;
      imageData.data[colorId++] = color;
      imageData.data[colorId++] = color;
      imageData.data[colorId++] = color;
      break;
    case 1:
      if (i - 1 == iterations) {
        imageData.data[colorId++] = 0; imageData.data[colorId++] = 0; imageData.data[colorId++] = 0;
      } else {
        let abs = Math.abs;
        let t = (colorStep * i / 256) % 6;
        imageData.data[colorId++] = (2 - abs(t-5) + abs(t-4) + abs(t-2) - abs(t-1)) * 127.5;
        imageData.data[colorId++] = (abs(t-4) - abs(t-3) - abs(t-1) + abs(t)) * 127.5;
        imageData.data[colorId++] = (abs(t-6) - abs(t-5) - abs(t-3) + abs(t-2)) * 127.5;
      }
      break;
  }
  imageData.data[colorId++] = 255;
}

function draw(mandelbrot, target) {
  canvas = (canvas) ? canvas : document.getElementById('canvas');
  let context = canvas.getContext('2d');
  colorStep = document.getElementById('colorStep').value;
  colorScheme = document.getElementById('colorizing').selectedIndex;
  iterations = document.getElementById('iterations').value;
  imageData = (imageData) ? imageData : context.createImageData(canvas.width, canvas.height);
  mandelbrot(target, canvas.width, canvas.height);
  context.putImageData(imageData, 0, 0);
  context.font='10px Verdana';
  context.fillStyle = (!colorScheme) ? '#777' : '#FFF';
  context.fillText(`(${target.Re}, ${target.Im}) with ${Math.floor(1.5 / target.dRe)}x zoom`, 5, canvas.height - 5);
}

window.onload = function() {
  draw(mandelbrot, target);
};