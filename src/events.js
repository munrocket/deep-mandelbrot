'use strict';

let savedMousePos;
let control = document.getElementById('glcontrol');

function getMousePos(e) {
  let rect = control.getBoundingClientRect();
  let pos = {
    x: aim.x.add(aim.hx.mul(2 * (e.clientX - rect.left) / rect.width - 1)),
    y: aim.y.sub(aim.hy.mul(2 * (e.clientY - rect.top) / rect.height - 1))
  };
  return pos;
}

function updateUI() {
  control.getContext('2d').clearRect(0, 0, control.width, control.height);
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
  draw();
  updateUI();
}

function zoomWheel(pos, val) {
  //wheelVal += val;
  //function requestZoom()
  aim.x = pos.x.add(aim.x.sub(pos.x).mul(val));
  aim.y = pos.y.add(aim.y.sub(pos.y).mul(val));
  aim.hx = aim.hx.mul(val);
  aim.hy = aim.hy.mul(val);
  draw();
  updateUI();
}

function buttonGoto() {
  aim.x = new Double(document.getElementById('aim.x').value);
  aim.y = new Double(document.getElementById('aim.y').value);
  aim.hx = new Double(document.getElementById('zoom').value);
  aim.hy = new Double(document.getElementById('zoom').value);
  draw();
  updateUI();
}

function savePng() {
  var a  = document.createElement('a');
  a.href = document.getElementById('glcanvas').toDataURL('png');
  a.download = `mandelbrot_${aim.x.toString()}_${aim.y.toString()})_${Math.floor(1.5 * aim.hx.inv().toNumber())}x.png`;
  a.click();
}

function drawOrbit(pos) {
  let orbittex = calcOrbit(pos);
  let ctx = control.getContext('2d');
  ctx.beginPath();
  for (let i = 0; i < imax; i++) {
    let point = { x: orbittex[3 * i], y: orbittex[3 * i + 1] };
    ctx.lineTo(((point.x - aim.x.toNumber()) / aim.hx.toNumber() + 1) / 2 * control.width,
              ((aim.y.toNumber() - point.y) / aim.hy.toNumber()+ 1) / 2 * control.height);
  }
  ctx.strokeStyle = '#ff0000';
  ctx.stroke();
}

control.addEventListener('mousedown', e => {
  savedMousePos = getMousePos(e);
}, false);

control.addEventListener('mouseup', e => {
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

control.addEventListener("wheel", e => {
  zoomWheel(getMousePos(e), Math.pow(2, e.deltaY / 100));
}, false);

document.getElementById('glcanvas').addEventListener('webglcontextlost', e => {
  alert("context lost!");
  e.preventDefault();
});

control.addEventListener('contextmenu', e => e.preventDefault());
window.onload = function() {
  updateUI();
  draw();
}