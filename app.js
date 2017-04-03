(async function() {
  const glMatrixModule = SystemJS.import('/gl-matrix.js');
  const modules = [
    'Camera',
    'Helpers',
    'IndexManager',
    'Input',
    'Mesh',
    'Program',
    'SceneGraph',
    'VAO',
  ].reduce((acc, m) => Object.assign(acc, {[m]: SystemJS.import(`/surmengine/${m}.js`).then(m => m)}), {});
  const canvas = document.querySelector('canvas');
  const gl = canvas.getContext('webgl2');
  const {VAO} = await modules['VAO'];
  const {IndexManager} = await modules['IndexManager'];
  const {Program} = await modules['Program'];
  const vao = new VAO(gl);
  const indexManager = new IndexManager();
  const program = new Program(gl)
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
        float lambert = clamp(dot(normalize(light), normalize(-normal)), 0.05, 1.0);
        out_color = mix(vec4(0.0, 0.0, 0.0, 1.0), color, lambert);
      }
    `)
    .bindInVariable('in_vertex', indexManager.forName('in_vertex'))
    .bindInVariable('in_color', indexManager.forName('in_color'))
    .bindInVariable('in_normal', indexManager.forName('in_normal'))
    .link()
    .activate();


  const viewUniform = program.referenceUniform('view');
  const cameraUniform = program.referenceUniform('camera');
  const modelUniform = program.referenceUniform('model');

  const {Mesh} = await modules['Mesh'];
  // const planeMesh = SurmEngine.Mesh.xyPlane({subdivisions: 10});
  const planeMesh = Mesh.normalizedCubeSphere({subdivisions: 10});
  vao.createVBO()
    .bind()
    .setData(planeMesh.data)
    .setItemSize(3)
    .bindToIndex(indexManager.forName('in_vertex'));

  vao.createVBO()
    .bind()
    // .setData(
    //   new Float32Array(planeMesh.numPoints * 4)
    //     .map((_, idx) => idx % 4 === 3?1:(idx/4/planeMesh.numPoints))
    // )
    .setData(
      new Float32Array(planeMesh.numPoints * 4).fill(1)
    )
    .setItemSize(4)
    .bindToIndex(indexManager.forName('in_color'));

  vao.createVBO()
    .bind()
    // .setData(
    //   new Float32Array(planeMesh.numPoints * 3)
    //     .map((_, idx) => idx % 3 === 2?1:0)
    // )
    .setNormalize(true)
    .setData(planeMesh.data)
    .setItemSize(3)
    .bindToIndex(indexManager.forName('in_normal'));

  const {Camera} = await modules['Camera'];
  const camera =
    new (await Camera)()
      .setAspectRatio(gl.canvas.width / gl.canvas.height)
      .setFov(90)
      .setNearPlane(0.1)
      .setFarPlane(1000);

  const {SceneGraph, Entity} = await modules['SceneGraph'];
  const scene = new SceneGraph()
    .add(
      new Entity('plane', {numPoints: planeMesh.numPoints, idx: 0})
        // .scale(100)
        // .rotate([1, 0, 0], 90)
        .move([0, 5, 0])
    )
    .add(
      new Entity('player_move')
        .add(
          new Entity('player_rot_y')
            .add(
              new Entity('player_rot_x')
                .add(
                  new Entity('player_camera', camera)
                )
            )
        )
    );

  const {Helpers} = await modules['Helpers'];
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);
  // gl.enable(gl.CULL_FACE);
  // gl.cullFace(gl.BACK);
  Helpers.autosize(gl, _ => {
    camera.setAspectRatio(gl.canvas.width / gl.canvas.height);
    viewUniform.setMatrix4(camera.viewMatrix);
  });
  viewUniform.setMatrix4(camera.viewMatrix);

  const {KeyboardState, MouseController} = await modules['Input'];
  const {mat4} = await glMatrixModule;
  const keyboard = new KeyboardState();
  const mouse = new MouseController(gl);
  const scratch = mat4.create();
  const ctrl = Helpers.loop(delta => {
    handleInput(keyboard, mouse, delta);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const flatScene = scene.flatten();
    const playerCamera = flatScene.find(entry => entry.entity.name === 'player_camera');

    flatScene.forEach(entry => {
      if(!(entry.entity.entity && 'idx' in entry.entity.entity)) return;

      cameraUniform.setMatrix4(mat4.invert(scratch, playerCamera.accumulatedTransform));
      modelUniform.setMatrix4(entry.accumulatedTransform);
      gl.drawArrays(gl.TRIANGLES, entry.entity.entity.idx, entry.entity.entity.numPoints);
    });
  });

  let speed = 5;
  let fov = 30;
  const playerRotX = scene.find(e => e.name === 'player_rot_x');
  const playerRotY = scene.find(e => e.name === 'player_rot_y');
  const playerMove = scene.find(e => e.name === 'player_move');
  let move = new Float32Array(3);
  playerMove.move([0, 5, 3]);
  function handleInput(keyboard, mouse, delta) {
    const {dx, dy} = mouse.delta();
    playerRotY.rotate([0, 1, 0], -dx);
    playerRotX.rotate([1, 0, 0], -dy);

    for(let key of keyboard) {
      move.fill(0);
      switch(key) {
        case 'KeyW':
          move[2] = -speed * delta/1000;
          break;
        case 'KeyA':
          move[0] = -speed * delta/1000;
          break;
        case 'KeyS':
          move[2] = speed * delta/1000;
          break;
        case 'KeyD':
          move[0] = speed * delta/1000;
          break;
        case 'Space':
          move[1] = speed * delta/1000;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          move[1] = -speed * delta/1000;
          break;
        case 'Comma':
          fov--;
          camera.setFov(fov);
          viewUniform.setMatrix4(camera.viewMatrix);
          break;
        case 'Period':
          fov++;
          camera.setFov(fov);
          viewUniform.setMatrix4(camera.viewMatrix);
          break;
      }
      playerMove.move(vec3.transformMat4(move, move, playerRotY.transform));
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
})();
