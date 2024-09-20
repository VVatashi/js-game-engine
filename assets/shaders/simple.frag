#version 300 es

precision mediump float;

uniform sampler2D colorTexture;

in vec2 fragPosition;
in vec2 fragTexCoords;
in vec4 fragColor;

out vec4 color;

void main() {
    color = fragColor * texture(colorTexture, fragTexCoords);
}
