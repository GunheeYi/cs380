#version 300 es
precision highp float;

in vec2 uv;

out vec4 output_color;

uniform sampler2D mainTexture;
uniform float width;
uniform float height;

void main() {
	// grayscale
	vec4 originalColor = texture(mainTexture, uv);
	output_color = vec4(vec3(0.299 * originalColor.r + 0.587 * originalColor.g + 0.114 * originalColor.b), originalColor.a);
}