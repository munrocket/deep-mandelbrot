'use strict';

let imax = 500;
let aim = { x: new Double(-0.75), y: new Double(0), hx: new Double(1.25), hy: new Double(1.15) };

function calcOrbit(z) {
  let orbittex = [], X, Y, XX = Double.Zero, YY = Double.Zero, XY = Double.Zero;
  for (let i = 0; i < imax && XX.add(YY).lt(16); i++) {
    X = XX.sub(YY).add(z.x);
    Y = XY.add(XY).add(z.y);
    XX = X.sqr(); YY = Y.sqr(); XY = X.mul(Y);
    orbittex.push(X.toNumber());
    orbittex.push(Y.toNumber());
    orbittex.push(XX.add(YY).toNumber());
  }
  return orbittex;
}

function draw() {

  function pointDepth(z) {
    let i, X, Y, XX = Double.Zero, YY = Double.Zero, XY = Double.Zero;;
    for (i = 0; i < imax && XX.add(YY).lt(16); i++) {
      X = XX.sub(YY).add(z.x);
      Y = XY.add(XY).add(z.y);
      XX = X.sqr(); YY = Y.sqr(); XY = X.mul(Y);
    }
    return (i != imax) ? i : Infinity;
  }

  function searchOrigin(aim) {
    let repeat = 6, n = 12, m = 3;
    let z = {}, zbest = {}, newAim = Object.assign({}, aim), f, fbest = -Infinity;
    for (let k = 0; k < repeat; k++) {
      for (let i = 0; i <= n; i++) {
        for (let j = 0; j <= n; j++) {
          z.x = newAim.x.add(newAim.hx.mul(2 * i / n - 1));
          z.y = newAim.y.add(newAim.hy.mul(2 * j / n - 1));
          f = pointDepth(z);
          if (f == Infinity) {
            return z;
          } else if (f > fbest) {
            zbest.x = z.x;
            zbest.y = z.y;
            fbest = f;
          }
        }
      }
      Object.assign(newAim, zbest);
      newAim.hx = newAim.hx.div(m / n);
      newAim.hy = newAim.hy.div(m / n);
    }
    return zbest;
  }

  const canvas = document.getElementById('glcanvas');
  const gl = twgl.getContext(canvas, { antialias: false, depth: false });
  twgl.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  let ratio = gl.canvas.width / gl.canvas.height;
  if (aim.hx.div(aim.hy).lt(ratio)) {
    aim.hx = aim.hy.mul(ratio);
  } else {
    aim.hy = aim.hx.div(ratio);
  }

  const programInfo = twgl.createProgramInfo(gl, [vsource, fsource]);
  gl.useProgram(programInfo.program);

  const arrays = { position: { data: [1, 1, 1, -1, -1, -1, -1, 1], numComponents: 2 } };
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

  let origin = searchOrigin(aim);
  const uniforms = {
    center: [aim.x.sub(origin.x).toNumber(), aim.y.sub(origin.y).toNumber()],
    size: [aim.hx.toNumber(), aim.hy.toNumber()],
    orbit: calcOrbit(origin)
  };
  twgl.setUniforms(programInfo, uniforms);
  twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_FAN);
}