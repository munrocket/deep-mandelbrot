<script>
  import * as twgl from 'twgl.js';
  import { onMount } from 'svelte';

  let imax = 1024;

  Number.prototype.sqr = function(){ return this * this; };
  Number.prototype.mul = function(y){ return this * y; };
  Number.prototype.div = function(y){ return this / y; };
  Number.prototype.add = function(y){ return this + y; }
  Number.prototype.sub = function(y){ return this - y; }
  Number.prototype.lt = function(y){ return this < y; }
  Number.prototype.toNumber = function(){ return this; }
  Number.prototype.one = 1;
  Number.prototype.zero = 0;

  function calcOrbit(c, c0) {
    let x = c0 ? c0.x : c.x;
    let y = c0 ? c0.y : c.y;
    let xx = x.sqr(), yy = y.sqr(), xy = x.mul(y);
    let dx = 1, dy = 0, temp; //let dx = Number.one, dy = Number.zero, temp;
    let i, orbit = [x.toNumber(), y.toNumber(), dx.toNumber(), dy.toNumber()];
    for (i = 1; i < imax && xx.add(yy).lt(256); i++) {
      temp = x.mul(dx).sub(y.mul(dy)).mul(2).add(1);
      dy = x.mul(dy).add(y.mul(dx)).mul(2);
      dx = temp;
      x = xx.sub(yy).add(c.x);
      y = xy.add(xy).add(c.y);
      xx = x.sqr(); yy = y.sqr(); xy = x.mul(y);
      orbit.push(x.toNumber());
      orbit.push(y.toNumber());
      orbit.push(dx.toNumber());
      orbit.push(dy.toNumber());
    }
    return orbit;
  }

  onMount(() => {

    const vsource = `
      precision highp float;

      attribute vec2 position;

      uniform vec2 rotor;
      uniform vec2 center;
      uniform vec2 size;
      uniform float zoom;

      varying vec2 c;

      void main() {
        vec2 p = zoom * size * position;
        c = center + vec2(p.x * rotor.y - p.y * rotor.x, dot(p, rotor));
        gl_Position = vec4(position, 0.0, 1.0);
      }`;

    const fsource = `
      precision mediump float;

      varying vec2 c;

      uniform float texsize;
      uniform sampler2D orbittex;

      #define imax 3000

      vec2 iterate(vec2 z, vec2 c) {
        return vec2(z.x * z.x - z.y * z.y + c.x, 2. * z.x * z.y + c.y);
      }

      void main() {
        vec2 z;
        float t, col;
        for (int i = 0; i < imax; i++) {
          z = iterate(z, c);
          if (dot(z, z) > 256.0) break;
          else col += 1.0;
        }
        gl_FragColor = vec4(vec3(0.9 - 0.9 * col/float(imax)), 1.0);
      }`;


    // init contect
    const canvas = document.getElementById('c');
    const gl = twgl.getContext(canvas, { depth: false, stencil: false, antialias: false });
    twgl.addExtensionsToContext(gl);
    twgl.resizeCanvasToDisplaySize(gl.canvas);

    // set shader and geometry
    const programInfo = twgl.createProgramInfo(gl, [vsource, fsource]);
    gl.useProgram(programInfo.program);
    const arrays = { position: { data: [-1, 1, 1, 1, 1, -1, -1, -1], numComponents: 2 } };
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

    const origin = { x: -0.5, y: 0 };
    const orbit = calcOrbit(origin);
    const texsize = Math.ceil(Math.sqrt(orbit.length / 4));
    const orbittex = twgl.createTexture(gl, {
      format: gl.RGBA,
      type: gl.FLOAT,
      minMag: gl.NEAREST,
      wrap: gl.CLAMP_TO_EDGE,
      src: orbit,
    });

    function draw(gl, programInfo, timePassed) {
      
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      const uniforms = {
        rotor: [Math.sin(timePassed), Math.cos(timePassed)],
        center: [-0.75, 0],
        size: [2, 2 / gl.canvas.width * gl.canvas.height],
        zoom: 1. + Math.sin(timePassed),
        texsize: texsize,
        orbittex: orbittex,
      };

      twgl.setUniforms(programInfo, uniforms);
      twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_FAN);
    }

    function animate(now) {
      draw(gl, programInfo, now / 1000);
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

  });
</script>

<canvas id="c"></canvas>

<style>
  #c {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
  }

  .viewer {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    background-color: #0a0a0a;
  }

  canvas {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  #gljulia {
    left: 0;
    bottom: 0;
    height: 400px;
    width: 400px;
  }

  #glcontrol {
    cursor: crosshair;
  }

  #zoomOut {
    position: absolute;
    bottom: .4em;
    left: .4em;
    width: 2.3em;
    font-size: 1em;
  }
</style>