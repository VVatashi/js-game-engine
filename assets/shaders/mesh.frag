#version 300 es

precision mediump float;

uniform vec3 lightDirection;

uniform sampler2D diffuseTexture;

in vec3 fragPosition;
in vec2 fragTexCoords;
in vec3 fragNormal;

in vec4 fragAmbientColor;
in vec4 fragDiffuseColor;
in vec4 fragSpecularColor;

out vec4 color;

void main() {
    float diffuse = max(0.0, dot(fragNormal, lightDirection));

    color = fragAmbientColor + diffuse * fragDiffuseColor * texture(diffuseTexture, fragTexCoords);
}
