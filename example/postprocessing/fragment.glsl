#version 300 es
precision highp float;
in vec2 uv;
in vec4 normal;
in vec4 light;
uniform sampler2D sampler;
out vec4 out_color;

void main() {
  vec4 black = vec4(vec3(0.0), 1.0);
  out_color = texture(sampler, uv);
  float lambert = clamp(dot(normalize(light), normalize(normal)), 0.35, 1.0);
  out_color = mix(black, out_color, lambert);
}
