export class Tower {
<<<<<<< Updated upstream
    constructor(spawnCoordinates, vertexData, uvData, normalData, texId) {
=======
    constructor(spawnCoordinates, scene, texId, damage, speed, scale, range) {
        spawnCoordinates[0] = spawnCoordinates[0] * 2 - 9;
        spawnCoordinates[2] = spawnCoordinates[2] * 2 - 9;

        this.position = spawnCoordinates;
        this.scene = scene
        this.texId = texId;
        this.translateMatrix = mat4.create();
        this.scale = scale;
        this.scaleMatrix = mat4.create();
        mat4.scale(this.scaleMatrix, this.scaleMatrix, vec3.fromValues(this.scale, this.scale, this.scale));
        this.rotateMatrix = mat4.create();
        mat4.rotateY(this.rotateMatrix, this.rotateMatrix, -Math.PI/2);
        this.range = range;
        this.gunCoords = vec3.fromValues(0, 0, 2);
        this.damage = damage;
        this.fireRate = speed;
        mat4.translate(this.translateMatrix, this.translateMatrix, this.position);

        mat4.mul(this.translateMatrix, this.translateMatrix, this.rotateMatrix);
        mat4.mul(this.translateMatrix, this.translateMatrix, this.scaleMatrix);
    }
    /* constructor(spawnCoordinates, vertexData, uvData, normalData, texId) {
>>>>>>> Stashed changes
        spawnCoordinates[0] = spawnCoordinates[0] * 2 - 9;
        spawnCoordinates[2] = spawnCoordinates[2] * 2 - 9;

        this.position = spawnCoordinates;
        this.vertexData = vertexData;
        this.uvData = uvData;
        this.normalData = normalData;
        this.texId = texId;
        this.translateMatrix = glMatrix.mat4.create();
        this.range = 5;
        this.gunCoords = glMatrix.vec3.fromValues(0,1.5,0);
        this.damage = 1;
        glMatrix.mat4.translate(this.translateMatrix, this.translateMatrix, this.position);
    }

    distanceFromEnemy(enemy) {
        return glMatrix.vec3.distance(this.position, enemy.currentPosition());
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
        
            let et = glMatrix.vec3.sub(glMatrix.vec3.create(), enemy.currentPosition(), this.position);
            let c = glMatrix.vec3.angle(et, glMatrix.vec3.fromValues(1, 0, 0));

            if (et[2] > 0) {
                c = -c + Math.PI / 2;
            } else {
                c += Math.PI / 2;
            }

            return glMatrix.mat4.rotateY(glMatrix.mat4.create(), glMatrix.mat4.create(), c);
        

        return glMatrix.mat4.create();

    }

    isEnemyInRange(enemy){
        return this.distanceFromEnemy(enemy) <= this.range;
    }

    dealDamage(enemy){
        enemy.health-=this.damage;
    }

}

function indexOfSmallest(a) {
    var lowest = 0;
    for (var i = 1; i < a.length; i++) {
        if (a[i] < a[lowest]) lowest = i;
    }
    return lowest;
}