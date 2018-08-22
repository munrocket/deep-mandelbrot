'use strict';

function getMousePos(e) {
  let rect = canvas.getBoundingClientRect();
  let pos = { x: target.x - target.dx + 2 * target.dx * (e.clientX - rect.left) / canvas.width,
              y: target.y + target.dy - 2 * target.dy * (e.clientY - rect.top) / canvas.height };
  if (target.x - target.dx > pos.x || pos.x > target.x + target.dx) return null;
  if (target.y - target.dy > pos.y || pos.y > target.y + target.dy) return null;
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
      target.dx *= 20;
      target.dy *= 20;
      draw(fractal);
    } else if (e.button == 0) {
      target.x = (savedMousePos.x + pos.x) / 2;
      target.y = (savedMousePos.y + pos.y) / 2;
      let dx = Math.abs(savedMousePos.x - pos.x) / 2;
      let dy = Math.abs(savedMousePos.y - pos.y) / 2;
      target.dx = (dx / target.dx > 0.05) ? dx : target.dx / 20;
      target.dy = (dy / target.dy > 0.05) ? dy : target.dy / 20;
      let ratio = canvas.width / canvas.height;
      if (ratio > target.dx / target.dy) {
        target.dx = ratio * target.dy;
      } else {
        target.dy = target.dx / ratio;
      }
      draw(fractal);
    } else if (e.button == 1 && document.getElementById('fractal').selectedIndex < 1) {
      
    }
  }
})

function savePng() {
  var a  = document.createElement('a');
  a.href = canvas.toDataURL('png');
  a.download = `mandelbrot_${target.x}_${target.y})_${Math.floor(1.5 / target.dx)}x.png`;
  a.click();
}

document.getElementById('canvas').addEventListener('contextmenu', function(evt) { 
  evt.preventDefault();
}, false);