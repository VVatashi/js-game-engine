#version 300 es

uniform mat4 projectionMatrix;

layout(location = 0) in vec2 position;
layout(location = 1) in vec2 texCoords;
layout(location = 2) in vec4 color;

out vec2 fragPosition;
out vec2 fragTexCoords;
out vec4 fragColor;

void main() {
    gl_Position = projectionMatrix * vec4(position, 0.0, 1.0);

    fragPosition = position;
    fragTexCoords = texCoords;
    fragColor = color;
}
