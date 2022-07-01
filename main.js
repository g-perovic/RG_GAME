import { Enemy } from "./enemy.js";
import { Tower } from "./tower.js";
<<<<<<< Updated upstream
=======
import { Bullet } from './bullet.js';
import { Tile } from "./tile.js";
import { Obj } from './object.js';
>>>>>>> Stashed changes

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');


const waveSpawn = document.getElementById("spawnWave");
const towerGrid = document.getElementById("towerSelectGrid");
let towerArray = new Array();
let enemyArray = new Array();
<<<<<<< Updated upstream
let pathArray = new Array();
=======
let bulletArray = new Array();
let pathArray = new Array();
let tileArray = new Array();
let objArray = new Array();

let previousClick = [0,0];
let allowTowersAndEnemies = false;
let enemyPath = [];

let enemySpeedMul = 1;
let enemyHealthMul = 2;

let fCount = 0;
>>>>>>> Stashed changes

let previousClick = [0,0];
let allowTowersAndEnemies = false;
let enemyPath = [];

<<<<<<< Updated upstream
let nTowers = 5 // št towerju ki jih lhku spawnas
=======
let nClicks = 7; // št towerju ki jih lhku spawnas
let playerMoney = 250;
let towerCost = 125;
let numberOfEnemySpawn = 10;
let spawnDelay = 500;
let numberOfSpawnedEnemies = numberOfEnemySpawn;
let roundCounter = 1;
let moneyMultiplier = 1;

let playerHealth = 100;

let selectedTower = 1;
>>>>>>> Stashed changes


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
<<<<<<< Updated upstream
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
=======
}

for(let i = 0; i < towerGrid.rows[1].cells.length; i++){
    towerGrid.rows[1].cells[i].onclick = selectTower;
}


function selectTower(){
    let x = this.attributes.id.nodeValue;
    for(let i = 0; i < towerGrid.rows[1].cells.length; i++){
        towerGrid.rows[1].cells[i].style.backgroundColor = "white";
    }
    this.style.backgroundColor = "red";
    switch(x) {
        case "tower1":
            selectedTower = 1;
            towerCost = 125;
          break;
        case "tower2":
            selectedTower = 2;
            towerCost = 200;
            break;
        case "tower3":
            selectedTower = 3;
            towerCost = 400;
            break;
      }
}
>>>>>>> Stashed changes

if (!gl) {
    throw new Error('WebGL not supported');
}




waveSpawn.addEventListener("click", function () {
    document.getElementById("right").play();
    if(allowTowersAndEnemies && numberOfSpawnedEnemies == numberOfEnemySpawn){
        let add = 0;
        if (roundCounter == 1){
            add = 9550;
        }
        for (let i = 0; i < numberOfEnemySpawn; i++) {
            setTimeout(function () {    
                spawnEnemyAtSpawnPoint();
            }, spawnDelay * i + add);
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
    let table = document.getElementById("tableID");
    pathArray[0][0] = 1;
    pathArray[9][9] = 3;
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

function clearPathAll(pathArray, table){
    for (let i = 0; i < pathArray.length; i++) {
        for (let j = 0; j < pathArray[i].length; j++) {
            if(pathArray[i][j] == 2 || pathArray[i][j] == 1){
                pathArray[i][j] = 0;
                table.rows[i].cells[j].onclick = null;
            } 
        }
    }
}

function colorRow(pathArray, x){
    for (let i = 0; i < pathArray[x].length; i++) {
        if(pathArray[i][x] == 0 || pathArray[i][x] == 3){
            pathArray[i][x] = 2;   
        }
         
    }
}

function colorColumn(pathArray, x){
    for (let i = 0; i < pathArray.length; i++) {
        if(pathArray[x][i] == 0 || pathArray[x][i] == 3){
            pathArray[x][i] = 2;   
        }    
    }
}

function colorTable(pathArray, table){
    for (let i = 0; i < table.rows.length; i++) {
        for (let j = 0; j < table.rows[i].cells.length; j++){
            if(pathArray[i][j] == 0){
                table.rows[i].cells[j].style.backgroundColor = "white";
                table.rows[i].cells[j].onclick = null;
            }
            else if (pathArray[i][j] == 1){
                table.rows[i].cells[j].style.backgroundColor = "orange";
                table.rows[i].cells[j].onclick = null;
            }
            else if (pathArray[i][j] == 2){
                table.rows[i].cells[j].style.backgroundColor = "black";
                table.rows[i].cells[j].onclick = setPathOnClick;
            }
            else if (pathArray[i][j] == 3){
                table.rows[i].cells[j].style.backgroundColor = "red";
                table.rows[i].cells[j].onclick = null;
            }
        }
    }
}

<<<<<<< Updated upstream

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
=======
function setPathOnClick(){
    let table = document.getElementById("tableID");
    if(nClicks > 0){
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
            setTileArray(tileArray, pathArray);
        }
    
        enemyPath.push([x*2-9,-2,z*2-9]);
        nClicks--;
    }
    else{
        if(pathArray[9][9] == 1){
            clearPath(pathArray);
            allowTowersAndEnemies = true;
            colorTable(pathArray, table);
            setTileArray(tileArray, pathArray);
        }
        else{
            alert("You failed to set an acceptable path!");
            nClicks = 7;
            clearPathAll(pathArray, table);
            setPath(pathArray);
            previousClick = [0,0];  
            enemyPath = [];
            tileArray = [];
        }
>>>>>>> Stashed changes
    }
    setPnClicks();
    
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



function setTileArray(tileArray, pathArray){
    for (let y = 0; y < pathArray.length; y++) {
        for (let x = 0; x < pathArray[y].length; x++) {
            if(pathArray[y][x] == 1)
                tileArray.push(new Tile(tileScene, x, y));
        }     
    }
}


function animate() {
    requestAnimationFrame(animate);
<<<<<<< Updated upstream
    //glMatrix.mat4.translate(viewMatrix, viewMatrix, [0, 0.1, 2]);
    //glMatrix.mat4.invert(viewMatrix, viewMatrix);

=======
    

    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    fCount++;
>>>>>>> Stashed changes

    if(numberOfSpawnedEnemies == 0 && !waveInProgress()){
        numberOfEnemySpawn = numberOfEnemySpawn + 3;
        numberOfSpawnedEnemies = numberOfEnemySpawn;
        roundCounter ++;
        playerMoney = playerMoney + Math.floor(((roundCounter-1) * 10 + 75)*moneyMultiplier);
        if(spawnDelay > 100){
            spawnDelay -= 30;
        }
        setPnTowers();
        updateRound();
        if(roundCounter%6 == 0){
            enemyHealthMul += 3;
            enemySpeedMul += 0.35;
        }

        enemyArray = new Array();
        bulletArray = new Array();

        allowTowersAndEnemies = true;
    }



    for (let i = 0; i < towerArray.length; i++) {
        for (let j = 0; j < towerArray[i].length; j++) {
            if (towerArray[i][j] != null) {
<<<<<<< Updated upstream
                drawTower(towerArray[i][j]);
=======
                let nearestI;
                if (enemyArray.length > 0 && waveInProgress()) {
                    nearestI = towerArray[i][j].nearestEnemy(enemyArray)
                    // if(enemyArray[nearestI] != null)
                    if (towerArray[i][j].isEnemyInRange(enemyArray[nearestI])) {
                        towerArray[i][j].rotateMatrix = towerArray[i][j].turnToEnemy(enemyArray[nearestI]);
                        if (fCount % towerArray[i][j].fireRate == 0){
                            spawnBulletAtTower(towerArray[i][j], enemyArray[nearestI]);
                            document.getElementById("amd").play();
                        }
                            
                        //towerArray[i][j].dealDamage(enemyArray[nearestI]);
                    }

                }

                renderer.renderTower(towerArray[i][j], viewMatrix, projectionMatrix);
>>>>>>> Stashed changes
            }
        }
    }

    for (let i = 0; i < enemyArray.length; i++) {
        if (enemyArray[i] != null) {
            if (enemyArray[i].isAtEndPosition) {
                playerHealth -= enemyArray[i].health;
                document.getElementById("niprebil").play();
                enemyArray[i] = null;
                
                showPlayerHealth();
            } else {
                if (enemyArray[i].isAlive())
                    drawEnemy(enemyArray[i]);
                else
                    enemyArray[i] = null;
            }
        }
    }
<<<<<<< Updated upstream
    if(allowTowersAndEnemies){
        placeTower();
    }
    
=======

    for (let i = 0; i < tileArray.length; i++) {
        renderer.renderTile(tileArray[i], viewMatrix, projectionMatrix);  
        tileArray[i].moveToCorrectPosition();
    }

    for (let i = 0; i < bulletArray.length; i++) {
        if(bulletArray[i] != null){
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

    for (let i = 0; i < objArray.length; i++) {
        renderer.renderObject(objArray[i], viewMatrix, projectionMatrix);
    }

    if(allowTowersAndEnemies){
        placeTower()
    }

    if(playerHealth <= 0){
        playerHealth = 1;
        window.location.href = "gameover.html";
    }
>>>>>>> Stashed changes
}



/* 
PREVERJANJE HTML TABELE
 */
function placeTower() {
<<<<<<< Updated upstream
    var table = document.getElementById("tableID");
    
=======
    let table = document.getElementById("tableID");

>>>>>>> Stashed changes
    if (table != null) {
        for (let i = 0; i < table.rows.length; i++) {
            for (let j = 0; j < table.rows[i].cells.length; j++)
                table.rows[i].cells[j].onclick = function () {
<<<<<<< Updated upstream
                    if(nTowers > 0){
                        spawnTowerAtCoordinates([this.cellIndex, -2, 9 - parseInt(this.parentElement.id)]);
                        this.style.backgroundColor = "red";
                        nTowers--;
                        setPnTowers();
=======
                    if (playerMoney - towerCost >= 0) {
                        if (!towerArray[9 - parseInt(this.parentElement.id)][this.cellIndex] && pathArray[9 - parseInt(this.parentElement.id)][this.cellIndex] != 1) {
                            if(selectedTower == 1){
                                spawnTowerAtCoordinates(towerScene1,[this.cellIndex, -3, 9 - parseInt(this.parentElement.id)], 1, 50, 0.1, 7);
                                moneyMultiplier += 0.05;
                            }
                            else if(selectedTower == 2){
                                spawnTowerAtCoordinates(towerScene2,[this.cellIndex, -3, 9 - parseInt(this.parentElement.id)],  5, 100, 0.3, 20);
                            }
                            else if(selectedTower == 3){
                                spawnTowerAtCoordinates(towerScene3,[this.cellIndex, -3, 9 - parseInt(this.parentElement.id)], 0.5, 10, 0.3, 5);
                            }
                            this.style.backgroundColor = "red";
                            playerMoney -= towerCost;
                            setPnTowers();
                        }
>>>>>>> Stashed changes
                    }
                };
        }
    }
}

<<<<<<< Updated upstream
function setPnTowers(){
    var numTowers = document.getElementById("nTowers");
    numTowers.textContent = "Towers: " + nTowers;
}

function spawnEnemyAtSpawnPoint(spawnPoint) {
    enemyArray.push(new Enemy([...spawnPoint], virusScene, 0, [...enemyPath]));
}

function spawnTowerAtCoordinates(coordinates) {
    let a = new Tower([...coordinates], [...vertexDataBase], [...uvDataBase], [...normalDataBase], 1); //tu bo use za towerje
=======
function setPnTowers() {
    let numTowers = document.getElementById("nTowers");
    numTowers.textContent = "Money: " + playerMoney +" $";
}

function setPnClicks() {
    let numClicks = document.getElementById("nClicks");
    numClicks.textContent = "Clicks remaining: " + nClicks;
}

function updateRound() {
    let round = document.getElementById("roundCounter");
    round.textContent = "Round: " + roundCounter;
}

function showPlayerHealth() {
    let pHealth = document.getElementById("nHealth");
    pHealth.style.color = "red";
    pHealth.style.fontSize = "25px";
    pHealth.style.top = "490px";
    setTimeout(function () {    
        pHealth.style.color = "black";
        pHealth.style.fontSize = "20px";
        pHealth.style.top = "500px";
    }, 500);
    pHealth.textContent = "Player health: " + playerHealth;
}

function spawnEnemyAtSpawnPoint() {
    enemyArray.push(new Enemy(virusScene, 0, [...enemyPath], enemyHealthMul, enemySpeedMul));
    numberOfSpawnedEnemies --;

}

function spawnTowerAtCoordinates(towerScene,coordinates, damage, attackSpeed, scale, range) {
    let a = new Tower([...coordinates], towerScene, 1, damage, attackSpeed, scale, range); //tu bo use za towerje
>>>>>>> Stashed changes
    towerArray[coordinates[2]][coordinates[0]] = a;
}


<<<<<<< Updated upstream

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
=======
function spawnTrees() {

    objArray.push(new Obj([-10, -2, 8], smrekaScene, 0.5, mat4.create()));
    objArray.push(new Obj([-12, -2, -2], smrekaScene, 0.4, mat4.create()));
    objArray.push(new Obj([-12.1, -2, 3], smrekaScene, 0.47, mat4.create()));
    objArray.push(new Obj([-10, -2, 0], smrekaScene, 0.53, mat4.create()));
    objArray.push(new Obj([-13, -2, -3], smrekaScene, 0.39, mat4.create()));
    objArray.push(new Obj([-11, -2, -7], smrekaScene, 0.659, mat4.create()));
    objArray.push(new Obj([2, -2, -12], smrekaScene, 0.4, mat4.create()));
    objArray.push(new Obj([-3, -2, -12.5], smrekaScene, 0.47, mat4.create()));
    objArray.push(new Obj([0, -2, -10], smrekaScene, 0.53, mat4.create()));
    objArray.push(new Obj([7, -2, -11], smrekaScene, 0.659, mat4.create()));
    objArray.push(new Obj([-11, -2, -11], smrekaScene, 0.55, mat4.create()));
    objArray.push(new Obj([-8, -2, -12], smrekaScene, 0.65, mat4.create()));
    objArray.push(new Obj([3, -2, 17], smrekaScene, 0.55, mat4.create()));
    objArray.push(new Obj([-2, -2, 13], smrekaScene, 0.85, mat4.create()));
    objArray.push(new Obj([-12, -2, 16], smrekaScene, 0.65, mat4.create()))
    objArray.push(new Obj([15, -2, -4], smrekaScene, 0.65, mat4.create()));
    objArray.push(new Obj([17, -2, 3], smrekaScene, 0.45, mat4.create()));

}

const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix,
    80 * Math.PI / 180, // vertical field-of-view (angle, radians)
    canvas.width / canvas.height, // aspect W/H
    1e-4, // near cull distance
    1e4 // far cull distance
);

mat4.rotateY(viewMatrix, viewMatrix, Math.PI / 4);
>>>>>>> Stashed changes

mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(0, 10, 18));
mat4.rotateX(viewMatrix, viewMatrix, -Math.PI / 4);


mat4.invert(viewMatrix, viewMatrix);


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//LOAD MODELS
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

let loader = new GLTFLoader();

const renderer = new Renderer(gl);

await loader.load('models/fri/fri.gltf');

let friScene = await loader.loadScene(loader.defaultScene);
let friCamera = await loader.loadNode('Camera');

if (!friScene || !friCamera) {
    throw new Error('Scene or Camera not present in glTF');
}

if (!friCamera.camera) {
    throw new Error('Camera node does not contain a camera reference');
}

<<<<<<< Updated upstream
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
=======
>>>>>>> Stashed changes

renderer.prepareScene(friScene);



await loader.load('models/smreka/smreka.gltf');

let smrekaScene = await loader.loadScene(loader.defaultScene);
let smrekaCamera = await loader.loadNode('Camera');

if (!smrekaScene || !smrekaCamera) {
    throw new Error('Scene or Camera not present in glTF');
}

if (!smrekaCamera.camera) {
    throw new Error('Camera node does not contain a camera reference');
}


renderer.prepareScene(smrekaScene);


<<<<<<< Updated upstream
    gl.uniformMatrix4fv(uniformLocations.tmatrix, false, glMatrix.mat4.create());
    gl.uniform1i(uniformLocations.texId, 2);
=======
>>>>>>> Stashed changes


await loader.load('models/tla/tla.gltf');

let tlaScene = await loader.loadScene(loader.defaultScene);
let tlaCamera = await loader.loadNode('Camera');

if (!tlaScene || !tlaCamera) {
    throw new Error('Scene or Camera not present in glTF');
}

if (!tlaCamera.camera) {
    throw new Error('Camera node does not contain a camera reference');
}


renderer.prepareScene(tlaScene);




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

<<<<<<< Updated upstream
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
=======

>>>>>>> Stashed changes

await loader.load('models/cannon5/cannon5.gltf');

<<<<<<< Updated upstream
glMatrix.mat4.invert(viewMatrix, viewMatrix);
=======
let towerScene1 = await loader.loadScene(loader.defaultScene);
let towerCamera1 = await loader.loadNode('Camera');
>>>>>>> Stashed changes

if (!towerScene1 || !towerCamera1) {
    throw new Error('Scene or Camera not present in glTF');
}

<<<<<<< Updated upstream
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//LOAD TEXTURES
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
const enemyTex = loadTexture(`textures/default_brick.png`);
=======
if (!towerCamera1.camera) {
    throw new Error('Camera node does not contain a camera reference');
}
>>>>>>> Stashed changes

renderer.prepareScene(towerScene1);



await loader.load('models/cannon3/cannon3.gltf');

let towerScene2 = await loader.loadScene(loader.defaultScene);
let towerCamera2 = await loader.loadNode('Camera');

if (!towerScene2 || !towerCamera2) {
    throw new Error('Scene or Camera not present in glTF');
}

if (!towerCamera2.camera) {
    throw new Error('Camera node does not contain a camera reference');
}

<<<<<<< Updated upstream
gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
=======


renderer.prepareScene(towerScene2);


await loader.load('models/cannon4/cannon4.gltf');

let towerScene3 = await loader.loadScene(loader.defaultScene);
let towerCamera3 = await loader.loadNode('Camera');

if (!towerScene3 || !towerCamera3) {
    throw new Error('Scene or Camera not present in glTF');
}

if (!towerCamera3.camera) {
    throw new Error('Camera node does not contain a camera reference');
}



renderer.prepareScene(towerScene3);





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

await loader.load('models/polje/polje.gltf');

let tileScene = await loader.loadScene(loader.defaultScene);
let tileCamera = await loader.loadNode('Camera');

if (!tileScene || !tileCamera) {
    throw new Error('Scene or Camera not present in glTF');
}

if (!tileCamera.camera) {
    throw new Error('Camera node does not contain a camera reference');
}


renderer.prepareScene(tileScene);


objArray.push(new Obj([9, -2.9, 9], friScene, 0.7, mat4.create()));
objArray.push(new Obj([30, -10, 30], tlaScene, 60, mat4.fromYRotation(mat4.create(), Math.PI / 4)));
/* let rM = mat4.fromYRotation(mat4.create(), Math.PI / 4);
mat4.rotateX(rM, rM, Math.PI / 4);
objArray.push(new Obj([-50, -20, -50], neboScene, 20, rM)); */

spawnTrees();
>>>>>>> Stashed changes


gl.clearColor(0.59, 0.84, 0.91, 1);
gl.enable(gl.CULL_FACE);


setPnTowers();
setPnClicks();
showPlayerHealth();
updateRound();


animate();
setPath(pathArray);


