module.exports = (async function() {
  class IndexManager {
    constructor() {
      this._bindings = {};
    }

    forName(name) {
      if(this._bindings.hasOwnProperty(name)) {
        return this._bindings[name];
      }
      return this._bindings[name] = this._freeIndex();
    }

    _freeIndex() {
      const usedKeys = Object.values(this._bindings);
      for(let i = 0; i < 32; i++) {
        if(!usedKeys.includes(i)) return i;
      }
      throw new Error(`No index available`);
    }
  }

  return {IndexManager};
})();
