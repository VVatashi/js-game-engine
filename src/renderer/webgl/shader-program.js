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

        /** @type {Object.<string, WebGLUniformLocation>} */
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

    /** @param {string} name */
    getUniformLocation(name) {
        const { context, handle, uniformLocationCache } = this;
        if (name in uniformLocationCache) return uniformLocationCache[name];

        return (uniformLocationCache[name] = context.getUniformLocation(handle, name));
    }

    /**
     * @param {string} name
     * @param {number} value
     */
    setUniformInteger(name, value) {
        const { context } = this;
        this.bind();

        const location = this.getUniformLocation(name);
        if (typeof value === 'boolean') context.uniform1i(location, value ? 1 : 0);
        else context.uniform1i(location, value);

        return this;
    }

    /**
     * @param {string} name
     * @param {number} value
     */
    setUniformFloat(name, value) {
        const { context } = this;
        this.bind();

        const location = this.getUniformLocation(name);
        context.uniform1f(location, value);

        return this;
    }

    /**
     * @param {string} name
     * @param {number[]|Float32Array} value
     */
    setUniformVec2(name, value) {
        const { context } = this;
        this.bind();

        const location = this.getUniformLocation(name);
        context.uniform2fv(location, value);

        return this;
    }

    /**
     * @param {string} name
     * @param {number[]|Float32Array} value
     */
    setUniformVec3(name, value) {
        const { context } = this;
        this.bind();

        const location = this.getUniformLocation(name);
        context.uniform3fv(location, value);

        return this;
    }

    /**
     * @param {string} name
     * @param {number[]|Float32Array} value
     */
    setUniformVec4(name, value) {
        const { context } = this;
        this.bind();

        const location = this.getUniformLocation(name);
        context.uniform4fv(location, value);

        return this;
    }

    /**
     * @param {string} name
     * @param {number[]|Float32Array} value
     */
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
