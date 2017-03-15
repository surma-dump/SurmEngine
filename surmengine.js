(function(module) {
  class Program {
    constructor(gl) {
      this._gl = gl;
      this._program = this._gl.createProgram();
      this._dirty = true;
      this._variableBindings = {};
    }

    _compileShader(type, source) {
      const shader = this._gl.createShader(type) ;
      this._gl.shaderSource(shader, source);
      this._gl.compileShader(shader);
      if (!this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)) {
        throw new Error(`Error compiling ${type==gl.VERTEX_SHADER?'vertex':'fragment'} shader: ${gl.getShaderInfoLog(shader)}`);
      }
      return shader;
    }

    get vertexShader() {
      return this._vertexShader;
    }

    setVertexShader(source) {
      const newShader = this._compileShader(this._gl.VERTEX_SHADER, source);
      if(this._vertexShader) {
        this._gl.detachShader(this._program, this._vertexShader);
        this._gl.deleteShader(this._vertexShader);
      }
      this._vertexShaderSource = source;
      this._vertexShader = newShader;
      this._gl.attachShader(this._program, this._vertexShader);
      this._dirty = true;
      return this;
    }

    get fragmentShader() {
      return this._fragmentShader;
    }

    setFragmentShader(source) {
      const newShader = this._compileShader(this._gl.FRAGMENT_SHADER, source);
      if(this._fragmentShader) {
        this._gl.detachShader(this._program, this._fragmentShader);
        this._gl.deleteShader(this._fragmentShader);
      }
      this._fragmentShaderSource = source;
      this._fragmentShader = newShader;
      this._gl.attachShader(this._program, this._fragmentShader);
      this._dirty = true;
      return this;
    }

    _freeSlot() {
      const usedKeys = Object.values(this._variableBindings);
      for(let i = 0; i < this._gl.MAX_VERTEX_ATTRIBS; i++) {
        if(!usedKeys.includes(i)) return i;
      }
      throw new Error(`No VBA slot available`);
    }

    bindInVariable(name, vbo) {
      let slotId = -1;
      if(this._variableBindings.hasOwnProperty(name)) {
        slotId = this._variableBindings[name];
      } else {
        slotId = this._freeSlot();
      }
      this._variableBindings[name] = slotId;
      vbo._bindSlotId(slotId);
      this._gl.enableVertexAttribArray(slotId);
      this._gl.bindAttribLocation(this._program, slotId, name);
      return this;
    }

    referenceUniform(name) {
      this.link();
      return new Uniform(this._gl, this._gl.getUniformLocation(this._program, name));
    }

    link() {
      if(!this._dirty) return;

      this._gl.linkProgram(this._program);
      if(!this._gl.getProgramParameter(this._program, this._gl.LINK_STATUS)) {
        throw new Error(`Couldn’t link program: ${this._gl.getProgramInfoLog(this._program)}`);
      }
      this._gl.validateProgram(this._program);
      if(!this._gl.getProgramParameter(this._program, this._gl.VALIDATE_STATUS)) {
        throw new Error(`Couldn’t validate program: ${this._gl.getProgramInfoLog(this._program)}`);
      }
      this._dirty = false;
      return this;
    }

    activate() {
      if(!this._dirty) return;
      this.link();
      this._gl.useProgram(this._program);
      return this;
    }
  }

  class Uniform {
    constructor(gl, ref) {
      this._gl = gl;
      this._ref = ref;
    }

    setMatrix4(mat4) {
      this._gl.uniformMatrix4fv(this._ref, false, mat4);
    }

    setVector4(vec4) {
      this._gl.uniform4v(this._ref, vec4);
    }
  }

  class VAO {
    constructor(gl) {
      this._gl = gl;
      this._vao = this._gl.createVertexArray();
      this._gl.bindVertexArray(this._vao);
    }

    createVBO() {
      this.bind();
      return new VBO(gl);
    }

    bind() {
      this._gl.bindVertexArray(this._vao);
      return this;
    }
  }

  class VBO {
    constructor(gl) {
      this._gl = gl;
      this._vao = vao;
      this._vbo = this._gl.createBuffer();
      this.bind();
      this._itemSize = 4;
      this._type = this._gl.STATIC_DRAW;
      this._normalize = false;
      this._stride = 0;
      this._offset = 0;
    }

    get itemSize() {
      return this._itemSize;
    }

    setItemSize(val) {
      this._itemSize = val;
      return this;
    }

    get type() {
      return this._type;
    }

    setType(val) {
      this._type = val;
      return this;
    }

    get normalize() {
      return this._normalize;
    }

    setNormalize(val) {
      this._normalize = val;
      return this;
    }

    get stride() {
      return this._stride;
    }

    setStride(val) {
      this._stride = val;
      return this;
    }

    get offset() {
      return this._offset;
    }

    setOffset(val) {
      this._offset = val;
      return this;
    }

    setData(val) {
      this._gl.bufferData(gl.ARRAY_BUFFER, val, this._type);
      return this;
    }

    bind() {
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vbo);
      return this;
    }

    _bindSlotId(slotId) {
      this.bind();
      this._gl.vertexAttribPointer(slotId, this._itemSize, this._type, this._normalized, this._stride, this._offset);
    }
  }

  class Entity {
    constructor() {
      this._children = [];
      this._transform = mat4.create();
    }

    get transform() {
      return this._transform;
    }

    setTransform(val) {
      this._transform = val;
      return this;
    }

    move(x, y, z) {
      mat4.translate(this._transform, this._transform, vec3.fromValues(x, y, z));
      return this;
    }

    rotate(axis, deg) {
      mat4.rotate(this._transform, this._transform, glMatrix.toRadian(deg), axis);
      return this;
    }

    rotateAround(point, axis, deg) {
      // TODO: Optimize me
      const t_in = mat4.fromTranslation(mat4.create(), vec3.negate(vec3.create(), point));
      const t_out = mat4.fromTranslation(mat4.create(), point);
      const r = mat4.fromRotation(mat4.create(), glMatrix.toRadian(deg), axis);
      mat4.multiply(this._transform, t_in, this._transform);
      mat4.multiply(this._transform, r, this._transform);
      mat4.multiply(this._transform, t_out, this._transform);
      return this;
    }
  }

  class Camera extends Entity {
    constructor() {
      super();
      this._dirty = true;
      this._aspectRatio = 1;
      this._fov = glMatrix.toRadian(60);
      this._near = 0.1;
      this._far = 1000;
      this._upDirection = [0, 1, 0];
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

    setUpDirection(x, y, z) {
      this._up = [x, y, z];
      return this;
    }

    get upDirection() {
      return this._upDirection;
    }

    get transform() {
      return mat4.invert(mat4.create(), this._transform);
    }

    get viewMatrix() {
      return mat4.perspective(mat4.create(), glMatrix.toRadian(this._fov), this._aspectRatio, this._near, this._far);
    }
  }

  class Triangle extends Entity {
    constructor() {
      super();
      this._vertices = [
        vec3.fromValues(0, 1, 0),
        vec3.fromValues(-1, 0, 0),
        vec3.fromValues(1, 0, 0),
      ];
    }
  }

  const Helpers = {
    loop(f) {
      requestAnimationFrame(function x() {
        f();
        requestAnimationFrame(x);
      });
    },
    autosize(gl, f) {
      const ro = new ResizeObserver(entries => {
        const w = entries[0].contentRect.width * window.devicePixelRatio;
        const h = entries[0].contentRect.height * window.devicePixelRatio;
        gl.canvas.width = w;
        gl.canvas.height = h;
        gl.viewport(0, 0, w, h);
        f && f();
      });
      ro.observe(gl.canvas);
    },
    logMatrix(m) {
      const t = mat4.transpose(mat4.create(), m);
      console.table([0, 1, 2, 3].map(i => t.slice(i*4, (i+1)*4)));
    }
  };

  module.SurmEngine = {
    Program,
    VAO,
    Entity,
    Camera,
    Triangle,
    Helpers,
  };
})(self);
