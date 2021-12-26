export class Enemy{
    constructor(spawnCoordinates, vertexData, uvData, normalData, texID){
        this.position = spawnCoordinates;
        this.movePath = [[0,-2,-6],[1,-2,-4],[-5,-2,0], [5,-2,6.5]];
        this.vertexData = vertexData;
        this.uvData = uvData;
        this.normalData = normalData;
        this.texID = texID;
        this.translateMatrix = glMatrix.mat4.create();
        glMatrix.mat4.translate(this.translateMatrix, this.translateMatrix, this.position);
        this.speed = 1/50;
        this.moveVector = this.calculateMoveVector();
    }

    moveForward(){
        if (this.isAtPosition()){
            this.movePath.shift();
            this.moveVector = this.calculateMoveVector();
        }
        
        glMatrix.mat4.translate(this.translateMatrix, this.translateMatrix, this.moveVector);
        glMatrix.vec3.add(this.position,this.position, this.moveVector);
    }

    calculateMoveVector(){
        let moveVector = glMatrix.vec3.create();
        glMatrix.vec3.sub(moveVector, this.movePath[0], this.position); //calculate direction
        glMatrix.vec3.normalize(moveVector, moveVector);
        
        for (let index = 0; index < 3; index++) {
            moveVector[index] = moveVector[index]*this.speed;
        }
        return moveVector;
    }
    isAtPosition(){
        return ((this.position[0] <= this.movePath[0][0]+0.01 && this.position[0] >= this.movePath[0][0]-0.01) &&
                (this.position[1] <= this.movePath[0][1]+0.01 && this.position[1] >= this.movePath[0][1]-0.01) &&
                (this.position[2] <= this.movePath[0][2]+0.01 && this.position[2] >= this.movePath[0][2]-0.01));
    }
}
