#version 300 es
precision highp float;

in vec4 frag_normal;
in vec4 frag_tangent;
in vec2 bumpCoord;

out vec4 output_color;

uniform mat4 cameraTransform;
uniform sampler2D mainTexture;
uniform vec3 mainColor;

void main() {
  float bump = length(texture(mainTexture, bumpCoord).rgb) / sqrt(3.0);
//   if (bump < 0.0 || bump > 1.0) {
//       output_color = vec4(1.0, 0.0, 0.0, 1.0);
//       return;
//   } else {
//       output_color = vec4(0.0, 1.0, 0.0, 1.0);
//       return;
//   }

  vec4 world_light_dir = vec4(1.0, 1.0, 1.0, 0.0);
  mat4 W2C = inverse(cameraTransform);

  vec3 L = normalize((W2C * world_light_dir).xyz);
  vec3 N = normalize(bump * frag_normal.xyz + (1.0-bump) * frag_tangent.xyz);

  float diffuse = min(max(0.0f, dot(N, L) * 0.9f) + 0.1f, 1.0f);

  output_color = vec4(mainColor * diffuse, 1.0);

  output_color.rgb = pow(output_color.rgb, vec3(1.0 / 2.2));  // Gamma correction
}
