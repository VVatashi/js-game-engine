import AssetManager from './asset-manager.js';
import InputManager from './input-manager.js';
import { MultisampleRenderPass } from './renderer/render-pass.js';
import Renderer from './renderer/renderer.js';
import SpriteBatch from './renderer/sprite-batch.js';
import Matrix4 from './matrix4.js';
import VectorRenderer from './renderer/vector-renderer.js';

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
        this.inputManager = new InputManager();
        this.multisampleRenderPass = new MultisampleRenderPass(this.renderer.context, this.canvas.width, this.canvas.height);
        this.spriteBatch = new SpriteBatch(this.renderer.context);
        this.vectorRenderer = new VectorRenderer(this.renderer.context);

        this.linecap = 'bevel';
        this.loop = false;

        fetch('./assets/assets.json').then(async (response) => {
            /** @type {import('./asset-manager.js').Asset[]} */
            const assets = await response.json();
            for (const asset of assets) this.assetManager.register(asset.type, asset.name, asset.metadata);

            await Promise.all(assets.map((asset) => this.assetManager.load(asset.type, asset.name)));

            console.log('Assets loaded');
        });

        /** @type {GameObject[]} */
        this.gameObjects = [];

        this.resize();
        addEventListener('resize', this.resize.bind(this));

        let currentTime = null;
        let timeSinceFixedUpdate = 0;

        const requestAnimationFrameCallback = (timestamp) => {
            requestAnimationFrame(requestAnimationFrameCallback);

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
        };

        requestAnimationFrame(requestAnimationFrameCallback);
    }

    resize() {
        this.canvas.width = document.documentElement.clientWidth * devicePixelRatio;
        this.canvas.height = document.documentElement.clientHeight * devicePixelRatio;

        this.viewMatrix = Matrix4.lookAt([15, 15, 15], [15, 0, 0], [0, 1, 0]);
        this.projectionMatrix = Matrix4.createPerspectiveFieldOfView(
            (80 * Math.PI) / 180,
            this.canvas.width / this.canvas.height,
            0.1,
            100
        );

        this.multisampleRenderPass.resize(this.canvas.width, this.canvas.height);
        this.renderer.resize();
    }

    fixedUpdate(deltaTime) {
        for (const gameObject of this.gameObjects) gameObject.fixedUpdate(deltaTime);
    }

    update(deltaTime) {
        for (const gameObject of this.gameObjects) gameObject.update(deltaTime);

        if (this.inputManager.leftMouseButtonPressed) {
            if (this.linecap === false) this.linecap = 'bevel';
            else this.linecap = false;
        }

        if (this.inputManager.rightMouseButtonPressed) {
            if (this.loop) this.loop = false;
            else this.loop = true;
        }

        this.inputManager.resetPressedButtons();
    }

    draw(deltaTime) {
        this.time = (this.time || 0) + deltaTime;

        this.multisampleRenderPass.begin();
        {
            this.renderer.clear();

            const shaderProgram = this.assetManager.getShader('mesh');
            if (shaderProgram !== null) {
                shaderProgram
                    .bind()
                    .setUniformMatrix('projectionMatrix', this.projectionMatrix)
                    .setUniformMatrix('viewMatrix', this.viewMatrix)
                    .setUniformInteger('colorTexture', 0);

                this.assetManager.getTexture('white.png')?.bind();
                this.assetManager.getMesh('Test_Level_1.obj')?.draw();

                for (const gameObject of this.gameObjects) gameObject.draw(deltaTime);
            }
        }
        this.multisampleRenderPass.end();
        this.renderer.clear();

        const screenShaderProgram = this.assetManager.getShader('screen');
        if (screenShaderProgram !== null) {
            screenShaderProgram.bind().setUniformInteger('colorTexture', 0);

            this.multisampleRenderPass.attachment?.bind(0);
            this.assetManager.getMesh('quad.obj')?.draw();
        }
    }
}

export default Engine;
