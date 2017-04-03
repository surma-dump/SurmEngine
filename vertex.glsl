#version 300 es
in vec3 in_vertex;
in vec4 in_color;
in vec3 in_normal;
uniform mat4 view;
uniform mat4 camera;
uniform mat4 model;
out vec4 color;
out vec4 normal;
out vec4 light;

vec3 light_dir = vec3(0.0, -80.0, -80.0);

void main() {
  mat4 normal_correction_matrix = transpose(inverse(model));
  gl_Position = view * camera * model * vec4(in_vertex, 1.0);
  color = in_color;
  normal = model * vec4(in_normal, 0.0);
  light = vec4(light_dir, 1.0);
}
