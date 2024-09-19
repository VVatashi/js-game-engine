import { dot } from '../node_modules/@vvatashi/js-vec-math/src/vec4.js';

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
                result[j + 4 * i] = dot(a.getRow(i), b.getColumn(j));
            }
        }

        return result;
    }
}

export default Matrix4;
