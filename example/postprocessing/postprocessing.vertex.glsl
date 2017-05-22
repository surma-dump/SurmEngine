#version 300 es
in vec2 in_vertex;
out vec2 uv;

void main() {
  gl_Position = vec4(in_vertex, 0.0, 1.0);
  uv = vec2((in_vertex.x + 1.0)/2.0, (in_vertex.y + 1.0)/2.0);
}
