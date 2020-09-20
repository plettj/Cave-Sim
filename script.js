

var unit = Math.floor(window.innerHeight / 48) * 4;
if (window.innerWidth * 9 / 16 < window.innerHeight) unit = Math.floor(window.innerWidth / 80) * 4;
document.body.style.setProperty("--unit", unit + "px");
document.body.style.setProperty("--pixel", unit / 12 + "px");

var frame = 0; // iterates forever
var gameStep = 8; // number of frames 1 step is.
var runSpeed = 32; // number of frames it takes to do 1 action.
var canWidth = 16; // canvas width
var canHeight = 9; // canvas height

var C = document.getElementById("CharacterCanvas");
C.width = unit * canWidth;
C.height = unit * canHeight;
var cctx = C.getContext('2d');
var B = document.getElementById("BackgroundCanvas");
B.width = unit * canWidth;
B.height = unit * canHeight;
var bctx = B.getContext('2d');

var gold = new Image();
gold.src = "Gold.png";
var rocksTileset = new Image();
rocksTileset.src = "RocksTileset.png";
var walkingTileset = new Image();
walkingTileset.src = "CavemanTileset.png";

class World {
  constructor() {
    this.map = [];
    for (var y = 0; y < canHeight; y++) {
      this.map.push([]);
      for (var x = 0; x < canWidth; x++) {
        var rand = Math.floor(Math.random() * 8);
        if (rand < 2) this.map[y].push(1);
        else if (rand < 5) this.map[y].push(2);
        else this.map[y].push(0);
      }
    }
  }
  draw() {
    for (var y = 0; y < canHeight; y++) {
      for (var x = 0; x < canWidth; x++) {
        if (this.map[y][x] === 1) {
          bctx.drawImage(gold, x * unit, y * unit, unit, unit);
        } else if (this.map[y][x] === 2) {
          bctx.drawImage(rocksTileset, 96 * Math.floor(Math.random() * 2), 96 * Math.floor(Math.random() * 2), 96, 96, x * unit, y * unit, unit, unit)
        }
      }
    }
  }
}
var world = new World();

//ctx.drawImage(img, sx, sy, swidth, sheight, x, y, width, height)

function clear(context, x = 0, y = 0, width = unit * 24, height = unit * 12) {
  context.clearRect(x, y, width, height);
}

class Character {
  constructor(x, y, img) {
    this.x = x;
    this.y = y;
    this.img = img;
    this.sight = 30; // maximum moves to be seen into future.
    this.planStart = 0; // frame the plan began on.
    this.preActI = 0; // previous action index.
    this.plan = []; // 0-left 1-up 2-right 3-down 4-idle 5-hit
    this.nodes = []; // for plan searching. [x, y, cost, ?final?]
  }
  draw(frame, row) {
    cctx.drawImage(this.img, frame * 96, row * 96, 96, 96, this.x, this.y, unit * 1, unit * 1);
  }
  matchNode(node, set) {
    for (var i = 0; i < set.length; i++) {
      if (node[0] === set[i][0] && node[1] === set[i][1]) {
        return i;
      }
    }
    return -1;
  }
  act(times) {
    var diff = frame - this.planStart;
    var actionI = Math.floor(diff / runSpeed);
    var row = 1; // row of tileset to be on
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
        case 4:
          row = 0;
          break;
        case 5:
          if (!(diff % runSpeed)) {
            clear(bctx, Math.round(this.x / unit) * unit, Math.round(this.y / unit) * unit, unit, unit);
            world.map[Math.round(this.y / unit)][Math.round(this.x / unit)] = 0;
          }
          break;
      }
      this.draw(Math.floor(frame / gameStep) % 4, row);
    } else {
      this.plan = [];
      times = this.choosePlan(times);
    }
    return times;
  }
  choosePlan(times) {
    var c = this;
    if (c.plan.length !== 0) return;
    var time = Date.now();
    c.nodes = [[Math.round(c.x / unit), Math.round(c.y / unit), 0]];
    var found = false;
    if (world.map[c.nodes[0][1]][c.nodes[0][0]] === 1) {
      found = true;
      c.nodes[0].push(1);
    }
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
              if (dupl === -1 && world.map[node[1]][node[0]] !== 2) {
                node[2] = cost;
                if (world.map[node[1]][node[0]] === 1) {
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
      if (cost === c.sight) {
        c.nodes = "Cannot see action.";
        found = true;
      }
    }
    time -= Date.now();
    times[0] += Math.abs(time);
    time = Date.now();
    var path = c.findPath(c.x, c.y, c.nodes); // [path1, path2, etc.]
    time -= Date.now();
    times[1] += Math.abs(time);
    if (path[0] !== 4) path.push(4, 5);
    c.plan = path;
    c.planStart = frame;
    c.act(times);
    return times;
  }
  findPath(x, y, nodes) {
    if (nodes === "Cannot see action.") return [4];
    var cost = this.sight + 1;
    var path = []; // stores order of coors
    var simplePath = []; // final directional numbers
    for (var i = nodes.length - 1; i > -1; i--) {
      if (nodes[i][2] < cost && path.length > 0) {
        var x = path[path.length - 1][0] - nodes[i][0];
        var y = path[path.length - 1][1] - nodes[i][1];
        if (Math.abs(x) + Math.abs(y) < 2) {
          path.push([nodes[i][0], nodes[i][1], x, y]);
          cost = nodes[i][2];
        }
      }
      if (nodes[i].length > 3 && path.length === 0) path = [[nodes[i][0], nodes[i][1], 0, 0]];
      //console.log(path.length + ", current node: " + nodes[i]);
    }
    for (var i = path.length - 1; i > 0; i--) {
      simplePath.push((path[i][2] + 1) * Math.abs(path[i][2]) + (path[i][3] + 2) * Math.abs(path[i][3]));
    }
    return simplePath;
  }
}

var amount = 10;
var characters = [];
for (var i = 0; i < amount; i++) {
  characters.push(new Character(unit * Math.floor(Math.random() * canWidth), unit * Math.floor(Math.random() * canHeight), walkingTileset));
}
var raf = undefined;

var times = [0, 0]; // [findPath, MainPlanChoosing]
var averageTimes = [0, 0];
var recordings = 0;
// results: 141.2, 0.3 (1000 guys, 16x9 map, 16 sight)
// results: 38.0,  0.6 (1000 guys, 16x9 map, 6  sight)

function animate() {
  clear(cctx);
  for (var i = 0; i < characters.length; i++) {
    var indTimes = characters[i].act([0, 0]);
    times[0] += indTimes[0];
    times[1] += indTimes[1];
  }
  if (times[0] > 0 || times[1] > 0) {
    averageTimes[0] = (averageTimes[0] * recordings + times[0]) / (recordings + 1)
    averageTimes[1] = (averageTimes[1] * recordings + times[1]) / (recordings + 1)
    recordings += 1;
    console.log(recordings + " | " + times[0] + " " + times[1] + " | " + Math.round(averageTimes[0] * 10) / 10 + " " + Math.round(averageTimes[1] * 10) / 10);
    times = [0, 0];
  }
  frame++;
  raf = window.requestAnimationFrame(animate);
}

walkingTileset.onload = function () {
  raf = window.requestAnimationFrame(animate);
  world.draw();
}