export class Enemy{
    constructor(spawnCoordinates, vertexData, uvData, normalData, texId){
        this.position = spawnCoordinates;
        this.movePath = [[0,-2,-6],[1,-2,-4],[-5,-2,0], [5,-2,6.5]];
        this.vertexData = vertexData;
        this.uvData = uvData;
        this.normalData = normalData;
        this.texId = texId;
        this.translateMatrix = glMatrix.mat4.create();
        glMatrix.mat4.translate(this.translateMatrix, this.translateMatrix, this.position);
        this.speed = 1/50;
        this.moveVector = this.calculateMoveVector();
        this.isAtEndPosition = false;
    }

    moveForward(){
        if (this.isAtPosition()){
            if(this.movePath.length != 1){
                this.movePath.shift();
            }else{
                this.isAtEndPosition = true;
            }
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
