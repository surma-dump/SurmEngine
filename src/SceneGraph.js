module.exports = (async function() {
  class SceneGraph {
    constructor() {
      this._root = new Node('_root');
      this._scratch = mat4.create();
    }

    add(node) {
      this._root.add(node);
      return this;
    }

    *propagate() {
      yield* this._root._propagate(this._scratch);
    }

    find(f) {
      return this._root.find(f);
    }

    findByName(name) {
      return this.find(n => n.name === name);
    }
  }

  class Node {
    constructor(name, data = {}) {
      this._transform = mat4.create();
      this._scratch = mat4.create();
      this._children = [];
      this.name = name;
      this.data = data;
    }

    add(node) {
      this._children.push(node);
      return this;
    }

    get children() {
      return this._children;
    }

    get transform() {
      return this._transform;
    }

    setTransform(val) {
      this._transform = val;
      return this;
    }

    move(v) {
      mat4.translate(this._transform, this._transform, v);
      return this;
    }

    rotate(axis, deg) {
      mat4.rotate(this._transform, this._transform, glMatrix.toRadian(deg), axis);
      return this;
    }

    scale(f) {
      mat4.scale(this._transform, this._transform, [f, f, f]);
      return this;
    }

    rotateAround(point, axis, deg) {
      // TODO: Optimize me
      const tIn = mat4.fromTranslation(mat4.create(), vec3.negate(vec3.create(), point));
      const tOut = mat4.fromTranslation(mat4.create(), point);
      const r = mat4.fromRotation(mat4.create(), glMatrix.toRadian(deg), axis);
      mat4.multiply(this._transform, tIn, this._transform);
      mat4.multiply(this._transform, r, this._transform);
      mat4.multiply(this._transform, tOut, this._transform);
      return this;
    }

    find(f) {
      if (f(this)) return this;
      return this._children.reduce((r, c) => r || c.find(f), null);
    }

    findByName(name) {
      return this.find(n => n.name === name);
    }

    *_propagate(transform) {
      mat4.multiply(this._scratch, transform, this._transform);
      yield {
          node: this,
          accumulatedTransform: this._scratch,
      };
      for(let childNode of this._children)
        yield* childNode._propagate(this._scratch);
    }
  }

  return {SceneGraph, Node};
})();
