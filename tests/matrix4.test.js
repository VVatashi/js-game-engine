import { expect, it } from '@jest/globals';
import Matrix4, { det2, det3 } from '../src/matrix4.js';

it.each([
    [
        // prettier-ignore
        [
             3, 7,
            1, -4,
        ],
        -19,
    ],
    [
        // prettier-ignore
        [
             1, 3,
            -2, 5,
        ],
        11,
    ],
])('expect det2%j to be %p', (value, expected) => {
    // Act
    const determinant = det2(value);

    // Assert
    expect(determinant).toStrictEqual(expected);
});

it.each([
    [
        // prettier-ignore
        [
            -2, -1, 2,
             2,  1, 4,
            -3,  3, -1,
        ],
        54,
    ],
])('expect det3%j to be %p', (value, expected) => {
    // Act
    const determinant = det3(value);

    // Assert
    expect(determinant).toStrictEqual(expected);
});

it.each([
    [
        // prettier-ignore
        [
            0,  1,  2,  3,
            4,  5,  6,  7,
            8,  9, 10, 11,
           12, 13, 14, 15,
        ],
        // prettier-ignore
        [
            0, 4,  8, 12,
            1, 5,  9, 13,
            2, 6, 10, 14,
            3, 7, 11, 15,
        ],
    ],
])('expect transpose%j to be %p', (value, expected) => {
    // Act
    const transpose = new Matrix4(value).transpose();

    // Assert
    expect([...transpose]).toStrictEqual(expected);
});

it.each([
    [
        // prettier-ignore
        [
             1, 0,  4, -6,
             2, 5,  0,  3,
            -1, 2,  3,  5,
             2, 1, -2,  3,
        ],
        318,
    ],
])('expect determinant%j to be %p', (value, expected) => {
    // Act
    const determinant = new Matrix4(value).determinant();

    // Assert
    expect(determinant).toStrictEqual(expected);
});

it.each([
    [Matrix4.createIdentity(), Matrix4.createIdentity()],
    [Matrix4.createScale(2), Matrix4.createScale(0.5)],
    [Matrix4.createTranslation(1, 2, 3), Matrix4.createTranslation(-1, -2, -3)],
    [Matrix4.createRotationY(Math.PI / 3), Matrix4.createRotationY(-Math.PI / 3)],
])('expect invert%j to be %p', (value, expected) => {
    // Act
    const invert = new Matrix4(value).invert();

    // Assert
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            expect(invert[j + 4 * i]).toBeCloseTo(expected[j + 4 * i]);
        }
    }
});

it.each([
    [Matrix4.createTranslation(1, 2, 3), [0, 0, 0, 1], [1, 2, 3, 1]],
    [Matrix4.createScale(2), [1, 2, 3, 1], [2, 4, 6, 1]],
    [Matrix4.createRotationX(Math.PI / 2), [1, 2, 3, 1], [1, -3, 2, 1]],
])('expect transform(%j,%j) to be %p', (matrix, value, expected) => {
    // Act
    const result = matrix.transform(value);

    // Assert
    expect([...result]).toStrictEqual([...expected]);
});
