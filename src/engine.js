import AssetManager from './asset-manager.js';
import { MultisampleRenderPass } from './renderer/render-pass.js';
import Renderer from './renderer/renderer.js';
import SpriteBatch from './renderer/sprite-batch.js';

const FIXED_UPDATE_TIMESTEP = 60 / 1000;

export class GameObject {
    constructor() {}

    fixedUpdate(deltaTime) {}

    update(deltaTime) {}

    draw(deltaTime) {}
}

export class Engine {
    /** @param {HTMLCanvasElement} canvas */
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.assetManager = new AssetManager(this.renderer.context);
        this.multisampleRenderPass = new MultisampleRenderPass(this.renderer.context, this.canvas.width, this.canvas.height);
        this.spriteBatch = new SpriteBatch(this.renderer.context);

        fetch('./assets/assets.json').then(async (response) => {
            /** @type {import('./asset-manager.js').Asset[]} */
            const assets = await response.json();
            for (const asset of assets) this.assetManager.register(asset.type, asset.name, asset.metadata);

            await Promise.all(assets.map((asset) => this.assetManager.load(asset.type, asset.name)));

            console.log('Assets loaded');
        });

        /** @type {GameObject[]} */
        this.gameObjects = [];

        document.addEventListener('contextmenu', (event) => event.preventDefault());

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

        // prettier-ignore
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

        this.multisampleRenderPass.resize(this.canvas.width, this.canvas.height);
        this.renderer.resize();
    }

    fixedUpdate(deltaTime) {
        for (const gameObject of this.gameObjects) gameObject.fixedUpdate(deltaTime);
    }

    update(deltaTime) {
        for (const gameObject of this.gameObjects) gameObject.update(deltaTime);
    }

    draw(deltaTime) {
        this.multisampleRenderPass.begin();
        {
            const shaderProgram = this.assetManager.getShader('simple');
            if (shaderProgram !== null) {
                shaderProgram.bind().setUniformMatrix('matrix', this.matrix).setUniformInteger('colorTexture', 0);

                this.assetManager.getTexture('1.png')?.bind();
                this.spriteBatch.begin();
                this.spriteBatch.drawRectangle(150, 150, 200, 200);
                this.spriteBatch.end();
            }

            for (const gameObject of this.gameObjects) gameObject.draw(deltaTime);
        }
        this.multisampleRenderPass.end();

        const screenShaderProgram = this.assetManager.getShader('screen');
        if (screenShaderProgram !== null) {
            screenShaderProgram.bind().setUniformInteger('colorTexture', 0);

            this.multisampleRenderPass.attachment?.bind(0);
            this.assetManager.getMesh('quad.obj')?.draw();
        }
    }
}

export default Engine;
