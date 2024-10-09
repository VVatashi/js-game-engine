import Material from './material.js';
import Mesh from './mesh.js';
import ShaderProgram from './webgl/shader-program.js';

export class Model {
    /**
     *
     * @param {{ material: Material, mesh: Mesh }[]} nodes
     */
    constructor(nodes = []) {
        this.nodes = nodes;
    }

    /**
     * @param {ShaderProgram} shaderProgram
     */
    draw(shaderProgram) {
        for (const node of this.nodes) {
            node.material.use(shaderProgram);
            node.mesh.draw();
        }
    }
}

export default Model;
