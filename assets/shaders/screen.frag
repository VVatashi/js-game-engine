#version 300 es

#define GAMMA 2.2

precision mediump float;

uniform sampler2D colorTexture;

in vec2 fragTexCoords;

out vec4 color;

void main() {
    vec3 result = texture(colorTexture, fragTexCoords).rgb;
    color = vec4(pow(result, vec3(1.0 / GAMMA)), 1.0);
}
