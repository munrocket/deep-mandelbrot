let looping = null;
let savedPos = null;
let canvas = document.getElementById("canvas");
let target = { Re: -0.5, Im: 0, dRe: 1.5, dIm: 1 };

async function mandelbrot(imageData, width, height, target) {
  let iterations = document.getElementById("iterations").value;
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {

      //calcuation
      let i = 0, zRe = 0, zIm = 0;
      let cRe = target.Re - target.dRe + 2 * target.dRe * x / width;
      let cIm = target.Im + target.dIm - 2 * target.dIm * y / height;
      while (zRe * zRe + zIm * zIm < 4 && i < iterations) {
        i++;
        let zRe0 = zRe;
        zRe = zRe * zRe - zIm * zIm;
        zIm = 2 * zRe0 * zIm;
        zRe += cRe;
        zIm += cIm;
      }

      //color
      let abs = Math.abs;
      let t = (10 * i / 256) % 6;
      let index = (y * width + x) * 4;
      if (i == iterations) {
        imageData.data[index] = 0; imageData.data[index + 1] = 0; imageData.data[index + 2] = 0;
      } else {
        imageData.data[index] = (2 - abs(t-5) + abs(t-4) + abs(t-2) - abs(t-1)) * 127.5;
        imageData.data[index + 1] = (abs(t-4) - abs(t-3) - abs(t-1) + abs(t)) * 127.5;
        imageData.data[index + 2] = (abs(t-6) - abs(t-5) - abs(t-3) + abs(t-2)) * 127.5;
      }
      imageData.data[index + 3] = 255;
    }
  }
  setTimeout(clearInterval(looping), 500);
}

function draw(mandelbrot, target) {
  let context = canvas.getContext("2d");
  let imageData = context.createImageData(canvas.width, canvas.height);
  mandelbrot(imageData, canvas.width, canvas.height, Object.assign({}, target));
  setTimeout(context.putImageData(imageData, 0, 0), 200);
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