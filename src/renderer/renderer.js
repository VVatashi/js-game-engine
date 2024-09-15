export class Renderer {
    /** @param {HTMLCanvasElement} canvas */
    constructor(canvas) {
        this.context = canvas.getContext('webgl2', { antialias: false });
    }

    resize() {
        this.context.bindFramebuffer(this.context.FRAMEBUFFER, null);
        this.context.viewport(0, 0, this.context.canvas.width, this.context.canvas.height);
    }

    clear() {
        this.context.clear(this.context.COLOR_BUFFER_BIT);
    }
}

export default Renderer;
