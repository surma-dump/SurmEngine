const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');
let last = performance.now();
let stop = false;
window._gl = gl;

const ro = new ResizeObserver(entries => {
  gl.canvas.width = entries[0].contentRect.width * window.devicePixelRatio;
  gl.canvas.height = entries[0].contentRect.height * window.devicePixelRatio;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  console.log(`Setting render size to ${gl.canvas.width}x${gl.canvas.height}`);
});
ro.observe(gl.canvas);

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(`Error compiling ${type==gl.VERTEX_SHADER?'vertex':'fragment'} shader: ${gl.getShaderInfoLog(shader)}`);
    return null
  }
  return shader;
}

function setup(gl) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const vertexVBO = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexVBO);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 0.5, 0,
    -0.5, -0.5, 0,
    0.5, -0.5, 0
  ]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);
  const colorVBO = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorVBO);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, true, 0, 0);
  gl.enableVertexAttribArray(1);

  const vShader = createShader(gl, gl.VERTEX_SHADER,
    `#version 300 es

    in vec3 in_coords;
    in vec3 in_color;
    uniform vec3 offset;
    out vec4 color;
    void main(void) {
      gl_Position = vec4(in_coords + offset, 1);
      color = vec4(in_color, 1);
    }
  `);
  if (!vShader) {
    stop = true;
    return;
  }

  const fShader = createShader(gl, gl.FRAGMENT_SHADER,
    `#version 300 es
    precision highp float;

    in vec4 color;
    out vec4 out_color;
    void main(void) {
      out_color = color;
    }
  `);
  if (!fShader) {
    stop = true;
    return;
  }

  const program = gl.createProgram();
  gl.attachShader(program, fShader);
  gl.attachShader(program, vShader);
  gl.bindAttribLocation(program, vertexVBO, 'coords');
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
  const offset = gl.getUniformLocation(program, 'offset');
  return {
    uniforms: {
      offset
    }
  }
}

function loop(gl, data) {
  gl.clearBufferfv(gl.COLOR, 0, new Float32Array([1, 0, 0, 1]));
  gl.uniform3f(data.uniforms.offset, 0, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.uniform3f(data.uniforms.offset, 0.5, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.uniform3f(data.uniforms.offset, -0.5, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function start() {
  const data = setup(gl);
  requestAnimationFrame(function f() {
    const now = performance.now();
    const fps = 1000/(now - last);
    loop(gl, data, now, last);
    last = now;
    if(!stop) requestAnimationFrame(f);
  });
}

start();
