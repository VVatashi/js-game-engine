import { Vec2 } from '../../node_modules/@vvatashi/js-vec-math/src/vec2.js';
import VertexArray from './webgl/vertex-array.js';
import VertexBuffer from './webgl/vertex-buffer.js';

const MAX_VERTEX_DATA_LENGTH = 65535;
const ELEMENTS_PER_VERTEX = 8;

const DEFAULT_MITER_THRESHOLD = Math.cos((11 * Math.PI) / 180); // cos(11 deg)

export class VectorRenderer {
    /**
     * @param {WebGL2RenderingContext} context
     */
    constructor(context) {
        this.context = context;
        this.vertexes = new Float32Array(MAX_VERTEX_DATA_LENGTH);
        this.vertexBuffer = new VertexBuffer(context, context.ARRAY_BUFFER, this.vertexes, { usage: context.DYNAMIC_DRAW });

        // prettier-ignore
        this.vertexArray = new VertexArray(context).attachBuffer(
            this.vertexBuffer,
            { index: 0, elements: 2, type: this.context.FLOAT, normalized: false, stride: ELEMENTS_PER_VERTEX * Float32Array.BYTES_PER_ELEMENT, offset: 0 },
            { index: 1, elements: 2, type: this.context.FLOAT, normalized: false, stride: ELEMENTS_PER_VERTEX * Float32Array.BYTES_PER_ELEMENT, offset: 2 * Float32Array.BYTES_PER_ELEMENT },
            { index: 2, elements: 4, type: this.context.FLOAT, normalized: false, stride: ELEMENTS_PER_VERTEX * Float32Array.BYTES_PER_ELEMENT, offset: 4 * Float32Array.BYTES_PER_ELEMENT }
        );

        this.vertexCount = 0;
    }

    begin() {
        this.vertexCount = 0;

        return this;
    }

    /**
     * @param {Vec2|Float32Array|number[]} start
     * @param {Vec2|Float32Array|number[]} end
     * @param {Object} options
     * @param {number} options.width
     * @param {number} options.r
     * @param {number} options.g
     * @param {number} options.b
     * @param {number} options.a
     */
    drawLine(start, end, options = {}) {
        start = new Vec2(start);
        end = new Vec2(end);
        options = { width: 1, r: 1, g: 1, b: 1, a: 1, ...options };

        const perpendicular = new Vec2(end)
            .subtract(start)
            .normalize()
            .perpendicularLeft()
            .multiply(options.width / 2);

        // prettier-ignore
        this.vertexes.set([
            start[0] - perpendicular[0], start[1] - perpendicular[1], 0, 1, options.r, options.g, options.b, options.a,
            end[0] + perpendicular[0], end[1] + perpendicular[1], 1, 0, options.r, options.g, options.b, options.a,
            end[0] - perpendicular[0], end[1] - perpendicular[1], 1, 1, options.r, options.g, options.b, options.a,

            start[0] - perpendicular[0], start[1] - perpendicular[1], 0, 1, options.r, options.g, options.b, options.a,
            start[0] + perpendicular[0], start[1] + perpendicular[1], 0, 0, options.r, options.g, options.b, options.a,
            end[0] + perpendicular[0], end[1] + perpendicular[1], 1, 0, options.r, options.g, options.b, options.a,
        ], this.vertexCount * ELEMENTS_PER_VERTEX);

        this.vertexCount += 6;

        return this;
    }

    /**
     * @param {Vec2[]|Float32Array[]|number[][]} points
     * @param {Object} options
     * @param {number} options.width
     * @param {boolean} options.loop
     * @param {'bevel'|false|null} options.linecap
     * @param {number} options.miterThreshold
     * @param {number} options.r
     * @param {number} options.g
     * @param {number} options.b
     * @param {number} options.a
     */
    drawLineStrip(points, options = {}) {
        if (points.length < 2) return this;

        options = { width: 1, r: 1, g: 1, b: 1, a: 1, loop: false, linecap: 'bevel', miterThreshold: DEFAULT_MITER_THRESHOLD, ...options };

        const halfWidth = options.width / 2;

        const start = new Vec2();
        const end = new Vec2();
        const next = new Vec2();
        const perpendicular = new Vec2();

        for (let i = 0; i < points.length - 1; i++) {
            start[0] = points[i][0];
            start[1] = points[i][1];

            end[0] = points[i + 1][0];
            end[1] = points[i + 1][1];

            perpendicular[0] = end[0];
            perpendicular[1] = end[1];
            perpendicular.subtract(start).normalize().perpendicularLeft();

            // prettier-ignore
            this.vertexes.set([
                start[0] - perpendicular[0] * halfWidth, start[1] - perpendicular[1] * halfWidth, 0, 1, options.r, options.g, options.b, options.a,
                end[0] + perpendicular[0] * halfWidth, end[1] + perpendicular[1] * halfWidth, 1, 0, options.r, options.g, options.b, options.a,
                end[0] - perpendicular[0] * halfWidth, end[1] - perpendicular[1] * halfWidth, 1, 1, options.r, options.g, options.b, options.a,

                start[0] - perpendicular[0] * halfWidth, start[1] - perpendicular[1] * halfWidth, 0, 1, options.r, options.g, options.b, options.a,
                start[0] + perpendicular[0] * halfWidth, start[1] + perpendicular[1] * halfWidth, 0, 0, options.r, options.g, options.b, options.a,
                end[0] + perpendicular[0] * halfWidth, end[1] + perpendicular[1] * halfWidth, 1, 0, options.r, options.g, options.b, options.a,
            ], this.vertexCount * ELEMENTS_PER_VERTEX);

            this.vertexCount += 6;

            if (options.linecap === 'bevel' && i < points.length - 2) {
                next[0] = points[i + 2][0];
                next[1] = points[i + 2][1];

                const nextPerpendicular = new Vec2(next).subtract(end).normalize().perpendicularLeft();

                // prettier-ignore
                this.vertexes.set([
                    end[0], end[1], 1, 0, options.r, options.g, options.b, options.a,
                    end[0] - nextPerpendicular[0] * halfWidth, end[1] - nextPerpendicular[1] * halfWidth, 1, 1, options.r, options.g, options.b, options.a,
                    end[0] - perpendicular[0] * halfWidth, end[1] - perpendicular[1] * halfWidth, 0, 1, options.r, options.g, options.b, options.a,

                    end[0], end[1], 0, 1, options.r, options.g, options.b, options.a,
                    end[0] + perpendicular[0] * halfWidth, end[1] + perpendicular[1] * halfWidth, 0, 0, options.r, options.g, options.b, options.a,
                    end[0] + nextPerpendicular[0] * halfWidth, end[1] + nextPerpendicular[1] * halfWidth, 1, 0, options.r, options.g, options.b, options.a,
                ], this.vertexCount * ELEMENTS_PER_VERTEX);

                this.vertexCount += 6;
            }
        }

        if (options.loop && points.length > 2) {
            start[0] = points[points.length - 1][0];
            start[1] = points[points.length - 1][1];

            end[0] = points[0][0];
            end[1] = points[0][1];

            perpendicular[0] = end[0];
            perpendicular[1] = end[1];
            perpendicular.subtract(start).normalize().perpendicularLeft();

            // prettier-ignore
            this.vertexes.set([
                start[0] - perpendicular[0] * halfWidth, start[1] - perpendicular[1] * halfWidth, 0, 1, options.r, options.g, options.b, options.a,
                end[0] + perpendicular[0] * halfWidth, end[1] + perpendicular[1] * halfWidth, 1, 0, options.r, options.g, options.b, options.a,
                end[0] - perpendicular[0] * halfWidth, end[1] - perpendicular[1] * halfWidth, 1, 1, options.r, options.g, options.b, options.a,

                start[0] - perpendicular[0] * halfWidth, start[1] - perpendicular[1] * halfWidth, 0, 1, options.r, options.g, options.b, options.a,
                start[0] + perpendicular[0] * halfWidth, start[1] + perpendicular[1] * halfWidth, 0, 0, options.r, options.g, options.b, options.a,
                end[0] + perpendicular[0] * halfWidth, end[1] + perpendicular[1] * halfWidth, 1, 0, options.r, options.g, options.b, options.a,
            ], this.vertexCount * ELEMENTS_PER_VERTEX);

            this.vertexCount += 6;

            if (options.linecap === 'bevel') {
                const prevPerpendicular = new Vec2(start)
                    .subtract(points[points.length - 2])
                    .normalize()
                    .perpendicularLeft();

                // prettier-ignore
                this.vertexes.set([
                    start[0], start[1], 1, 0, options.r, options.g, options.b, options.a,
                    start[0] - perpendicular[0] * halfWidth, start[1] - perpendicular[1] * halfWidth, 1, 1, options.r, options.g, options.b, options.a,
                    start[0] - prevPerpendicular[0] * halfWidth, start[1] - prevPerpendicular[1] * halfWidth, 0, 1, options.r, options.g, options.b, options.a,

                    start[0], start[1], 0, 1, options.r, options.g, options.b, options.a,
                    start[0] + prevPerpendicular[0] * halfWidth, start[1] + prevPerpendicular[1] * halfWidth, 0, 0, options.r, options.g, options.b, options.a,
                    start[0] + perpendicular[0] * halfWidth, start[1] + perpendicular[1] * halfWidth, 1, 0, options.r, options.g, options.b, options.a,
                ], this.vertexCount * ELEMENTS_PER_VERTEX);

                this.vertexCount += 6;

                const nextPerpendicular = new Vec2(points[1]).subtract(end).normalize().perpendicularLeft();

                // prettier-ignore
                this.vertexes.set([
                    end[0], end[1], 1, 0, options.r, options.g, options.b, options.a,
                    end[0] - nextPerpendicular[0] * halfWidth, end[1] - nextPerpendicular[1] * halfWidth, 1, 1, options.r, options.g, options.b, options.a,
                    end[0] - perpendicular[0] * halfWidth, end[1] - perpendicular[1] * halfWidth, 0, 1, options.r, options.g, options.b, options.a,

                    end[0], end[1], 0, 1, options.r, options.g, options.b, options.a,
                    end[0] + perpendicular[0] * halfWidth, end[1] + perpendicular[1] * halfWidth, 0, 0, options.r, options.g, options.b, options.a,
                    end[0] + nextPerpendicular[0] * halfWidth, end[1] + nextPerpendicular[1] * halfWidth, 1, 0, options.r, options.g, options.b, options.a,
                ], this.vertexCount * ELEMENTS_PER_VERTEX);

                this.vertexCount += 6;
            }
        }

        return this;
    }

    end() {
        if (this.vertexCount === 0) return;

        this.vertexBuffer.setDataRange(this.vertexes, 0, this.vertexCount * ELEMENTS_PER_VERTEX);
        this.vertexArray.draw(this.vertexCount);

        return this;
    }
}

export default VectorRenderer;
