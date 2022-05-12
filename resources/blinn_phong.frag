#version 300 es
precision highp float;

#define DIRECTIONAL 0
#define POINT 1
#define SPOTLIGHT 2
#define AMBIENT 3

in vec4 frag_pos;
in vec4 frag_normal;

out vec4 output_color;

uniform mat4 cameraTransform;

uniform vec3 mainColor;

struct Light {
    int type;
    bool enabled;
    vec3 pos;
    vec3 dir;
    float illuminance;
    float angle;
    float angleSmoothness;
};

uniform int numLights;
uniform Light lights[10];

float random(vec3 seed) {
    seed = seed + vec3(123.456, 789.123, 456.789);
    return fract(sin(dot(seed, vec3(12.9898, 78.233, 45.5432))) * 43758.5453);
}

void main() {
    mat4 W2C = inverse(cameraTransform);
    float intensity = 0.0;
    
    vec3 N = normalize(frag_normal.xyz);
    
    for (int i=0; i<numLights; i++){
        if (lights[i].enabled == false) continue;
        
        if (lights[i].type == DIRECTIONAL) {
            // TODO: implement diffuse and specular reflections for directional light
            float shininess = 200.0;
            vec3 L = - normalize((W2C * vec4(lights[i].dir, 0.0)).xyz);
            vec3 V = - normalize(frag_pos.xyz);
            vec3 N = normalize(frag_normal.xyz);
            vec3 H = normalize(L + V);
            float diffuse = max(dot(N, L), 0.0);
            // float diffuse = 0.0;
            float specular = pow(max(dot(N, H), 0.0), shininess);
            intensity += min(max((diffuse + specular) * lights[i].illuminance, 0.0), 1.0);
        }
        else if (lights[i].type == POINT) {
            continue;
        }
        else if (lights[i].type == SPOTLIGHT) {
            continue;
        }
        else if (lights[i].type == AMBIENT) {
            // TODO: implement ambient reflection
            intensity += lights[i].illuminance;
        }
    }

    intensity = min(max(intensity, 0.0), 1.0);
    
    output_color = vec4(mainColor * intensity, 1.0);
    
    output_color.rgb = pow(output_color.rgb, vec3(1.0 / 2.2));  // Gamma correction
}

