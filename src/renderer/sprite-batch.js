import VertexArray from './webgl/vertex-array.js';
import VertexBuffer from './webgl/vertex-buffer.js';

const MAX_VERTEX_DATA_LENGTH = 65535;
const ELEMENTS_PER_VERTEX = 8;

export class SpriteBatch {
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
     *
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @param {Object} options
     */
    drawRectangle(x, y, width, height, options = {}) {
        options = { r: 1, g: 1, b: 1, a: 1, ...options };

        // prettier-ignore
        this.vertexes.set([
            x, y, 0, 1, options.r, options.g, options.b, options.a,
            x + width, y + height, 1, 0, options.r, options.g, options.b, options.a,
            x + width, y, 1, 1, options.r, options.g, options.b, options.a,

            x, y, 0, 1, options.r, options.g, options.b, options. a,
            x, y + height, 0, 0, options.r, options.g, options.b, options.a,
            x + width, y + height, 1, 0, options.r, options.g, options.b, options.a,
        ], this.vertexCount * ELEMENTS_PER_VERTEX);

        this.vertexCount += 6;

        return this;
    }

    end() {
        if (this.vertexCount === 0) return;

        this.vertexBuffer.setDataRange(this.vertexes, 0, this.vertexCount * ELEMENTS_PER_VERTEX);
        this.vertexArray.draw(this.vertexCount);

        return this;
    }
}

export default SpriteBatch;
