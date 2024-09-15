export class VertexBuffer {
    /**
     * @param {WebGL2RenderingContext} context
     * @param {number} type
     * @param {Float64Array|Float32Array|Uint32Array|Uint16Array|Uint8Array|Int32Array|Int16Array|Int8Array} data
     * @param {Object} options
     * @param {number} options.usage
     */
    constructor(context, type, data, options = {}) {
        options = { usage: context.STATIC_DRAW, ...options };
        const handle = context.createBuffer();
        context.bindBuffer(type, handle);
        context.bufferData(type, data, options.usage);

        this.context = context;
        this.handle = handle;
        this.type = type;
        this.usage = options.usage;
    }

    bind() {
        const { context, handle, type } = this;
        context.bindBuffer(type, handle);

        return this;
    }

    /**
     * @param {Float64Array|Float32Array|Uint32Array|Uint16Array|Uint8Array|Int32Array|Int16Array|Int8Array} data
     */
    setData(data) {
        const { context, type } = this;
        this.bind();
        context.bufferData(type, data, this.usage);

        return this;
    }

    /**
     * @param {Float64Array|Float32Array|Uint32Array|Uint16Array|Uint8Array|Int32Array|Int16Array|Int8Array} data
     * @param {number} offset
     * @param {number} count
     */
    setDataRange(data, offset, count) {
        const { context, type } = this;
        this.bind();
        context.bufferSubData(type, offset, data, 0, count);

        return this;
    }

    delete() {
        const { context, handle } = this;
        if (handle !== null) {
            context.deleteBuffer(handle);
            this.handle = null;
        }
    }
}

export default VertexBuffer;
