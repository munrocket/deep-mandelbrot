'use strict';

(function () {

  let savedMousePos;
  let savedWheelPos = 0;
  let control = document.getElementById('glcontrol');

  function getMousePos(e) {
    let rect = control.getBoundingClientRect();
    let pos = {
      x: aim.x.add(aim.hx.mul(2 * (e.clientX - rect.left) / rect.width - 1)),
      y: aim.y.sub(aim.hy.mul(2 * (e.clientY - rect.top) / rect.height - 1)),
      px: e.clientX - rect.left,
      py: e.clientY - rect.top
    };
    return pos;
  }

  function updateUI() {
    let ctx = control.getContext('2d');
    control.width = ctx.canvas.clientWidth;
    control.height = ctx.canvas.clientHeight;
    ctx.clearRect(0, 0, control.width, control.height);
  }

  function zoomRect(pos, factor) {
    let dx = savedMousePos.x.sub(pos.x).div(2);
    let dy = savedMousePos.y.sub(pos.y).div(2);
    if (dx.abs().lt(aim.hx.mul(0.005)) && dy.abs().lt(aim.hy.mul(0.005))) {
      zoom(pos, factor)
    } else {
      aim.x = savedMousePos.x.add(pos.x).div(2);
      aim.y = savedMousePos.y.add(pos.y).div(2);
      aim.hx = dx.abs();
      aim.hy = dy.abs();
      draw();
      updateUI();
    }
  }

  function zoom(pos, factor) {
    aim.x = pos.x;
    aim.y = pos.y;
    aim.hx = aim.hx.mul(factor);
    aim.hy = aim.hy.mul(factor);
    draw();
    updateUI();
  }

  function zoomWheel(pos) {
    let factor = Math.pow(2, -savedWheelPos / 200 );
    pos.x = pos.x.add(aim.x.sub(pos.x).mul(factor));
    pos.y = pos.y.add(aim.y.sub(pos.y).mul(factor));
    zoom(pos, factor);
    savedWheelPos = 0;
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
    ctx.strokeStyle = '#efe1f4';
    ctx.stroke();
  }

  control.addEventListener('mousedown', e => {
    savedMousePos = getMousePos(e);
  }, false);

  control.addEventListener('mouseup', e => {
    let pos = getMousePos(e);
    if (savedMousePos) {
      if (e.button == 0) {
        zoomRect(pos, 1/20);
      } else if (e.button == 2) {
        zoom(pos, 20);
      } else {
        drawOrbit(pos);
      }
    }
  }, false);

  control.addEventListener('wheel', e => {
    if (savedWheelPos == 0) {
      setTimeout(() => zoomWheel(getMousePos(e)), 100);
    }
    savedWheelPos += e.deltaY;
  });

  control.addEventListener('contextmenu', e => e.preventDefault());
  
  document.getElementById('glcanvas').addEventListener('webglcontextlost', e => {
    alert("context lost!");
    e.preventDefault();
  });
  
  window.addEventListener('resize', e => {
    function requestResize(requestWheelPos) {
      if (requestWheelPos == savedWheelPos) {
        zoom(aim, 1);
      }
      savedWheelPos = 0;
    }
    savedWheelPos += 1;
    setTimeout(() => requestResize(savedWheelPos), 200);
  });

  window.onload = function() {
    draw();
    updateUI();
    document.getElementById('buttonSave').style.display = 'block';
  }

})();

let Buttons = {
  savePng() {
    var a  = document.createElement('a');
    a.href = document.getElementById('glcanvas').toDataURL('png');
    a.download = `mandelbrot_x_${aim.x.toExponential()}__y_${aim.y.toExponential()})__zoom_${Math.floor(1.5 * aim.hx.inv().toNumber())}x.png`;
    a.click();
  }
}