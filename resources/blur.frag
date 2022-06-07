#version 300 es
precision highp float;

in vec2 uv;

out vec4 output_color;

uniform sampler2D mainTexture;
uniform float width;
uniform float height;

void main() {

	float w = 1.0 / width;
	float h = 1.0 / height;

	float kernel[25] = float[](
		1.0, 4.0, 6.0, 4.0, 1.0,
		4.0, 16.0, 24.0, 16.0, 4.0,
		6.0, 24.0, 36.0, 24.0, 6.0,
		4.0, 16.0, 24.0, 16.0, 4.0,
		1.0, 4.0, 6.0, 4.0, 1.0
	);
	vec2 displacement[25] = vec2[](
		vec2(-2, -2), vec2(-2, -1), vec2(-2, 0), vec2(-2, 1), vec2(-2, 2),
		vec2(-1, -2), vec2(-1, -1), vec2(-1, 0), vec2(-1, 1), vec2(-1, 2),
		vec2(0, -2), vec2(0, -1), vec2(0, 0), vec2(0, 1), vec2(0, 2),
		vec2(1, -2), vec2(1, -1), vec2(1, 0), vec2(1, 1), vec2(1, 2),
		vec2(2, -2), vec2(2, -1), vec2(2, 0), vec2(2, 1), vec2(2, 2)
	);
	vec4 avg = vec4(0.0, 0.0, 0.0, 0.0);
	for (int i = 0; i < 25; i++) {
		avg += texture(mainTexture, uv + displacement[i] * vec2(w, h)) * kernel[i];
	}
	avg /= 256.0;
	output_color = vec4(avg.rgb, 1.0);
}

