#version 300 es
precision highp float;

#define DIRECTIONAL 0
#define POINT 1
#define SPOTLIGHT 2
#define AMBIENT 3

in vec4 frag_pos;
in vec4 frag_normal;
in vec4 frag_tangent;
in vec2 bumpCoord;

out vec4 output_color;

uniform mat4 cameraTransform;

uniform vec3 mainColor;
uniform vec3 reflectivity;
uniform float shininess;
uniform int useBumpMap;
uniform sampler2D bumpMap;

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

    vec3 V = - normalize(frag_pos.xyz);

    vec3 N;
    if (useBumpMap==1) {
        float bump = length(texture(bumpMap, bumpCoord).rgb) / sqrt(3.0);
        N = normalize(bump * frag_normal.xyz + (1.0-bump) * frag_tangent.xyz);
    }
    else N = normalize(frag_normal.xyz);
    
    for (int i=0; i<numLights; i++){
        Light l = lights[i];

        if (l.enabled == false) continue;

        if (l.type == AMBIENT) {
            intensity += l.color * l.illuminance * reflectivity;
            continue;
        }

        vec3 lDir = (W2C * vec4(l.dir, 0.0)).xyz;
        vec3 lPos = (W2C * vec4(l.pos, 1.0)).xyz;

        vec3 L;
        if (l.type == DIRECTIONAL) L = - normalize((W2C * vec4(l.dir, 0.0)).xyz);
        else L = normalize((W2C * vec4(l.pos, 1.0)).xyz - frag_pos.xyz);
        
        vec3 H = normalize(L + V);

        float diffuse = max(dot(N, L), 0.0);
        float specular = pow(max(dot(N, H), 0.0), shininess);
        
        if (l.type == DIRECTIONAL) {
            intensity += l.color * min(max((diffuse + specular) * l.illuminance, 0.0), 1.0) * reflectivity;
            continue;
        }

        if (dot(L, frag_normal.xyz) < 0.0) continue;

        float a = 1.0, b = 0.1, c = 1.0;
        float distance = length(lPos - frag_pos.xyz);
        float attenuation = 1.0 / (a + b * distance + c * distance * distance);

        if (l.type == POINT) {
            intensity += l.color * min(max((diffuse + specular) * l.illuminance, 0.0), 1.0) * attenuation;
        }
        else if (l.type == SPOTLIGHT) {
            float dotProduct = dot(-L, normalize(lDir));
            float anglee = acos(dotProduct);
            if (anglee <= l.angle) intensity += l.color * min(max((diffuse + specular) * l.illuminance, 0.0), 1.0) * pow(max(dotProduct, 0.0), l.angleSmoothness) * attenuation;
        }
    }
    
    output_color = vec4(mainColor * intensity, 1.0);
    
    output_color.rgb = pow(output_color.rgb, vec3(1.0 / 2.2));  // Gamma correction
}

