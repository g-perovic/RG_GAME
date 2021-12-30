
import { vec3, mat4 } from './gl-matrix-module.js';
export class Enemy {
    constructor(spawnCoordinates, scene, texId, enemyPath) {
        this.position = spawnCoordinates;
        this.movePath = enemyPath;
        this.scene = scene;
        this.texId = texId;

        this.translateMatrix = mat4.create();
        mat4.translate(this.translateMatrix, this.translateMatrix, this.position);
        this.scale = 0.5;
        this.scaleMatrix = mat4.create();
        mat4.scale(this.scaleMatrix, this.scaleMatrix, vec3.fromValues(this.scale, this.scale, this.scale));

        //mat4.mul(this.translateMatrix, this.translateMatrix, this.scaleMatrix);

        this.health = 60 * 2;
        this.speed = 1 / 50;
        this.moveVector = this.calculateMoveVector();
        this.isAtEndPosition = false;
    }

    /* constructor(spawnCoordinates, vertexData, uvData, normalData, texId) {
        this.position = spawnCoordinates;
        this.movePath = [[0, -2, -6], [1, -2, -4], [-5, -2, 0], [5, -2, 6.5]];
        this.vertexData = vertexData;
        this.uvData = uvData;
        this.normalData = normalData;
        this.texId = texId;
        this.translateMatrix =  mat4.create();
         mat4.translate(this.translateMatrix, this.translateMatrix, this.position);
        this.health = 60 * 2;
        this.speed = 1 / 50;
        this.moveVector = this.calculateMoveVector();
        this.isAtEndPosition = false;
    } */


    moveForward() {
        if (this.isAtPosition()) {
            if (this.movePath.length != 1) {
                this.movePath.shift();
            } else {
                this.isAtEndPosition = true;
            }
            this.moveVector = this.calculateMoveVector();
        }

        mat4.translate(this.translateMatrix, this.translateMatrix, this.moveVector);
        vec3.add(this.position, this.position, this.moveVector);
    }

    calculateMoveVector() {
        let moveVector = vec3.create();
        vec3.sub(moveVector, this.movePath[0], this.position); //calculate direction
        vec3.normalize(moveVector, moveVector);

        for (let index = 0; index < 3; index++) {
            moveVector[index] = moveVector[index] * this.speed;
        }
        return moveVector;
    }
    isAtPosition() {
        return ((this.position[0] <= this.movePath[0][0] + 0.01 && this.position[0] >= this.movePath[0][0] - 0.01) &&
            (this.position[1] <= this.movePath[0][1] + 0.01 && this.position[1] >= this.movePath[0][1] - 0.01) &&
            (this.position[2] <= this.movePath[0][2] + 0.01 && this.position[2] >= this.movePath[0][2] - 0.01));
    }

    currentPosition() {
        return vec3.transformMat4(vec3.create(), vec3.create(), this.translateMatrix);
    }

    isAlive() {
        return this.health > 0;
    }

}