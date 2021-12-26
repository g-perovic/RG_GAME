import { Enemy } from "./enemy.js";

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');


if (!gl){
    throw new Error('WebGL not supported');
}

function createShaders(){
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, `#version 300 es
    precision mediump float;

    in vec3 position;
    in vec4 vertColor;

    uniform mat4 tMatrix;
    uniform mat4 vMatrix;
    uniform mat4 pMatrix;

    out vec4 fragColor; 
    void main(){
        fragColor = vertColor;
        gl_Position = pMatrix * vMatrix * tMatrix * vec4(position, 1);
    }
    `);
    gl.compileShader(vertexShader);
    
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader,`#version 300 es
    precision mediump float;
    in vec4 fragColor;

    out vec4 color;
    void main(){
        color = fragColor;
    }
    `);
    gl.compileShader(fragmentShader);

    return [vertexShader, fragmentShader];
}


function createProgram([...shaders]){
    const program = gl.createProgram();
    
    for(let s of shaders){
        gl.attachShader(program,s);
    }
    gl.linkProgram(program);

    return program;
}

function randomColor(){
    return [Math.random(), Math.random(), Math.random(), 1];
}

function animate(enemy){

    //glMatrix.mat4.translate(viewMatrix, viewMatrix, [0, 0.1, 2]);
    //glMatrix.mat4.invert(viewMatrix, viewMatrix);

    gl.uniformMatrix4fv(uniformLocations.tmatrix, false, enemy.translateMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, vertexData.length/3);

    enemy.moveForward();
}


function spawnEnemyAtSpawnPoint(spawnPoint){
    let a = new Enemy([...spawnPoint], [...vertexData], [...newRandomColor()]);

    return a;
}


function drawEnemy(enemy){

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(enemy.vertexData), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(enemy.colorData), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 3 , gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorLocation, 4 , gl.FLOAT, false, 0, 0);

    //animate(enemy);
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
const vertexData = [

    // Front
    0.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    -.5, 0.5, 0.5,
    -.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    -.5, -.5, 0.5,

    // Left
    -.5, 0.5, 0.5,
    -.5, -.5, 0.5,
    -.5, 0.5, -.5,
    -.5, 0.5, -.5,
    -.5, -.5, 0.5,
    -.5, -.5, -.5,

    // Back
    -.5, 0.5, -.5,
    -.5, -.5, -.5,
    0.5, 0.5, -.5,
    0.5, 0.5, -.5,
    -.5, -.5, -.5,
    0.5, -.5, -.5,

    // Right
    0.5, 0.5, -.5,
    0.5, -.5, -.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    0.5, -.5, -.5,

    // Top
    0.5, 0.5, 0.5,
    0.5, 0.5, -.5,
    -.5, 0.5, 0.5,
    -.5, 0.5, 0.5,
    0.5, 0.5, -.5,
    -.5, 0.5, -.5,

    // Bottom
    0.5, -.5, 0.5,
    0.5, -.5, -.5,
    -.5, -.5, 0.5,
    -.5, -.5, 0.5,
    0.5, -.5, -.5,
    -.5, -.5, -.5,
];



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

function newRandomColor(){
    let colorData = [];
    for(let face = 0; face < 6; face++){
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

const colorBuffer = gl.createBuffer();
//gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
//gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

const shaders = createShaders();

const program = createProgram(shaders);

const positionLocation = gl.getAttribLocation(program, `position`);
//gl.enableVertexAttribArray(positionLocation);
//gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
//gl.vertexAttribPointer(positionLocation, 3 , gl.FLOAT, false, 0, 0);

const colorLocation = gl.getAttribLocation(program, `vertColor`);
//gl.enableVertexAttribArray(colorLocation);
//gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
//gl.vertexAttribPointer(colorLocation, 4 , gl.FLOAT, false, 0, 0);

gl.useProgram(program);
gl.enable(gl.DEPTH_TEST);

const uniformLocations = {
    tmatrix: gl.getUniformLocation(program, `tMatrix`),
    vmatrix: gl.getUniformLocation(program, `vMatrix`),
    pmatrix: gl.getUniformLocation(program, `pMatrix`),
};

const modelMatrix = glMatrix.mat4.create();
const viewMatrix = glMatrix.mat4.create();
const projectionMatrix = glMatrix.mat4.create();
glMatrix.mat4.perspective(projectionMatrix, 
    80 * Math.PI/180, // vertical field-of-view (angle, radians)
    canvas.width/canvas.height, // aspect W/H
    1e-4, // near cull distance
    1e4 // far cull distance
);

glMatrix.mat4.translate(viewMatrix, viewMatrix, glMatrix.vec3.fromValues(0, 5, 15));
glMatrix.mat4.rotateX(viewMatrix, viewMatrix, -0.4);
glMatrix.mat4.invert(viewMatrix, viewMatrix);

gl.uniformMatrix4fv(uniformLocations.vmatrix, false, viewMatrix);
gl.uniformMatrix4fv(uniformLocations.pmatrix, false, projectionMatrix);
let newEnemy = spawnEnemyAtSpawnPoint([0,-2,-6]);

drawEnemy(newEnemy);

setInterval(function(){
    animate(newEnemy);
}, 1000/120);



