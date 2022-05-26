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
uniform vec3 reflectivity;

struct Light {
    int type;
    bool enabled;
    vec3 pos;
    vec3 dir;
    float illuminance;
    vec3 color;
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
    vec3 intensity = vec3(0.0, 0.0, 0.0);
    
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
            float specular = pow(max(dot(N, H), 0.0), shininess);
            intensity += lights[i].color * min(max((diffuse + specular) * lights[i].illuminance, 0.0), 1.0) * reflectivity;
        }
        else if (lights[i].type == POINT) {
            vec3 lightPos = (W2C * vec4(lights[i].pos, 1.0)).xyz;
            vec3 frag2light = lightPos - frag_pos.xyz;

            if (dot(frag2light, frag_normal.xyz) >= 0.0) {
                float a = 1.0, b = 0.1, c = 1.0;
                float distance = length(lightPos - frag_pos.xyz);
                float attenuation = 1.0 / (a + b * distance + c * distance * distance);
                intensity += lights[i].color * lights[i].illuminance * attenuation;
            }
        }
        else if (lights[i].type == SPOTLIGHT) {
            vec3 lightPos = (W2C * vec4(lights[i].pos, 1.0)).xyz;
            vec3 lightDir = (W2C * vec4(lights[i].dir, 0.0)).xyz;
            vec3 frag2light = lightPos - frag_pos.xyz;
            float dotProduct = dot(normalize(-frag2light), normalize(lightDir));
            float anglee = acos(dotProduct);
            if (
                // dot(frag2light, frag_normal.xyz) >= 0.0 &&
                anglee <= lights[i].angle
            ) intensity += lights[i].color * lights[i].illuminance * pow(max(dotProduct, 0.0), lights[i].angleSmoothness);
        }
        else if (lights[i].type == AMBIENT) {
            // TODO: implement ambient reflection
            intensity += lights[i].color * lights[i].illuminance * reflectivity;
        }
    }
    
    output_color = vec4(mainColor * intensity, 1.0);
    
    output_color.rgb = pow(output_color.rgb, vec3(1.0 / 2.2));  // Gamma correction
}

