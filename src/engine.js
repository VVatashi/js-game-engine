import AssetManager from './asset-manager.js';
import Renderer from './renderer/renderer.js';
import Framebuffer from './renderer/webgl/framebuffer.js';
import Renderbuffer from './renderer/webgl/renderbuffer.js';
import Texture2D from './renderer/webgl/texture2d.js';
import VertexArray from './renderer/webgl/vertex-array.js';
import VertexBuffer from './renderer/webgl/vertex-buffer.js';

const FIXED_UPDATE_TIMESTEP = 60 / 1000;

export class GameObject {
    constructor() { }

    fixedUpdate(deltaTime) { }

    update(deltaTime) { }

    draw(deltaTime) { }
}

export class Engine {
    /** @param {HTMLCanvasElement} canvas */
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.assetManager = new AssetManager(this.renderer.context);

        this.framebufferMultisample = new Framebuffer(this.renderer.context, this.canvas.width, this.canvas.height);
        this.framebuffer = new Framebuffer(this.renderer.context, this.canvas.width, this.canvas.height);

        /** @type {Renderbuffer|null} */
        this.framebufferMultisampleRenderbuffer = null;

        /** @type {Texture2D|null} */
        this.framebufferTexture = null;

        fetch('./assets/assets.json').then(async response => {
            const assets = await response.json();
            for (const asset of assets)
                this.assetManager.register(asset.type, asset.name, asset.metadata);

            await Promise.all(assets.map(asset => {
                console.log(`Loading ${asset.type} ${asset.name}`);
                return this.assetManager.load(asset.type, asset.name);
            }));

            console.log('Assets loaded');
        });

        this.vertexBuffer = new VertexBuffer(this.renderer.context, this.renderer.context.ARRAY_BUFFER, new Float32Array([
            0, 0, 0, 0, 1, 1, 1, 1,
            0, 512, 0, 1, 1, 1, 1, 1,
            512, 512, 1, 1, 1, 1, 1, 1,

            0, 0, 0, 0, 1, 1, 1, 1,
            512, 512, 1, 1, 1, 1, 1, 1,
            512, 0, 1, 0, 1, 1, 1, 1,
        ]));

        {
            const position = { index: 0, elements: 2, type: this.renderer.context.FLOAT, normalized: false, stride: 8 * Float32Array.BYTES_PER_ELEMENT, offset: 0 };
            const texCoords = { index: 1, elements: 2, type: this.renderer.context.FLOAT, normalized: false, stride: 8 * Float32Array.BYTES_PER_ELEMENT, offset: 2 * Float32Array.BYTES_PER_ELEMENT };
            const color = { index: 2, elements: 4, type: this.renderer.context.FLOAT, normalized: false, stride: 8 * Float32Array.BYTES_PER_ELEMENT, offset: 4 * Float32Array.BYTES_PER_ELEMENT };
            this.vertexArray = new VertexArray(this.renderer.context).attachBuffer(this.vertexBuffer, position, texCoords, color);
        }

        this.screenVertexBuffer = new VertexBuffer(this.renderer.context, this.renderer.context.ARRAY_BUFFER, new Float32Array([
            -1, -1, 0, 0,
            -1, 1, 0, 1,
            1, 1, 1, 1,

            -1, -1, 0, 0,
            1, 1, 1, 1,
            1, -1, 1, 0,
        ]));

        {
            const position = { index: 0, elements: 2, type: this.renderer.context.FLOAT, normalized: false, stride: 4 * Float32Array.BYTES_PER_ELEMENT, offset: 0 };
            const texCoords = { index: 1, elements: 2, type: this.renderer.context.FLOAT, normalized: false, stride: 4 * Float32Array.BYTES_PER_ELEMENT, offset: 2 * Float32Array.BYTES_PER_ELEMENT };
            this.screenVertexArray = new VertexArray(this.renderer.context).attachBuffer(this.screenVertexBuffer, position, texCoords);
        }

        /** @type {GameObject[]} */
        this.gameObjects = [];

        document.addEventListener('contextmenu', event => event.preventDefault());

        this.resize();
        addEventListener('resize', this.resize.bind(this));

        let currentTime = null;
        let timeSinceFixedUpdate = 0;

        const requestAnimationFrameCallback = (timestamp) => {
            timestamp /= 1000;

            const deltaTime = timestamp - currentTime;
            currentTime = timestamp;

            timeSinceFixedUpdate += deltaTime;
            while (timeSinceFixedUpdate >= FIXED_UPDATE_TIMESTEP) {
                this.fixedUpdate(FIXED_UPDATE_TIMESTEP);
                timeSinceFixedUpdate -= FIXED_UPDATE_TIMESTEP;
            }

            this.update(deltaTime);
            this.draw(deltaTime);

            requestAnimationFrame(requestAnimationFrameCallback);
        };

        requestAnimationFrame(requestAnimationFrameCallback);
    }

    createOrthographicOffCenter(left, right, bottom, top, near, far) {
        const leftRight = 1 / (left - right);
        const bottomTop = 1 / (bottom - top);
        const nearFar = 1 / (near - far);

        const scaleX = -2 * leftRight;
        const scaleY = -2 * bottomTop;
        const scaleZ = 2 * nearFar;

        const translateX = (left + right) * leftRight;
        const translateY = (top + bottom) * bottomTop;
        const translateZ = (far + near) * nearFar;

        return [
            scaleX, 0, 0, 0,
            0, scaleY, 0, 0,
            0, 0, scaleZ, 0,
            translateX, translateY, translateZ, 1,
        ];
    }

    resize() {
        this.canvas.width = document.documentElement.clientWidth * window.devicePixelRatio;
        this.canvas.height = document.documentElement.clientHeight * window.devicePixelRatio;

        this.matrix = this.createOrthographicOffCenter(0, this.canvas.width, this.canvas.height, 0, -1, 1);

        this.framebufferMultisampleRenderbuffer?.delete();
        this.framebufferMultisample.resize(this.canvas.width, this.canvas.height)
            .attachRenderbuffer(this.framebufferMultisampleRenderbuffer = new Renderbuffer(this.renderer.context, this.canvas.width, this.canvas.height, { multisample: true }));

        this.framebufferTexture?.delete();
        this.framebuffer.resize(this.canvas.width, this.canvas.height)
            .attachTexture2D(this.framebufferTexture = new Texture2D(this.renderer.context, this.canvas.width, this.canvas.height, { mipFilter: false }));

        this.renderer.resize();
    }

    fixedUpdate(deltaTime) {
        for (const gameObject of this.gameObjects)
            gameObject.fixedUpdate(deltaTime);
    }

    update(deltaTime) {
        for (const gameObject of this.gameObjects)
            gameObject.update(deltaTime);
    }

    draw(deltaTime) {
        this.framebufferMultisample.bind();
        this.renderer.clear();

        const shaderProgram = this.assetManager.getShader('simple');
        if (shaderProgram !== null) {
            shaderProgram.bind()
                .setUniformMatrix('matrix', this.matrix)
                .setUniformInteger('colorTexture', 0);

            this.assetManager.getTexture('1.png').bind();
            this.vertexArray.draw(6);
        }

        for (const gameObject of this.gameObjects)
            gameObject.draw(deltaTime);

        this.framebufferMultisample.unbind();
        this.framebufferMultisample.blitTo(this.framebuffer);

        const screenShaderProgram = this.assetManager.getShader('screen');
        if (screenShaderProgram !== null) {
            screenShaderProgram.bind()
                .setUniformInteger('colorTexture', 0);

            this.framebufferTexture.bind();
            this.screenVertexArray.draw(6);
        }
    }
}

export default Engine;
