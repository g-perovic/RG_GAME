import { vec3, mat4 } from './gl-matrix-module.js';
export class Bullet {
    constructor(spawnCoordinates, scene, enemy, damage) {
        this.position = vec3.fromValues(...spawnCoordinates);
        this.enemy = enemy;
        this.scene = scene;
        this.damage = damage;


        this.translateMatrix = mat4.create();
        mat4.translate(this.translateMatrix, this.translateMatrix, this.position);
        this.scale = 0.15;
        this.scaleMatrix = mat4.create();
        mat4.scale(this.scaleMatrix, this.scaleMatrix, vec3.fromValues(this.scale, this.scale, this.scale));
        this.rotateMatrix = mat4.create();
        this.rMatrix = mat4.create()
        mat4.rotateX(this.rMatrix, this.rMatrix, Math.PI / 2);
        //mat4.mul(this.translateMatrix, this.translateMatrix, this.scaleMatrix);


        this.speed = 1 / 30;
        this.moveVector = this.calculateMoveVector();
        this.isAtEndPosition = false;
    }

    moveForward() {

        this.moveVector = this.calculateMoveVector();


        mat4.translate(this.translateMatrix, this.translateMatrix, this.moveVector);
        vec3.add(this.position, this.position, this.moveVector);
    }

    calculateMoveVector() {
        let moveVector = vec3.create();
        vec3.sub(moveVector, this.enemy.position, this.position); //calculate direction
        vec3.normalize(moveVector, moveVector);

        for (let index = 0; index < 3; index++) {
            moveVector[index] = moveVector[index] * this.speed;
        }
        return moveVector;
    }
    /* isAtPosition() {
        return ((this.position[0] <= this.movePath[0][0] + 0.01 && this.position[0] >= this.movePath[0][0] - 0.01) &&
            (this.position[1] <= this.movePath[0][1] + 0.01 && this.position[1] >= this.movePath[0][1] - 0.01) &&
            (this.position[2] <= this.movePath[0][2] + 0.01 && this.position[2] >= this.movePath[0][2] - 0.01));
    }
 */
    /* currentPosition() {
        return vec3.transformMat4(vec3.create(), vec3.create(), this.translateMatrix);
    } */

    turnToEnemy() {

        let et = vec3.sub(vec3.create(), this.enemy.currentPosition(), this.position);
        let c = vec3.angle(et, vec3.fromValues(1, 0, 0));

        if (et[2] > 0) {
            c = -c + Math.PI / 2;
        } else {
            c += Math.PI / 2;
        }

        mat4.rotateZ(this.rotateMatrix, this.rMatrix, -c);

    }



    isAtEnemy() {
        return this.position[0] - this.enemy.position[0] < 0.05 && this.position[1] - this.enemy.position[1] < 0.05 && this.position[2] - this.enemy.position[2] < 0.05;
    }

    dealDamage() {
        this.enemy.health -= this.damage;
    }

}