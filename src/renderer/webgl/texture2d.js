export class Texture2D {
    /**
     * @param {WebGL2RenderingContext} context
     * @param {number} width
     * @param {number} height
     * @param {Object} options
     * @param {number} options.textureUnit
     * @param {number} options.internalFormat
     * @param {number} options.format
     * @param {number} options.type
     * @param {boolean} options.minFilter
     * @param {boolean} options.magFilter
     * @param {boolean} options.mipFilter
     * @param {number} options.wrap
     * @param {number} options.wrapS
     * @param {number} options.wrapT
     */
    constructor(context, width, height, options = {}) {
        options = {
            textureUnit: 0,
            internalFormat: context.RGBA8,
            format: context.RGBA,
            pixelType: context.UNSIGNED_BYTE,
            minFilter: true,
            magFilter: true,
            mipFilter: true,
            wrap: context.CLAMP_TO_EDGE,
            wrapS: context.CLAMP_TO_EDGE,
            wrapT: context.CLAMP_TO_EDGE,
            ...options,
        };

        const wrapS = options.wrapS || options.wrap;
        const wrapT = options.wrapT || options.wrap;

        const handle = context.createTexture();
        context.activeTexture(options.textureUnit + context.TEXTURE0);
        context.bindTexture(context.TEXTURE_2D, handle);
        context.texImage2D(context.TEXTURE_2D, 0, options.internalFormat, width, height, 0, options.format, options.pixelType, null);
        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, options.magFilter ? context.LINEAR : context.NEAREST);
        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, options.mipFilter
            ? (options.minFilter ? context.LINEAR_MIPMAP_LINEAR : context.NEAREST_MIPMAP_LINEAR)
            : (options.minFilter ? context.LINEAR : context.NEAREST));
        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, wrapS);
        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, wrapT);

        this.context = context;
        this.handle = handle;
        this.format = options.format;
        this.pixelType = options.pixelType;
        this.mipFilter = options.mipFilter;
    }

    /**
     * @param {WebGL2RenderingContext} context
     * @param {HTMLImageElement} image
     * @param {Object} options
     * @param {number} options.textureUnit
     * @param {number} options.internalFormat
     * @param {number} options.format
     * @param {number} options.type
     * @param {boolean} options.minFilter
     * @param {boolean} options.magFilter
     * @param {boolean} options.mipFilter
     * @param {number} options.wrap
     * @param {number} options.wrapS
     * @param {number} options.wrapT
     */
    static createFromImage(context, image, options = {}) {
        options = { internalFormat: context.SRGB8_ALPHA8, ...options };
        return new Texture2D(context, image.width, image.height, options).setImage(image);
    }

    /**
     * @param {WebGL2RenderingContext} context
     * @param {string} url
     * @param {Object} options
     * @param {number} options.textureUnit
     * @param {number} options.internalFormat
     * @param {number} options.format
     * @param {number} options.type
     * @param {boolean} options.minFilter
     * @param {boolean} options.magFilter
     * @param {boolean} options.mipFilter
     * @param {number} options.wrap
     * @param {number} options.wrapS
     * @param {number} options.wrapT
     */
    static createFromImageUrl(context, url, options = {}) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(Texture2D.createFromImage(context, image, options)));
            image.addEventListener('error', e => reject(e));
            image.loading = 'eager';
            image.src = url;
        });
    }

    bind(textureUnit = 0) {
        const { context, handle } = this;
        context.activeTexture(textureUnit + context.TEXTURE0);
        context.bindTexture(context.TEXTURE_2D, handle);

        return this;
    }

    /**
     * @param {HTMLImageElement} image
     */
    setImage(image) {
        const { context } = this;
        this.bind();
        context.texSubImage2D(context.TEXTURE_2D, 0, 0, 0, this.format, this.pixelType, image);
        if (this.mipFilter)
            context.generateMipmap(context.TEXTURE_2D);

        return this;
    }

    delete() {
        const { context, handle } = this;
        if (handle !== null) {
            context.deleteTexture(handle);
            this.handle = null;
        }
    }
}

export default Texture2D;
