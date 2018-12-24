'use strict';
let fractal, target = { x: new D(-0.6), y: new D(0), hx: new D(1.5), hy: new D(1.1) };
let imax = 200;

function calcOrbit(z) {
  let X, Y, XX = D.Zero, YY = D.Zero, XY = D.Zero;
  let x = [], y = [], xx = [], yy = [];
  for (let i = 0; i < imax && XX.add(YY).lt(16); i++) {
    X = XX.sub(YY).add(z.x);
    Y = XY.add(XY).add(z.y);
    XX = X.sqr(); YY = Y.sqr(); XY = X.mul(Y);
    x.push(X.toNumber()); y.push(Y.toNumber());
    xx.push(XX.toNumber()); yy.push(YY.toNumber());
  }
  return { x: x, y: y, xx: xx, yy: yy };
}

function imandel(z) {
  let i, X, Y, XX = D.Zero, YY = D.Zero, XY = D.Zero;;
  for (i = 0; i < imax && XX.add(YY).lt(16); i++) {
    X = XX.sub(YY).add(z.x);
    Y = XY.add(XY).add(z.y);
    XX = X.sqr(); YY = Y.sqr(); XY = X.mul(Y);
  }
  return (i != imax) ? i : Infinity;
}

function fractal_search(target) {
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
  const programInfo = twgl.createProgramInfo(gl, [vsource, fsource]);
  gl.useProgram(programInfo.program);
  
  twgl.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  const arrays = { position: { data:[-1, 1, 1, 1, 1, -1, 1, -1, -1, -1, -1, 1], numComponents: 2 } };
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

  let orbit = calcOrbit(fractal_search(target));
  const uniforms = {
    center: [target.x.toNumber(), target.y.toNumber()],
    size: [target.hx.mul(2).toNumber(), target.hy.mul(2).toNumber()],
    resolution: [gl.canvas.width, gl.canvas.height],
    ox: orbit.x,
    oy: orbit.y,
    oxx: orbit.xx,
    oyy: orbit.yy
  };
  twgl.setUniforms(programInfo, uniforms);

  twgl.drawBufferInfo(gl, bufferInfo);
  
  //let context = document.getElementById('canvas').getContext('2d');
  //context.font='10px Verdana';
  //context.fillStyle = (!uniforms.palette) ? '#777' : '#FFF';
  //context.fillText(`(${target.x.toNumber()}, ${target.y.toNumber()}) with ${Math.floor(target.hx.div(1.5).inv().toNumber())}x zoom`, 5, canvas.height - 5);
}