import { vec3, mat4 } from './gl-matrix-module.js';

export class Tower {
    constructor(spawnCoordinates, scene, texId) {
        spawnCoordinates[0] = spawnCoordinates[0] * 2 - 9;
        spawnCoordinates[2] = spawnCoordinates[2] * 2 - 9;

        this.position = spawnCoordinates;
        this.scene = scene
        this.texId = texId;
        this.translateMatrix = mat4.create();
        this.scale = 0.1;
        this.scaleMatrix = mat4.create();
        mat4.scale(this.scaleMatrix, this.scaleMatrix, vec3.fromValues(this.scale, this.scale, this.scale));
        this.rotateMatrix = mat4.create();
        this.range = 5;
        this.gunCoords = vec3.fromValues(0, 1.5, 0);
        this.damage = 1;
        mat4.translate(this.translateMatrix, this.translateMatrix, this.position);

        mat4.mul(this.translateMatrix, this.translateMatrix, this.scaleMatrix);
    }
    /* constructor(spawnCoordinates, vertexData, uvData, normalData, texId) {
        spawnCoordinates[0] = spawnCoordinates[0] * 2 - 9;
        spawnCoordinates[2] = spawnCoordinates[2] * 2 - 9;

        this.position = spawnCoordinates;
        this.vertexData = vertexData;
        this.uvData = uvData;
        this.normalData = normalData;
        this.texId = texId;
        this.translateMatrix =  mat4.create();
        this.range = 5;
        this.gunCoords =  vec3.fromValues(0,1.5,0);
        this.damage = 1;
         mat4.translate(this.translateMatrix, this.translateMatrix, this.position);
    }
 */

    distanceFromEnemy(enemy) {
        return vec3.distance(this.position, enemy.currentPosition());
    }

    nearestEnemy(enemyArray) {
        let distances = new Array(0);
        for (const x of enemyArray) {
            if (x != null) {
                distances.push(this.distanceFromEnemy(x));
            }
            else {
                distances.push(10000)
            }
        }


        let i = indexOfSmallest(distances);

        return i;
    }


    turnToEnemy(enemy) {

        let et = vec3.sub(vec3.create(), enemy.currentPosition(), this.position);
        let c = vec3.angle(et, vec3.fromValues(1, 0, 0));

        if (et[2] > 0) {
            c = -c + Math.PI / 2;
        } else {
            c += Math.PI / 2;
        }

        return mat4.rotateY(mat4.create(), mat4.create(), c);



    }

    isEnemyInRange(enemy) {
        return this.distanceFromEnemy(enemy) <= this.range;
    }

    dealDamage(enemy) {
        enemy.health -= this.damage;
    }

}

function indexOfSmallest(a) {
    var lowest = 0;
    for (var i = 1; i < a.length; i++) {
        if (a[i] < a[lowest]) lowest = i;
    }
    return lowest;
}