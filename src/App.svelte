<script>
  import * as twgl from 'twgl.js';
  import { onMount } from 'svelte';

  onMount(() => {

    const vsource = `
      precision mediump float;
      uniform vec2 size;
      uniform vec2 center;
      uniform float phi;
      uniform float zoom;
      attribute vec2 position;
      varying vec2 c;
      void main() {
        vec2 rot = vec2(sin(phi), cos(phi));
        vec2 p = size * position * zoom;
        c = center + vec2(p.x * rot.y - p.y * rot.x, dot(p, rot));
        gl_Position = vec4(position, 0.0, 1.0);
      }`;

    const fsource = `
      precision mediump float;
      #define imax 50
      varying vec2 c;
      
      void main() {
        float x, y, t, col;
        for (int i = 0; i < imax; i++) {
          t = x * x - y * y + c.x;
          y = 2.0 * x * y + c.y;
          x = t;
          if (x * x + y * y > 16.0) break;
          else col += 1.0;
        }
        gl_FragColor = vec4(vec3(0.9 - 0.9 * col/float(imax)), 1.0);
      }`;


    const canvas = document.getElementById('c');
    const gl = twgl.getContext(canvas, {depth: false });
    const programInfo = twgl.createProgramInfo(gl, [vsource, fsource]);

    gl.useProgram(programInfo.program);

    const arrays = { position: { data: [-1, 1, 1, 1, 1, -1, 1, -1, -1, -1, -1, 1], numComponents: 2 } };
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

    function draw(gl, programInfo, timePassed) {
      twgl.resizeCanvasToDisplaySize(gl.canvas);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      const uniforms = {
        center: [-0.75, 0],
        size: [2, 2 / gl.canvas.width * gl.canvas.height],
        phi: timePassed,
        zoom: 1.3 + Math.sin(timePassed),
      };

      twgl.setUniforms(programInfo, uniforms);
      twgl.drawBufferInfo(gl, bufferInfo);
    }

    (function animate(now) {
      draw(gl, programInfo, now / 1000);
      requestAnimationFrame(animate);
    })(0);

  });
</script>

<main>
	<canvas id="c"></canvas>
</main>

<style>
	main {
		background-color: pink;
	}
	#c {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
	}
</style>
