#version 300 es

layout(location = 0) in vec3 in_pos;

out vec3 uv;

uniform mat4 projectionMatrix;
uniform mat4 cameraTransform;
uniform mat4 modelTransform;

void main() {
  //TODO: implement uv and gl_Position
  uv = in_pos;

  mat4 cameraTransform_ = cameraTransform;
  cameraTransform_[3][0] = 0.0; // column-major
  cameraTransform_[3][1] = 0.0;
  cameraTransform_[3][2] = 0.0;

  mat4 MVM = inverse(cameraTransform_) * modelTransform;

	vec4 frag_pos = MVM * vec4(in_pos, 1);
  gl_Position = projectionMatrix * frag_pos;
}
