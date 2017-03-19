const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');

const vao = new SurmEngine.VAO(gl);
const indexManager = new SurmEngine.VAOIndexManager(vao);
const program = new SurmEngine.Program(gl)
  .setVertexShader(`#version 300 es
    in vec3 in_vertex;
    in vec4 in_color;
    uniform mat4 view;
    uniform mat4 camera;
    uniform mat4 model;
    out vec4 color;

    void main() {
      gl_Position = view * camera * model * vec4(in_vertex, 1);
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
  `);
program
  .bindInVariable('in_vertex', indexManager.indexForName('in_vertex'))
  .bindInVariable('in_color', indexManager.indexForName('in_color'))
  .activate();
const viewUniform = program.referenceUniform('view');
const cameraUniform = program.referenceUniform('camera');
const modelUniform = program.referenceUniform('model');

const vbo = vao.createVBO()
  .bind()
  .setData(new Float32Array([
    0, 1, 0,
    1, 0, 0, 1,
    -1, -1, 0,
    0, 1, 0, 1,
    1, -1, 0,
    0, 0, 1, 1,
  ]))
  .setType(gl.FLOAT)
  .setNormalize(false);
vbo
  .setItemSize(3)
  .setStride(7*4)
  .setOffset(0)
  .bindToIndex(indexManager.indexForName('in_vertex'));
vbo
  .setItemSize(4)
  .setStride(7*4)
  .setOffset(3*4)
  .bindToIndex(indexManager.indexForName('in_color'));


const camera = new SurmEngine.Entity('camera')
  .move(0, 10, 30)
  .rotate([1, 0, 0], -20);
camera.entity =
  new SurmEngine.Camera()
    .setAspectRatio(gl.canvas.width / gl.canvas.height)
    .setFov(30)
    .setNearPlane(0.1)
    .setFarPlane(1000)
const scene = new SurmEngine.SceneGraph()
  .add(
    new SurmEngine.Entity('t1_move')
      .add(new SurmEngine.Entity('t1'))
      .move(0, 0, 0)
  )
  .add(
    new SurmEngine.Entity('t2_move')
      .add(new SurmEngine.Entity('t2'))
      .move(2, 0, 2)
  )
  .add(
    new SurmEngine.Entity('t3_move')
      .add(new SurmEngine.Entity('t3'))
      .move(4, 0, 4)
  )
  .add(camera);

function isTriangle(entity) {
  return /^t[0-9]+$/.test(entity.name);
}
scene.visitAll(entity => {
  if(isTriangle(entity))
    entity.vao = vao;
  return true;
});

gl.clearColor(0, 0, 0, 1);
gl.enable(gl.DEPTH_TEST);
SurmEngine.Helpers.autosize(gl, _ => {
  camera.entity.setAspectRatio(gl.canvas.width / gl.canvas.height);
  viewUniform.setMatrix4(camera.entity.viewMatrix);
});
viewUniform.setMatrix4(camera.entity.viewMatrix);

const keyboard = new SurmEngine.KeyboardState();
const ctrl = SurmEngine.Helpers.loop(delta => {
  handleKeyboard(keyboard, camera, delta);
  scene.visitAll(entity => {
    if(isTriangle(entity))
      entity.rotate([0, 1, 0], -80*delta/1000);
    if(entity.name === 't3_move')
      entity.rotateAround([0, 0, 0], [0, 1, 0], -80*delta/1000);
    return true;
  });

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  const flatScene = scene.flatten();
  const cameraTransform = flatScene.find(entry => entry.entity.name === 'camera').entity.transform;
  cameraUniform.setMatrix4(mat4.invert(mat4.create(), camera.transform));

  flatScene.forEach(entry => {
    if(!isTriangle(entry.entity)) return;
    modelUniform.setMatrix4(entry.accumulatedTransform);
    entry.entity.vao.bind();
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  });
});

const speed = 5;
function handleKeyboard(keyboard, camera, delta) {
  const shift = keyboard.isDown('ShiftLeft') || keyboard.isDown('ShiftRight');
  for(let key of keyboard) {
    if(!shift) {
      switch(key) {
        case 'KeyW':
          camera.move(0, 0, -speed * delta/1000);
          break;
        case 'KeyA':
          camera.move(-speed * delta/1000, 0, 0);
          break;
        case 'KeyS':
          camera.move(0, 0, speed * delta/1000);
          break;
        case 'KeyD':
          camera.move(speed * delta/1000, 0, 0);
          break;
        case 'Space':
          camera.move(0, speed * delta/1000, 0);
          break;
      }
    } else {
      switch(key) {
        case 'KeyW':
          camera.rotate([1, 0, 0], 36*delta/1000);
          break;
        case 'KeyA':
          camera.rotate([0, 1, 0], 36*delta/1000);
          break;
        case 'KeyS':
          camera.rotate([1, 0, 0], -36*delta/1000);
          break;
        case 'KeyD':
          camera.rotate([0, 1, 0], -36*delta/1000);
          break;
        case 'Space':
          camera.move(0, -speed * delta/1000, 0);
          break;

      }
    }
  }
}

document.addEventListener('keypress', event => {
  if(event.code !== 'KeyP') return;
  if(ctrl.isPaused)
    ctrl.play();
  else
    ctrl.pause();
  console.log(`Paused: ${ctrl.isPaused}`);
});
