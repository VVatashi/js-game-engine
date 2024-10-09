import Material from './renderer/material.js';
import Mesh from './renderer/mesh.js';
import Model from './renderer/model.js';

export class ObjLoader {
    /**
     * @param {WebGL2RenderingContext} context
     */
    constructor(context) {
        this.context = context;
        this.defaultMaterial = new Material();

        this.materials = new Map();

        /** @type {Mesh[]} */
        this.meshes = [];
    }

    clear() {
        this.materials.clear();
        this.meshes = [];
    }

    /**
     * @param {string} data
     */
    loadMaterialLibrary(data) {
        let materialName = 'default';
        let material = Material.copyFrom(this.defaultMaterial);

        const lines = data.split('\n');
        for (const line of lines) {
            const [command, ...values] = line.trim().split(' ');
            switch (command) {
                case 'newmtl':
                    this.materials.set(materialName, material);

                    materialName = values.join(' ');
                    material = Material.copyFrom(this.defaultMaterial);
                    break;

                case 'Ka':
                    material.ambientColor[0] = Number.parseFloat(values[0]);
                    material.ambientColor[1] = Number.parseFloat(values[1]);
                    material.ambientColor[2] = Number.parseFloat(values[2]);
                    break;

                case 'Kd':
                    material.diffuseColor[0] = Number.parseFloat(values[0]);
                    material.diffuseColor[1] = Number.parseFloat(values[1]);
                    material.diffuseColor[2] = Number.parseFloat(values[2]);
                    break;

                case 'Ks':
                    material.specularColor[0] = Number.parseFloat(values[0]);
                    material.specularColor[1] = Number.parseFloat(values[1]);
                    material.specularColor[2] = Number.parseFloat(values[2]);
                    break;

                case 'Ns':
                    material.specularExponent = Number.parseFloat(values[0]);
                    break;

                case 'Ni':
                    material.refractionIndex = Number.parseFloat(values[0]);
                    break;

                case 'd':
                    material.ambientColor[3] = Number.parseFloat(values[0]);
                    material.diffuseColor[3] = Number.parseFloat(values[0]);
                    material.specularColor[3] = Number.parseFloat(values[0]);
                    break;

                case 'Tr':
                    material.ambientColor[3] = 1 - Number.parseFloat(values[0]);
                    material.diffuseColor[3] = 1 - Number.parseFloat(values[0]);
                    material.specularColor[3] = 1 - Number.parseFloat(values[0]);
                    break;

                case 'illum':
                    switch (Number.parseInt(values[0])) {
                        case 2:
                            material.transparent = false;
                            break;

                        case 9:
                            material.transparent = true;
                            break;
                    }

                    break;
            }
        }

        this.materials.set(materialName, material);
        return this;
    }

    /**
     * @param {string} src
     */
    async loadMaterialLibraryFromUrl(src) {
        const response = await fetch(src);
        return this.loadMaterialLibrary(await response.text());
    }

    /**
     * @param {string} data
     * @param {string} basePath
     * @param {Object} options
     * @param {number|false|null} options.positionElements
     * @param {number|false|null} options.texCoordElements
     * @param {number|false|null} options.normalElements
     */
    async loadObj(data, basePath, options = {}) {
        options = {
            positionElements: 3,
            texCoordElements: 2,
            normalElements: 3,
            ...options,
        };

        const attributes = [];
        const stride = (options.positionElements + options.texCoordElements + options.normalElements) * Float32Array.BYTES_PER_ELEMENT;

        if (options.positionElements > 0) {
            attributes.push({
                index: 0,
                elements: options.positionElements,
                type: this.context.FLOAT,
                normalized: false,
                stride,
                offset: 0,
            });
        }

        if (options.texCoordElements > 0) {
            attributes.push({
                index: 1,
                elements: options.texCoordElements,
                type: this.context.FLOAT,
                normalized: false,
                stride,
                offset: options.positionElements * Float32Array.BYTES_PER_ELEMENT,
            });
        }

        if (options.normalElements > 0) {
            attributes.push({
                index: 2,
                elements: options.normalElements,
                type: this.context.FLOAT,
                normalized: false,
                stride,
                offset: (options.positionElements + options.texCoordElements) * Float32Array.BYTES_PER_ELEMENT,
            });
        }

        const vertices = [];
        const texCoords = [];
        const normals = [];

        let vertexData = [];
        let group = 'default';
        let object = 'default';
        let material = Material.copyFrom(this.defaultMaterial);

        this.clear();

        const lines = data.split('\n');
        for (const line of lines) {
            const [command, ...values] = line.trim().split(' ');
            switch (command) {
                case 'mtllib':
                    await this.loadMaterialLibraryFromUrl(`${basePath}/${values[0]}`);
                    break;

                case 'g':
                    if (vertexData.length > 0) {
                        const mesh = new Mesh(this.context, new Float32Array(vertexData), ...attributes);
                        mesh.group = group;
                        mesh.object = object;
                        mesh.material = material;
                        this.meshes.push(mesh);

                        vertexData = [];
                    }

                    group = values.join(' ');
                    break;

                case 'o':
                    if (vertexData.length > 0) {
                        const mesh = new Mesh(this.context, new Float32Array(vertexData), ...attributes);
                        mesh.group = group;
                        mesh.object = object;
                        mesh.material = material;
                        this.meshes.push(mesh);

                        vertexData = [];
                    }

                    object = values.join(' ');
                    break;

                case 'usemtl':
                    if (vertexData.length > 0) {
                        const mesh = new Mesh(this.context, new Float32Array(vertexData), ...attributes);
                        mesh.group = group;
                        mesh.object = object;
                        mesh.material = material;
                        this.meshes.push(mesh);

                        vertexData = [];
                    }

                    material = this.materials.get(values.join(' '));
                    break;

                case 'v':
                    if (Number(options.positionElements) > 0) {
                        vertices.push(values.slice(0, options.positionElements).map(Number.parseFloat));
                    }
                    break;

                case 'vt':
                    if (Number(options.texCoordElements) > 0) {
                        texCoords.push(values.slice(0, options.texCoordElements).map(Number.parseFloat));
                    }
                    break;

                case 'vn':
                    if (Number(options.normalElements) > 0) {
                        normals.push(values.slice(0, options.normalElements).map(Number.parseFloat));
                    }
                    break;

                case 'f':
                    const indexes = values.length === 3 ? [0, 1, 2] : values.length === 4 ? [0, 1, 2, 0, 2, 3] : [];
                    for (const index of indexes) {
                        const [vertexIndex, texCoordIndex, normalIndex] = values[index].split('/');

                        if (Number(options.positionElements) > 0) {
                            vertexData.push(...vertices[vertexIndex - 1]);
                        }

                        if (Number(options.texCoordElements) > 0) {
                            vertexData.push(...texCoords[texCoordIndex - 1]);
                        }

                        if (Number(options.normalElements) > 0) {
                            vertexData.push(...normals[normalIndex - 1]);
                        }
                    }
                    break;
            }
        }

        if (vertexData.length > 0) {
            const mesh = new Mesh(this.context, new Float32Array(vertexData), ...attributes);
            mesh.group = group;
            mesh.object = object;
            mesh.material = material;
            this.meshes.push(mesh);
        }

        return this;
    }

    /**
     * @param {string} src
     * @param {Object} options
     * @param {number|false|null} options.positionElements
     * @param {number|false|null} options.texCoordElements
     * @param {number|false|null} options.normalElements
     */
    async loadObjFromUrl(src, options = {}) {
        const response = await fetch(src);
        const basePath = src.substring(0, src.lastIndexOf('/'));
        return this.loadObj(await response.text(), basePath, options);
    }

    toModel() {
        return new Model(this.meshes.map((mesh) => ({ material: mesh.material, mesh })));
    }
}

export default ObjLoader;
