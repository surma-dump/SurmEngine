module.exports = (async function() {
  const {glMatrix, mat4, vec3} = await SystemJS.import('/gl-matrix.js');

  class SceneGraph {
    constructor() {
      this._root = new Entity('_root');
    }

    add(entity) {
      this._root.add(entity);
      return this;
    }

    flatten() {
      return this._root._flatten(mat4.create());
    }

    find(f) {
      return this._root.find(f);
    }

    visitAll(f) {
      this._root._visitAll(f);
    }
  }

  class Entity {
    constructor(name, entity = null) {
      this._transform = mat4.create();
      this._children = [];
      this.name = name;
      this.entity = entity;
    }

    add(entity) {
      this._children.push(entity);
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
      const t_in = mat4.fromTranslation(mat4.create(), vec3.negate(vec3.create(), point));
      const t_out = mat4.fromTranslation(mat4.create(), point);
      const r = mat4.fromRotation(mat4.create(), glMatrix.toRadian(deg), axis);
      mat4.multiply(this._transform, t_in, this._transform);
      mat4.multiply(this._transform, r, this._transform);
      mat4.multiply(this._transform, t_out, this._transform);
      return this;
    }

    find(f) {
      if (f(this)) return this;
      return this._children.reduce((r, c) => r || c.find(f), null);
    }

    _flatten(transform) {
      const newTransform = mat4.multiply(mat4.create(), transform, this._transform);
      return Array.prototype.concat.apply(
        [{
          entity: this,
          accumulatedTransform: newTransform
        }],
        this._children.map(e => e._flatten(newTransform))
      );
    }

    _visitAll(f) {
      if (!f(this)) return;
      this._children.forEach(entity => entity._visitAll(f));
    }
  }

  return {SceneGraph, Entity};
})();
