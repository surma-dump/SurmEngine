#version 300 es
in vec3 in_vertex;
in vec2 in_uv;
in vec3 in_normal;
uniform mat4 model;
uniform mat4 view;
uniform mat4 camera;
uniform vec4 lightPosition;
out vec2 uv;
out vec4 normal;
out vec4 light;


void main() {
  gl_Position = view * camera * model * vec4(in_vertex, 1.0);
  uv = in_uv;
  normal = model * vec4(in_normal, 0.0);
  light = lightPosition - model * vec4(in_vertex, 1.0);
}
