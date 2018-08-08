'use strict';

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
    if (e.button == 2) {
      target.dRe *= 20;
      target.dIm *= 20;
      draw(mandelbrot, target);
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
      draw(mandelbrot, target);
    }
  }
})

function savePng() {
  var a  = document.createElement('a');
  a.href = canvas.toDataURL('png');
  a.download = `mandelbrot_${target.Re}_${target.Im})_${Math.floor(1.5 / target.dRe)}x.png`;
  a.click();
}

document.getElementById('canvas').addEventListener('contextmenu', function(evt) { 
  evt.preventDefault();
}, false);