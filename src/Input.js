export class KeyboardState {
  constructor() {
    this._pressMap = new Set();
    document.addEventListener('keydown', this._onKeyDown.bind(this));
    document.addEventListener('keyup', this._onKeyUp.bind(this));
  }

  _onKeyDown(event) {
    this._pressMap.add(event.code);
  }

  _onKeyUp(event) {
    this._pressMap.delete(event.code);
  }

  isDown(code) {
    return this._pressMap.has(code);
  }

  [Symbol.iterator]() {
    return this._pressMap[Symbol.iterator]();
  }
}

export class MouseController {
  constructor(gl) {
    this._gl = gl;
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onPointerLockChange = this._onPointerLockChange.bind(this);
    this._dx = this._dy = 0;
  }

  capture() {
    this._gl.canvas.requestPointerLock();
    this._gl.canvas.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('pointerlockchange', this._onPointerLockChange);
  }

  free() {
    this._gl.canvas.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('pointerlockchange', this._onPointerLockChange);
    document.exitPointerLock();
  }

  delta() {
    const delta = {
      dx: this._dx,
      dy: this._dy,
    };
    this._dx = this._dy = 0;
    return delta;
  }

  isCaptured() {
    return document.pointerLockElement === this._gl.canvas;
  }

  _onMouseMove(event) {
    this._dx += event.movementX;
    this._dy += event.movementY;
  }

  _onPointerLockChange() {
    if (document.pointerLockElement !== this._gl.canvas) this.free();
  }
}
