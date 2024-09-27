import { Vec3 } from '@vvatashi/js-vec-math/src/vec3.js';
import { Vec4 } from '@vvatashi/js-vec-math/src/vec4.js';

/**
 * @param {number[]|Float32Array} a
 */
export function det2(a) {
    return a[0] * a[3] - a[1] * a[2];
}

/**
 * @param {number[]|Float32Array} a
 */
export function det3(a) {
    return a[0] * a[4] * a[8] + a[1] * a[5] * a[6] + a[2] * a[3] * a[7] - a[2] * a[4] * a[6] - a[1] * a[3] * a[8] - a[0] * a[5] * a[7];
}

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
        const translationX = Vec3.dot(position, right);
        const translationY = Vec3.dot(position, up);
        const translationZ = Vec3.dot(position, forward);

        // prettier-ignore
        return new Matrix4([
                  right.x,    cameraUp.x,     forward.x, 0,
                  right.y,    cameraUp.y,     forward.y, 0,
                  right.z,    cameraUp.z,     forward.z, 0,
            -translationX, -translationY, -translationZ, 1,
        ]);
    }

    /**
     * @param {Matrix4} a
     * @param {Matrix4} b
     */
    static multiply(a, b) {
        const result = new Matrix4(16);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result[j + 4 * i] = Vec4.dot(a.getRow(i), b.getColumn(j));
            }
        }

        return result;
    }

    /**
     * @param {number} index
     */
    getRow(index) {
        return [this[4 * index], this[4 * index + 1], this[4 * index + 2], this[4 * index + 3]];
    }

    /**
     * @param {number} index
     */
    getColumn(index) {
        return [this[index], this[index + 4], this[index + 8], this[index + 12]];
    }

    /**
     * @param {number} i
     * @param {number} j
     */
    getMinor(i, j) {
        return det3(this.filter((_, index) => index % 4 !== j).filter((_, index) => Math.floor(index / 3) !== i));
    }

    /**
     * @param {number} value
     */
    multiply(value) {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                this[j + 4 * i] *= value;
            }
        }

        return this;
    }

    /**
     * @param {number[]|Float32Array|Vec4} value
     */
    transform(value) {
        return new Vec4([
            Vec4.dot(this.getColumn(0), value),
            Vec4.dot(this.getColumn(1), value),
            Vec4.dot(this.getColumn(2), value),
            Vec4.dot(this.getColumn(3), value),
        ]);
    }

    transpose() {
        // prettier-ignore
        return new Matrix4([
            this[0], this[4],  this[8], this[12],
            this[1], this[5],  this[9], this[13],
            this[2], this[6], this[10], this[14],
            this[3], this[7], this[11], this[15],
        ]);
    }

    determinant() {
        return (
            this[0] * this.getMinor(0, 0) - this[1] * this.getMinor(0, 1) + this[2] * this.getMinor(0, 2) - this[3] * this.getMinor(0, 3)
        );
    }

    cofactor() {
        // prettier-ignore
        return new Matrix4([
            this.getMinor(0, 0), -this.getMinor(0, 1), this.getMinor(0, 2), -this.getMinor(0, 3),
            -this.getMinor(1, 0), this.getMinor(1, 1), -this.getMinor(1, 2), this.getMinor(1, 3),
            this.getMinor(2, 0), -this.getMinor(2, 1), this.getMinor(2, 2), -this.getMinor(2, 3),
            -this.getMinor(3, 0), this.getMinor(3, 1), -this.getMinor(3, 2), this.getMinor(3, 3),
        ]);
    }

    adjugate() {
        return this.cofactor().transpose();
    }

    invert() {
        const determinant = this.determinant();
        if (determinant === 0) {
            return null;
        }

        return this.adjugate().multiply(1 / determinant);
    }
}

export default Matrix4;
