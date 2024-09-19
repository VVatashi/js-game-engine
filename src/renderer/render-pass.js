import Framebuffer from './webgl/framebuffer.js';
import Renderbuffer from './webgl/renderbuffer.js';
import Texture2D from './webgl/texture2d.js';

export class RenderPass {
    constructor(context, width, height) {
        this.context = context;

        /** @type {Texture2D|null} */
        this.attachment = null;
        this.framebuffer = new Framebuffer(context, width, height);
    }

    resize(width, height) {
        this.attachment?.delete();
        this.attachment = new Texture2D(this.context, width, height, { mipFilter: false });

        this.framebuffer.resize(width, height);
        this.framebuffer.attachTexture2D(this.attachment);
    }

    begin() {
        this.framebuffer.bind();
    }

    end() {
        this.framebuffer.unbind();
    }
}

export class MultisampleRenderPass extends RenderPass {
    constructor(context, width, height) {
        super(context, width, height);

        /** @type {Renderbuffer|null} */
        this.multisampleAttachment = null;
        this.multisampleFramebuffer = new Framebuffer(this.context, width, height);
    }

    resize(width, height) {
        super.resize(width, height);

        this.multisampleAttachment?.delete();
        this.multisampleAttachment = new Renderbuffer(this.context, width, height, { multisample: true });

        this.multisampleFramebuffer.resize(width, height);
        this.multisampleFramebuffer.attachRenderbuffer(this.multisampleAttachment);
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
