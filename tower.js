export class Tower {
    constructor(spawnCoordinates, vertexData, uvData, normalData, texId) {
        this.position = spawnCoordinates;
        this.vertexData = vertexData;
        this.uvData = uvData;
        this.normalData = normalData;
        this.texId = texId;
        this.translateMatrix = glMatrix.mat4.create();
        glMatrix.mat4.translate(this.translateMatrix, this.translateMatrix, this.position);
    }



}