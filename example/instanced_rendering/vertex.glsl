#version 300 es
in vec3 in_vertex;
in vec4 in_color;
in vec3 in_normal;
uniform mat4 view;
uniform mat4 camera;
uniform mat4 model[128];
uniform vec4 lightPosition;
out vec4 color;
out vec4 normal;
out vec4 light;


void main() {
  gl_Position = view * camera * model[gl_InstanceID] * vec4(in_vertex, 1.0);
  color = in_color;
  normal = model[gl_InstanceID] * vec4(in_normal, 0.0);
  light = lightPosition - model[gl_InstanceID] * vec4(in_vertex, 1.0);
}
