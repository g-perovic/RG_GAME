import { Enemy } from "./enemy.js";
import { Tower } from "./tower.js";

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');


const waveSpawn = document.getElementById("spawnWave");
let towerArray = new Array();
let enemyArray = new Array();
let pathArray = new Array();

let previousClick = [0,0];
let allowTowersAndEnemies = false;
let enemyPath = [];

let nTowers = 5 // št towerju ki jih lhku spawnas


for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
        towerArray[i] = new Array(10);
    }
}

for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
        pathArray[i] = new Array(10);
        pathArray[i].fill(0);
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
    if(allowTowersAndEnemies){
        for (var i = 0; i < 12; i++) {
            setTimeout(function () {
                spawnEnemyAtSpawnPoint([-9, -2, -9])
            }, 750 * i);
        }
    }
});

function waveInProgress() {
    for (const x of enemyArray) {
        if (x != null)
            return true;
    }
    return false;
}


function setPath(pathArray){ 
    var table = document.getElementById("tableID");
    pathArray[0][0] = 1;
    colorRow(pathArray, 0);
    colorColumn(pathArray, 0);
    colorTable(pathArray,table);
    
}

function drawPath(pathArray, end){
    if(previousClick[0] == end[0]){
        let x1 = Math.min(previousClick[1], end[1]);
        let x2 = Math.max(previousClick[1], end[1]);

        for (let i = x1; i <= x2; i++) {
            pathArray[previousClick[0]][i] = 1;   
        }
    }
    else if(previousClick[1] == end[1]){
        let x1 = Math.min(previousClick[0], end[0]);
        let x2 = Math.max(previousClick[0], end[0]);

        for (let i = x1; i <= x2; i++) {
            pathArray[i][previousClick[1]] = 1;   
        }
    }
    previousClick = end;
}

function clearPath(pathArray){
    for (let i = 0; i < pathArray.length; i++) {
        for (let j = 0; j < pathArray[i].length; j++) {
            if(pathArray[i][j] == 2){
                pathArray[i][j] = 0;
            } 
        }
    }
}

function colorRow(pathArray, x){
    for (let i = 0; i < pathArray[x].length; i++) {
        if(pathArray[i][x] == 0){
            pathArray[i][x] = 2;   
        }
         
    }
}

function colorColumn(pathArray, x){
    for (let i = 0; i < pathArray.length; i++) {
        if(pathArray[x][i] == 0){
            pathArray[x][i] = 2;   
        }    
    }
}

function colorTable(pathArray, table){
    for (var i = 0; i < table.rows.length; i++) {
        for (var j = 0; j < table.rows[i].cells.length; j++){
            if(pathArray[i][j] == 0){
                table.rows[i].cells[j].style.backgroundColor = "white";
                table.rows[i].cells[j].onclick = null;
            }
            else if (pathArray[i][j] == 1){
                table.rows[i].cells[j].style.backgroundColor = "blue";
                table.rows[i].cells[j].onclick = null;
            }
            else if (pathArray[i][j] == 2){
                table.rows[i].cells[j].style.backgroundColor = "black";
                table.rows[i].cells[j].onclick = setPathOnClick;
            }
        }
    }
}

function setPathOnClick(){
    var table = document.getElementById("tableID");
    let x = this.cellIndex;
    let z = 9 - parseInt(this.parentElement.id);
    clearPath(pathArray);
    colorRow(pathArray, x);
    colorColumn(pathArray, z);
    drawPath(pathArray, [z,x]);
    colorTable(pathArray, table);
    if(pathArray[9][9] == 1){
        clearPath(pathArray);
        allowTowersAndEnemies = true;
        colorTable(pathArray, table);
    }


    enemyPath.push([x*2-9,-2,z*2-9]);
}




function animate() {
    requestAnimationFrame(animate);
    //glMatrix.mat4.translate(viewMatrix, viewMatrix, [0, 0.1, 2]);
    //glMatrix.mat4.invert(viewMatrix, viewMatrix);






    for (let i = 0; i < towerArray.length; i++) {
        for (let j = 0; j < towerArray[i].length; j++) {
            if (towerArray[i][j] != null) {
                drawTower(towerArray[i][j]);
            }
        }
    }

    for (let i = 0; i < enemyArray.length; i++) {
        if (enemyArray[i] != null) {
            if (enemyArray[i].isAtEndPosition) {
                enemyArray[i] = null;
            } else {
                if (enemyArray[i].isAlive())
                    drawEnemy(enemyArray[i]);
                else
                    enemyArray[i] = null;
            }
        }
    }
    if(allowTowersAndEnemies){
        placeTower();
    }
    
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
                    if(nTowers > 0){
                        spawnTowerAtCoordinates([this.cellIndex, -2, 9 - parseInt(this.parentElement.id)]);
                        this.style.backgroundColor = "red";
                        nTowers--;
                        setPnTowers();
                    }
                };
        }
    }
}

function setPnTowers(){
    var numTowers = document.getElementById("nTowers");
    numTowers.textContent = "Towers: " + nTowers;
}

function spawnEnemyAtSpawnPoint(spawnPoint) {
    enemyArray.push(new Enemy([...spawnPoint], virusScene, 0, [...enemyPath]));
}

function spawnTowerAtCoordinates(coordinates) {
    let a = new Tower([...coordinates], [...vertexDataBase], [...uvDataBase], [...normalDataBase], 1); //tu bo use za towerje
    towerArray[coordinates[2]][coordinates[0]] = a;
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

    enemy.moveForward();
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

    let moveMatrix = glMatrix.mat4.create();

    let rotateMatrix = glMatrix.mat4.create();
    let nearestI;
    if (enemyArray.length > 0 && waveInProgress()) {
        nearestI = tower.nearestEnemy(enemyArray)
        // if(enemyArray[nearestI] != null)
        if (tower.isEnemyInRange(enemyArray[nearestI])) {
            rotateMatrix = tower.turnToEnemy(enemyArray[nearestI]);
            tower.dealDamage(enemyArray[nearestI]);
        }

    }

    glMatrix.mat4.mul(moveMatrix, tower.translateMatrix, rotateMatrix);
    //glMatrix.mat4.translate(moveMatrix, moveMatrix, tower.translateMatrix);


    gl.uniformMatrix4fv(uniformLocations.tmatrix, false, moveMatrix);




    gl.uniform1i(uniformLocations.texId, tower.texId);

    gl.drawArrays(gl.TRIANGLES, 0, tower.vertexData.length / 3);

    gl.flush();

    if (nearestI != null && tower.isEnemyInRange(enemyArray[nearestI])) {

        drawLine(tower.gunCoords, enemyArray[nearestI].currentPosition(), tower);
    }

}


function drawLine(v1, v2, tower) {
    let v3 = glMatrix.vec3.create();
    glMatrix.vec3.add(v3, v1, tower.position);

    let v = [
        ...glMatrix.vec3.add(glMatrix.vec3.create(), v3, glMatrix.vec3.fromValues(0, 0.1, 0)),
        ...glMatrix.vec3.add(glMatrix.vec3.create(), v3, glMatrix.vec3.fromValues(0, -0.1, 0)),
        ...glMatrix.vec3.add(glMatrix.vec3.create(), v2, glMatrix.vec3.fromValues(0, 0.1, 0)),
        ...glMatrix.vec3.add(glMatrix.vec3.create(), v2, glMatrix.vec3.fromValues(0, 0.1, 0)),
        ...glMatrix.vec3.add(glMatrix.vec3.create(), v3, glMatrix.vec3.fromValues(0, -0.1, 0)),
        ...glMatrix.vec3.add(glMatrix.vec3.create(), v2, glMatrix.vec3.fromValues(0, -0.1, 0)),

        ...glMatrix.vec3.add(glMatrix.vec3.create(), v3, glMatrix.vec3.fromValues(0.1, 0, 0)),
        ...glMatrix.vec3.add(glMatrix.vec3.create(), v3, glMatrix.vec3.fromValues(-0.1, 0, 0)),
        ...glMatrix.vec3.add(glMatrix.vec3.create(), v2, glMatrix.vec3.fromValues(0.1, 0, 0)),
        ...glMatrix.vec3.add(glMatrix.vec3.create(), v2, glMatrix.vec3.fromValues(0.1, 0, 0)),
        ...glMatrix.vec3.add(glMatrix.vec3.create(), v3, glMatrix.vec3.fromValues(-0.1, 0, 0)),
        ...glMatrix.vec3.add(glMatrix.vec3.create(), v2, glMatrix.vec3.fromValues(-0.1, 0, 0)),
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


    gl.uniformMatrix4fv(uniformLocations.tmatrix, false, glMatrix.mat4.create());
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

const modelMatrix = glMatrix.mat4.create();
const viewMatrix = glMatrix.mat4.create();
const projectionMatrix = glMatrix.mat4.create();
glMatrix.mat4.perspective(projectionMatrix,
    80 * Math.PI / 180, // vertical field-of-view (angle, radians)
    canvas.width / canvas.height, // aspect W/H
    1e-4, // near cull distance
    1e4 // far cull distance
);

glMatrix.mat4.rotateX(viewMatrix, viewMatrix, -0.4);
glMatrix.mat4.translate(viewMatrix, viewMatrix, glMatrix.vec3.fromValues(0, 0, 15));


glMatrix.mat4.invert(viewMatrix, viewMatrix);

gl.uniformMatrix4fv(uniformLocations.vmatrix, false, viewMatrix);
gl.uniformMatrix4fv(uniformLocations.pmatrix, false, projectionMatrix);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//LOAD TEXTURES
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
const enemyTex = loadTexture(`textures/default_brick.png`);

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

gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);




setPnTowers();
animate();
setPath(pathArray);


