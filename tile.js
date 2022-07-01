import { vec3, mat4 } from './gl-matrix-module.js';
export class Tile{
    constructor(scene, x ,y){
        this.scene = scene;
        this.position = [2*x-9, 9, 2*y-9];
        this.translateMatrix = mat4.create();
        mat4.translate(this.translateMatrix, this.translateMatrix, this.position);
        this.scale = 1;
        this.scaleMatrix = mat4.create();
        mat4.scale(this.scaleMatrix, this.scaleMatrix, vec3.fromValues(this.scale, this.scale, this.scale));
        this.speed = 1/10;
    }

    moveToCorrectPosition(){
        if(!this.isAtPosition() && this.position != [this.position[0], -3, this.position[2]]){
            let moveVector = vec3.create();
            vec3.sub(moveVector, [this.position[0], -3, this.position[2]], this.position); //calculate direction
            vec3.normalize(moveVector, moveVector);

            for (let index = 0; index < 3; index++) {
                moveVector[index] = moveVector[index] * this.speed;
            }

            mat4.translate(this.translateMatrix, this.translateMatrix, moveVector);
            vec3.add(this.position, this.position, moveVector);
        }
        
    }

    isAtPosition() {
        return ((this.position[1] <= -3 + 0.01 && this.position[1] >= -3 - 0.01))
    }
}