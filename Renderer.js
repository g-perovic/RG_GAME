import { vec3, mat4 } from './gl-matrix-module.js';

import { WebGL } from './WebGL.js';

import { shaders } from './shaders.js';


import { Enemy } from "./enemy.js";
import { Tower } from "./tower.js";
import { Bullet } from './bullet.js';

// This class prepares all assets for use with WebGL
// and takes care of rendering.

export class Renderer {

    constructor(gl) {
        this.gl = gl;
        this.glObjects = new Map();
        this.programs = WebGL.buildPrograms(gl, shaders);

        gl.clearColor(1, 1, 1, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
    }

    prepareBufferView(bufferView) {
        if (this.glObjects.has(bufferView)) {
            return this.glObjects.get(bufferView);
        }

        const buffer = new DataView(
            bufferView.buffer,
            bufferView.byteOffset,
            bufferView.byteLength);
        const glBuffer = WebGL.createBuffer(this.gl, {
            target: bufferView.target,
            data: buffer
        });
        this.glObjects.set(bufferView, glBuffer);
        return glBuffer;
    }

    prepareSampler(sampler) {
        if (this.glObjects.has(sampler)) {
            return this.glObjects.get(sampler);
        }

        const glSampler = WebGL.createSampler(this.gl, sampler);
        this.glObjects.set(sampler, glSampler);
        return glSampler;
    }

    prepareImage(image) {
        if (this.glObjects.has(image)) {
            return this.glObjects.get(image);
        }

        const glTexture = WebGL.createTexture(this.gl, { image });
        this.glObjects.set(image, glTexture);
        return glTexture;
    }

    prepareTexture(texture) {
        const gl = this.gl;

        this.prepareSampler(texture.sampler);
        const glTexture = this.prepareImage(texture.image);

        const mipmapModes = [
            gl.NEAREST_MIPMAP_NEAREST,
            gl.NEAREST_MIPMAP_LINEAR,
            gl.LINEAR_MIPMAP_NEAREST,
            gl.LINEAR_MIPMAP_LINEAR,
        ];

        if (!texture.hasMipmaps && mipmapModes.includes(texture.sampler.min)) {
            gl.bindTexture(gl.TEXTURE_2D, glTexture);
            gl.generateMipmap(gl.TEXTURE_2D);
            texture.hasMipmaps = true;
        }
    }

    prepareMaterial(material) {
        if (material.baseColorTexture) {
            this.prepareTexture(material.baseColorTexture);
        }
        if (material.metallicRoughnessTexture) {
            this.prepareTexture(material.metallicRoughnessTexture);
        }
        if (material.normalTexture) {
            this.prepareTexture(material.normalTexture);
        }
        if (material.occlusionTexture) {
            this.prepareTexture(material.occlusionTexture);
        }
        if (material.emissiveTexture) {
            this.prepareTexture(material.emissiveTexture);
        }
    }

    preparePrimitive(primitive) {
        if (this.glObjects.has(primitive)) {
            return this.glObjects.get(primitive);
        }

        this.prepareMaterial(primitive.material);

        const gl = this.gl;
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        if (primitive.indices) {
            const bufferView = primitive.indices.bufferView;
            bufferView.target = gl.ELEMENT_ARRAY_BUFFER;
            const buffer = this.prepareBufferView(bufferView);
            gl.bindBuffer(bufferView.target, buffer);
        }

        // this is an application-scoped convention, matching the shader
        const attributeNameToIndexMap = {
            POSITION: 0,
            TEXCOORD_0: 1,
        };

        for (const name in primitive.attributes) {
            const accessor = primitive.attributes[name];
            const bufferView = accessor.bufferView;
            const attributeIndex = attributeNameToIndexMap[name];

            if (attributeIndex !== undefined) {
                bufferView.target = gl.ARRAY_BUFFER;
                const buffer = this.prepareBufferView(bufferView);
                gl.bindBuffer(bufferView.target, buffer);
                gl.enableVertexAttribArray(attributeIndex);
                gl.vertexAttribPointer(
                    attributeIndex,
                    accessor.numComponents,
                    accessor.componentType,
                    accessor.normalized,
                    bufferView.byteStride,
                    accessor.byteOffset);
            }
        }

        this.glObjects.set(primitive, vao);
        return vao;
    }

    prepareMesh(mesh) {
        for (const primitive of mesh.primitives) {
            this.preparePrimitive(primitive);
        }
    }

    prepareNode(node) {
        if (node.mesh) {
            this.prepareMesh(node.mesh);
        }
        for (const child of node.children) {
            this.prepareNode(child);
        }
    }

    prepareScene(scene) {
        for (const node of scene.nodes) {
            this.prepareNode(node);
        }
    }

    getViewProjectionMatrix(camera) {
        const mvpMatrix = mat4.clone(camera.matrix);
        let parent = camera.parent;
        while (parent) {
            mat4.mul(mvpMatrix, parent.matrix, mvpMatrix);
            parent = parent.parent;
        }
        mat4.invert(mvpMatrix, mvpMatrix);
        mat4.mul(mvpMatrix, camera.camera.matrix, mvpMatrix);
        return mvpMatrix;
    }

    render(scene, camera) {
        const gl = this.gl;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const program = this.programs.simple;
        gl.useProgram(program.program);
        gl.uniform1i(program.uniforms.uTexture, 0);

        const mvpMatrix = this.getViewProjectionMatrix(camera);
        for (const node of scene.nodes) {
            this.renderNode(node, mvpMatrix);
        }
    }

    renderVirus(enemy, vMatrix, pMatrix) {
        const gl = this.gl;

        //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const program = this.programs.simple;
        gl.useProgram(program.program);
        gl.uniform1i(program.uniforms.uTexture, 0);

        let mMatrix = mat4.create();
        mat4.mul(mMatrix, enemy.translateMatrix, enemy.scaleMatrix);

        //const mvpMatrix = this.getViewProjectionMatrix(camera);
        for (const node of enemy.scene.nodes) {
            this.renderNode(node, mMatrix, vMatrix, pMatrix);
        }
    }

    renderTile(tile, vMatrix, pMatrix) {
        const gl = this.gl;

        //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const program = this.programs.simple;
        gl.useProgram(program.program);
        gl.uniform1i(program.uniforms.uTexture, 0);

        let mMatrix = mat4.create();
        mat4.mul(mMatrix, tile.translateMatrix, tile.scaleMatrix);

        //const mvpMatrix = this.getViewProjectionMatrix(camera);
        for (const node of tile.scene.nodes) {
            this.renderNode(node, mMatrix, vMatrix, pMatrix);
        }
    }

    renderTower(tower, vMatrix, pMatrix) {
        const gl = this.gl;

        //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const program = this.programs.simple;
        gl.useProgram(program.program);
        gl.uniform1i(program.uniforms.uTexture, 0);

        let mMatrix = mat4.create();
        mat4.mul(mMatrix, tower.translateMatrix, tower.rotateMatrix);

        //const mvpMatrix = this.getViewProjectionMatrix(camera);
        for (const node of tower.scene.nodes) {
            this.renderNode(node, mMatrix, vMatrix, pMatrix);
        }
    }

    renderBullet(bullet, vMatrix, pMatrix) {
        const gl = this.gl;

        //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const program = this.programs.simple;
        gl.useProgram(program.program);
        gl.uniform1i(program.uniforms.uTexture, 0);

        let mMatrix = mat4.create();
        mat4.mul(mMatrix, bullet.scaleMatrix, bullet.rotateMatrix);
        mat4.mul(mMatrix, bullet.translateMatrix, mMatrix);

        //const mvpMatrix = this.getViewProjectionMatrix(camera);
        for (const node of bullet.scene.nodes) {
            this.renderNode(node, mMatrix, vMatrix, pMatrix);
        }
    }

    renderObject(object, vMatrix, pMatrix) {
        const gl = this.gl;

        //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const program = this.programs.simple;
        gl.useProgram(program.program);
        gl.uniform1i(program.uniforms.uTexture, 0);

        let mMatrix = mat4.create();
        mat4.mul(mMatrix, object.translateMatrix, object.rotateMatrix);

        //const mvpMatrix = this.getViewProjectionMatrix(camera);
        for (const node of object.scene.nodes) {
            this.renderNode(node, mMatrix, vMatrix, pMatrix);
        }
    }


    renderNode(node, tMatrix, vMatrix, pMatrix) {
        const gl = this.gl;

        tMatrix = mat4.clone(tMatrix);
        mat4.mul(tMatrix, tMatrix, node.matrix);

        if (node.mesh) {
            const program = this.programs.simple;
            gl.uniformMatrix4fv(program.uniforms.tMatrix, false, tMatrix);
            gl.uniformMatrix4fv(program.uniforms.vMatrix, false, vMatrix);
            gl.uniformMatrix4fv(program.uniforms.pMatrix, false, pMatrix);

            for (const primitive of node.mesh.primitives) {
                this.renderPrimitive(primitive);
            }
        }

        for (const child of node.children) {
            this.renderNode(child, tMatrix, vMatrix, pMatrix);
        }
    }

    renderPrimitive(primitive) {
        const gl = this.gl;

        const vao = this.glObjects.get(primitive);
        const material = primitive.material;
        const texture = material.baseColorTexture;
        const glTexture = this.glObjects.get(texture.image);
        const glSampler = this.glObjects.get(texture.sampler);

        gl.bindVertexArray(vao);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, glTexture);
        gl.bindSampler(0, glSampler);

        if (primitive.indices) {
            const mode = primitive.mode;
            const count = primitive.indices.count;
            const type = primitive.indices.componentType;
            gl.drawElements(mode, count, type, 0);
        } else {
            const mode = primitive.mode;
            const count = primitive.attributes.POSITION.count;
            gl.drawArrays(mode, 0, count);
        }
    }

}
