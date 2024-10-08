import ObjLoader from './obj-loader.js';
import Material from './renderer/material.js';
import Mesh from './renderer/mesh.js';
import Model from './renderer/model.js';
import ShaderProgram from './renderer/webgl/shader-program.js';
import Shader from './renderer/webgl/shader.js';
import Texture2D from './renderer/webgl/texture2d.js';

export const ASSET_TYPE_TEXTURE = 'texture';
export const ASSET_TYPE_SHADER = 'shader';
export const ASSET_TYPE_MESH = 'mesh';
export const ASSET_TYPE_MATERIAL = 'material';
export const ASSET_TYPE_MODEL = 'model';

/**
 * @typedef {Object} Asset
 * @property {ASSET_TYPE_TEXTURE|ASSET_TYPE_SHADER|ASSET_TYPE_MESH|ASSET_TYPE_MATERIAL|ASSET_TYPE_MODEL} type
 * @property {string} name
 * @property {Object} metadata
 * @property {Object} data
 * @property {boolean} loaded
 */

export class AssetManager {
    /**
     * @param {WebGL2RenderingContext} context
     */
    constructor(context) {
        /** @type {Object.<string, Object.<string, Asset>>} */
        this.assets = {};
        this.context = context;
    }

    /**
     * @param {string} type
     * @param {string} name
     * @param {Object} metadata
     */
    register(type, name, metadata = {}) {
        if (!(type in this.assets)) this.assets[type] = {};

        this.assets[type][name] = {
            type,
            name,
            metadata,
            data: null,
            loaded: false,
        };
    }

    /**
     * @param {string} type
     * @param {string} name
     */
    async load(type, name) {
        if (!(type in this.assets) || !(name in this.assets[type])) return null;

        const asset = this.assets[type][name];
        if (asset.loaded) return asset;

        switch (type) {
            case ASSET_TYPE_TEXTURE:
                asset.data = await Texture2D.createFromImageUrl(this.context, `./assets/images/${name}`, asset.metadata);
                asset.loaded = true;
                break;

            case ASSET_TYPE_SHADER:
                const shaders = await Promise.all([
                    Shader.createFromUrl(this.context, this.context.VERTEX_SHADER, `./assets/shaders/${name}.vert`),
                    Shader.createFromUrl(this.context, this.context.FRAGMENT_SHADER, `./assets/shaders/${name}.frag`),
                ]);

                asset.data = new ShaderProgram(this.context, ...shaders);
                asset.loaded = true;
                break;

            case ASSET_TYPE_MODEL:
                const loader = new ObjLoader(this.context);
                await loader.loadObjFromUrl(`./assets/models/${name}`, asset.metadata);
                asset.data = loader.toModel();
                asset.loaded = true;
                break;

            default:
                asset.loaded = true;
                break;
        }

        return asset;
    }

    /**
     * @param {string} type
     * @param {string} name
     */
    get(type, name) {
        if (!(type in this.assets) || !(name in this.assets[type])) return null;

        const asset = this.assets[type][name];
        if (!asset.loaded) return null;

        return asset.data;
    }

    /**
     * @param {string} name
     * @return {Texture2D}
     */
    getTexture(name) {
        return this.get(ASSET_TYPE_TEXTURE, name);
    }

    /**
     * @param {string} name
     * @return {ShaderProgram}
     */
    getShader(name) {
        return this.get(ASSET_TYPE_SHADER, name);
    }

    /**
     * @param {string} name
     * @return {Mesh}
     */
    getMesh(name) {
        return this.get(ASSET_TYPE_MESH, name);
    }

    /**
     * @param {string} name
     * @return {Material}
     */
    getMaterial(name) {
        return this.get(ASSET_TYPE_MATERIAL, name);
    }

    /**
     * @param {string} name
     * @return {Model}
     */
    getModel(name) {
        return this.get(ASSET_TYPE_MODEL, name);
    }
}

export default AssetManager;
