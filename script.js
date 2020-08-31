

var unit = Math.floor(window.innerHeight / 48) * 4;
if (window.innerWidth * 9 / 16 < window.innerHeight) unit = Math.floor(window.innerWidth / 80) * 4;
document.body.style.setProperty("--unit", unit + "px");
document.body.style.setProperty("--pixel", unit / 12 + "px");

var B = document.getElementById("BackgroundCanvas");
B.width = unit * 10;
B.height = unit * 10;
var bctx = B.getContext('2d');

//ctx.drawImage(img, sx, sy, swidth, sheight, x, y, width, height)

function clear(context, x = 0, y = 0, width = unit * 10, height = unit * 10) {
  context.clearRect(x, y, width, height);
}

var walkingTileset = new Image();
walkingTileset.src = "WalkingAnimationFirstTileset800.png";

class Character {
  constructor(x, y, img) {
    this.x = x;
    this.y = y;
    this.img = img;
  }
  draw(sx, sy) {
    bctx.drawImage(this.img, sx, sy, 96, 96, this.x, this.y, unit * 1, unit * 1);
  }
}

var char1 = new Character(unit * 3, unit * 3, walkingTileset);
var x = 0;
function loopDraw() {
  if (x === 48 * 8) x = 0;
  clear(bctx);
  char1.draw(x, 0);
  x += 12 * 8;
  setTimeout(loopDraw, 125);
}


walkingTileset.onload = function () {
  loopDraw();
}