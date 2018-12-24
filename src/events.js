'use strict';

let savedMousePos;
let canvas = document.getElementById('canvasgl');

function getMousePos(e) {
  let rect = canvas.getBoundingClientRect();
  let pos = { x: target.x.add(target.hx.mul(2 * (e.clientX - rect.left) / canvas.width - 1)),
              y: target.y.sub(target.hy.mul(2 * (e.clientY - rect.top) / canvas.height - 1)) };
  return pos;
}

window.addEventListener('mousedown', function(e) {
  savedMousePos = getMousePos(e);
}, false);

window.addEventListener('mouseup', function(e) {
  let pos = getMousePos(e);
  if (pos && savedMousePos) {
    if (e.button == 0) {
      //left button (zoom in)
      target.x = savedMousePos.x.add(pos.x).div(2);
      target.y = savedMousePos.y.add(pos.y).div(2);
      let hx = savedMousePos.x.sub(pos.x).abs().div(2);
      let hy = savedMousePos.y.sub(pos.y).abs().div(2);
      target.hx = (hx.div(target.hx).gt(0.05)) ? hx : target.hx.div(20);
      target.hy = (hy.div(target.hy).gt(0.05)) ? hy : target.hy.div(20);
      let ratio = canvas.width / canvas.height;
      if (ratio > target.hx / target.hy) {
        target.hx = target.hy.mul(ratio);
      } else {
        target.hy = target.hx.div(ratio);
      }
      draw();
    } else if (e.button == 2) {
      //right button (zoom out)
      target.hx = target.hx.mul(20);
      target.hy = target.hy.mul(20);
      draw();
    } else if (e.button == 1) {
      //scroll button (draw orbit)
      let zx = savedMousePos.x.add(pos.x).div(20).toNumber();
      let zy = savedMousePos.y.add(pos.y).div(20).toNumber();
      let orbit = calcOrbit([zx, zy]);
      // let ctx = canvas.getContext('2d');
      // ctx.beginPath();
      // for (let i = 0; i < imax; i++) {
      //   ctx.moveTo(((orbit.x[i] - target.x.toNumber()) / target.hx.toNumber() + 1) / 2 * canvas.width,
      //             ((target.y.toNumber() - orbit.y[i]) / target.hy.toNumber() + 1) / 2 * canvas.height);
      // }
      // ctx.strokeStyle = '#ff0000';
      // ctx.stroke();
    }
  }
}, false);

document.addEventListener("wheel", function (e) {
  var oldVal = parseInt(document.getElementById("body").style.transform.replace("translateY(","").replace("px)",""));
  var variation = parseInt(e.deltaY);
  
  // update the body translation to simulate a scroll
  document.getElementById("body").style.transform = "translateY(" + (oldVal - variation) + "px)";

  return false;
  
}, true);

function savePng() {
  var a  = document.createElement('a');
  a.href = canvas.toDataURL('png');
  a.download = `mandelbrot_${target.x.toNumber()}_${target.y.toNumber()})_${Math.floor(1.5 * target.hx.inv().toNumber())}x.png`;
  a.click();
}

canvas.addEventListener('contextmenu', function(evt) { 
  evt.preventDefault();
}, false);

window.onload = function() {
  
  draw(fractal);
};