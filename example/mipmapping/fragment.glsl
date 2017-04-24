#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D samplers[4];
uniform int samplerID;
out vec4 out_color;

void main() {
  vec4 black = vec4(vec3(0.0), 1.0);
  out_color = texture(samplers[samplerID], uv);
}
