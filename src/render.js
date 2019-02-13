'use strict';

/**
 * State managment
 */
let imax;
let bailout = 5000;
let colorScheme = 0;
let aim = { x: new Double(-0.75), y: new Double(0), hx: new Double(1.25), hy: new Double(1.15), phi: 0 };
let programGetter = (() => {
  let savedGl = null, savedVert = null, savedFrag = null, savedProgramInfo = null;
  return (gl, vert, frag, julia) => {
    julia = julia ? 1 : 0;
    if (gl != savedGl || vert != savedVert || savedFrag != frag(julia)) {
      savedGl = gl; savedVert = vert; savedFrag = frag(julia);
      savedProgramInfo = twgl.createProgramInfo(savedGl, [vert, savedFrag]);
    }
    return savedProgramInfo;
  }
})();
const glMandel = twgl.getContext(document.getElementById('glmandel'), { antialias: false, depth: false });
const glJulia = twgl.getContext(document.getElementById('gljulia'), { antialias: false, depth: false });
if (!glMandel || !glJulia ) {
  Events.showError('This viewer requires WebGL', 'WebGL is turned off or not supported by this device.');
};

/**
 * Calculating orbit for one point in Mandelbrot/Julia fractal
 * for Mandelbrot c0=undefined, for julia set c0 it is initial c.
 * if you want only iteration count, you need to pass returnIteration = true
*/
function calcOrbit(c, c0, returnIteration) {
  let x = c0 ? c0.x : c.x, y = c0 ? c0.y : c.y;
  let xx = x.sqr(), yy = y.sqr(), xy = x.mul(y);
  let dx = Double.One, dy = Double.Zero, temp;
  let i, orbit = [x.toNumber(), y.toNumber(), dx.toNumber(), dy.toNumber()]
  for (i = 1; i < imax && xx.add(yy).lt(bailout); i++) {
    temp = x.mul(dx).sub(y.mul(dy)).mul(2).add(1);
    dy = x.mul(dy).add(y.mul(dx)).mul(2);
    dx = temp;
    x = xx.sub(yy).add(c.x);
    y = xy.add(xy).add(c.y);
    xx = x.sqr(); yy = y.sqr(); xy = x.mul(y);
    if (!returnIteration) {
      orbit.push(x.toNumber());
      orbit.push(y.toNumber());
      orbit.push(dx.toNumber());
      orbit.push(dy.toNumber());
    }
  }
  return returnIteration ? i : orbit;
}

/**
 * Logarithmic search of new reference point.
 */
function searchOrigin(aim, julia) {
  let repeat = 6, n = 12, m = 3;
  let z = {}, zbest = {}, newAim = Object.assign({}, aim), f, fbest = -Infinity;
  for (let k = 0; k < repeat; k++) {
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n; j++) {
        z.x = newAim.x.add(newAim.hx.mul(2 * i / n - 1));
        z.y = newAim.y.add(newAim.hy.mul(2 * j / n - 1));
        f = (julia) ? calcOrbit(julia, z, true) : calcOrbit(z, null, true)
        if (f == imax) {
          return z;
        } else if (f > fbest) {
          Object.assign(zbest, z);
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

/**
 * Main function for drawing fractal. It uses searchOrigin() and then drawing fractal with WebGL
 */
function draw(aim, julia) {
  try {
    const gl = (julia) ? glJulia : glMandel;
    twgl.resizeCanvasToDisplaySize(gl.canvas, window.devicePixelRatio || 1);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    let ratio = gl.canvas.width / gl.canvas.height;
    if (ratio > 1) {
      aim.hx = aim.hy.mul(ratio);
    } else {
      aim.hy = aim.hx.div(ratio);
    }

    imax = Math.floor(gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS) / 2);
    const programInfo = programGetter(gl, vert, frag, julia);
    gl.useProgram(programInfo.program);

    const attribs = { position: { data: [1, 1, 1, -1, -1, -1, -1, 1], numComponents: 2 } };
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, attribs);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

    let origin = searchOrigin(aim, julia ? julia : 0);
    const uniforms = {
      center: [aim.x.sub(origin.x).toNumber(), aim.y.sub(origin.y).toNumber()],
      size: [aim.hx.toNumber(), aim.hy.toNumber()],
      phi: aim.phi,
      orbit: julia ? calcOrbit(julia, origin) : calcOrbit(origin),
    };
    twgl.setUniforms(programInfo, uniforms);

    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_FAN);
  } catch (error) {
    document.getElementById('errorMsg').innerHTML += ' <br> ' + error;
    Events.showError();
  }
}