

var unit = Math.floor(window.innerHeight / 48) * 4;
if (window.innerWidth * 9 / 16 < window.innerHeight) unit = Math.floor(window.innerWidth / 80) * 4;
document.body.style.setProperty("--unit", unit + "px");
document.body.style.setProperty("--pixel", unit / 12 + "px");

var frame = 0; // iterates forever
var gameStep = 8; // number of frames 1 step is.
var runSpeed = 32; // number of frames it takes to do 1 action.
var canWidth = 24; // canvas width
var canHeight = 12; // canvas height

var B = document.getElementById("BackgroundCanvas");
B.width = unit * canWidth;
B.height = unit * canHeight;
var bctx = B.getContext('2d');

//ctx.drawImage(img, sx, sy, swidth, sheight, x, y, width, height)

function clear(context, x = 0, y = 0, width = unit * 24, height = unit * 12) {
  context.clearRect(x, y, width, height);
}

var walkingTileset = new Image();
walkingTileset.src = "WalkingAnimationFirstTileset800.png";

class Character {
  constructor(x, y, img) {
    this.x = x;
    this.y = y;
    this.img = img;
    this.planStart = 0; // frame the plan began on.
    this.preActI = 0; // previous action index.
    this.plan = []; // 0-left 1-up 2-right 3-down 4-hit
  }
  draw(frame) {
    bctx.drawImage(this.img, frame * 96, 0, 96, 96, this.x, this.y, unit * 1, unit * 1);
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
      }
      this.draw(Math.floor(frame / gameStep) % 4);
    } else {
      this.plan = [];
      this.choosePlan(Math.random(), Math.random());
    }
  }
  choosePlan(input1, input2, override = false) {
    var c = this;
    if (c.plan.length !== 0 && !override) return;
    var currX = Math.round(c.x / unit);
    var currY = Math.round(c.y / unit);
    console.log(currX, currY);
    [input1, input2].forEach(function (input) {
      for (i = 0; i < Math.floor(Math.random() * 4) + 1; i++) {
        if (input < 0.5) { // left or right
          var attempt = Math.floor(Math.random() * 2) * 2;
          currX += attempt - 1;
          if (currX < 1 || currX > canWidth - 1) {
            attempt = (attempt - 2) * -1;
            currX += (attempt - 1) * 2;
          }
          c.plan.push(attempt);
        } else {
          var attempt = Math.floor(Math.random() * 2) * 2 + 1;
          currY += attempt - 2;
          if (currY < 1 || currY > canHeight - 2) {
            attempt = (attempt - 1) * -1 + 3;
            currY += (attempt - 2) * 2;
          }
          c.plan.push(attempt);
        }
      }
    });
    c.planStart = frame;
    c.act();
  }
}

var amount = 30;
var characters = [];
for (i = 0; i < amount; i++) {
  characters.push(new Character(unit * 10, unit * 6, walkingTileset));
}
var raf = undefined;
function animate() {
  clear(bctx);
  for (i = 0; i < characters.length; i++) {
    characters[i].act();
  }
  frame++;
  raf = window.requestAnimationFrame(animate);
}

walkingTileset.onload = function () {
  raf = window.requestAnimationFrame(animate);
}