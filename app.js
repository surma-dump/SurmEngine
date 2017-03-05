const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');
let last = performance.now();
let stop = false;

const ro = new ResizeObserver(entries => {
  gl.canvas.width = entries[0].contentRect.width;
  gl.canvas.height = entries[0].contentRect.height;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
});
ro.observe(gl.canvas);

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(`Error compiling shader: ${gl.getShaderInfoLog(shader)}`);
    return null
  }
  return shader;
}

function loop(gl, now, last) {
  gl.clearBufferfv(gl.COLOR, 0, new Float32Array([1, 0, 0, 1]));

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 0.5, 0,
    -0.5, -0.5, 0,
    0.5, -0.5, 0
  ]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(vbo, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vbo);

  const vShader = createShader(gl, gl.VERTEX_SHADER,
    `#version 300 es

    in vec3 coords;

    void main(void) {
      gl_Position = vec4(coords, 1);
    }
  `);
  if (!vShader) {
    stop = true;
    return;
  }

  const fShader = createShader(gl, gl.FRAGMENT_SHADER,
    `#version 300 es
    precision highp float;

    out vec4 color;

    void main(void) {
      color = vec4(0, 1, 0, 1);
    }
  `);
  if (!fShader) {
    stop = true;
    return;
  }

  const program = gl.createProgram();
  gl.attachShader(program, fShader);
  gl.attachShader(program, vShader);
  gl.bindAttribLocation(program, vbo, "coords");
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    stop = true;
    console.log(`Couldn’t link program: ${gl.getProgramInfoLog(program)}`);
    return;
  }
  gl.validateProgram(program);
  if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    stop = true;
    console.log(`Couldn’t validate program: ${gl.getProgramInfoLog(program)}`);
    return;
  }
  gl.useProgram(program);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function start() {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  requestAnimationFrame(function f() {
    const now = performance.now();
    const fps = 1000/(now - last);
    loop(gl, now, last);
    last = now;
    if(!stop) requestAnimationFrame(f);
  });
}

start();
