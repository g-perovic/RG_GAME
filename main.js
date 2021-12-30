import { vec3, mat4 } from './gl-matrix-module.js';

import { GLTFLoader } from './GLTFLoader.js';
import { Renderer } from './Renderer.js';

import { Enemy } from "./enemy.js";
import { Tower } from "./tower.js";
import { Bullet } from './bullet.js';

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');


const waveSpawn = document.getElementById("spawnWave");
let towerArray = new Array();
let enemyArray = new Array();
let bulletArray = new Array();
let endPosition = [5, -2, 6.5]; //provizoriš

let fCount = 0;


let nTowers = 100 // št towerju ki jih lhku spawnas


for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
        towerArray[i] = new Array(10);
    }
}

if (!gl) {
    throw new Error('WebGL not supported');
}



function createShaders() {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, `#version 300 es
    precision mediump float;

    const vec3 lightDirection = normalize(vec3(0, 3, 5));
    const float ambient = 0.3;

    in vec3 position;
    in vec2 uv;
    in vec3 normal;

    uniform mat4 tMatrix;
    uniform mat4 vMatrix;
    uniform mat4 pMatrix;

    out vec2 vUV; 
    out float vBrightness;

    void main(){
        mat4 normalMatrix = vMatrix * tMatrix;
        normalMatrix = inverse(normalMatrix);
        normalMatrix = transpose(normalMatrix);

        vec3 worldNormal = (normalMatrix * vec4(normal, 1)).xyz;
        float diffuse = max(0.0, dot(worldNormal, lightDirection));

        vUV = uv;
        vBrightness = ambient + diffuse;

        gl_Position = pMatrix * vMatrix * tMatrix * vec4(position, 1);
    }
    `);
    gl.compileShader(vertexShader);

    let status = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    if (!status) {
        const log = gl.getShaderInfoLog(vertexShader);
        throw new Error('Cannot compile vertex shader\nInfo log:\n' + log);
    }



    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `#version 300 es
    precision mediump float;

    in vec2 vUV;
    in float vBrightness;

    uniform sampler2D texID;

    out vec4 oColor;

    void main() {
        vec4 texel = texture(texID, vUV);
        texel.xyz *= vBrightness;
        oColor = texel;
    }
    `);
    gl.compileShader(fragmentShader);

    status = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
    if (!status) {
        const log = gl.getShaderInfoLog(fragmentShader);
        throw new Error('Cannot compile fragment shader\nInfo log:\n' + log);
    }




    return [vertexShader, fragmentShader];
}


function createProgram([...shaders]) {
    const program = gl.createProgram();

    for (let s of shaders) {
        gl.attachShader(program, s);
    }
    gl.linkProgram(program);

    let status = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!status) {
        const log = gl.getProgramInfoLog(program);
        throw new Error('Cannot link program\nInfo log:\n' + log);
    }

    return program;
}

function loadTexture(url) {
    const texture = gl.createTexture();
    const image = new Image();

    image.onload = e => {
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        gl.generateMipmap(gl.TEXTURE_2D);
    };

    image.src = url;
    return texture;
}

// Construct an Array by repeating `pattern` n times
function repeat(n, pattern) {
    return [...Array(n)].reduce(sum => sum.concat(pattern), []);
}

function randomColor() {
    return [Math.random(), Math.random(), Math.random(), 1];
}


waveSpawn.addEventListener("click", function () {
    for (var i = 0; i < 12; i++) {
        setTimeout(function () {
            spawnEnemyAtSpawnPoint([0, -2, -6])
        }, 750 * i);
    }

});

function waveInProgress() {
    for (const x of enemyArray) {
        if (x != null)
            return true;
    }
    return false;
}




function animate() {
    requestAnimationFrame(animate);
    // mat4.translate(viewMatrix, viewMatrix, [0, 0.1, 2]);
    // mat4.invert(viewMatrix, viewMatrix);
    fCount++;





    for (let i = 0; i < towerArray.length; i++) {
        for (let j = 0; j < towerArray[i].length; j++) {
            if (towerArray[i][j] != null) {
                let nearestI;
                if (enemyArray.length > 0 && waveInProgress()) {
                    nearestI = towerArray[i][j].nearestEnemy(enemyArray)
                    // if(enemyArray[nearestI] != null)
                    if (towerArray[i][j].isEnemyInRange(enemyArray[nearestI])) {
                        towerArray[i][j].rotateMatrix = towerArray[i][j].turnToEnemy(enemyArray[nearestI]);
                        if (fCount % towerArray[i][j].fireRate == 0)
                            spawnBulletAtTower(towerArray[i][j], enemyArray[nearestI]);
                        //towerArray[i][j].dealDamage(enemyArray[nearestI]);
                    }

                }

                renderer.renderTower(towerArray[i][j], viewMatrix, projectionMatrix);
            }
        }
    }

    for (let i = 0; i < enemyArray.length; i++) {
        if (enemyArray[i] != null) {
            if (enemyArray[i].isAtEndPosition) {
                enemyArray[i] = null;
            } else {
                if (enemyArray[i].isAlive()) {
                    renderer.renderVirus(enemyArray[i], viewMatrix, projectionMatrix);
                    enemyArray[i].moveForward();
                }
                else
                    enemyArray[i] = null;
            }
        }
    }

    for (let i = 0; i < bulletArray.length; i++) {
        if (bulletArray[i] != null) {
            if (bulletArray[i].isAtEnemy()) {
                bulletArray[i].dealDamage();
                bulletArray[i] = null;
            } else {
                bulletArray[i].turnToEnemy();
                bulletArray[i].moveForward();
                renderer.renderBullet(bulletArray[i], viewMatrix, projectionMatrix);
            }
        }
    }

    placeTower()
}



/* 
PREVERJANJE HTML TABELE
 */
function placeTower() {
    var table = document.getElementById("tableID");

    if (table != null) {
        for (var i = 0; i < table.rows.length; i++) {
            for (var j = 0; j < table.rows[i].cells.length; j++)
                table.rows[i].cells[j].onclick = function () {
                    if (nTowers > 0) {
                        if (!towerArray[9 - parseInt(this.parentElement.id)][this.cellIndex]) {

                            spawnTowerAtCoordinates([this.cellIndex, -2, 9 - parseInt(this.parentElement.id)]);
                            this.style.backgroundColor = "red";
                            nTowers--;
                            setPnTowers();
                        }
                    }
                };
        }
    }
}

function setPnTowers() {
    var numTowers = document.getElementById("nTowers");
    numTowers.textContent = "Towers: " + nTowers;
}

function spawnEnemyAtSpawnPoint(spawnPoint) {
    enemyArray.push(new Enemy([...spawnPoint], virusScene, 0));

}

function spawnTowerAtCoordinates(coordinates) {
    let a = new Tower([...coordinates], towerScene, 1); //tu bo use za towerje
    towerArray[coordinates[2]][coordinates[0]] = a;
}

function spawnBulletAtTower(tower, enemy) {
    let a = new Bullet(tower.getBulletSpawnPosition(enemy), bulletScene, enemy, tower.damage);
    //let a = new Tower([...coordinates], towerScene, 1); //tu bo use za towerje
    bulletArray.push(a);
}



function drawEnemy(enemy) {

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(enemy.vertexData), gl.STATIC_DRAW);


    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(enemy.uvData), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(enemy.normalData), gl.STATIC_DRAW);


    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(uvLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(normalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(uniformLocations.tmatrix, false, enemy.translateMatrix);


    gl.uniform1i(uniformLocations.texId, enemy.texId);

    gl.drawArrays(gl.TRIANGLES, 0, enemy.vertexData.length / 3);


}

function drawTower(tower) {

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tower.vertexData), gl.STATIC_DRAW);


    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tower.uvData), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tower.normalData), gl.STATIC_DRAW);


    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(uvLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(normalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

    let moveMatrix = mat4.create();

    let rotateMatrix = mat4.create();
    let nearestI;
    if (enemyArray.length > 0 && waveInProgress()) {
        nearestI = tower.nearestEnemy(enemyArray)
        // if(enemyArray[nearestI] != null)
        if (tower.isEnemyInRange(enemyArray[nearestI])) {
            rotateMatrix = tower.turnToEnemy(enemyArray[nearestI]);
            tower.dealDamage(enemyArray[nearestI]);
        }

    }

    mat4.mul(moveMatrix, tower.translateMatrix, rotateMatrix);
    // mat4.translate(moveMatrix, moveMatrix, tower.translateMatrix);


    gl.uniformMatrix4fv(uniformLocations.tmatrix, false, moveMatrix);




    gl.uniform1i(uniformLocations.texId, tower.texId);

    gl.drawArrays(gl.TRIANGLES, 0, tower.vertexData.length / 3);

    gl.flush();

    if (nearestI != null && tower.isEnemyInRange(enemyArray[nearestI])) {

        drawLine(tower.gunCoords, enemyArray[nearestI].currentPosition(), tower);
    }

}


function drawLine(v1, v2, tower) {
    let v3 = vec3.create();
    vec3.add(v3, v1, tower.position);

    let v = [
        ...vec3.add(vec3.create(), v3, vec3.fromValues(0, 0.1, 0)),
        ...vec3.add(vec3.create(), v3, vec3.fromValues(0, -0.1, 0)),
        ...vec3.add(vec3.create(), v2, vec3.fromValues(0, 0.1, 0)),
        ...vec3.add(vec3.create(), v2, vec3.fromValues(0, 0.1, 0)),
        ...vec3.add(vec3.create(), v3, vec3.fromValues(0, -0.1, 0)),
        ...vec3.add(vec3.create(), v2, vec3.fromValues(0, -0.1, 0)),

        ...vec3.add(vec3.create(), v3, vec3.fromValues(0.1, 0, 0)),
        ...vec3.add(vec3.create(), v3, vec3.fromValues(-0.1, 0, 0)),
        ...vec3.add(vec3.create(), v2, vec3.fromValues(0.1, 0, 0)),
        ...vec3.add(vec3.create(), v2, vec3.fromValues(0.1, 0, 0)),
        ...vec3.add(vec3.create(), v3, vec3.fromValues(-0.1, 0, 0)),
        ...vec3.add(vec3.create(), v2, vec3.fromValues(-0.1, 0, 0)),
    ];

    let uv = [
        1, 1, // top right
        1, 0, // bottom right
        0, 1, // top left

        0, 1, // top left
        1, 0, // bottom right
        0, 0,  // bottom left


        1, 1, // top right
        1, 0, // bottom right
        0, 1, // top left

        0, 1, // top left
        1, 0, // bottom right
        0, 0,  // bottom left
    ];

    let normal = [
        ...repeat(6, [0, 0, 1]),
        ...repeat(6, [0, 1, 0])
    ];

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);


    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normal), gl.STATIC_DRAW);


    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(uvLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(normalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);


    gl.uniformMatrix4fv(uniformLocations.tmatrix, false, mat4.create());
    gl.uniform1i(uniformLocations.texId, 2);

    gl.drawArrays(gl.TRIANGLES, 0, v.length / 3);

    gl.flush();

}




//triangle data
const vertexDataEnemy = [

    // Front
    0.5, 0.5, 0.5, // top right 
    0.5, -0.5, 0.5, // bottom right
    -0.5, 0.5, 0.5, // top left
    -0.5, 0.5, 0.5, // top left
    0.5, -0.5, 0.5, // bottom right
    -0.5, -0.5, 0.5, // bottom left  

    // Left
    -0.5, 0.5, 0.5,
    -0.5, -0.5, 0.5,
    -0.5, 0.5, -0.5,
    -0.5, 0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, -0.5, -0.5,

    // Back
    -0.5, 0.5, -0.5,
    -0.5, -0.5, -0.5,
    0.5, 0.5, -0.5,
    0.5, 0.5, -0.5,
    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5,

    // Right
    0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, -0.5, -0.5,
    0.5, -0.5, 0.5,

    // Top
    0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
    -0.5, 0.5, 0.5,
    -0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
    -0.5, 0.5, -0.5,

    // Underside
    0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,
    -0.5, -0.5, -0.5,
];

const uvDataEnemy = repeat(6, [
    1, 1, // top right
    1, 0, // bottom right
    0, 1, // top left

    0, 1, // top left
    1, 0, // bottom right
    0, 0  // bottom left
]);

const normalDataEnemy = [
    ...repeat(6, [0, 0, 1]),    // Z+
    ...repeat(6, [-1, 0, 0]),   // X-
    ...repeat(6, [0, 0, -1]),   // Z-
    ...repeat(6, [1, 0, 0]),    // X+
    ...repeat(6, [0, 1, 0]),    // Y+
    ...repeat(6, [0, -1, 0]),   // Y-
]


// F|L|B|R|T|U
const vertexDataBase = [

    // Front
    0.5, 0.5, 0.5, // top right 
    0.5, -0.5, 0.5, // bottom right
    -0.5, 0.5, 0.5, // top left
    -0.5, 0.5, 0.5, // top left
    0.5, -0.5, 0.5, // bottom right
    -0.5, -0.5, 0.5, // bottom left

    // Front2
    0.3, 1, 0.3, // top right 
    0.5, 0.5, 0.5, // bottom right
    -0.3, 1, 0.3, // top left
    -0.3, 1, 0.3, // top left
    0.5, 0.5, 0.5, // bottom right
    -0.5, 0.5, 0.5, // bottom left

    // Left
    -0.5, 0.5, 0.5,
    -0.5, -0.5, 0.5,
    -0.5, 0.5, -0.5,
    -0.5, 0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, -0.5, -0.5,

    // Left2
    -0.3, 1, 0.3,
    -0.5, 0.5, 0.5,//
    -0.3, 1, -0.3,
    -0.3, 1, -0.3,
    -0.5, 0.5, 0.5,//
    -0.5, 0.5, -0.5,//

    // Back
    -0.5, 0.5, -0.5,
    -0.5, -0.5, -0.5,
    0.5, 0.5, -0.5,
    0.5, 0.5, -0.5,
    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5,

    // Back2
    -0.3, 1, -0.3,
    -0.5, 0.5, -0.5,//
    0.3, 1, -0.3,
    0.3, 1, -0.3,
    -0.5, 0.5, -0.5,//
    0.5, 0.5, -0.5,//

    // Right
    0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, -0.5, -0.5,
    0.5, -0.5, 0.5,

    // Right2
    0.3, 1, -0.3,
    0.5, 0.5, -0.5,//
    0.3, 1, 0.3,
    0.3, 1, 0.3,
    0.5, 0.5, -0.5,//
    0.5, 0.5, 0.5,//

    // Top
    0.3, 1, 0.3,
    0.3, 1, -0.3,
    -0.3, 1, 0.3,
    -0.3, 1, 0.3,
    0.3, 1, -0.3,
    -0.3, 1, -0.3,

    // Underside
    0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,
    -0.5, -0.5, -0.5,
];


const uvDataBase = repeat(10, [
    1, 1, // top right
    1, 0, // bottom right
    0, 1, // top left

    0, 1, // top left
    1, 0, // bottom right
    0, 0  // bottom left
]);

// F|L|B|R|T|U
const normalDataBase = [
    ...repeat(6, [0, 0, 1]),    // Z+
    ...repeat(6, [0, 0.1, 0.3]),    // Z+
    ...repeat(6, [-1, 0, 0]),   // X-
    ...repeat(6, [-3, 0.1, 0]),   // X-
    ...repeat(6, [0, 0, -1]),   // Z-
    ...repeat(6, [0, 0.1, -0.3]),   // Z-
    ...repeat(6, [1, 0, 0]),    // X+
    ...repeat(6, [0.3, 0.1, 0]),    // X+
    ...repeat(6, [0, 1, 0]),    // Y+
    ...repeat(6, [0, -1, 0]),   // Y-
]


//const colorData = 
//    [
//        1,0,0,1,
//        0,1,0,1,
//        0,0,1,1
//    ]
//

//const colorData = 
//    [
//        ...randomColor(),
//        ...randomColor(),
//        ...randomColor()
//    ]

function newRandomColor() {
    let colorData = [];
    for (let face = 0; face < 6; face++) {
        let faceColor = randomColor();
        for (let vertex = 0; vertex < 6; vertex++) {
            colorData.push(...faceColor);
        }
    }
    return colorData;
}



const positionBuffer = gl.createBuffer();
//gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
//gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);



const uvBuffer = gl.createBuffer();
//gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
//gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvDataBase), gl.STATIC_DRAW);

const normalBuffer = gl.createBuffer();
//gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
//gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalDataBase), gl.STATIC_DRAW);


const shaders = createShaders();

const program = createProgram(shaders);

gl.useProgram(program);
gl.enable(gl.DEPTH_TEST);



const positionLocation = gl.getAttribLocation(program, `position`);
//gl.enableVertexAttribArray(positionLocation);
//gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
//gl.vertexAttribPointer(positionLocation, 3 , gl.FLOAT, false, 0, 0);

const uvLocation = gl.getAttribLocation(program, `uv`);


const normalLocation = gl.getAttribLocation(program, `normal`);
//gl.enableVertexAttribArray(normalLocation);
//gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
//gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);


const uniformLocations = {
    tmatrix: gl.getUniformLocation(program, `tMatrix`),
    vmatrix: gl.getUniformLocation(program, `vMatrix`),
    pmatrix: gl.getUniformLocation(program, `pMatrix`),
    texId: gl.getUniformLocation(program, `texID`)
};

const modelMatrix = mat4.create();
const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix,
    80 * Math.PI / 180, // vertical field-of-view (angle, radians)
    canvas.width / canvas.height, // aspect W/H
    1e-4, // near cull distance
    1e4 // far cull distance
);

mat4.rotateX(viewMatrix, viewMatrix, -0.4);
mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(0, 0, 15));


mat4.invert(viewMatrix, viewMatrix);

gl.uniformMatrix4fv(uniformLocations.vmatrix, false, viewMatrix);
gl.uniformMatrix4fv(uniformLocations.pmatrix, false, projectionMatrix);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//LOAD MODELS
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* const enemyTex = loadTexture(`textures/default_brick.png`);

gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, enemyTex);

gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

const tower = loadTexture(`textures/default_obsidian.png`);

gl.activeTexture(gl.TEXTURE0 + 1);
gl.bindTexture(gl.TEXTURE_2D, tower);

gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

const laser = loadTexture(`textures/default_diamond_block.png`);

gl.activeTexture(gl.TEXTURE0 + 2);
gl.bindTexture(gl.TEXTURE_2D, laser);

gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); */


let loader = new GLTFLoader();

const renderer = new Renderer(gl);

await loader.load('models/covid-19/covid.gltf');

let virusScene = await loader.loadScene(loader.defaultScene);
let virusCamera = await loader.loadNode('Camera');

if (!virusScene || !virusCamera) {
    throw new Error('Scene or Camera not present in glTF');
}

if (!virusCamera.camera) {
    throw new Error('Camera node does not contain a camera reference');
}


renderer.prepareScene(virusScene);



await loader.load('models/topcina/topcina.gltf');

let towerScene = await loader.loadScene(loader.defaultScene);
let towerCamera = await loader.loadNode('Camera');

if (!towerScene || !towerCamera) {
    throw new Error('Scene or Camera not present in glTF');
}

if (!towerCamera.camera) {
    throw new Error('Camera node does not contain a camera reference');
}


renderer.prepareScene(towerScene);

await loader.load('models/inekcija/inekcija.gltf');

let bulletScene = await loader.loadScene(loader.defaultScene);
let bulletCamera = await loader.loadNode('Camera');

if (!bulletScene || !bulletCamera) {
    throw new Error('Scene or Camera not present in glTF');
}

if (!bulletCamera.camera) {
    throw new Error('Camera node does not contain a camera reference');
}


renderer.prepareScene(bulletScene);



/* enemyArray[0] = new Enemy([-9, -2, -9], virusScene, 0);
bulletArray[0] = new Bullet([9, -2, -9], bulletScene, enemyArray[0], 1); */




setPnTowers();
animate();


