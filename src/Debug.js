export class GlLogger {
  constructor(gl) {
    this._proxy = new Proxy(gl, this);
    this._log = [];
    this.filter = _ => true;
    this._objDescriptors = new Map();
    this._typeCounter = new Map();
    this._constantNames =
      Object.entries(WebGL2RenderingContext)
      .filter(([_, v]) => Object.getPrototypeOf(v).constructor === Number)
      .reduce((map, [k, v]) => map.set(v, (map.get(v) || []).concat(k)), new Map());
  }

  get proxy() {
    return this._proxy;
  }

  static _argumentToString(arg) {
    if(arg === undefined || arg === null)
      return String(arg);
    if(arg.buffer instanceof ArrayBuffer)
      return `new ${arg.constructor.name}([${Array.from(arg).join(', ')}])`;
    if(arg.symbols && arg.symbols.length > 0)
      return `gl.${arg.symbols[0]}`;
    if(arg.name)
      return arg.name;
    return arg.value;
  }

  generateCode() {
    let str = `
      const canvas = document.appendChild(document.createElement('canvas'));
      const gl = canvas.getContext('webgl2');
    `;
    for(let i = 0; i < this._log.length; i++) {
      const cmd = this._log[i];
      if(cmd.returnValue) {
        str += `const ${cmd.returnValue.name} = `;
      }
      str += `gl.${cmd.name}(${cmd.arguments.map(a => GlLogger._argumentToString(a)).join(', ')}); //${i} ${'\n'}`;
    }
    return str;
  }

  _incTypeCounter(name) {
    let count = 0;
    if(this._typeCounter.has(name)) {
      count = this._typeCounter.get(name);
    }
    this._typeCounter.set(name, count+1);
    return count;
  }

  _entrify(obj) {
    if([null, undefined].includes(obj))
      return obj;

    const prototype = Object.getPrototypeOf(obj);
    if(prototype.constructor === Float32Array)
      return new Float32Array(obj);
    if(prototype.constructor === HTMLImageElement) {
      const canvas = document.createElement('canvas');
      [canvas.width, canvas.height] = [obj.naturalWidth, obj.naturalHeight];
      const ctx = canvas.getContext('2d');
      ctx.drawImage(obj, 0, 0);
      return {
        name: 'HTMLImageElement',
        value: canvas.toDataURL(),
      };
    }
    if([Number, String, Boolean].some(v => prototype.constructor === v))
      return {
        value: JSON.stringify(obj),
        symbols: this._constantNames.get(obj),
      };
    // Default
    if (!this._objDescriptors.has(obj)) {
      const name = prototype.constructor.name;
      this._objDescriptors.set(obj, {
        name: `${name}${this._incTypeCounter(name)}`,
        value: obj,
      });
    }
    return this._objDescriptors.get(obj);
  }

  get(target, property, receiver) {
    if(target[property] instanceof Function) {
      return (...args) => {
        const r = target[property].call(target, ...args);
        if (this.filter(property))
          this._log.push({
            name: property,
            arguments: args.map(arg => this._entrify(arg)),
            returnValue: this._entrify(r),
          });
        return r;
      };
    }
    return target[property];
  }
}
