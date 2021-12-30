import { mat4 } from './gl-matrix-module.js';

export class Camera {

    constructor(options = {}) {
        this.node = options.node || null;
        this.matrix = options.matrix
            ? mat4.clone(options.matrix)
            : mat4.create();
    }

}
