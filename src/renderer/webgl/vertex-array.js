export class VertexAttribute {
    /**
     * @param {number} index
     * @param {number} elements
     * @param {number} type
     * @param {boolean} normalized
     * @param {number} stride
     * @param {number} offset
     */
    constructor(index, elements, type, normalized, stride, offset) {
        this.index = index;
        this.elements = elements;
        this.type = type;
        this.normalized = normalized;
        this.stride = stride;
        this.offset = offset;
    }
}

export class VertexArray {
    /**
     * @param {WebGL2RenderingContext} context
     */
    constructor(context) {
        const handle = context.createVertexArray();
        this.context = context;
        this.handle = handle;
    }

    bind() {
        const { context, handle } = this;
        context.bindVertexArray(handle);

        return this;
    }

    unbind() {
        const { context } = this;
        context.bindVertexArray(null);

        return this;
    }

    /**
     * @param {Buffer} buffer
     * @param {VertexAttribute[]} vertexAttributes
     */
    attachBuffer(buffer, ...vertexAttributes) {
        const { context } = this;
        this.bind();
        buffer.bind();
        for (const vertexAttribute of vertexAttributes) {
            context.enableVertexAttribArray(vertexAttribute.index);
            context.vertexAttribPointer(vertexAttribute.index, vertexAttribute.elements, vertexAttribute.type, vertexAttribute.normalized, vertexAttribute.stride, vertexAttribute.offset);
        }

        this.unbind();

        return this;
    }

    /**
     * @param {number} vertexCount
     * @param {number} offset
     * @param {number} mode
     */
    draw(vertexCount, offset = 0, mode = undefined) {
        const { context } = this;
        mode = mode || context.TRIANGLES;
        this.bind();
        context.drawArrays(mode, offset, vertexCount);
        this.unbind();

        return this;
    }

    delete() {
        const { context, handle } = this;
        if (handle !== null) {
            context.deleteVertexArray(handle);
            this.handle = null;
        }
    }
}

export default VertexArray;
