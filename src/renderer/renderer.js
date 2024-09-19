export class Renderer {
    /** @param {HTMLCanvasElement} canvas */
    constructor(canvas) {
        this.context = canvas.getContext('webgl2', { antialias: false });

        this.context.enable(this.context.CULL_FACE);
        this.context.cullFace(this.context.BACK);
        this.context.frontFace(this.context.CCW);

        this.context.enable(this.context.DEPTH_TEST);
        this.context.depthFunc(this.context.LESS);

        this.context.pixelStorei(this.context.UNPACK_FLIP_Y_WEBGL, true);
    }

    resize() {
        this.context.bindFramebuffer(this.context.FRAMEBUFFER, null);
        this.context.viewport(0, 0, this.context.canvas.width, this.context.canvas.height);
    }

    clear() {
        this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
    }
}

export default Renderer;
