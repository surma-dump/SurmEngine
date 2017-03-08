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

function setup(gl, tex) {
  gl.clearColor(0, 0, 0, 1);
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const vertexVBO = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexVBO);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 0.2, 0,
    -0.2, -0.2, 0,
    0.2, -0.2, 0
  ]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);
  const colorVBO = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorVBO);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 0, 0, 1,
    0, 0, 0, 1,
    0, 0, 0, 1,
  ]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(1, 4, gl.FLOAT, true, 0, 0);
  gl.enableVertexAttribArray(1);
  const uvVBO = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvVBO);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.5, 0,
    0, 1,
    1, 1,
  ]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(2, 2, gl.FLOAT, true, 0, 0);
  gl.enableVertexAttribArray(2);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    tex
  );
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.activeTexture(gl.TEXTURE0);

  const vShader = createShader(gl, gl.VERTEX_SHADER,
    `#version 300 es

    in vec3 in_coords;
    in vec4 in_color;
    in vec2 in_uv;
    uniform vec3 offset;
    out vec4 color;
    out vec2 uv;
    void main(void) {
      gl_Position = vec4(in_coords + offset, 1);
      color = in_color;
      uv = in_uv;
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
    in vec2 uv;
    out vec4 out_color;
    uniform sampler2D tex;
    void main(void) {
      out_color = texture(tex, uv);
      out_color.a = color.a;
    }
  `);
  if (!fShader) {
    stop = true;
    return;
  }

  const program = gl.createProgram();
  gl.attachShader(program, fShader);
  gl.attachShader(program, vShader);
  gl.bindAttribLocation(program, 0, 'in_coords');
  gl.bindAttribLocation(program, 1, 'in_color');
  gl.bindAttribLocation(program, 2, 'in_uvs');
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
  return {
    uniforms: {
      offset: gl.getUniformLocation(program, 'offset'),
      texture: gl.getUniformLocation(program, 'tex'),
    }
  }
}

function loop(gl, data) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.uniform3f(data.uniforms.offset, 0.5, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.uniform3f(data.uniforms.offset, 0, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.uniform3f(data.uniforms.offset, -0.5, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function start(tex) {
  const data = setup(gl, tex);
  gl.uniform1i(data.texture, gl.TEXTURE0);
  requestAnimationFrame(function f() {
    const now = performance.now();
    const fps = 1000/(now - last);
    loop(gl, data, now, last);
    last = now;
    if(!stop) requestAnimationFrame(f);
  });
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const node = document.createElement('img');
    node.onload = _ => resolve(node);
    node.onerror = _ => reject();
    node.src = url;
  });
}

loadImage('uvgrid.jpg')
  .then(tex => {
    start(tex);
  });
