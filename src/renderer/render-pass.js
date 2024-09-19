import Framebuffer from './webgl/framebuffer.js';
import Renderbuffer from './webgl/renderbuffer.js';
import Texture2D from './webgl/texture2d.js';

export class RenderPass {
    /**
     * @param {WebGL2RenderingContext} context
     * @param {number} width
     * @param {number} height
     */
    constructor(context, width, height) {
        this.context = context;

        /** @type {Texture2D|null} */
        this.attachment = null;
        this.framebuffer = new Framebuffer(context, width, height);
    }

    /**
     * @param {number} width
     * @param {number} height
     */
    resize(width, height) {
        this.attachment?.delete();
        this.attachment = new Texture2D(this.context, width, height, { mipFilter: false });

        this.depthAttachment?.delete();
        this.depthAttachment = new Renderbuffer(this.context, width, height, { internalFormat: this.context.DEPTH24_STENCIL8 });

        this.framebuffer.resize(width, height);
        this.framebuffer.attachTexture2D(this.attachment);
        this.framebuffer.attachRenderbuffer(this.depthAttachment, { attachment: this.context.DEPTH_STENCIL_ATTACHMENT });
    }

    begin() {
        this.framebuffer.bind();
    }

    end() {
        this.framebuffer.unbind();
    }
}

export class MultisampleRenderPass extends RenderPass {
    /**
     * @param {WebGL2RenderingContext} context
     * @param {number} width
     * @param {number} height
     */
    constructor(context, width, height) {
        super(context, width, height);

        /** @type {Renderbuffer|null} */
        this.multisampleAttachment = null;
        this.multisampleFramebuffer = new Framebuffer(this.context, width, height);
    }

    /**
     * @param {number} width
     * @param {number} height
     */
    resize(width, height) {
        super.resize(width, height);

        this.multisampleAttachment?.delete();
        this.multisampleAttachment = new Renderbuffer(this.context, width, height, { multisample: true });

        this.multisampleDepthAttachment?.delete();
        this.multisampleDepthAttachment = new Renderbuffer(this.context, width, height, { internalFormat: this.context.DEPTH24_STENCIL8, multisample: true });

        this.multisampleFramebuffer.resize(width, height);
        this.multisampleFramebuffer.attachRenderbuffer(this.multisampleAttachment);
        this.multisampleFramebuffer.attachRenderbuffer(this.multisampleDepthAttachment, { attachment: this.context.DEPTH_STENCIL_ATTACHMENT });
    }

    begin() {
        this.multisampleFramebuffer.bind();
    }

    end() {
        this.multisampleFramebuffer.unbind();
        this.multisampleFramebuffer.blitTo(this.framebuffer);
    }
}

export default RenderPass;
