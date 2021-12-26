import { Enemy } from "./enemy.js";

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');


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

function animate() {
    requestAnimationFrame(animate);
    //glMatrix.mat4.translate(viewMatrix, viewMatrix, [0, 0.1, 2]);
    //glMatrix.mat4.invert(viewMatrix, viewMatrix);

    drawEnemy(newEnemy);
    drawEnemy(e);
}


function spawnEnemyAtSpawnPoint(spawnPoint) {
    let a = new Enemy([...spawnPoint], [...vertexDataEnemy], [...uvDataEnemy], [...normalDataEnemy], 0);

    return a;
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

    gl.drawArrays(gl.TRIANGLES, 0, vertexDataEnemy.length / 3);

    enemy.moveForward();
}



/*function spherePointCloud(pointCount){
    let points = [];
    for (let index = 0; index < pointCount; index++) {

        const r = () => (Math.random() * 2) - 1;
        const point = [r(),r(),r()];

        point.forEach(element => {
            points.push(element);
         });
        
    }

    return points;
}

const vertexData = spherePointCloud(1000);*/
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

glMatrix.mat4.translate(viewMatrix, viewMatrix, glMatrix.vec3.fromValues(0, 5, 15));
glMatrix.mat4.rotateX(viewMatrix, viewMatrix, -0.4);
glMatrix.mat4.invert(viewMatrix, viewMatrix);

gl.uniformMatrix4fv(uniformLocations.vmatrix, false, viewMatrix);
gl.uniformMatrix4fv(uniformLocations.pmatrix, false, projectionMatrix);

//LOAD TEXTURES

const enemy = loadTexture(`textures/default_brick.png`);

gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, enemy);

gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);


let newEnemy = spawnEnemyAtSpawnPoint([0, -2, -6]);
let e = spawnEnemyAtSpawnPoint([0, 0, -5]);

//drawEnemy(newEnemy);

/* setInterval(function(){
    animate();
}, 1000/120);
 */

animate();


