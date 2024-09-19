import Shader from './shader.js';

export class ShaderProgram {
    /**
     * @param {WebGL2RenderingContext} context
     * @param {Shader[]} shaders
     */
    constructor(context, ...shaders) {
        const handle = context.createProgram();
        for (const shader of shaders) context.attachShader(handle, shader.handle);

        context.linkProgram(handle);
        if (!context.getProgramParameter(handle, context.LINK_STATUS)) {
            throw new Error("Can't link shader program: " + context.getProgramInfoLog(handle));
        }

        this.context = context;
        this.handle = handle;
        this.uniformLocationCache = {};
    }

    /**
     * @param {WebGL2RenderingContext} context
     * @param {string} vertexShaderSource
     * @param {string} fragmentShaderSource
     */
    static createFromVertexFragmentSource(context, vertexShaderSource, fragmentShaderSource) {
        const vertexShader = new Shader(context, context.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = new Shader(context, context.FRAGMENT_SHADER, fragmentShaderSource);
        const shaderProgram = new ShaderProgram(context, vertexShader, fragmentShader);
        vertexShader.delete();
        fragmentShader.delete();

        return shaderProgram;
    }

    bind() {
        const { context, handle } = this;
        context.useProgram(handle);

        return this;
    }

    getUniformLocation(name) {
        const { context, handle, uniformLocationCache } = this;
        if (name in uniformLocationCache) return uniformLocationCache[name];

        return (uniformLocationCache[name] = context.getUniformLocation(handle, name));
    }

    setUniformInteger(name, value) {
        const { context } = this;
        this.bind();

        const location = this.getUniformLocation(name);
        if (typeof value === 'boolean') context.uniform1i(location, value ? 1 : 0);
        else context.uniform1i(location, value);

        return this;
    }

    setUniformFloat(name, value) {
        const { context } = this;
        this.bind();

        const location = this.getUniformLocation(name);
        context.uniform1f(location, value);

        return this;
    }

    setUniformMatrix(name, value, transpose = false) {
        const { context } = this;
        this.bind();

        const location = this.getUniformLocation(name);
        context.uniformMatrix4fv(location, transpose, value);

        return this;
    }

    delete() {
        const { context, handle } = this;
        if (handle !== null) {
            context.deleteProgram(handle);
            this.handle = null;
        }
    }
}

export default ShaderProgram;
