#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D sampler;
uniform float time;
out vec4 out_color;

void main() {
  vec2 offset = vec2(sin(time*2.0*3.14/1000.0 + uv.y*30.0), sin(time*2.0*3.14/1000.0 + uv.x*18.0));
  vec4 texel = texture(sampler, uv + offset * 0.005);
  out_color = texel;
}
