#version 300 es
in vec3 in_vertex;
in vec2 in_uv;
uniform mat4 model;
uniform mat4 view;
uniform mat4 camera;
out vec2 uv;


void main() {
  gl_Position = view * camera * model * vec4(in_vertex, 1.0);
  uv = in_uv;
}
