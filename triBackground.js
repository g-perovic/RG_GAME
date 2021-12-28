export class TriBackground {
    constructor(x, angle, scale, texId) {
        this.vertexData = [
            0.5, 0.5, 0.5, // top right 
            0.5, -0.5, 0.5, // bottom right
            -0.5, 0.5, 0.5, // top left
        ];
        this.uvData = [
            1, 1, // top right
            1, 0, // bottom right
            0, 1, // top left
        ];
        this.normalData = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
        ];
        this.position = glMatrix.vec3.fromValues(x, 25, -20);
        this.angle = angle;
        this.scale = scale;
        this.texId = texId;
        this.translateMatrix = glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), this.position);

        this.rotateMatrix = glMatrix.mat4.fromXRotation(glMatrix.mat4.create(), -0.4);
        glMatrix.mat4.rotateZ(this.rotateMatrix, this.rotateMatrix, angle);
        this.scaleMatrix = glMatrix.mat4.fromScaling(glMatrix.mat4.create(), glMatrix.vec3.fromValues(scale, scale, 1));
        this.time = 120;
        this.speed = 1 / 20;
        this.shirnkSpeed = 1 / 100;
        this.downVector = glMatrix.vec3.fromValues(0, -this.speed, 0);
        //glMatrix.vec3.rotateX(this.downVector, this.downVector, -0.4)
    }

    moveDown() {
        glMatrix.mat4.translate(this.translateMatrix, this.translateMatrix, this.downVector);
        glMatrix.vec3.add(this.position, this.position, this.downVector);
    }

    shrink() {
        this.scale -= this.shirnkSpeed;
        this.scaleMatrix = glMatrix.mat4.fromScaling(glMatrix.mat4.create(), glMatrix.vec3.fromValues(this.scale, this.scale, 1));
    }

    isGone() {
        return this.scale <= 0.5;
    }
}