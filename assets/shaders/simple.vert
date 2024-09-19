#version 300 es

uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;

layout(location = 0) in vec3 position;
layout(location = 1) in vec2 texCoords;
layout(location = 2) in vec3 normal;

out vec3 fragPosition;
out vec2 fragTexCoords;
out vec3 fragNormal;

void main() {
    gl_Position = projectionMatrix * modelMatrix * vec4(position, 1);

    fragPosition = position;
    fragTexCoords = texCoords;
    fragNormal = mat3(transpose(inverse(modelMatrix))) * normal;
}
