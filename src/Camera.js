module.exports = (async function() {
  class Camera {
    constructor() {
      this._aspectRatio = 1;
      this._fov = glMatrix.toRadian(60);
      this._near = 0.1;
      this._far = 1000;
    }

    get aspectRatio() {
      return this._aspectRatio;
    }

    setAspectRatio(val) {
      this._aspectRatio = val;
      return this;
    }

    get fov() {
      return this._fov;
    }

    setFov(val) {
      this._fov = val;
      return this;
    }

    get nearPlane() {
      return this._near;
    }

    setNearPlane(val) {
      this._near = val;
      return this;
    }

    get farPlane() {
      return this._far;
    }

    setFarPlane(val) {
      this._far = val;
      return this;
    }

    get viewMatrix() {
      return mat4.perspective(mat4.create(), glMatrix.toRadian(this._fov), this._aspectRatio, this._near, this._far);
    }
  }

  return {Camera};
})();
