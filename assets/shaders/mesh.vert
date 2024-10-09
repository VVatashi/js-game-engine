#version 300 es

uniform mat4 modelViewProjectionMatrix;

uniform vec4 ambientColor;
uniform vec4 diffuseColor;
uniform vec4 specularColor;

layout(location = 0) in vec3 position;
layout(location = 1) in vec2 texCoords;
layout(location = 2) in vec3 normal;

out vec3 fragPosition;
out vec2 fragTexCoords;
out vec3 fragNormal;

out vec4 fragAmbientColor;
out vec4 fragDiffuseColor;
out vec4 fragSpecularColor;

void main() {
    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);

    fragPosition = position;
    fragTexCoords = texCoords;
    fragNormal = normal;

    fragAmbientColor = ambientColor;
    fragDiffuseColor = diffuseColor;
    fragSpecularColor = specularColor;
}
