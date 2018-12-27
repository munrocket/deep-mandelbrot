'use strict';
let fractal, target = { x: new Double(-0.6), y: new Double(0), hx: new Double(1.5), hy: new Double(1.1) };
let imax = 200;

function calcOrbit(z) {
  let orbittex = [], X, Y, XX = Double.Zero, YY = Double.Zero, XY = Double.Zero;
  for (let i = 0; i < imax && XX.add(YY).lt(16); i++) {
    X = XX.sub(YY).add(z.x);
    Y = XY.add(XY).add(z.y);
    XX = X.sqr(); YY = Y.sqr(); XY = X.mul(Y);
    orbittex.push(X.toNumber());
    orbittex.push(Y.toNumber());
    orbittex.push(XX.add(YY).div(2).toNumber());
  }
  return orbittex;
}

function imandel(z) {
  let i, X, Y, XX = Double.Zero, YY = Double.Zero, XY = Double.Zero;;
  for (i = 0; i < imax && XX.add(YY).lt(16); i++) {
    X = XX.sub(YY).add(z.x);
    Y = XY.add(XY).add(z.y);
    XX = X.sqr(); YY = Y.sqr(); XY = X.mul(Y);
  }
  return (i != imax) ? i : Infinity;
}

function searchOrigin(target) {
  let repeat = 6, n = 10, m = 2;
  let z = {}, zbest = {}, ztarget = Object.assign({}, target), f, fbest = -Infinity;
  for (let k = 0; k < repeat; k++) {
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n; j++) {
        z.x = ztarget.x.add(ztarget.hx.mul(2 * i / n - 1));
        z.y = ztarget.y.add(ztarget.hy.mul(2 * j / n - 1));
        f = imandel(z);
        if (f == Infinity) {
          return z;
        } else if (f > fbest) {
          zbest.x = z.x;
          zbest.y = z.y;
          fbest = f;
        }
      }
    }
    ztarget.x = zbest.x;
    ztarget.y = zbest.y;
    ztarget.hx = ztarget.hx.div(m / n);
    ztarget.hy = ztarget.hy.div(m / n);
  }
  return zbest;
}

function draw() {
  const gl = document.getElementById('canvasgl').getContext('webgl');
  twgl.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  target.hx = target.hy.mul(gl.canvas.width).div(gl.canvas.height);

  const programInfo = twgl.createProgramInfo(gl, [vsource, fsource]);
  gl.useProgram(programInfo.program);

  const arrays = { position: { data: [1, 1, 1, -1, -1, -1, -1, 1], numComponents: 2 } };
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

  let origin = searchOrigin(target);
  const uniforms = {
    center: [target.x.sub(origin.x).toNumber(), target.y.sub(origin.y).toNumber()],
    size: [target.hx.toNumber(), target.hy.toNumber()],
    orbit: calcOrbit(origin)
  };
  twgl.setUniforms(programInfo, uniforms);
  twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_FAN);
  
  //let context = document.getElementById('canvas').getContext('2d');
  //context.font='10px Verdana';
  //context.fillStyle = (!uniforms.palette) ? '#777' : '#FFF';
  //context.fillText(`(${target.x.toNumber()}, ${target.y.toNumber()}) with ${Math.floor(target.hx.div(1.5).inv().toNumber())}x zoom`, 5, canvas.height - 5);
  document.getElementById('zoom').value = Math.floor(Math.log10(target.hx.div(1.5).toNumber()));
}