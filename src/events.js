'use strict';

let Events = {
  savePng() {
    var a  = document.createElement('a');
    a.href = document.getElementById('glmandel').toDataURL('png');
    a.download = `mandelbrot_x_${aim.x.toExponential()}__y_${aim.y.toExponential()})`
      + `__zoom_${Math.floor(1.5 * aim.hx.inv().toNumber())}x.png`;
    a.click();
  },
  showError(header, msg) {
    if (header) document.getElementById('errorHdr').innerHTML = header;
    if (msg) document.getElementById('errorMsg').innerHTML = msg;
    document.getElementById('errorBox').classList.add('is-active');
  }
};

(function () {

  let glcontrol = document.getElementById('glcontrol');
  let mouseDownPos;
  let wheelAccum = 0;
  let isJulia = false;
  let isOrbit = false;
  let isDrawingAim = false;
  let isRotatingAim = false;
  let newAim = {};

  function updateUI() {
    let ctx = glcontrol.getContext('2d');
    ctx.clearRect(0, 0, glcontrol.width, glcontrol.height);
    glcontrol.width = ctx.canvas.clientWidth;
    glcontrol.height = ctx.canvas.clientHeight;
    let gl = twgl.getContext(document.getElementById('gljulia'));
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  function getPos(e) {
    let rect = glcontrol.getBoundingClientRect();
    return {
      x: aim.x.add(aim.hx.mul(2 * e.offsetX / rect.width - 1)),
      y: aim.y.sub(aim.hy.mul(2 * e.offsetY / rect.height - 1)),
      px: e.offsetX,
      py: e.offsetY,
    };
  }

  function getAim(pos1, pos2) {
    return {
      x: pos1.x.add(pos2.x).div(2),
      y: pos1.y.add(pos2.y).div(2),
      hx: pos1.x.sub(pos2.x).div(2).abs(),
      hy: pos1.y.sub(pos2.y).div(2).abs(),
      phi: 0,
    };
  }

    
  function rectZoom(pos, factor) {
    let newAim = getAim(mouseDownPos, pos);
    if (newAim.hx.lt(aim.hx.mul(0.005)) && newAim.hy.lt(aim.hy.mul(0.005))) {
      simpleZoom(pos, factor);
    } else {
      aim = newAim;
      draw(aim);
      updateUI();
    }
  }

  function simpleZoom(pos, factor) {
    aim.x = pos.x;
    aim.y = pos.y;
    aim.hx = aim.hx.mul(factor);
    aim.hy = aim.hy.mul(factor);
    draw(aim);
    updateUI();
  }

  function wheelZoom(pos) {
    let factor = Math.pow(2, -wheelAccum / 200 );
    pos.x = pos.x.add(aim.x.sub(pos.x).mul(factor));
    pos.y = pos.y.add(aim.y.sub(pos.y).mul(factor));
    simpleZoom(pos, factor);
    wheelAccum = 0;
  }

  function drawOrbit(pos) {
    let orbittex = calcOrbit(pos);
    let ctx = glcontrol.getContext('2d');
    ctx.clearRect(0, 0, glcontrol.width, glcontrol.height);
    ctx.beginPath();
    for (let i = 0; i < imax; i++) {
      let point = { x: orbittex[4 * i], y: orbittex[4 * i + 1] };
      let x = ((point.x - aim.x.toNumber()) / aim.hx.toNumber() + 1) / 2 * glcontrol.width;
      let y = ((aim.y.toNumber() - point.y) / aim.hy.toNumber()+ 1) / 2 * glcontrol.height;
      ctx.arc(x, y, 1, 0, 2 * Math.PI, true);
      ctx.lineTo(x, y);
      ctx.moveTo(x, y);
    }
    ctx.strokeStyle = '#efe1f4';
    ctx.stroke();
  }

  glcontrol.addEventListener('mousedown', e => {
    mouseDownPos = getPos(e);
    if ((e.button == 0 && e.ctrlKey) || e.button == 1) {
      isJulia = true;      
    } else if (e.button == 0) {
      isDrawingAim = true;
    }
  });

  glcontrol.addEventListener('mouseup', e => {
    let pos = getPos(e);
    if (e.button == 0 && !isJulia) {
      isDrawingAim = false;
      rectZoom(pos, 1/15);
      // let tempAim = getAim(mouseDownPos, pos);
      // if (tempAim.hx.lt(aim.hx.mul(0.005)) && tempAim.hy.lt(aim.hy.mul(0.005))) {
      //   isDrawingAim = false;
      //   simpleZoom(pos, 1/15);
      // } else {
      //   isRotatingAim = true;
      //   newAim = tempAim;
      //   glcontrol.dispatchEvent(new MouseEvent('mousemove', e));
      // }
    } else if (e.button == 2) {
      simpleZoom(pos, 15);
    }
  });

  window.addEventListener('mouseup', e => {
    if (isDrawingAim && e.target.id != 'glcontrol') {
      getPos(e);
      glcontrol.dispatchEvent(new MouseEvent('mouseup', e));
    }
    if (isJulia) {
      isJulia = false;
      updateUI();
    }
    if (isOrbit) {
      isOrbit = false;
      updateUI();
    }
  });

  glcontrol.addEventListener('mousemove', e => {
    if (isDrawingAim || isRotatingAim) {
      let ctx = glcontrol.getContext('2d');
      let pos0 = mouseDownPos;
      ctx.clearRect(0, 0, glcontrol.width, glcontrol.height);
      ctx.beginPath();
      ctx.rect(pos0.px, pos0.py, e.offsetX - pos0.px, e.offsetY - pos0.py);
      if(isRotatingAim) {
        let x = ((newAim.x.toNumber() - aim.x.toNumber()) / aim.hx.toNumber() + 1) / 2 * glcontrol.width;
        let y = ((aim.y.toNumber() - newAim.y.toNumber()) / aim.hy.toNumber() + 1) / 2 * glcontrol.height;
        ctx.fillRect(pos0.px-2, pos0.py-1, 4, 4);
        ctx.fillRect(pos0.px-2, e.offsetY-1, 4, 4);
        ctx.fillRect(e.offsetX -2, e.offsetY-1, 4, 4);
        ctx.fillRect(e.offsetX-2, pos0.py-1, 4, 4);
        isRotatingAim = false;
        isDrawingAim = false;
      }
      ctx.strokeStyle = '#f9a4a4';
      ctx.fillStyle = '#f9a4a4';
      ctx.stroke();
    }
    if (isJulia) {
      let pos = getPos(e);
      draw({x:Double.Zero, y:Double.Zero, hx:new Double(2), hy:new Double(2), phi:0}, pos);
      drawOrbit(pos);
    }
  });

  glcontrol.addEventListener('wheel', e => {
    if (wheelAccum == 0) {
      setTimeout(() => wheelZoom(getPos(e)), 100);
    }
    wheelAccum += e.deltaY;
  });

  glcontrol.addEventListener('contextmenu', e => e.preventDefault());
  
  document.getElementById('glmandel').addEventListener('webglcontextlost', e => {
    Events.showError("WebGL context lost!",
      "GPU calculation was too long and the browser or the OS decides to reset the GPU.")
    e.preventDefault();
  });
  
  let currentRequestId = 0;
  window.addEventListener('resize', e => {
    function requestResize(crid) {
      if (crid == currentRequestId) {
        simpleZoom(aim, 1);
      }
      currentRequestId = 0;
    }
    currentRequestId += 1;
    setTimeout(() => requestResize(currentRequestId), 500);
  });

  const burger = document.querySelector('.navbar-burger');
  const menu = document.getElementById(burger.dataset.target);
  menu.addEventListener('click', () => {
    if (window.getComputedStyle(burger).display == 'block') {
      burger.click();
    }
  }, true);
  burger.addEventListener('click', () => {
    burger.classList.toggle('is-active');
    menu.classList.toggle('is-active');
  }, true);

  document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    draw(aim);
  });

})();