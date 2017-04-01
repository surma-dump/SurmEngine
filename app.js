const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');

const vao = new SurmEngine.VAO(gl);
const indexManager = new SurmEngine.VAOIndexManager(vao);
const program = new SurmEngine.Program(gl)
  .setVertexShader(`#version 300 es
    in vec3 in_vertex;
    in vec4 in_color;
    in vec3 in_normal;
    uniform mat4 view;
    uniform mat4 camera;
    uniform mat4 model;
    out vec4 color;
    out vec4 normal;
    out vec4 light;

    vec3 light_dir = vec3(0.0, 0.0, -80.0);

    void main() {
      mat4 normal_correction_matrix = transpose(inverse(model));
      gl_Position = view * camera * model * vec4(in_vertex, 1.0);
      color = in_color;
      normal = model * vec4(in_normal, 0.0);
      light = vec4(light_dir, 1.0);
    }
  `)
  .setFragmentShader(`#version 300 es
    precision highp float;
    in vec4 color;
    in vec4 normal;
    in vec4 light;
    out vec4 out_color;

    void main() {
      float lambert = clamp(abs(dot(normalize(light), normalize(normal))), 0.3, 1.0);
      out_color = mix(vec4(0.0, 0.0, 0.0, 1.0), color, lambert);
    }
  `);
program
  .bindInVariable('in_vertex', indexManager.forName('in_vertex'))
  .bindInVariable('in_color', indexManager.forName('in_color'))
  .bindInVariable('in_normal', indexManager.forName('in_normal'))
  .activate();
const viewUniform = program.referenceUniform('view');
const cameraUniform = program.referenceUniform('camera');
const modelUniform = program.referenceUniform('model');

const planeMesh = SurmEngine.Mesh.plane({subdivisions: 10});
vao.createVBO()
  .bind()
  .setData(planeMesh)
  .setItemSize(3)
  .bindToIndex(indexManager.forName('in_vertex'));

vao.createVBO()
  .bind()
  .setData(
    new Float32Array(planeMesh.length/3*4)
      .map((_, idx) => idx % 4 === 3?1:(idx*4/planeMesh.length/3/2))
  )
  .setItemSize(4)
  .bindToIndex(indexManager.forName('in_color'));

vao.createVBO()
  .bind()
  .setData(
    new Float32Array(planeMesh.length)
      .map((_, idx) => idx % 3 === 2?1:0)
  )
  .setItemSize(3)
  .bindToIndex(indexManager.forName('in_normal'));

const camera =
  new SurmEngine.Camera()
    .setAspectRatio(gl.canvas.width / gl.canvas.height)
    .setFov(90)
    .setNearPlane(0.1)
    .setFarPlane(1000);

const scene = new SurmEngine.SceneGraph()
  .add(
    new SurmEngine.Entity('plane', vao)
  )
  .add(
    new SurmEngine.Entity('player')
      .add(
        new SurmEngine.Entity('player_rot_y')
          .add(
            new SurmEngine.Entity('player_rot_x')
              .add(
                new SurmEngine.Entity('player_camera', camera)
                  .move(0, 0, 10)
              )
          )
      )
  );

gl.clearColor(0, 0, 0, 1);
gl.enable(gl.DEPTH_TEST);
SurmEngine.Helpers.autosize(gl, _ => {
  camera.setAspectRatio(gl.canvas.width / gl.canvas.height);
  viewUniform.setMatrix4(camera.viewMatrix);
});
viewUniform.setMatrix4(camera.viewMatrix);

const player = scene.find(e => e.name === 'player');
const keyboard = new SurmEngine.KeyboardState();
const mouse = new SurmEngine.MouseController(gl);
const camInvert = mat4.create();
const ctrl = SurmEngine.Helpers.loop(delta => {
  handleInput(keyboard, mouse, player, delta);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  const flatScene = scene.flatten();
  const player_camera = flatScene.find(entry => entry.entity.name === 'player_camera');
  cameraUniform.setMatrix4(mat4.invert(camInvert, player_camera.accumulatedTransform));

  flatScene.forEach(entry => {
    if(!(entry.entity.entity instanceof SurmEngine.VAO)) return;
    modelUniform.setMatrix4(entry.accumulatedTransform);
    entry.entity.entity.bind();
    gl.drawArrays(gl.TRIANGLES, 0, planeMesh.length/3);
  });
});

const speed = 5;
let fov = 90;
function handleInput(keyboard, mouse, player, delta) {
  const {dx, dy} = mouse.delta();
  player.find(e => e.name === 'player_rot_y').rotate([0, 1, 0], -dx);
  player.find(e => e.name === 'player_rot_x').rotate([1, 0, 0], -dy);

  const shift = keyboard.isDown('ShiftLeft') || keyboard.isDown('ShiftRight');
  for(let key of keyboard) {
    switch(key) {
      case 'KeyW':
        player.move(0, 0, -speed * delta/1000);
        break;
      case 'KeyA':
        player.move(-speed * delta/1000, 0, 0);
        break;
      case 'KeyS':
        player.move(0, 0, speed * delta/1000);
        break;
      case 'KeyD':
        player.move(speed * delta/1000, 0, 0);
        break;
      case 'Comma':
        fov--;
        camera.setFov(fov);
        viewUniform.setMatrix4(camera.viewMatrix);
        break;
      case 'Period':
        fov++
        camera.setFov(fov);
        viewUniform.setMatrix4(camera.viewMatrix);
        break;
    }
  }
}

document.addEventListener('keypress', event => {
  switch(event.code) {
    case 'KeyP':
      if(ctrl.isPaused)
        ctrl.play();
      else {
        ctrl.pause();
        mouse.free();
      }
      console.log(`Paused: ${ctrl.isPaused}`);
      break;
    case 'KeyM':
      ctrl.manual(16);
      break;
  }
});

canvas.addEventListener('click', event => {
  if(mouse.isCaptured()) return;
  mouse.capture();
});
