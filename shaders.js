const vertex = `#version 300 es



layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec3 aNormal;

uniform mat4 tMatrix;
uniform mat4 vMatrix;
uniform mat4 pMatrix;


out vec2 vTexCoord;



void main() {
    

    vTexCoord = aTexCoord;

    gl_Position = pMatrix * vMatrix * tMatrix * aPosition;
}
`;

const fragment = `#version 300 es
precision mediump float;

uniform mediump sampler2D uTexture;

in vec2 vTexCoord;


out vec4 oColor;

void main() {
    oColor = texture(uTexture, vTexCoord);

}
`;

export const shaders = {
    simple: { vertex, fragment }
};


/* const vertex = `#version 300 es

const vec3 lightDirection = normalize(vec3(0, 3, 10));
const float ambient = 0.4;

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec3 aNormal;

uniform mat4 tMatrix;
uniform mat4 vMatrix;
uniform mat4 pMatrix;


out vec2 vTexCoord;
out float vBrightness;


void main() {
    mat4 normalMatrix = vMatrix * tMatrix;
    normalMatrix = inverse(normalMatrix);
    normalMatrix = transpose(normalMatrix);

    vec3 worldNormal = (normalMatrix * vec4(aNormal, 1)).xyz;
    float diffuse = max(0.0, dot(worldNormal, lightDirection));

    vBrightness = ambient + diffuse;

    vTexCoord = aTexCoord;

    gl_Position = pMatrix * vMatrix * tMatrix * aPosition;
}
`;

const fragment = `#version 300 es
precision mediump float;

uniform mediump sampler2D uTexture;

in vec2 vTexCoord;
in float vBrightness;

out vec4 oColor;

void main() {
    vec4 texel = texture(uTexture, vTexCoord);
    texel.xyz *= vBrightness;
    oColor = texel;
}
`;

export const shaders = {
    simple: { vertex, fragment }
}; */
