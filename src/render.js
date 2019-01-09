'use strict';

let imax;
let bailout = 5000;
let colorScheme = 0;
let aim = { x: new Double(-0.75), y: new Double(0), hx: new Double(1.25), hy: new Double(1.15) };
//let aim = { x: new Double(0), y: new Double(0), hy: new Double(1.25), hy: new Double(1.15) };

function calcOrbit(c, c0) {
  let X = c0 ? c0.x : c.x, Y = c0 ? c0.y : c.y;
  let XX = X.sqr(), YY = Y.sqr(), XY = X.mul(Y);
  let DX = Double.One, DY = Double.Zero, temp;
  let orbit = [X.toNumber(), Y.toNumber(), DX.toNumber(), DY.toNumber()]
  for (let i = 1; i < imax && XX.add(YY).lt(bailout); i++) {
    temp = X.mul(DX).sub(Y.mul(DY)).mul(2).add(1);
    DY = X.mul(DY).add(Y.mul(DX)).mul(2);
    DX = temp;
    X = XX.sub(YY).add(c.x);
    Y = XY.add(XY).add(c.y);
    XX = X.sqr(); YY = Y.sqr(); XY = X.mul(Y);
    orbit.push(X.toNumber());  orbit.push(Y.toNumber());
    orbit.push(DX.toNumber()); orbit.push(DY.toNumber());
  }
  return orbit;
}

function draw(aim, julia) {

  function pointDepth(c, c0) {
    let i, X = c0 ? c0.x : c.x, Y = c0 ? c0.y : c.y;
    let XX = X.sqr(), YY = Y.sqr(), XY = X.mul(Y);
    for (i = 0; i < imax && XX.add(YY).lt(bailout); i++) {
      X = XX.sub(YY).add(c.x);
      Y = XY.add(XY).add(c.y);
      XX = X.sqr(); YY = Y.sqr(); XY = X.mul(Y);
    }
    return (i != imax) ? i : Infinity;
  }

  function searchOrigin(aim, julia) {
    let repeat = 6, n = 12, m = 3;
    let z = {}, zbest = {}, newAim = Object.assign({}, aim), f, fbest = -Infinity;
    for (let k = 0; k < repeat; k++) {
      for (let i = 0; i <= n; i++) {
        for (let j = 0; j <= n; j++) {
          z.x = newAim.x.add(newAim.hx.mul(2 * i / n - 1));
          z.y = newAim.y.add(newAim.hy.mul(2 * j / n - 1));
          f = (julia) ? pointDepth(julia, z) : pointDepth(z)
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

  try {
    const canvas = document.getElementById(julia ? 'gljulia' : 'glmandel');
    const gl = twgl.getContext(canvas, { antialias: false, depth: false });
    if (!gl) { Events.showError('This viewer requires WebGL', 'WebGL is turned off or not supported by this device.'); }

    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    let ratio = gl.canvas.width / gl.canvas.height;
    if (ratio > 1) {
      aim.hx = aim.hy.mul(ratio);
    } else {
      aim.hy = aim.hx.div(ratio);
    }

    imax = Math.floor(gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS) / 2);
    const programInfo = twgl.createProgramInfo(gl, [vert, frag(julia ? 1 : 0)]);
    gl.useProgram(programInfo.program);

    const attribs = { position: { data: [1, 1, 1, -1, -1, -1, -1, 1], numComponents: 2 } };
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, attribs);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

    let origin = searchOrigin(aim, julia ? julia : 0);
    const uniforms = {
      center: [aim.x.sub(origin.x).toNumber(), aim.y.sub(origin.y).toNumber()],
      size: [aim.hx.toNumber(), aim.hy.toNumber()],
      orbit: julia ? calcOrbit(julia, origin) : calcOrbit(origin),
      phi: 0,
    };
    twgl.setUniforms(programInfo, uniforms);

    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_FAN);
  } catch (error) {
    console.log(error);
    Events.showError();
  }
}