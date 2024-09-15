export class Renderbuffer {
    /**
     * @param {WebGL2RenderingContext} context
     * @param {number} width
     * @param {number} height
     * @param {Object} options
     * @param {number} options.internalFormat
     * @param {bool} options.multisample
     */
    constructor(context, width, height, options = {}) {
        options = { internalFormat: context.RGBA8, multisample: false, ...options };
        const handle = context.createRenderbuffer();
        context.bindRenderbuffer(context.RENDERBUFFER, handle);
        if (options.multisample)
            context.renderbufferStorageMultisample(context.RENDERBUFFER, context.getParameter(context.MAX_SAMPLES), options.internalFormat, width, height);
        else
            context.renderbufferStorage(context.RENDERBUFFER, options.internalFormat, width, height);

        this.context = context;
        this.handle = handle;
        this.width = width;
        this.height = height;
    }

    bind() {
        const { context, handle } = this;
        context.bindRenderbuffer(context.RENDERBUFFER, handle);

        return this;
    }

    delete() {
        const { context, handle } = this;
        if (handle !== null) {
            context.deleteRenderbuffer(handle);
            this.handle = null;
        }
    }
}

export default Renderbuffer;
