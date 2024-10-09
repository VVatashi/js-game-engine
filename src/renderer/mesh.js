import VertexArray from './webgl/vertex-array.js';
import VertexBuffer from './webgl/vertex-buffer.js';

export class Mesh {
    /**
     * @param {WebGL2RenderingContext} context
     * @param {Float32Array} vertexData
     * @param {VertexAttribute[]} attributes
     */
    constructor(context, vertexData, ...attributes) {
        if (attributes.length === 0) throw new Error('At least one vertex attribute is required');

        this.context = context;

        this.vertexBuffer = new VertexBuffer(context, context.ARRAY_BUFFER, vertexData);
        this.vertexArray = new VertexArray(context).attachBuffer(this.vertexBuffer, ...attributes);

        this.vertexCount = vertexData.length / (attributes[0].stride / Float32Array.BYTES_PER_ELEMENT);
    }

    draw() {
        this.vertexArray.draw(this.vertexCount);
    }
}

export default Mesh;
