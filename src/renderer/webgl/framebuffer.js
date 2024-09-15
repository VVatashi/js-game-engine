import Renderbuffer from './renderbuffer.js';
import Texture2D from './texture2d.js';

export class Framebuffer {
    /**
     * @param {WebGL2RenderingContext} context
     * @param {number} width
     * @param {number} height
     */
    constructor(context, width, height) {
        const handle = context.createFramebuffer();
        context.bindFramebuffer(context.FRAMEBUFFER, handle);
        context.viewport(0, 0, width, height);
        context.bindFramebuffer(context.FRAMEBUFFER, null);

        this.context = context;
        this.handle = handle;
        this.width = width;
        this.height = height;
    }

    bind() {
        const { context, handle } = this;
        context.bindFramebuffer(context.FRAMEBUFFER, handle);

        return this;
    }

    unbind() {
        const { context } = this;
        context.bindFramebuffer(context.FRAMEBUFFER, null);

        return this;
    }

    /**
     * @param {Texture2D} texture
     * @param {Object} options
     * @param {number} options.attachment
     */
    attachTexture2D(texture, options = {}) {
        const { context } = this;
        options = { attachment: context.COLOR_ATTACHMENT0, ...options };
        this.bind();
        texture.bind();
        context.framebufferTexture2D(context.FRAMEBUFFER, options.attachment, context.TEXTURE_2D, texture.handle, 0);
        this.unbind();

        return this;
    }

    /**
     * @param {Renderbuffer} renderbuffer
     * @param {Object} options
     * @param {number} options.attachment
     */
    attachRenderbuffer(renderbuffer, options = {}) {
        const { context } = this;
        options = { attachment: context.COLOR_ATTACHMENT0, ...options };
        this.bind();
        renderbuffer.bind();
        context.framebufferRenderbuffer(context.FRAMEBUFFER, options.attachment, context.RENDERBUFFER, renderbuffer.handle);
        this.unbind();

        return this;
    }

    resize(width, height) {
        const { context } = this;
        this.bind();
        context.viewport(0, 0, width, height);
        this.unbind();
        this.width = width;
        this.height = height;

        return this;
    }

    /**
     * @param {Framebuffer} framebuffer
     * @param {Object} options
     * @param {number} options.mask
     * @param {boolean} options.filter
     */
    blitTo(framebuffer, options = {}) {
        const { context, width, height } = this;
        options = { mask: context.COLOR_BUFFER_BIT, filter: true, ...options };
        context.bindFramebuffer(context.READ_FRAMEBUFFER, this.handle);
        context.bindFramebuffer(context.DRAW_FRAMEBUFFER, framebuffer.handle);
        context.blitFramebuffer(0, 0, width, height, 0, 0, framebuffer.width, framebuffer.height, options.mask, options.filter ? context.LINEAR : context.NEAREST);
        context.bindFramebuffer(context.READ_FRAMEBUFFER, null);
        context.bindFramebuffer(context.DRAW_FRAMEBUFFER, null);

        return this;
    }

    delete() {
        const { context, handle } = this;

        if (handle !== null) {
            context.deleteFramebuffer(handle);
            this.handle = null;
        }
    }
}

export default Framebuffer;
