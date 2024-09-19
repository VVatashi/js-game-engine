import AssetManager from './asset-manager.js';
import InputManager from './input-manager.js';
import { MultisampleRenderPass } from './renderer/render-pass.js';
import Renderer from './renderer/renderer.js';
import SpriteBatch from './renderer/sprite-batch.js';
import Matrix4 from './matrix4.js';

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
        this.inputManager = new InputManager();
        this.multisampleRenderPass = new MultisampleRenderPass(this.renderer.context, this.canvas.width, this.canvas.height);
        this.spriteBatch = new SpriteBatch(this.renderer.context);

        this.time = 0;

        this.offsetX = 0;
        this.offsetY = 0;

        this.startX = 0;
        this.startY = 0;

        this.startMouseX = 0;
        this.startMouseY = 0;

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

    resize() {
        this.canvas.width = document.documentElement.clientWidth * devicePixelRatio;
        this.canvas.height = document.documentElement.clientHeight * devicePixelRatio;

        this.projectionMatrix = Matrix4.createOrthographicOffCenter(1, -1, -1, 1, -1, 1);

        this.multisampleRenderPass.resize(this.canvas.width, this.canvas.height);
        this.renderer.resize();
    }

    fixedUpdate(deltaTime) {
        for (const gameObject of this.gameObjects) gameObject.fixedUpdate(deltaTime);
    }

    update(deltaTime) {
        for (const gameObject of this.gameObjects) gameObject.update(deltaTime);

        this.time += deltaTime;

        if (this.inputManager.leftMouseButtonPressed) {
            this.startX = this.offsetX;
            this.startY = this.offsetY;

            this.startMouseX = this.inputManager.mouseX;
            this.startMouseY = this.inputManager.mouseY;
        }

        if (this.inputManager.leftMouseButtonDown) {
            this.offsetX = this.startX + (this.inputManager.mouseX - this.startMouseX);
            this.offsetY = this.startY + (this.inputManager.mouseY - this.startMouseY);
        }

        this.inputManager.resetPressedButtons();
    }

    draw(deltaTime) {
        this.multisampleRenderPass.begin();
        {
            this.renderer.clear();

            const shaderProgram = this.assetManager.getShader('simple');
            if (shaderProgram !== null) {
                let matrix = Matrix4.multiply(
                    Matrix4.createScale(0.02),
                    Matrix4.multiply(
                        Matrix4.createTranslation(0.06, 0, 0.06),
                        Matrix4.multiply(
                            Matrix4.createRotationY(this.time),
                            Matrix4.createTranslation(-this.offsetX / this.canvas.width * 2, -this.offsetY / this.canvas.height * 2, 0),
                        )
                    )
                );

                shaderProgram.bind().setUniformMatrix('modelMatrix', matrix).setUniformMatrix('projectionMatrix', this.projectionMatrix).setUniformInteger('colorTexture', 0);
                this.renderer.context.frontFace(this.renderer.context.CW);
                this.assetManager.getTexture('Body_tex_003.png')?.bind();
                this.assetManager.getMesh('Elf01_body.obj')?.draw();
                this.assetManager.getTexture('Face_tex_002_toObj.png')?.bind();
                this.assetManager.getMesh('Elf01_face.obj')?.draw();
                this.assetManager.getTexture('Hair_tex_001.png')?.bind();
                this.assetManager.getMesh('Elf01_hair.obj')?.draw();

                for (const gameObject of this.gameObjects) gameObject.draw(deltaTime);
            }
        }
        this.multisampleRenderPass.end();
        this.renderer.clear();

        const screenShaderProgram = this.assetManager.getShader('screen');
        if (screenShaderProgram !== null) {
            screenShaderProgram.bind().setUniformInteger('colorTexture', 0);

            this.multisampleRenderPass.attachment?.bind(0);
            this.renderer.context.frontFace(this.renderer.context.CCW);
            this.assetManager.getMesh('quad.obj')?.draw();
        }
    }
}

export default Engine;
