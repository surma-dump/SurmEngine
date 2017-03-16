const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');

const t = new SurmEngine.TestTriangle(gl);
const modelUniform = t._program.referenceUniform('model');
const cameraUniform = t._program.referenceUniform('camera');
const viewUniform = t._program.referenceUniform('view');

const camera =
  new SurmEngine.Camera()
    .setAspectRatio(gl.canvas.width / gl.canvas.height)
    .setFov(30)
    .setNearPlane(0.1)
    .setFarPlane(1000)
    .setUpDirection(0, 1, 0)
    .move(0, 0, 15);

gl.clearColor(0, 0, 0, 1);
gl.enable(gl.DEPTH_TEST);
SurmEngine.Helpers.autosize(gl, _ => {
  camera.setAspectRatio(gl.canvas.width / gl.canvas.height);
  viewUniform.setMatrix4(camera.viewMatrix);
});
viewUniform.setMatrix4(camera.viewMatrix);

const keyboard = new SurmEngine.KeyboardState();
const ctrl = SurmEngine.Helpers.loop(delta => {
    for(let key of keyboard) {
    switch(key) {
      case 'KeyQ':
        camera.rotate([0, 1, 0], 36*delta/1000);
        break;
      case 'KeyE':
        camera.rotate([0, 1, 0], -36*delta/1000);
        break;
      case 'KeyW':
        camera.move(0, 0, -1 * delta/1000);
        break;
      case 'KeyA':
        camera.move(-1 * delta/1000, 0, 0);
        break;
      case 'KeyS':
        camera.move(0, 0, 1 * delta/1000);
        break;
      case 'KeyD':
        camera.move(1 * delta/1000, 0, 0);
        break;
    }
  }

  cameraUniform.setMatrix4(camera.transform);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  const m = mat4.create();
  modelUniform.setMatrix4(m);
  t.render();
  modelUniform.setMatrix4(mat4.fromTranslation(m, [1, 0, 1]));
  t.render();
  modelUniform.setMatrix4(mat4.fromTranslation(m, [2, 0, 2]));
  t.render();
  modelUniform.setMatrix4(mat4.fromTranslation(m, [3, 0, 3]));
  t.render();
});

document.addEventListener('keypress', event => {
  if(event.code !== 'KeyP') return;
  if(ctrl.isPaused)
    ctrl.play();
  else
    ctrl.pause();
  console.log(`Paused: ${ctrl.isPaused}`);
});
