

var unit = Math.floor(window.innerHeight / 48) * 4;
if (window.innerWidth * 9 / 16 < window.innerHeight) unit = Math.floor(window.innerWidth / 80) * 4;
document.body.style.setProperty("--unit", unit + "px");
document.body.style.setProperty("--pixel", unit / 12 + "px");

var frame = 0; // iterates forever
var gameStep = 8; // number of frames 1 step is.
var runSpeed = 32; // number of frames it takes to do 1 action.
var canWidth = 24; // canvas width
var canHeight = 12; // canvas height

var C = document.getElementById("CharacterCanvas");
C.width = unit * canWidth;
C.height = unit * canHeight;
var cctx = C.getContext('2d');
var B = document.getElementById("BackgroundCanvas");
B.width = unit * canWidth;
B.height = unit * canHeight;
var bctx = B.getContext('2d');

class World {
  constructor() {
    this.map = [];
    for (var y = 0; y < canHeight; y++) {
      this.map.push([]);
      for (var x = 0; x < canWidth; x++) {
        var rand = Math.floor(Math.random() * 15);
        if (rand > 0)
          this.map[y].push(0);
        else
          this.map[y].push(1);
      }
    }
  }
  draw() {
    for (var y = 0; y < canHeight; y++) {
      for (var x = 0; x < canWidth; x++) {
        if (this.map[y][x] === 1) {
          bctx.drawImage(treeTileset, x * unit, y * unit, unit, unit);
        }
      }
    }
    console.log("hi!");
  }
}
var world = new World();

//ctx.drawImage(img, sx, sy, swidth, sheight, x, y, width, height)

function clear(context, x = 0, y = 0, width = unit * 24, height = unit * 12) {
  context.clearRect(x, y, width, height);
}

var treeTileset = new Image();
treeTileset.src = "Tree.png";
var walkingTileset = new Image();
walkingTileset.src = "WalkingAnimationFirstTileset800.png";

class Character {
  constructor(x, y, img) {
    this.x = x;
    this.y = y;
    this.img = img;
    this.sight = 6; // maximum moves to be seen into future.
    this.planStart = 0; // frame the plan began on.
    this.preActI = 0; // previous action index.
    this.plan = []; // 0-left 1-up 2-right 3-down 4-idle 5-hit
    this.nodes = []; // for plan searching. [x, y, cost, ?final?]
  }
  draw(frame) {
    cctx.drawImage(this.img, frame * 96, 0, 96, 96, this.x, this.y, unit * 1, unit * 1);
  }
  matchNode(node, set) {
    for (var i = 0; i < set.length; i++) {
      if (node[0] === set[i][0] && node[1] === set[i][1]) {
        return i;
      }
    }
    return -1;
  }
  act() {
    var diff = frame - this.planStart;
    var actionI = Math.floor(diff / runSpeed);
    if (actionI < this.plan.length) {
      if (this.preActI !== actionI) { // first time at new action
        this.x = Math.round(this.x / unit) * unit;
        this.y = Math.round(this.y / unit) * unit;
        this.preActI = actionI;
      }
      switch (this.plan[actionI]) {
        case 0:
          this.x -= unit / runSpeed;
          break;
        case 1:
          this.y -= unit / runSpeed;
          break;
        case 2:
          this.x += unit / runSpeed;
          break;
        case 3:
          this.y += unit / runSpeed;
          break;
        case 5:
          if (diff === runSpeed - 1)
            clear(bctx, this.x, this.y, unit, unit);
            break;
      }
      this.draw(Math.floor(frame / gameStep) % 4);
    } else {
      this.plan = [];
      this.choosePlan();
    }
  }
  choosePlan() {
    var c = this;
    if (c.plan.length !== 0) return;
    var currX = Math.round(c.x / unit);
    var currY = Math.round(c.y / unit);
    //console.log(currX, currY);
    // super cool function that starts at the coor, then moves 1 unit
    // in every available and non-visited direction to check if there
    // is a possible action (in this case if the square is a 1), then
    // when it finds a 1 it stops all other searches and propagates
    // back to the start and returns the path it took to get there!

    var result = [];
    c.nodes = [[Math.floor(c.x / unit), Math.floor(c.y / unit), 0]];
    var found = false;
    var cost = 0;
    while (!found) {
      cost++;
      for (var i = 0; i < c.nodes.length; i++) {
        if (c.nodes[i][2] === cost - 1) {
          var node = [c.nodes[i][0], c.nodes[i][1], cost - 1];
          for (var j = 0; j < 4; j++) {
            if (j === 0 && node[0] + 1 < canWidth) node[0] += 1;
            else if (j === 1 && node[0] - 1 > -1) node[0] -= 1;
            else if (j === 2 && node[1] + 1 < canHeight) node[1] += 1;
            else if (j === 3 && node[1] - 1 > -1) node[1] -= 1;
            if (!(node[0] === c.nodes[i][0] && node[1] === c.nodes[i][1])) {
              var dupl = c.matchNode(node, c.nodes);
              if (dupl === -1) {
                node[2] = cost;
                if (world.map[node[1]][node[0]] !== 0) {
                  found = true;
                  node.push(world.map[node[1]][node[0]]);
                }
                c.nodes.push(node);
              }
            }
            node = [c.nodes[i][0], c.nodes[i][1], cost - 1];
          }
        }
      }
      if (cost === 6) {
        c.nodes = "Cannot see action.";
        found = true;
      }
    }
    console.log(c.nodes);
    var path = c.findPath(c.x, c.y, c.nodes); // [path, final action]
    console.log(path);
    for (var i = 0; i < Math.random() * 5 + 1; i++) {
      c.plan.push(Math.floor(Math.random() * 4));
    }
    c.planStart = frame;
    c.act();
  }
  findPath(x, y, nodes) {
    if (nodes === "Cannot see action.") return [4];
    var cost = 7;
    var aim = [];
    for (var i = nodes.length - 1; i > -1; i--) {
      if (nodes[i].length > 3) aim = nodes[i];
      cost = nodes[i][2];
      // start at aim node. go backward until a node with adjacent coordinates
      // with lower cost is found. jump past next costing nodes again, look
      // for adjacent nodes again until origin is spotted.
      // use coordinates to map out the direction he travels.
    }
  }
}

var amount = 1;
var characters = [];
for (var i = 0; i < amount; i++) {
  characters.push(new Character(unit * 10, unit * 6, walkingTileset));
}
var raf = undefined;


var throttle = 8;
var thrott_i = 0;

function animate() {
  thrott_i++;
  if (!(thrott_i % throttle)) {
    clear(cctx);
    for (var i = 0; i < characters.length; i++) {
      characters[i].act();
    }
    frame++;
  }
  raf = window.requestAnimationFrame(animate);
}

walkingTileset.onload = function () {
  raf = window.requestAnimationFrame(animate);
  world.draw();
}