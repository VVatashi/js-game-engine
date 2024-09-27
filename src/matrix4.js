import { Vec3 } from '../node_modules/@vvatashi/js-vec-math/src/vec3.js';
import { Vec4 } from '../node_modules/@vvatashi/js-vec-math/src/vec4.js';

export class Matrix4 extends Float32Array {
    static createIdentity() {
        // prettier-ignore
        return new Matrix4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ]);
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    static createTranslation(x, y, z) {
        // prettier-ignore
        return new Matrix4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1,
        ]);
    }

    /**
     * @param {number} angle
     */
    static createRotationX(angle) {
        const sinAngle = Math.sin(angle);
        const cosAngle = Math.cos(angle);

        // prettier-ignore
        return new Matrix4([
            1,         0,        0, 0,
            0,  cosAngle, sinAngle, 0,
            0, -sinAngle, cosAngle, 0,
            0,         0,        0, 1,
        ]);
    }

    /**
     * @param {number} angle
     */
    static createRotationY(angle) {
        const sinAngle = Math.sin(angle);
        const cosAngle = Math.cos(angle);

        // prettier-ignore
        return new Matrix4([
            cosAngle, 0, -sinAngle, 0,
                   0, 1,         0, 0,
            sinAngle, 0,  cosAngle, 0,
                   0, 0,         0, 1,
        ]);
    }

    /**
     * @param {number} angle
     */
    static createRotationZ(angle) {
        const sinAngle = Math.sin(angle);
        const cosAngle = Math.cos(angle);

        // prettier-ignore
        return new Matrix4([
             cosAngle, sinAngle, 0, 0,
            -sinAngle, cosAngle, 0, 0,
                    0,        0, 1, 0,
                    0,        0, 0, 1,
        ]);
    }

    /**
     * @param {number} scale
     */
    static createScale(scale) {
        // prettier-ignore
        return new Matrix4([
            scale,     0,     0, 0,
                0, scale,     0, 0,
                0,     0, scale, 0,
                0,     0,     0, 1,
        ]);
    }

    static createOrthographicOffCenter(left, right, bottom, top, near, far) {
        const leftRight = 1 / (left - right);
        const bottomTop = 1 / (bottom - top);
        const nearFar = 1 / (near - far);

        const scaleX = -2 * leftRight;
        const scaleY = -2 * bottomTop;
        const scaleZ = 2 * nearFar;

        const translateX = (left + right) * leftRight;
        const translateY = (top + bottom) * bottomTop;
        const translateZ = (far + near) * nearFar;

        // prettier-ignore
        return new Matrix4([
                scaleX,          0,          0, 0,
                     0,     scaleY,          0, 0,
                     0,          0,     scaleZ, 0,
            translateX, translateY, translateZ, 1,
        ]);
    }

    static createPerspectiveFieldOfView(fovY, aspectRatio, near, far) {
        const top = Math.tan(fovY / 2) * near;
        const right = top * aspectRatio;

        // prettier-ignore
        return new Matrix4([
            near / right,          0,                                0,  0,
                       0, near / top,                                0,  0,
                       0,          0,     -(far + near) / (far - near), -1,
                       0,          0, -2 * (far * near) / (far - near),  0,
        ]);
    }

    /**
     * @param {number[]|Float32Array|Vec3} position
     * @param {number[]|Float32Array|Vec3} target
     * @param {number[]|Float32Array|Vec3} up
     */
    static lookAt(position, target, up) {
        const forward = new Vec3(position).subtract(target).normalize();
        const right = new Vec3(up).cross(forward).normalize();
        const cameraUp = new Vec3(forward).cross(right).normalize();
        const translation = [Vec3.dot(position, right), Vec3.dot(position, up), Vec3.dot(position, forward)];

        // prettier-ignore
        return new Matrix4([
                    right.x,      cameraUp.x,       forward.x, 0,
                    right.y,      cameraUp.y,       forward.y, 0,
                    right.z,      cameraUp.z,       forward.z, 0,
            -translation[0], -translation[1], -translation[2], 1,
        ]);
    }

    getRow(index) {
        return [this[4 * index], this[4 * index + 1], this[4 * index + 2], this[4 * index + 3]];
    }

    getColumn(index) {
        return [this[index], this[index + 4], this[index + 8], this[index + 12]];
    }

    static multiply(a, b) {
        const result = new Matrix4(16);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result[j + 4 * i] = Vec4.dot(a.getRow(i), b.getColumn(j));
            }
        }

        return result;
    }
}

export default Matrix4;
