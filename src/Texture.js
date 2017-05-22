export class Texture {
  constructor(gl) {
    this._gl = gl;
    this._texture = this._gl.createTexture();
    this._type = this._gl.TEXTURE_2D;
    this._internalFormat = this._gl.RGBA;
    this._textureID = 0;
    this._maxMipmapLevel = 1000;
    this._magFilter = this._gl.LINEAR;
    this._wrapMode = gl.REPEAT;
    this._minFilter = this._gl.NEAREST_MIPMAP_LINEAR;
  }

  get raw() {
    return this._texture;
  }

  get type() {
    return this._type;
  }

  setType(val) {
    this._type = val;
    return this;
  }

  get internalFormat() {
    return this._internalFormat;
  }

  setInternalFormat(val) {
    this._internalFormat = val;
    return this;
  }

  get textureID() {
    return this._textureID;
  }

  setTextureID(val) {
    this._textureID = val;
    return this;
  }

  get wrapMode() {
    return this._wrapMode;
  }

  setWrapMode(val) {
    this._wrapMode = val;
    return this;
  }

  get maxMipmapLevel() {
    return this._maxMipmapLevel;
  }

  setMaxMipmapLevel(val) {
    this._maxMipmapLevel = val;
    return this;
  }

  get magFilter() {
    return this._magFilter;
  }

  setMagFilter(val) {
    this._magFilter = val;
    return this;
  }

  get minFilter() {
    return this._minFilter;
  }

  setMinFilter(val) {
    this._minFilter = val;
    return this;
  }

  activate() {
    this._gl.activeTexture(this._gl[`TEXTURE${this._textureID}`]);
    return this;
  }

  bind() {
    this._gl.bindTexture(this._type, this._texture);
    return this;
  }

  setParameters() {
    this._gl.texParameteri(this._type, this._gl.TEXTURE_MAX_LEVEL, this._maxMipmapLevel);
    this._gl.texParameteri(this._type, this._gl.TEXTURE_MAG_FILTER, this._magFilter);
    this._gl.texParameteri(this._type, this._gl.TEXTURE_MIN_FILTER, this._minFilter);
    this._gl.texParameteri(this._type, this._gl.TEXTURE_WRAP_S, this._wrapMode);
    this._gl.texParameteri(this._type, this._gl.TEXTURE_WRAP_T, this._wrapMode);
    return this;
  }

  uploadImage2D(level, img) {
    this._gl.texImage2D(this._type, level, this._internalFormat, this._gl.RGBA, this._gl.UNSIGNED_BYTE, img);
    return this;
  }

  allocate(level, width, height) {
    this._gl.texImage2D(this._type, level, this._internalFormat, width, height, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, null);
    return this;
  }

  generateMipmap() {
    this._gl.generateMipmap(this._type);
    return this;
  }
}
