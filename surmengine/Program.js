module.exports = (async function() {
  class Program {
    constructor(gl) {
      this._gl = gl;
      this._program = this._gl.createProgram();
      this._dirty = true;
      this._variableBindings = {};
    }

    _compileShader(type, source) {
      const shader = this._gl.createShader(type);
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
      return this;
    }

    _freeSlot() {
      const usedKeys = Object.values(this._variableBindings);
      for(let i = 0; i < this._gl.MAX_VERTEX_ATTRIBS; i++) {
        if(!usedKeys.includes(i)) return i;
      }
      throw new Error(`No VBA slot available`);
    }

    bindInVariable(name, index) {
      this._gl.enableVertexAttribArray(index);
      this._gl.bindAttribLocation(this._program, index, name);
      return this;
    }

    referenceUniform(name) {
      return new Uniform(this._gl, this._gl.getUniformLocation(this._program, name));
    }

    link() {
      this._gl.linkProgram(this._program);
      if(!this._gl.getProgramParameter(this._program, this._gl.LINK_STATUS)) {
        throw new Error(`Couldn’t link program: ${this._gl.getProgramInfoLog(this._program)}`);
      }
      this._gl.validateProgram(this._program);
      if(!this._gl.getProgramParameter(this._program, this._gl.VALIDATE_STATUS)) {
        throw new Error(`Couldn’t validate program: ${this._gl.getProgramInfoLog(this._program)}`);
      }
      return this;
    }

    activate() {
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

  return {Program};
})();
