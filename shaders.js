const vertex = `#version 300 es

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;

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
