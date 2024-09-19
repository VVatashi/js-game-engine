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

    /**
     * @param {WebGL2RenderingContext} context
     * @param {string} data
     * @param {Object} options
     * @param {number|false|null} options.positionElements
     * @param {number|false|null} options.texCoordElements
     * @param {number|false|null} options.normalElements
     */
    static createFromObj(context, data, options = {}) {
        options = {
            positionElements: 3,
            texCoordElements: 2,
            normalElements: 3,
            ...options,
        };

        const vertexData = [];

        const vertices = [];
        const texCoords = [];
        const normals = [];

        const lines = data.split('\n');
        for (const line of lines) {
            const [command, ...values] = line.trim().split(' ');
            switch (command) {
                case 'v':
                    if (Number(options.positionElements) > 0)
                        vertices.push(values.slice(0, options.positionElements).map(Number.parseFloat));
                    break;

                case 'vt':
                    if (Number(options.texCoordElements) > 0)
                        texCoords.push(values.slice(0, options.texCoordElements).map(Number.parseFloat));
                    break;

                case 'vn':
                    if (Number(options.normalElements) > 0) normals.push(values.slice(0, options.normalElements).map(Number.parseFloat));
                    break;

                case 'f':
                    const indexes = values.length === 3 ? [0, 1, 2] : values.length === 4 ? [0, 1, 2, 0, 2, 3] : [];

                    for (const index of indexes) {
                        const [vertexIndex, texCoordIndex, normalIndex] = values[index].split('/');

                        if (Number(options.positionElements) > 0) vertexData.push(...vertices[vertexIndex - 1]);
                        if (Number(options.texCoordElements) > 0) vertexData.push(...texCoords[texCoordIndex - 1]);
                        if (Number(options.normalElements) > 0) vertexData.push(...normals[normalIndex - 1]);
                    }
                    break;
            }
        }

        const attributes = [];
        const stride = (options.positionElements + options.texCoordElements + options.normalElements) * Float32Array.BYTES_PER_ELEMENT;

        if (options.positionElements > 0)
            attributes.push({ index: 0, elements: options.positionElements, type: context.FLOAT, normalized: false, stride, offset: 0 });

        if (options.texCoordElements > 0)
            attributes.push({
                index: 1,
                elements: options.texCoordElements,
                type: context.FLOAT,
                normalized: false,
                stride,
                offset: options.positionElements * Float32Array.BYTES_PER_ELEMENT,
            });

        if (options.normalElements > 0)
            attributes.push({
                index: 2,
                elements: options.normalElements,
                type: context.FLOAT,
                normalized: false,
                stride,
                offset: (options.positionElements + options.texCoordElements) * Float32Array.BYTES_PER_ELEMENT,
            });

        return new Mesh(context, new Float32Array(vertexData), ...attributes);
    }

    /**
     * @param {string} src
     * @param {Object} options
     * @param {number|false|null} options.positionElements
     * @param {number|false|null} options.texCoordElements
     * @param {number|false|null} options.normalElements
     */
    static async createFromObjUrl(context, src, options = {}) {
        const response = await fetch(src);
        return Mesh.createFromObj(context, await response.text(), options);
    }

    draw() {
        this.vertexArray.draw(this.vertexCount);
    }
}

export default Mesh;
