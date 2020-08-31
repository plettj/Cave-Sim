

var unit = Math.floor(window.innerHeight / 48) * 4;
if (window.innerWidth * 9 / 16 < window.innerHeight) unit = Math.floor(window.innerWidth / 80) * 4;
document.body.style.setProperty("--unit", unit + "px");
document.body.style.setProperty("--pixel", unit / 12 + "px");

var B = document.getElementById("BackgroundCanvas");
B.width = unit * 32;
B.height = unit * 32;
var bctx = B.getContext('2d');

//ctx.drawImage(img, sx, sy, swidth, sheight, x, y, width, height)

var walkingTileset = new Image();
walkingTileset.src = "WalkingAnimationFirstTileset.png";

function Character(x, y, img) {
  this.x = x;
  this.y = y;
  this.img = img;
}
Character.draw = function (sx, sy) {
  bctx.drawImage(this.img, sx, sy, 12, 12, this.x, this.y, unit, unit);
}

var char1 = new Character(unit * 3, unit * 3, walkingTileset);
char1.draw(0, 0);