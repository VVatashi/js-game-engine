#version 300 es

precision mediump float;

uniform sampler2D colorTexture;

in vec3 fragPosition;
in vec2 fragTexCoords;
in vec3 fragNormal;

out vec4 color;

void main() {
    float d = 0.2 + 0.8 * max(dot(normalize(fragNormal), normalize(vec3(1, 1, 1))), 0.0);
    color = vec4(d, d, d, 1) * texture(colorTexture, fragTexCoords);
}
