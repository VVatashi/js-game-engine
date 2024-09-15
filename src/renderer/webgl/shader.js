export class Shader {
    /**
     * @param {WebGL2RenderingContext} context
     * @param {number} type
     * @param {string} source
     */
    constructor(context, type, source) {
        const handle = context.createShader(type);
        context.shaderSource(handle, source);
        context.compileShader(handle);
        if (!context.getShaderParameter(handle, context.COMPILE_STATUS)) {
            throw new Error("Can't compile shader: " + context.getShaderInfoLog(handle));
        }

        this.context = context;
        this.handle = handle;
    }

    /**
     * @param {WebGL2RenderingContext} context
     * @param {number} type
     * @param {string} src
     */
    static async createFromUrl(context, type, src) {
        const response = await fetch(src);
        return new Shader(context, type, await response.text());
    }

    delete() {
        const { context, handle } = this;
        if (handle !== null) {
            context.deleteShader(handle);
            this.handle = null;
        }
    }
}

export default Shader;
