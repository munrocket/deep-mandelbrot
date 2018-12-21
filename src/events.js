'use strict';

let savedMousePos;
let ticking = false;

function getMousePos(e) {
  let rect = canvas.getBoundingClientRect();
  let pos = { x: target.x.sub(target.dx).add(target.dx.mul(2 * (e.clientX - rect.left)).div(canvas.width)),
              y: target.y.add(target.dy).sub(target.dy.mul(2 * (e.clientY - rect.top)).div(canvas.height)) };
  if (target.x.sub(target.dx).gt(pos.x) || target.x.add(target.dx).lt(pos.x)) return null;
  if (target.y.sub(target.dy).gt(pos.y) || target.y.add(target.dy).lt(pos.y)) return null;
  return pos;
}

window.addEventListener('scroll', function(e) {
  if (!ticking) {
    ticking = true;

    ticking = false;
  }
}, false);


window.addEventListener('mousedown', function(e) {
  savedMousePos = getMousePos(e);
}, false);

window.addEventListener('mouseup', function(e) {
  let pos = getMousePos(e);
  if (pos && savedMousePos) {
    if (e.button == 2) {
      //right button
      target.dx.mul(5);
      target.dy.mul(5);
      draw();
    } else if (e.button == 0) {
      //left button
      target.x = savedMousePos.x.add(pos.x).div(2);
      target.y = savedMousePos.y.add(pos.y).div(2);
      let dx = savedMousePos.x.sub(pos.x).abs().div(2);
      let dy = savedMousePos.y.sub(pos.y).abs().div(2);
      target.dx = (dx.div(target.dx).gt(0.05)) ? dx : target.dx.div(5);
      target.dy = (dy.div(target.dy).gt(0.05)) ? dy : target.dy.div(5);
      let ratio = canvas.width / canvas.height;
      if (ratio > target.dx / target.dy) {
        target.dx = target.dy.mul(ratio);
      } else {
        target.dy = target.dx.div(ratio);
      }
      draw();
    } else if (e.button == 1 && document.getElementById('fractal').selectedIndex < 1) {
      //scroll button
      let cx = savedMousePos.x.add(pos.x).div(2).toNumber();
      let cy = savedMousePos.y.add(pos.y).div(2).toNumber();
      let ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(((cx - target.x.toNumber()) / target.dx.toNumber() + 1) * canvas.width / 2,
                ((target.y.toNumber() - cy) / target.dy.toNumber() + 1) * canvas.height / 2);
      let x = cx, y = cy, xx = x * x, yy = y * y, xy = x * y;
      for (let i = 0; i < 100 && xx + yy < 4; i++) {
        x = xx - yy + cx; y = xy + xy + cy;
        xx = x * x; yy = y * y; xy = x * y;
        ctx.lineTo(((x - target.x.toNumber()) / target.dx.toNumber() + 1) * canvas.width / 2,
                  ((target.y.toNumber() - y) / target.dy.toNumber() + 1) * canvas.height / 2);
      }
      ctx.strokeStyle = '#ff0000';
      ctx.stroke();
    }
  }
}, false);

window.addEventListener('scroll', function(e) {
  
}, false);

function savePng() {
  var a  = document.createElement('a');
  a.href = canvas.toDataURL('png');
  a.download = `mandelbrot_${target.x.toNumber()}_${target.y.toNumber()})_${Math.floor(1.5 * target.dx.inv().toNumber())}x.png`;
  a.click();
}

document.getElementById('canvas').addEventListener('contextmenu', function(evt) { 
  evt.preventDefault();
}, false);