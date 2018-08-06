let looping = null;
let savedPos = null;
let canvas = document.getElementById("canvas");
let target = { Re: -0.5, Im: 0, dRe: 1.5, dIm: 1 };

function mandelbrot(imageData, width, height, target) {  
  let iterations = document.getElementById("iterations").value;
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {

      let i = 0, zRe = 0, zIm = 0, zReSqr = 0, zImSqr = 0;
      let cRe = target.Re - target.dRe + 2 * target.dRe * x / width;
      let cIm = target.Im + target.dIm - 2 * target.dIm * y / height;
      while (zReSqr + zImSqr < 4 && i < iterations) {
        i++;
        zIm = (zRe + zIm) * (zRe + zIm) - zReSqr - zImSqr;
        zRe = zReSqr - zImSqr;
        zIm += cIm;
        zRe += cRe;
        zImSqr = zIm * zIm;
        zReSqr = zRe * zRe;
      }

      let index = (y * width + x) * 4;
      imageData.data[index + 3] = 255;
      colorize(index, i, iterations, imageData)
    }
  }
}

function colorize(index, i, iterations, imageData) {
  let scheme = document.getElementById("colorizing").selectedIndex;
  let colorStep = document.getElementById("colorStep").value;
  switch (scheme) {
    case 1:
      if (i == iterations) {
        imageData.data[index] = 0; imageData.data[index + 1] = 0; imageData.data[index + 2] = 0;
      } else {
        let abs = Math.abs;
        let t = (colorStep * i / 256) % 6;
        imageData.data[index] = (2 - abs(t-5) + abs(t-4) + abs(t-2) - abs(t-1)) * 127.5;
        imageData.data[index + 1] = (abs(t-4) - abs(t-3) - abs(t-1) + abs(t)) * 127.5;
        imageData.data[index + 2] = (abs(t-6) - abs(t-5) - abs(t-3) + abs(t-2)) * 127.5;
      }
      break;
    default:
      imageData.data[index] = 255 * (iterations - i) / iterations ;
      imageData.data[index + 1] = imageData.data[index];
      imageData.data[index + 2] = imageData.data[index];
      break;
  }
}

function draw(mandelbrot, target) {
  let context = canvas.getContext("2d");
  let imageData = context.createImageData(canvas.width, canvas.height);
  mandelbrot(imageData, canvas.width, canvas.height, Object.assign({}, target));
  context.putImageData(imageData, 0, 0);
  document.getElementById("currentPos").innerHTML = `(${target.Re}, ${target.Im}) with ${Math.floor(1.5 / target.dRe)}x zoom`;
}

function getMousePos(e) {
  let rect = canvas.getBoundingClientRect();
  let pos = { Re: target.Re - target.dRe + 2 * target.dRe * (e.clientX - rect.left) / canvas.width,
              Im: target.Im + target.dIm - 2 * target.dIm * (e.clientY - rect.top) / canvas.height };
  if (target.Re - target.dRe > pos.Re || pos.Re > target.Re + target.dRe) return null;
  if (target.Im - target.dIm > pos.Im || pos.Im > target.Im + target.dIm) return null;
  return pos;
}

window.onmousedown = function(e) {
  savedPos = getMousePos(e);
}

window.onmouseup = function(e) {
  let pos = getMousePos(e);
  if (pos && savedPos) {
    target = { Re: (savedPos.Re + pos.Re) / 2, Im: (savedPos.Im + pos.Im) / 2,
              dRe: Math.abs(savedPos.Re - pos.Re) / 2, dIm: Math.abs(savedPos.Im - pos.Im) / 2 };
    let ratio = canvas.width / canvas.height;
    if (ratio > target.dRe / target.dIm) {
      target.dRe = ratio * target.dIm;
    } else {
      target.dIm = target.dRe / ratio;
    }
    draw(mandelbrot, target);
  }
}

window.onload = function() {
  draw(mandelbrot, target);
};