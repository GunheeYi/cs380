#version 300 es
precision highp float;

in vec2 uv;

out vec4 output_color;

uniform sampler2D mainTexture;
uniform float width;
uniform float height;

float PI = 3.141592;

void main() {

	// float w = 1.0 / width;
	// float h = 1.0 / height;

	vec2 center = vec2(0.5, 0.5);
	// float d = distance(uv, center);

	vec2 UV = uv + (uv - center);



	output_color = texture(mainTexture, UV);
}

