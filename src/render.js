'use strict';
let fractal, target = { x: new D(-0.5), y: new D(0), dx: new D(3), dy: new D(2) };
let imax = 200;

function calcOrbit(v) {
  let X, Y, XX = D.Zero, YY = D.Zero, XY = D.Zero;
  let x = [], y = [], xx = [], yy = [];
  for (let i = 0; i < imax && XX.add(YY).lt(16); i++) {
    X = XX.sub(YY).add(v[0]);
    Y = XY.add(XY).add(v[1]);
    XX = X.sqr(); YY = Y.sqr(); XY = X.mul(Y);
    x.push(X.toNumber()); y.push(Y.toNumber());
    xx.push(XX.toNumber()); yy.push(YY.toNumber());
  }
  return { x: x, y: y, xx: xx, yy: yy };
}

function smoothIteration(v) {
  if (v[0] < target.x.sub(target.dx).toNumber() || v[0] > target.x.add(target.dx).toNumber() ||
      v[1] < target.y.sub(target.dy) || v [1] > target.x.add(target.dx).toNumber())
    return 0;
  let i, X = D.Zero, Y = D.Zero, XX = D.Zero, YY = D.Zero, XY = D.Zero, DX = D.Zero, DY = D.Zero;
  for (i = 0; i < imax && XX.add(YY).lt(16); i++) {
    X = XX.sub(YY).add(v[0]);
    Y = XY.add(XY).add(v[1]);
    XX = X.sqr(); YY = Y.sqr(); XY = X.mul(Y);
  }
  return -(i + 1 + Math.log(Math.log(16)/Math.log(XX.add(YY).toNumber())));
}

function gradient(v) {
  let i, X = D.Zero, Y = D.Zero, XX = D.Zero, YY = D.Zero, XY = D.Zero, DX = D.Zero, DY = D.Zero;
  for (i = 0; i < imax && XX.add(YY).lt(16); i++) {
    X = XX.sub(YY).add(v[0]);
    Y = XY.add(XY).add(v[1]);
    XX = X.sqr(); YY = Y.sqr(); XY = X.mul(Y);
    let temp = X.mul(DX).sub(Y.mul(DY)).mul(2).add(1);
    DY = X.mul(DY).add(Y.mul(DX)).mul(2);
    DX = temp;
  }
  return [DX.toNumber(), DY.toNumber()];
}

function expansionPoint(target){
  //let sol0 = optimjs.minimize_L_BFGS(smoothIteration, gradient, [target.x.toNumber(), target.y.toNumber()]);
  //let sol1 = optimjs.minimize_L_BFGS(smoothIteration, gradient, [target.x.sub(target.dx).toNumber(), target.y.sub(target.dy).toNumber()]);
  //let sol2 = optimjs.minimize_L_BFGS(smoothIteration, gradient, [target.x.add(target.dx).toNumber(), target.y.add(target.dy).toNumber()]);
  //return sol0.argument;
  return [target.x.toNumber(), target.y.toNumber()];
}

function draw() {
  const gl = document.getElementById('canvas').getContext('webgl');
  const programInfo = twgl.createProgramInfo(gl, [vsource, fsource]);

  const arrays = { position: [-1, 1, 0, 1, 1, 0, 1, -1, 0, 1, -1, 0, -1, -1, 0, -1, 1, 0] };
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

  twgl.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  let point = expansionPoint(target);
  console.log(point);
  let orbit = calcOrbit(point);
  console.log(orbit.x[0], orbit.y[0]);
  console.log(orbit.xx[0], orbit.yy[0]);
  console.log(orbit.x[1], orbit.y[1]);
  console.log(orbit.xx[1], orbit.yy[1]);

  const uniforms = {
    //imax: parseInt(document.getElementById('imax').value),
    center: [target.x.toNumber(), target.y.toNumber()],
    size: [target.dx.toNumber(), target.dy.toNumber()],
    resolution: [gl.canvas.width, gl.canvas.height],
    ox: orbit.x,
    oy: orbit.y,
    oxx: orbit.xx,
    oyy: orbit.yy
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
