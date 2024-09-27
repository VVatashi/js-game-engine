#version 300 es

precision mediump float;

uniform sampler2D colorTexture;

in vec3 fragPosition;
in vec2 fragTexCoords;
in vec3 fragNormal;

out vec4 color;

void main() {
    float ambient = 0.2;
    float diffuse = 0.8 * max(0.0, dot(fragNormal, normalize(vec3(2, 3, 1))));

    color = (ambient + diffuse) * texture(colorTexture, fragTexCoords);
}
