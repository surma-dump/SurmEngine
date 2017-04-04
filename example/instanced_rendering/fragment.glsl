#version 300 es
precision highp float;
in vec4 color;
in vec4 normal;
in vec4 light;
out vec4 out_color;

void main() {
  vec4 black = vec4(vec3(0.0), 1.0);
  out_color = color;
  float lambert = clamp(dot(normalize(-light), normalize(normal)), 0.05, 1.0);
  out_color = mix(black, color, lambert);
}
