'use strict';

let savedMousePos;
let canvas = document.getElementById('canvasgl');

function getMousePos(e) {
  let rect = canvas.getBoundingClientRect();
  let pos = {
    x: aim.x.add(aim.hx.mul(2 * (e.clientX - rect.left) / canvas.width - 1)),
    y: aim.y.sub(aim.hy.mul(2 * (e.clientY - rect.top) / canvas.height - 1))
  };
  return pos;
}

function updateUI() {
  document.getElementById('aim.x').value = aim.x.toNumber();
  document.getElementById('aim.y').value = aim.y.toNumber();
  document.getElementById('zoom').value = aim.hx.toNumber().toExponential(1);
}

function zoomClick(pos, val) {
  let dx = savedMousePos.x.sub(pos.x).div(2);
  let dy = savedMousePos.y.sub(pos.y).div(2);
  if (dx.abs().gt(aim.hx.mul(0.005)) || dy.abs().gt(aim.hy.mul(0.005))) {
    aim.x = savedMousePos.x.add(pos.x).div(2);
    aim.y = savedMousePos.y.add(pos.y).div(2);
    aim.hx = dx.abs();
    aim.hy = dy.abs();
  } else {
    aim.x = pos.x;
    aim.y = pos.y;
    aim.hx = aim.hx.mul(val);
    aim.hy = aim.hy.mul(val);
  }
  updateUI();
  draw();
}

function zoomWheel(pos, val) {
  aim.x = pos.x.add(aim.x.sub(pos.x).mul(val));
  aim.y = pos.y.add(aim.y.sub(pos.y).mul(val));
  aim.hx = aim.hx.mul(val);
  aim.hy = aim.hy.mul(val);
  updateUI();
  draw();
}

function buttonGoto() {
  aim.x = new Double(document.getElementById('aim.x').value);
  aim.y = new Double(document.getElementById('aim.y').value);
  aim.hx = new Double(document.getElementById('zoom').value);
  aim.hy = new Double(document.getElementById('zoom').value);
  updateUI();
  draw();
}

function savePng() {
  var a  = document.createElement('a');
  a.href = canvas.toDataURL('png');
  a.download = `mandelbrot_${aim.x.toString()}_${aim.y.toString()})_${Math.floor(1.5 * aim.hx.inv().toNumber())}x.png`;
  a.click();
}

window.addEventListener('mousedown', function(e) {
  savedMousePos = getMousePos(e);
}, false);

canvas.addEventListener('mouseup', function(e) {
  let pos = getMousePos(e);
  if (savedMousePos) {
    if (e.button == 0) {
      zoomClick(pos, 1/15);
    } else if (e.button == 2) {
      zoomClick(pos, 15);
    } else {
      drawOrbit(pos);
    }
  }
}, false);

canvas.addEventListener("wheel", function (e) {
  zoomWheel(getMousePos(e), Math.pow(2, e.deltaY / 100));
}, false);

canvas.addEventListener('contextmenu', function(evt) { 
  evt.preventDefault();
}, false);

function drawOrbit(pos) {
  console.log("orbit");
  let orbit = calcOrbit(pos);
  // let ctx = canvas.getContext('2d');
  // ctx.beginPath();
  // for (let i = 0; i < imax; i++) {
  //   ctx.moveTo(((orbit.x[i] - aim.x.toNumber()) / aim.hx.toNumber() + 1) / 2 * canvas.width,
  //             ((aim.y.toNumber() - orbit.y[i]) / aim.hy.toNumber() + 1) / 2 * canvas.height);
  // }
  // ctx.strokeStyle = '#ff0000';
  // ctx.stroke();
}

window.onload = function() {
  draw();
};