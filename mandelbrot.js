let canvas = document.getElementById('canvas');
let colorScheme, colorStep, savedMousePos;
let target = { Re: -0.5, Im: 0, dRe: 1.5, dIm: 1 };

function mandelbrot(imageData, width, height, target) {  
  let iterations = document.getElementById('iterations').value;
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      
      let i = 0, zRe = 0, zIm = 0, zReSqr = 0, zImSqr = 0;
      let cRe = target.Re - target.dRe + 2 * target.dRe * x / width;
      let cIm = target.Im + target.dIm - 2 * target.dIm * y / height;

      while (zReSqr + zImSqr < 4 && i < iterations) {
        i++;
        zIm = (zRe + zIm) * (zRe + zIm) - zReSqr - zImSqr + cIm;
        zRe = zReSqr - zImSqr + cRe;
        zImSqr = zIm * zIm;
        zReSqr = zRe * zRe;
      }

      colorize(4 * (y * width + x), i, iterations, imageData)
    }
  }
}

function colorize(index, i, iterations, imageData) {
  imageData.data[index + 3] = 255;
  switch (colorScheme) {
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
  let context = canvas.getContext('2d');
  colorStep = document.getElementById('colorStep').value;
  colorScheme = document.getElementById('colorizing').selectedIndex;
  let imageData = context.createImageData(canvas.width, canvas.height);
  mandelbrot(imageData, canvas.width, canvas.height, Object.assign({}, target));
  context.putImageData(imageData, 0, 0);
  context.font='10px Verdana';
  context.fillStyle = (!colorScheme) ? '#777' : '#FFF';
  context.fillText(`(${target.Re}, ${target.Im}) with ${Math.floor(1.5 / target.dRe)}x zoom`, 5, canvas.height - 5);
}


//------------------ window events ---------------------

function getMousePos(e) {
  let rect = canvas.getBoundingClientRect();
  let pos = { Re: target.Re - target.dRe + 2 * target.dRe * (e.clientX - rect.left) / canvas.width,
              Im: target.Im + target.dIm - 2 * target.dIm * (e.clientY - rect.top) / canvas.height };
  if (target.Re - target.dRe > pos.Re || pos.Re > target.Re + target.dRe) return null;
  if (target.Im - target.dIm > pos.Im || pos.Im > target.Im + target.dIm) return null;
  return pos;
}

function multiEventListener(element, eventNames, action) {
  let events = eventNames.split(' ');
  for (let i = 0; i < events.length; i++) {
    element.addEventListener(events[i], action, false);
  }
}

multiEventListener(window, 'mousedown touchstart', function(e) {
  savedMousePos = getMousePos(e);
})

multiEventListener(window, 'mouseup touchend', function(e) {
  let pos = getMousePos(e);
  if (pos && savedMousePos) {
    if (e.button == 1) {
      target.dRe *= 20;
      target.dIm *= 20;
    } else if (e.button == 0) {
      target.Re = (savedMousePos.Re + pos.Re) / 2;
      target.Im = (savedMousePos.Im + pos.Im) / 2;
      let diffRe = Math.abs(savedMousePos.Re - pos.Re) / 2;
      let diffIm = Math.abs(savedMousePos.Im - pos.Im) / 2;
      target.dRe = (diffRe / target.dRe > 0.05) ? diffRe : target.dRe / 20;
      target.dIm = (diffIm / target.dIm > 0.05) ? diffIm : target.dIm / 20;
      let ratio = canvas.width / canvas.height;
      if (ratio > target.dRe / target.dIm) {
        target.dRe = ratio * target.dIm;
      } else {
        target.dIm = target.dRe / ratio;
      }
    }
    draw(mandelbrot, target);
  }
})

window.onload = function() {
  draw(mandelbrot, target);
};