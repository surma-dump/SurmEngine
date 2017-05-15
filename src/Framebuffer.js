export class Framebuffer {
  constructor(gl) {
    this._gl = gl;
    this._framebuffer = this._gl.createFramebuffer();
  }

  get raw() {
    return this._framebuffer;
  }

  bind(mode = this._gl.FRAMEBUFFER) {
    this._gl.bindFramebuffer(mode, this._framebuffer);
    return this;
  }

  attachTexture2D(type, tex) {
    this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, type, this._gl.TEXTURE_2D, tex, 0);
    return this;
  }

  attachRenderbuffer(type, rbo) {
    this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, type, this._gl.RENDERBUFFER, rbo);
    return this;
  }

  status() {
    const status = this._gl.checkFramebufferStatus(this._gl.FRAMEBUFFER);
    return [
      'FRAMEBUFFER_INCOMPLETE_ATTACHMENT',
      'FRAMEBUFFER_INCOMPLETE_DIMENSIONS',
      'FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT',
      'FRAMEBUFFER_UNSUPPORTED',
    ].find(k => this._gl[k] === status);
  }
}

export class Renderbuffer {
  constructor(gl) {
    this._gl = gl;
    this._renderbuffer = this._gl.createRenderbuffer();
    this.width = 512;
    this.height = 512;
    this.type = this._gl.DEPTH_COMPONENT16;
  }

  get raw() {
    return this._renderbuffer;
  }

  bind() {
    this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, this._renderbuffer);
    return this;
  }

  setWidth(val) {
    this.width = val;
    return this;
  }

  setHeight(val) {
    this.height = val;
    return this;
  }

  setType(val) {
    this.type = val;
    return this;
  }

  allocate() {
    this._gl.renderbufferStorageMultisample(this._gl.RENDERBUFFER, 16, this.type, this.width, this.height);
    return this;
  }
}
