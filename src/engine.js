import AssetManager from './asset-manager.js';
import InputManager from './input-manager.js';
import { MultisampleRenderPass } from './renderer/render-pass.js';
import Renderer from './renderer/renderer.js';
import SpriteBatch from './renderer/sprite-batch.js';
import Matrix4 from './matrix4.js';
import VectorRenderer from './renderer/vector-renderer.js';
import { Vec4 } from '@vvatashi/js-vec-math/src/vec4.js';
import { Vec3 } from '@vvatashi/js-vec-math/src/vec3.js';

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

        this.multisampleRenderPass.resize(this.canvas.width, this.canvas.height);
        this.renderer.resize();

        this.levelModelMatrix = Matrix4.createIdentity();
        this.viewMatrix = Matrix4.lookAt([15, 15, 15], [15, 0, 0], [0, 1, 0]);
        this.projectionMatrix = Matrix4.createPerspectiveFieldOfView(
            (80 * Math.PI) / 180,
            this.canvas.width / this.canvas.height,
            0.1,
            1000
        );

        this.viewProjectionMatrix = Matrix4.multiply(this.viewMatrix, this.projectionMatrix);

        this.inverseViewMatrix = this.viewMatrix.invert();
        this.inverseProjectionMatrix = this.projectionMatrix.invert();
        this.inverseViewProjectionMatrix = this.viewProjectionMatrix.invert();
    }

    fixedUpdate(deltaTime) {
        for (const gameObject of this.gameObjects) gameObject.fixedUpdate(deltaTime);
    }

    update(deltaTime) {
        for (const gameObject of this.gameObjects) gameObject.update(deltaTime);

        const x = (2 * this.inputManager.mouseX) / this.canvas.width - 1;
        const y = (-2 * this.inputManager.mouseY) / this.canvas.height + 1;

        let nearPoint = new Vec4(x, y, 0, 1);
        nearPoint = this.inverseViewProjectionMatrix.transform(nearPoint);
        nearPoint.divide(nearPoint[3]);

        let farPoint = new Vec4(x, y, 1, 1);
        farPoint = this.inverseViewProjectionMatrix.transform(farPoint);
        farPoint.divide(farPoint[3]);

        let origin = new Vec3(nearPoint.xyz);
        let direction = new Vec3(farPoint.xyz).subtract(nearPoint).normalize();

        const t = -origin.y / direction.y;
        const intersectionPoint = new Vec3(direction).multiply(t).add(origin);

        this.intersectionPoint = intersectionPoint;
        this.intersectionModelMatrix = Matrix4.createTranslation(intersectionPoint[0], intersectionPoint[1], intersectionPoint[2]);

        if (this.inputManager.leftMouseButtonPressed) {
            console.log('Screen', this.inputManager.mouseX, this.inputManager.mouseY);
            console.log('Clip space', x, y);
            console.log('Near plane intersection', ...nearPoint.xyz);
            console.log('Far plane intersection', ...farPoint.xyz);
            console.log('Ray direction', ...direction);
            console.log('y=0 plane intersection', ...intersectionPoint);
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
                    .setUniformMatrix('modelMatrix', this.levelModelMatrix)
                    .setUniformInteger('colorTexture', 0);

                this.assetManager.getTexture('white.png')?.bind();
                this.assetManager.getMesh('Test_Level_1.obj')?.draw();

                if (this.intersectionPoint) {
                    shaderProgram.setUniformMatrix('modelMatrix', this.intersectionModelMatrix);
                    this.assetManager.getMesh('teapot.obj')?.draw();
                }

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
