import { vec3, mat4 } from './gl-matrix-module.js';
export class Obj {
    constructor(position, scene, scale, rotateMatrix) {
        this.position = position;
        this.scene = scene
        this.translateMatrix = mat4.create();
        this.scale = scale;
        this.scaleMatrix = mat4.create();
        mat4.scale(this.scaleMatrix, this.scaleMatrix, vec3.fromValues(this.scale, this.scale, this.scale));
        mat4.translate(this.translateMatrix, this.translateMatrix, this.position);

        mat4.mul(this.translateMatrix, this.translateMatrix, this.scaleMatrix);
        this.rotateMatrix = rotateMatrix;

    }

}