export class TrackballCamera {
  constructor(node, mouse, keyboard) {
    this._mouse = mouse;
    this._keyboard = keyboard;

    this._node = node;
    this._translationNode = node.findByName('translation');
    if(!this._translationNode)
      throw new Error(`Node does not have child named 'translation'`);
    this._rotXNode = node.findByName('rotation_x');
    if(!this._translationNode)
      throw new Error(`Node does not have child named 'rotation_x'`);
    this._rotYNode = node.findByName('rotation_y');
    if(!this._translationNode)
      throw new Error(`Node does not have child named 'rotation_y'`);

    this.moveSpeed = 1;
    this.turnSpeed = 1;
    this._scratchVector = vec4.create();
  }

  _move(v, positiveKey, negativeKey, delta) {
    vec4.set(this._scratchVector, ...v, 1);
    vec4.transformMat4(this._scratchVector, this._scratchVector, this._rotYNode.transform);
    const factor = (this._keyboard.isDown(positiveKey) ? 1 : 0) + (this._keyboard.isDown(negativeKey) ? -1 : 0);
    this._translationNode.move(
      vec4.scale(
        this._scratchVector,
        this._scratchVector,
        this.moveSpeed * delta/1000 * factor
      )
    );
  }
  update(delta) {
    this._move([0, 0, -1], 'KeyW', 'KeyS', delta);
    this._move([-1, 0, 0], 'KeyA', 'KeyD', delta);

    const {dx, dy} = this._mouse.delta();
    this._rotYNode.rotate([0, 1, 0], -dx * this.turnSpeed * delta/1000);
    this._rotXNode.rotate([1, 0, 0], -dy * this.turnSpeed * delta/1000);
  }
}
