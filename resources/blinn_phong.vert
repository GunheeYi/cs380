#version 300 es

layout(location = 0) in vec3 in_pos;
layout(location = 1) in vec3 in_normal;
layout(location = 2) in vec2 in_uv; 
layout(location = 3) in vec3 in_tangent;

out vec4 frag_pos;
out vec4 frag_normal;
out vec4 frag_tangent;
out vec2 bumpCoord;

uniform mat4 projectionMatrix;
uniform mat4 cameraTransform;
uniform mat4 modelTransform;

mat4 getNormalMatrix(mat4 MVM)
{
	mat4 invm = inverse(MVM);
	invm[0][3] = 0.0;
	invm[1][3] = 0.0;
	invm[2][3] = 0.0;

	return transpose(invm);
}

void main() {
    mat4 MVM = inverse(cameraTransform) * modelTransform;
    mat4 NVM = getNormalMatrix(MVM);

    frag_pos = MVM * vec4(in_pos, 1);
    frag_normal = NVM * vec4(in_normal, 0);
    frag_tangent = NVM * vec4(in_tangent, 0);

	bumpCoord = in_uv;
    
    gl_Position = projectionMatrix * frag_pos;
}

