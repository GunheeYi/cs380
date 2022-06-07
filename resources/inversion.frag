#version 300 es
precision highp float;

in vec2 uv;

out vec4 output_color;

uniform sampler2D mainTexture;
uniform float width;
uniform float height;

void main() {
	vec4 originalColor = texture(mainTexture, uv);
	output_color = vec4(1.0 - originalColor.r, 1.0 - originalColor.g, 1.0 - originalColor.b, originalColor.a);
}