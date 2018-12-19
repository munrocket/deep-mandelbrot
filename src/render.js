'use strict';
let fractal, target = { x: new D(-0.5), y: new D(0), dx: new D(3), dy: new D(2) };

function draw() {
  switch (document.getElementById('fractal').selectedIndex) {
    case 0: fractal = mandelbrot; break;
    case 1: fractal = mandelbrotDouble; break;
    case 2: fractal = mandelbrotPerturb; break;
    case 3: fractal = mandelbrotApprox; break;
    case 4: if (fractal != drop) { fractal = drop; target = { x: new D(0), y: new D(0), dx: new D(3), dy: new D(2) } }; break;
    case 5: if (fractal != eye) { fractal = eye; target = { x: new D(0), y: new D(0), dx: new D(3), dy: new D(2) } }; break;
    case 6: if (fractal != necklace) { fractal = necklace; target = { x: new D(0), y: new D(0), dx: new D(3), dy: new D(2) } }; break;
    case 7: if (fractal != mandelpinski) { fractal = mandelpinski; target = { x: new D(0), y: new D(0), dx: new D(3), dy: new D(2) } }; break;
    case 8: if (fractal != circle) { fractal = circle; target = { x: new D(0), y: new D(0), dx: new D(6), dy: new D(4) } }; break;
    case 9: if (fractal != bug) { fractal = bug; target = { x: new D(0), y: new D(0), dx: new D(3), dy: new D(2) } }; break;
    default: window.alert("error");
  }
  const gl = document.getElementById('canvas').getContext('webgl');
  const programInfo = twgl.createProgramInfo(gl, [vsource, fsource]);

  const arrays = { position: [-1, 1, 0, 1, 1, 0, 1, -1, 0, 1, -1, 0, -1, -1, 0, -1, 1, 0] };
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

  twgl.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  const uniforms = {
    center: [target.x.toNumber(), target.y.toNumber()],
    delta: [target.dx.toNumber(), target.dy.toNumber()],
    resolution: [gl.canvas.width, gl.canvas.height],
    imax: parseInt(document.getElementById('imax').value),
    bailout: Math.pow(document.getElementById('bailout').value, 2),
    // palette: document.getElementById('palette').selectedIndex,
    // colorAlgo: document.getElementById('colorAlgo').selectedIndex,
    // colorStep: document.getElementById('colorStep').value / 256,
    // preventEscape: document.getElementById('preventEscape').checked,
  };

  gl.useProgram(programInfo.program);
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
  twgl.setUniforms(programInfo, uniforms);
  twgl.drawBufferInfo(gl, bufferInfo);
  
  //let context = document.getElementById('canvas').getContext('2d');
  //context.font='10px Verdana';
  //context.fillStyle = (!uniforms.palette) ? '#777' : '#FFF';
  //context.fillText(`(${target.x.toNumber()}, ${target.y.toNumber()}) with ${Math.floor(1.5 * target.dx.inv().toNumber())}x zoom`, 5, canvas.height - 5);
}

window.onload = function() {
  draw(fractal);
};