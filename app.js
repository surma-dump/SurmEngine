const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');


const vao = new SurmEngine.VAO(gl);
const vboVertices =
  vao.createVBO()
    .bind()
    .setData(new Float32Array([
      0, 1, 0,
      -1, 0, 0,
      1, 0, 0,
    ]))
    .setItemSize(3)
    .setType(gl.FLOAT)
    .setNormalize(false)
    .setStride(0)
    .setOffset(0)
const vboColors =
  vao.createVBO()
    .bind()
    .setData(new Float32Array([
      1, 0, 0, 1,
      0, 1, 0, 1,
      0, 0, 1, 1,
    ]))
    .setItemSize(4)
    .setType(gl.FLOAT)
    .setNormalize(false)
    .setStride(0)
    .setOffset(0)

const program =
  new SurmEngine.Program(gl)
    .setVertexShader(`#version 300 es
      in vec3 in_vertex;
      in vec4 in_color;
      uniform mat4 camera;
      out vec4 color;

      void main() {
        gl_Position = camera * vec4(in_vertex, 1);
        color = in_color;
      }
    `)
    .setFragmentShader(`#version 300 es
      precision highp float;
      in vec4 color;
      out vec4 out_color;

      void main() {
        out_color = color;
      }
    `)
    .bindInVariable('in_vertex', vboVertices)
    .bindInVariable('in_color', vboColors)
    .activate();
const cameraUniform = program.referenceUniform('camera');
program.activate();

const camera =
  new SurmEngine.Camera()
    .setAspectRatio(gl.canvas.width / gl.canvas.height)
    .setFov(30)
    .setNearPlane(0.1)
    .setFarPlane(1000)
    .setUpDirection(0, 1, 0)
    .move(0, 0, 5);

gl.clearColor(0, 0, 0, 1);
SurmEngine.Helpers.autosize(gl, camera);
SurmEngine.Helpers.logMatrix(camera._transform);
SurmEngine.Helpers.loop(_ => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  cameraUniform.setMatrix4(camera.transform);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
});

let alpha = 0;
document.addEventListener('keydown', event => {
  switch(event.code) {
    case 'KeyQ':
      camera.rotate([0, 1, 0], -1);
      break;
    case 'KeyE':
      camera.rotate([0, 1, 0], 1);
      break;
    case 'KeyW':
      camera.move(0, 0, -0.1);
      break;
    case 'KeyS':
      camera.move(0, 0, 0.1);
      break;
    case 'KeyA':
      camera.move(-0.1, 0, 0);
      break;
    case 'KeyD':
      camera.move(0.1, 0, 0);
      break;
  }
});


/*
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');
const cameraPos = vec3.fromValues(0, 0, 2);
let last = performance.now();
let stop = false;
window._gl = gl;

document.addEventListener('keydown', event => {
  switch(event.key) {
    case 'w':
      cameraPos[2] -= 0.01;
      break;
    case 's':
      cameraPos[2] += 0.01;
      break;
  }
});

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
  const barycentricVBO = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, barycentricVBO);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
  ]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(3, 3, gl.FLOAT, true, 0, 0);
  gl.enableVertexAttribArray(3);

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

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const vShader = createShader(gl, gl.VERTEX_SHADER,
    `#version 300 es

    in vec3 in_coords;
    in vec4 in_color;
    in vec2 in_uv;
    in vec3 in_barycentric;
    uniform mat4 transform;
    uniform mat4 camera;
    uniform mat4 view;
    out vec4 color;
    out vec2 uv;
    out vec3 barycentric;
    void main(void) {
      gl_Position = view * camera * transform * vec4(in_coords, 1);
      color = in_color;
      uv = in_uv;
      barycentric = in_barycentric;
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
    in vec3 barycentric;
    out vec4 out_color;
    uniform sampler2D tex;
    float weight;
    float width = 0.04;
    float edge = 0.01;

    float bump(float min, float max, float v) {
      return step(min, v) * (1.0 - step(max, v));
    }

    float smoothbump(float min, float max, float w, float v) {
      return smoothstep(min, min+w, v) * (1.0 - smoothstep(max-w, max, v));
    }

    void main(void) {
      out_color = texture(tex, uv);
      weight = smoothbump(0.0, width, edge, barycentric.x) + smoothbump(0.0, width, edge, barycentric.y) + smoothbump(0.0, width, edge, barycentric.z);
      out_color = mix(out_color, vec4(0, 0, 0, 1), max(1.0-weight, 0.0));
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
  gl.bindAttribLocation(program, 3, 'in_barycentric');
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
      transform: gl.getUniformLocation(program, 'transform'),
      camera: gl.getUniformLocation(program, 'camera'),
      view: gl.getUniformLocation(program, 'view'),
      texture: gl.getUniformLocation(program, 'tex'),
    }
  }
}

function loop(gl, data, now) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniformMatrix4fv(data.uniforms.view, false,
    mat4.perspective(mat4.create(), glMatrix.toRadian(60), gl.canvas.width/gl.canvas.height, 0.1, 100));
  // gl.uniformMatrix4fv(data.uniforms.view, false, mat4.create());

  gl.uniformMatrix4fv(data.uniforms.camera, false,
    mat4.lookAt(
      mat4.create(),
      cameraPos,
      vec3.fromValues(0, 0, 0),
      vec3.fromValues(0, 1, 0)
    ));


  const base = mat4.create();
  const offset = vec3.fromValues(0.5, 0, 0);
  mat4.translate(base, base, vec3.fromValues(-0.5, 0, 0));
  gl.uniformMatrix4fv(data.uniforms.transform, false, mat4.rotateY(mat4.create(), base, glMatrix.toRadian(now/1000 * 180 % 360)));
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  mat4.translate(base, base, offset);
  gl.uniformMatrix4fv(data.uniforms.transform, false, mat4.rotateY(mat4.create(), base, glMatrix.toRadian(now/1000 * 180 % 360)));
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  mat4.translate(base, base, offset);
  gl.uniformMatrix4fv(data.uniforms.transform, false, mat4.rotateY(mat4.create(), base, glMatrix.toRadian(now/1000 * 180 % 360)));
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
*/
