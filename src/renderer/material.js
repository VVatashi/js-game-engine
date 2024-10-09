import { Vec4 } from '@vvatashi/js-vec-math/src/vec4.js';
import ShaderProgram from './webgl/shader-program.js';

export class Material {
    constructor() {
        this.ambientColor = Vec4.unitW;
        this.diffuseColor = Vec4.one;
        this.specularColor = Vec4.unitW;

        this.specularExponent = 1;
        this.refractionIndex = 1;
        this.transparent = false;
    }

    /**
     * @param {Material} material
     */
    copyFrom(material) {
        this.ambientColor = [...material.ambientColor];
        this.diffuseColor = [...material.diffuseColor];
        this.specularColor = [...material.specularColor];

        this.specularExponent = material.specularExponent;
        this.refractionIndex = material.refractionIndex;
        this.transparent = material.transparent;

        return this;
    }

    /**
     * @param {Material} material
     */
    static copyFrom(material) {
        return new Material().copyFrom(material);
    }

    /**
     * @param {ShaderProgram} shaderProgram
     */
    use(shaderProgram) {
        shaderProgram
            .setUniformVec4('ambientColor', this.ambientColor)
            .setUniformVec4('diffuseColor', this.diffuseColor)
            .setUniformVec4('specularColor', this.specularColor)
            .setUniformFloat('specularExponent', this.specularExponent)
            .setUniformFloat('refractionIndex', this.refractionIndex);

        return this;
    }
}

export default Material;
