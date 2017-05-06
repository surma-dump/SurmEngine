export class XYPlane {
  static numPoints(opts = {subdivisions: 1}) {
    const numCells = opts.subdivisions * opts.subdivisions;
    const numTriangles = numCells * 2;
    const numPoints = numTriangles * 3;
    return numPoints;
  }

  static vertices(data, opts = {subdivisions: 1}) {
    const gap = 2 / opts.subdivisions;
    for(let x = 0; x < opts.subdivisions; x++) {
      for(let y = 0; y < opts.subdivisions; y++) {
        data[(y * opts.subdivisions + x) * 18 +  0] = -1 + gap * x;
        data[(y * opts.subdivisions + x) * 18 +  1] = -1 + gap * y;
        data[(y * opts.subdivisions + x) * 18 +  2] = 0;
        data[(y * opts.subdivisions + x) * 18 +  3] = -1 + gap * (x+1);
        data[(y * opts.subdivisions + x) * 18 +  4] = -1 + gap * (y+1);
        data[(y * opts.subdivisions + x) * 18 +  5] = 0;
        data[(y * opts.subdivisions + x) * 18 +  6] = -1 + gap * x;
        data[(y * opts.subdivisions + x) * 18 +  7] = -1 + gap * (y+1);
        data[(y * opts.subdivisions + x) * 18 +  8] = 0;

        data[(y * opts.subdivisions + x) * 18 +  9] = -1 + gap * x;
        data[(y * opts.subdivisions + x) * 18 + 10] = -1 + gap * y;
        data[(y * opts.subdivisions + x) * 18 + 11] = 0;
        data[(y * opts.subdivisions + x) * 18 + 12] = -1 + gap * (x+1);
        data[(y * opts.subdivisions + x) * 18 + 13] = -1 + gap * y;
        data[(y * opts.subdivisions + x) * 18 + 14] = 0;
        data[(y * opts.subdivisions + x) * 18 + 15] = -1 + gap * (x+1);
        data[(y * opts.subdivisions + x) * 18 + 16] = -1 + gap * (y+1);
        data[(y * opts.subdivisions + x) * 18 + 17] = 0;
      }
    }
    return data;
  }

  static normals(data, opts = {subdivisions: 1}) {
    return data.map((_, idx) => idx % 3 === 2?1:0);
  }
}

export class Cube {
  static _transforms() {
    return [
      mat4.fromRotationTranslation(mat4.create(), quat.setAxisAngle(quat.create(), [0, 1, 0], glMatrix.toRadian(90)), [1, 0, 0]),
      mat4.fromRotationTranslation(mat4.create(), quat.setAxisAngle(quat.create(), [0, 1, 0], glMatrix.toRadian(-90)), [-1, 0, 0]),
      mat4.fromRotationTranslation(mat4.create(), quat.setAxisAngle(quat.create(), [1, 0, 0], glMatrix.toRadian(-90)), [0, 1, 0]),
      mat4.fromRotationTranslation(mat4.create(), quat.setAxisAngle(quat.create(), [1, 0, 0], glMatrix.toRadian(90)), [0, -1, 0]),
      mat4.fromRotationTranslation(mat4.create(), quat.setAxisAngle(quat.create(), [0, 1, 0], glMatrix.toRadian(0)), [0, 0, 1]),
      mat4.fromRotationTranslation(mat4.create(), quat.setAxisAngle(quat.create(), [0, 1, 0], glMatrix.toRadian(180)), [0, 0, -1]),
    ];
  }
  static numPoints(opts = {subdivisions: 1}) {
    return XYPlane.numPoints(opts) * 6;
  }

  static vertices(data, opts = {subdivisions: 1}) {
    const floatsPerPlane = XYPlane.numPoints(opts)*3;
    const bytesPerPlane = floatsPerPlane * 4;
    XYPlane.vertices(data, opts);
    for(let i = 1; i <= 6; i++)
      data.copyWithin(i*floatsPerPlane, 0, floatsPerPlane);

    const transforms = Cube._transforms();
    transforms.forEach((m, idx) => {
      const view = new Float32Array(data.buffer, idx * bytesPerPlane, floatsPerPlane);
      for(let i = 0; i < floatsPerPlane; i+=3) {
        const v = new Float32Array(view.buffer, view.byteOffset + i * 4, 3);
        vec3.transformMat4(v, v, m);
      }
    });

    return data;
  }

  static normals(data, opts = {subdivisions: 1}) {
    const floatsPerPlane = XYPlane.numPoints(opts) * 3;
    const bytesPerPlane = floatsPerPlane * 4;
    XYPlane.normals(data, opts);
    for(let i = 1; i <= 6; i++)
      data.copyWithin(i*floatsPerPlane, 0, floatsPerPlane);

    const transforms = Cube._transforms();
    transforms.forEach((m, idx) => {
      const view = new Float32Array(data.buffer, idx * bytesPerPlane, floatsPerPlane);
      for(let i = 0; i < floatsPerPlane; i+=3) {
        const v = new Float32Array(view.buffer, view.byteOffset + i * 4, 3);
        vec3.transformMat4(v, v, m);
      }
    });

    return data;
  }
}

export class NormalizedCubeSphere {
  static numPoints(opts = {subdivisions: 10}) {
    return Cube.numPoints(opts);
  }

  static vertices(data, opts = {subdivisions: 10}) {
    const numPoints = Cube.numPoints(opts);
    Cube.vertices(data, opts);
    for(let i = 0; i < numPoints; i++) {
      const vertex = new Float32Array(data.buffer, i * 3 * 4, 3);
      vec3.normalize(vertex, vertex);
    }
    return data;
  }

  static normals(data, opts = {subdivisions: 10}) {
    return NormalizedCubeSphere.vertices(data, opts);
  }

}
