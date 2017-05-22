export class VAO {
  constructor(gl) {
    this._gl = gl;
    this._vao = this._gl.createVertexArray();
  }

  createVBO() {
    return new VBO(this._gl, this);
  }

  bind() {
    this._gl.bindVertexArray(this._vao);
    return this;
  }
}

class VBO {
  constructor(gl, vao) {
    this._gl = gl;
    this._vao = vao;
    this._vbo = this._gl.createBuffer();
    this._itemSize = 4;
    this._type = this._gl.FLOAT;
    this._usage = this._gl.STATIC_DRAW;
    this._normalize = false;
    this._stride = 0;
    this._offset = 0;
    this._divisor = 0;
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

  get usage() {
    return this._usage;
  }

  setUsage(val) {
    this._usage = val;
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

  get divisor() {
    return this._divisor;
  }

  setDivisor(val) {
    this._divisor = val;
    return this;
  }

  setData(val) {
    this._gl.bufferData(this._gl.ARRAY_BUFFER, val, this._usage);
    return this;
  }

  bind() {
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vbo);
    return this;
  }

  bindToIndex(index) {
    this.bind();
    this._gl.vertexAttribPointer(index, this._itemSize, this._type, this._normalized, this._stride, this._offset);
    this._gl.vertexAttribDivisor(index, this._divisor);
    this._gl.enableVertexAttribArray(index);
    return this;
  }
}
