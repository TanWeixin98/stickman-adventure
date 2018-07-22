// The point and size class used in this program
function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w)? parseFloat(w) : 0.0;
    this.h = (h)? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
            pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}


// The player class used in this program
function Player() {
    this.node = svgdoc.getElementById("player");
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.verticalSpeed = 0;
}

Player.prototype.isOnPlatform = function() {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
             ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y) return true;
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

Player.prototype.collidePlatform = function(position) {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);
        var tempSize = new Size(w,3);
        var tempPos = new Point(x,y-3);
        if(intersect(position,PLAYER_SIZE, tempPos ,tempSize)){
            if(node.getAttribute("type")=="disappear"){
                node.setAttribute("id","remove");
                setTimeout(function(platforms,node){
                           var temp=svgdoc.getElementById("remove");
                           while(temp!=null && temp.parentNode!=null)
                            temp.parentNode.removeChild(temp);
                           },1300);
            setTimeout("var temp=svgdoc.getElementById('remove');if(temp!=null)temp.style.setProperty('opacity','.66');",250);
                setTimeout("var temp=svgdoc.getElementById('remove');if(temp!=null)temp.style.setProperty('opacity','.33');",750);
            
                
            }
        }
        
        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                    position.y = y + h;
                else
                    position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
    }
}


Player.prototype.collideScreen = function(position) {
    if (position.x < 0) position.x = 0;
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
        this.verticalSpeed = 0;
    }
}


//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(40, 40);         // The size of the player
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(0, 420);   // The initial position of the player

var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed

var GAME_INTERVAL = 40;                     // The time interval of running the game

var BULLET_SIZE = new Size(10, 10);         // The speed of a bullet
var BULLET_SPEED = 10.0;                    // The speed of a bullet
                                            //  = pixels it moves each game loop
var SHOOT_INTERVAL = 200.0;                 // The period when shooting is disabled
var canShoot = true;                        // A flag indicating whether the player can shoot a bullet

var MONSTER_SIZE = new Size(40, 40);        // The monster size
var HEART_SIZE= new Size(40,40);            //the heart size

var name =""                                //player name
var goods_remain= 8;                        //remaining hearts
var monsterCanShoot=true;                   //whether monster is able to shoot
//
// Variables in the game
//
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum

var svgdoc = null;                          // SVG root document node
var player = null;                          // The player object
var gameInterval = null;                    // The interval
var timeInterval=null;                      //interval for timer
var zoom = 1.0;                             // The zoom level of the screen
var score = 0;                              // The score of the game
var ON_CHEAT = false;                       //the game is on cheat mode or not
var bullets_remaining= 8;                   //remaining bullets for player
var time_remaining =40;                     //remaining time of the game
var facing_right = true;                    //the face position of the player
var timeBar_Decrement= 140/GAME_INTERVAL;



//aduio file
var gameMusic,shotSound,PlayerDieSound,MonsterDieSound,FinishGameSound;
//
// The load function for the SVG document
//
function load(evt) {
    // Set the root node to the global variable
    svgdoc = evt.target.ownerDocument;

    // Attach keyboard events
    svgdoc.documentElement.addEventListener("keydown", keydown, false);
    svgdoc.documentElement.addEventListener("keyup", keyup, false);

    // Remove text nodes in the 'platforms' group
    cleanUpGroup("platforms", true);

    // Create the player
    player = new Player();

    // Create the monsters
    generateRandomMonster();
    generateRandomHeart();
    
    //declear sound
    gameMusic=document.getElementById("game");
    shotSound=document.getElementById("fire");
    PlayerDieSound=document.getElementById("DiePlayer");
    MonsterDieSound=document.getElementById("DieMonster");
    FinishGameSound=document.getElementById("winGame");
    // Start the game interval
    gameMusic.play();
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);

}


//
// This function removes all/certain nodes under a group
//
function cleanUpGroup(id, textOnly) {
    var node, next;
    var group = svgdoc.getElementById(id);
    node = group.firstChild;
    while (node != null) {
        next = node.nextSibling;
        if (!textOnly || node.nodeType == 3) // A text node
            group.removeChild(node);
        node = next;
    }
}


//
// This function creates the monsters in the game
//

function generateRandomMonster(){
    for(var i=0;i<8;i++){
        var x=Math.random() * 551+2;
        var y=Math.random() * 511+2;
        while(!checkValid(x,y,MONSTER_SIZE)){
            x=Math.random() * 551+2;
            y=Math.random() * 511+2;
        }
        createMonster(x,y);
    }
    //special monster
    var x=Math.random() * 551+2;
    var y=Math.random() * 511+2;
    while(!checkValid(x,y,MONSTER_SIZE)){
        x=Math.random() * 551+2;
        y=Math.random() * 511+2;
    }
    var monster = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    monster.setAttribute("x", x);
    monster.setAttribute("y", y);
    monster.setAttribute("type","right");
    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
    monster.setAttribute("id","specialMonster");
    monster.style.setProperty("fill","red",null);
    svgdoc.getElementById("monsters").appendChild(monster);
    
}
function createMonster(x,y) {
    var monster = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    monster.setAttribute("x", x);
    monster.setAttribute("y", y);
    monster.setAttribute("type","right");
    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
    svgdoc.getElementById("monsters").appendChild(monster);
}
function generateRandomHeart(){
    for(var i=0;i<8;i++){
        var x=Math.floor(Math.random() * 551)+2;
        var y=Math.floor(Math.random() * 511)+2;
        while(!checkValid(x,y,HEART_SIZE)){
            x=Math.floor(Math.random() * 551)+2;
            y=Math.floor(Math.random() * 511)+2;
        }
        createHeart(x,y);
    }
}
function createHeart(x,y){
    var heart = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    heart.setAttribute("x", x);
    heart.setAttribute("y", y);
    heart.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#heart");
    svgdoc.getElementById("hearts").appendChild(heart);
}

//
// This function shoots a bullet from the player
//
function shootBullet() {
    // Disable shooting for a short period of time
    canShoot = false;
    setTimeout("canShoot = true", SHOOT_INTERVAL);
    // Create the bullet using the use node
    var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    bullet.setAttribute("x", player.position.x + PLAYER_SIZE.w / 2 - BULLET_SIZE.w / 2);
    bullet.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
    if(facing_right)
        svgdoc.getElementById("bullets_right").appendChild(bullet);
    else
        svgdoc.getElementById("bullets_left").appendChild(bullet);
    if(!shotSound.paused || !MonsterDieSound.paused){
        shotSound.pause();
        MonsterDieSound.pause();
    }
    shotSound.pause();
    shotSound.currentTime=0;
    shotSound.play();
}

//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            player.motion = motionType.LEFT;
            facing_right=false;
            break;

        case "D".charCodeAt(0):
            player.motion = motionType.RIGHT;
            facing_right =true;
            break;
			
        case "W".charCodeAt(0):
            if (player.isOnPlatform() || ON_CHEAT) {
                player.verticalSpeed = JUMP_SPEED;
            }
            break;
        case "C".charCodeAt(0):
            ON_CHEAT=true;
            player.node.style.opacity =".5";
            break;
        case "V".charCodeAt(0):
            ON_CHEAT=false;
            player.node.style.opacity="1";
            break;
        case 32:
            if (canShoot){
                if(bullets_remaining>0 || ON_CHEAT)
                    shootBullet();
                if(!ON_CHEAT && bullets_remaining>0)
                    bullets_remaining--;
            }
            break;
    }
}


//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            break;

        case "D".charCodeAt(0):
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            break;
    }
}

function gameOver(){
    // Clear the game interval
    clearInterval(gameInterval);
    clearInterval(timeInterval);
    
    // Get the high score table from cookies
    table=getHighScoreTable();
    // Create the new score record
    if(name.length==0)
        name="Anonymous";
    var record = new ScoreRecord(name, score);
    
    // Insert the new score record
    var pos = table.length;
    for(var i=0; i<table.length;i++){
        if(record.score>table[i].score){
            pos=i;
            break;
        }
    }
    table.splice(pos,0,record);
    // Store the new high score table
    setHighScoreTable(table);
    // Show the high score table
    showHighScoreTable(table);
    var node = svgdoc.getElementById("restartbutton");
    node.style.setProperty("visibility", "visible", null);
    
}

function restart(){
    location.reload();
}

//
// This function checks collision
//
function collisionDetection() {
    //check whether the player collide with the heart
    var hearts = svgdoc.getElementById("hearts");
    for (var i = 0; i < hearts.childNodes.length; i++) {
        var heart = hearts.childNodes.item(i);
        var x = parseInt(heart.getAttribute("x"));
        var y = parseInt(heart.getAttribute("y"));
        
        if (intersect(new Point(x, y), HEART_SIZE, player.position, PLAYER_SIZE) ){
            if(zoom==2)
                score+=10;
            else
                score+=5;
            svgdoc.getElementById("score").firstChild.data= score;
            bullets_remaining+= 1;
            hearts.removeChild(heart);
            i--;
            goods_remain--;
        }
    }
    
    // Check whether the player collides with a monster
    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);
        var x = parseInt(monster.getAttribute("x"));
        var y = parseInt(monster.getAttribute("y"));

        if (intersect(new Point(x, y), MONSTER_SIZE, player.position, PLAYER_SIZE) && !ON_CHEAT) {
            if(!shotSound.paused || !MonsterDieSound.paused){
                shotSound.pause();
                MonsterDieSound.pause();
            }
            PlayerDieSound.pause();
            PlayerDieSound.currentTime=0;
            PlayerDieSound.play();
            gameOver();
            return;
        }
    }
    //check whether player hit by monster bullet
    var monsterBullet= svgdoc.getElementById("monsterBullet");
    if(monsterBullet!=null){
    var monsterBulletx =parseInt(monsterBullet.getAttribute("x"));
    var monsterBullety =parseInt(monsterBullet.getAttribute("y"));
    if(intersect(new Point(monsterBulletx,monsterBullety),BULLET_SIZE,player.position,PLAYER_SIZE) && !ON_CHEAT){
        if(!shotSound.paused || !MonsterDieSound.paused){
            shotSound.pause();
            MonsterDieSound.pause();
        }
        PlayerDieSound.pause();
        PlayerDieSound.currentTime=0;
        PlayerDieSound.play();
        gameOver();
        return;
    }
}

    // Check whether a bullet hits a monster
    var bullets = svgdoc.getElementById("bullets_left");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        var x = parseInt(bullet.getAttribute("x"));
        var y = parseInt(bullet.getAttribute("y"));

        for (var j = 0; j < monsters.childNodes.length; j++) {
            var monster = monsters.childNodes.item(j);
            var mx = parseInt(monster.getAttribute("x"));
            var my = parseInt(monster.getAttribute("y"));

            if (intersect(new Point(x, y), BULLET_SIZE, new Point(mx, my), MONSTER_SIZE)) {
                if(!shotSound.paused){
                    shotSound.pause();
                }
                MonsterDieSound.pause();
                MonsterDieSound.currentTime=0;
                MonsterDieSound.play();
                monsters.removeChild(monster);
                j--;
                bullets.removeChild(bullet);
                i--;
                //write some code to update the score
                if(zoom==2)
                    score+=30;
                else
                    score+=10;
                svgdoc.getElementById("score").firstChild.data= score;
            }
        }
    }
    bullets = svgdoc.getElementById("bullets_right");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        var x = parseInt(bullet.getAttribute("x"));
        var y = parseInt(bullet.getAttribute("y"));
        
        for (var j = 0; j < monsters.childNodes.length; j++) {
            var monster = monsters.childNodes.item(j);
            var mx = parseInt(monster.getAttribute("x"));
            var my = parseInt(monster.getAttribute("y"));
            
            if (intersect(new Point(x, y), BULLET_SIZE, new Point(mx, my), MONSTER_SIZE)) {
                monsters.removeChild(monster);
                j--;
                bullets.removeChild(bullet);
                i--;
                if(!shotSound.paused){
                    shotSound.pause();
                }
                MonsterDieSound.pause();
                MonsterDieSound.currentTime=0;
                MonsterDieSound.play();
                
                //write some code to update the score
                if(zoom==2)
                    score+=30;
                else
                    score+=10;
                svgdoc.getElementById("score").firstChild.data= score;
            }
        }
    }
    var door=svgdoc.getElementById("door");
    if(intersect(new Point(10, 0), HEART_SIZE, player.position, PLAYER_SIZE) && door.style.getPropertyValue("visibility")!="hidden"){
        if(zoom==2)
            score=score+(2*time_remaining);
        else
            score+=time_remaining;
        svgdoc.getElementById("score").firstChild.data= score;
        time_remaining=0;
        if(!shotSound.paused ||  !MonsterDieSound.paused){
            shotSound.pause();
            MonsterDieSound.paused();
        }
        winGame.pause();
        winGame.currentTime=0;
        winGame.play();
        gameOver();
    }
}

//var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
//bullet.setAttribute("x", player.position.x + PLAYER_SIZE.w / 2 - BULLET_SIZE.w / 2);
//bullet.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
//

//
// This function updates the position of the bullets
//
function moveBullets() {
    // Go through all bullets
    var bullets = svgdoc.getElementById("bullets_right");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);
        
        // Update the position of the bullet
        var x = parseInt(node.getAttribute("x"));
        node.setAttribute("x", x + BULLET_SPEED);
        // If the bullet is not inside the screen delete it from the group

    }
    bullets=svgdoc.getElementById("bullets_left");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);
        
        // Update the position of the bullet
        var x = parseInt(node.getAttribute("x"));
        node.setAttribute("x", x - BULLET_SPEED);
        // If the bullet is not inside the screen delete it from the group
        if (x <0) {
            bullets.removeChild(node);
            i--;
        }
    }
}


//
// This function updates the position and motion of the player in the system
//
function gamePlay() {
    // Check collisions
    collisionDetection();
    teleport();
    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();
    
    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT)
        displacement.x = -MOVE_DISPLACEMENT;
    if (player.motion == motionType.RIGHT)
        displacement.x = MOVE_DISPLACEMENT;
    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0)
            player.verticalSpeed = 0;
    }

    // Get the new position of the player
    var position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;

    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideScreen(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;
    // Move the bullets
    moveBullets();
    randomMove();
    
    if(monsterCanShoot)
        monsterShoot();
    else{
        updateMonsterBullet();
    }
    updateScreen();
}

function monsterShoot(){

    var specialMonster= svgdoc.getElementById("specialMonster");
    if(specialMonster!=null){
        monsterCanShoot=false;
        var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
        var monstX=parseInt(specialMonster.getAttribute("x"));
        var monstY=parseInt(specialMonster.getAttribute("y"));
        bullet.setAttribute("x", monstX + MONSTER_SIZE.w / 2 - BULLET_SIZE.w / 2);
        bullet.setAttribute("y", monstY + MONSTER_SIZE.h / 2 - BULLET_SIZE.h / 2);
        bullet.setAttribute("id","monsterBullet");
        bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#superBullet");
        svgdoc.getElementById("platforms").appendChild(bullet);
    }
}

function updateMonsterBullet(){
    var bullet=svgdoc.getElementById("monsterBullet");
    var specialMonster= svgdoc.getElementById("specialMonster");
    if(specialMonster!=null){
    if(specialMonster.getAttribute("type")=="right"){
        var x = parseInt(bullet.getAttribute("x"));
        bullet.setAttribute("x", x + BULLET_SPEED/2);
        if(x>SCREEN_SIZE.w){
            svgdoc.getElementById("platforms").removeChild(bullet);
            monsterCanShoot=true;
            
        }
    }else{
        var x = parseInt(bullet.getAttribute("x"));
        bullet.setAttribute("x", x - BULLET_SPEED);
        if(x<0){
            svgdoc.getElementById("platforms").removeChild(bullet);
            monsterCanShoot=true;
        }
    }
    }else{
        if(bullet!=null)
            svgdoc.getElementById("platforms").removeChild(bullet);
    }
}
//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//
function updateScreen() {
    if(gameMusic.ended){
        gameMusic.play();
    }
    
    updateBullet();
    showDoor();
    // Transform the player
    if(facing_right)
        player.node.setAttribute("transform","translate(" + (PLAYER_SIZE.w +player.position.x) + ","+ player.position.y+") scale(-1, 1)");
    else
        player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");
    // Calculate the scaling and translation factors
    var scale = new Point(zoom, zoom);
    var translate = new Point();
    
    translate.x = SCREEN_SIZE.w / 2.0 - (player.position.x + PLAYER_SIZE.w / 2) * scale.x;
    if (translate.x > 0) 
        translate.x = 0;
    else if (translate.x < SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x)
        translate.x = SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x;

    translate.y = SCREEN_SIZE.h / 2.0 - (player.position.y + PLAYER_SIZE.h / 2) * scale.y;
    if (translate.y > 0) 
        translate.y = 0;
    else if (translate.y < SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y)
        translate.y = SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y;
            
    // Transform the game area
    svgdoc.getElementById("gamearea").setAttribute("transform", "translate(" + translate.x + "," + translate.y + ") scale(" + scale.x + "," + scale.y + ")");	
}
function showDoor(){
    if(goods_remain==0){
        var node = svgdoc.getElementById("door");
        node.style.setProperty("visibility", "visible", null);
    }
}
function teleport(){
    var door1= svgdoc.getElementById("door1");
    var door2=svgdoc.getElementById("door2");
    var x1 = door1.getAttribute("cx");
    var y1 = door1.getAttribute("cy")
    var x2 = door2.getAttribute("cx");
    var y2 = door2.getAttribute("cy")
    if(intersect(player.position,PLAYER_SIZE,new Point(x1,y1),new Size(40,40))){
        player.node.setAttribute("transform", "translate(" + 500 +"," + 30 + ")");
        player.position.x=500;
        player.position.y=30;
    }
    if(intersect(player.position,PLAYER_SIZE,new Point(x2,y2),new Size(40,40))){
        player.node.setAttribute("transform", "translate(" + 70 +"," + 500 + ")");
        player.position.x=70;
        player.position.y=500;
    }
}
//
// This function sets the zoom level to 2
//
function setZoom() {
    zoom = 2.0;
    showGameContent();
}
function setNormal(){
    showGameContent();
}


function randomMove(){
    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);
        var x = parseInt(monster.getAttribute("x"));
        if(monster.getAttribute("type")=="right"){
            // Update the position of the bullet
            // If the bullet is not inside the screen delete it from the group
            if (x > SCREEN_SIZE.w) {
                monster.setAttribute("type","left");
            }else{
                monster.setAttribute("x", x + 3.0);
            }
        }else{
            if (x < 0) {
                monster.setAttribute("type","right");
            }else{
                monster.setAttribute("x", x - 3.0);
            }
        }
    }
}
function checkValid(RanX,RanY,Objectsize){
    if(RanX<40 ||RanX>550 || RanY<40 || RanY>510)
        return false;
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);
        var newY=RanY+Objectsize.h;
        
        if(newY>y && RanY<y)
            return false;
        if (intersect(new Point(RanX,RanY), Objectsize, pos, size)) {
            return false
        }
    }
    var hearts = svgdoc.getElementById("hearts");
    for (var i = 0; i < hearts.childNodes.length; i++) {
        var node = hearts.childNodes.item(i);
        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);
        
        if (intersect(new Point(RanX,RanY), Objectsize, pos, size)) {
            return false
        }
    }
    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);
        
        var x = parseFloat(monster.getAttribute("x"));
        var y = parseFloat(monster.getAttribute("y"));
        var w = parseFloat(monster.getAttribute("width"));
        var h = parseFloat(monster.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);
        
        if (intersect(new Point(RanX,RanY), Objectsize, pos, size)) {
            return false
        }
    }
    
    if(intersect(new Point(RanX,RanY),Objectsize,player.position,PLAYER_SIZE))
        return false;
    return true;
}

function showGameContent(){
    var node = svgdoc.getElementById("GameMode");
    node.style.setProperty("visibility", "hidden", null);
    if(name==""){
        name= prompt("Enter Player Name:","");
    }
    if(setPlayerName())
        timeInterval = setInterval("updateTime()",1000);

}

function updateTime(){
    var node = svgdoc.getElementById("time_bar");
    var length= node.getBBox().width-timeBar_Decrement;
    node.setAttribute("width",length+"");
    time_remaining--;
    svgdoc.getElementById("timeRemaining").firstChild.data= time_remaining;
    if(time_remaining==0){
        if(!shotSound.paused || !MonsterDieSound.paused){
            shotSound.pause();
            MonsterDieSound.pause();
        }
        PlayerDieSound.pause();
        PlayerDieSound.currentTime=0;
        PlayerDieSound.play();
        gameOver();
    }
}
function setPlayerName(){
    if(name=="null"){
        var node = svgdoc.getElementById("GameMode");
        node.style.setProperty("visibility", "visible", null);
        return false;
    }
    if(name.length!=0)
        svgdoc.getElementById("player_name").firstChild.data=name;
    return true
}

function updateBullet(){
    svgdoc.getElementById("bulletNum").firstChild.data= bullets_remaining;
}

function userContinue(){
    
    var node = svgdoc.getElementById("startPanel");
    node.style.setProperty("visibility", "hidden", null);
    var node = svgdoc.getElementById("GameMode");
    node.style.setProperty("visibility", "visible", null);
}
