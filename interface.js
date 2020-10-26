// Interface Handler

document.addEventListener("click", function (event) {
    cursor.click(event);
});
document.addEventListener("mousemove", function (event) {
    cursor.move(event);
});

var dom = {
    popUp: document.getElementById("PopUp"),
    pTitle: document.getElementById("PTitle"),
    pContent: document.getElementById("PContent")
}

var cursor = {
    click: function (e) {
        characters.forEach(function (c) {
            loc = [Math.round(c.x / unit) * unit, Math.round(c.y / unit) * unit]; // character's location
            if (loc[0] < e.x && loc[0] > e.x - unit && loc[1] < e.y && loc[1] > e.y - unit) {
                var paused = c.pause();
                dom.popUp.style.left = (loc[0] - unit * 1) + "px";
                dom.popUp.style.top = (loc[1] - unit * 5) + "px";
                dom.pTitle.innerHTML = c.info.name;
                dom.pContent.innerHTML = ("Level: " + c.info.level + "<br>Walking: " + c.info.genes[0][0] +
                "<br><br>Type -- Speed -- Ability<br>Mining --- " + c.info.genes[1][0] + " -- " + c.info.genes[1][1] +
                "%<br>Forestry --- " + c.info.genes[2][0] + " -- " + c.info.genes[2][1] + "%<br>Building --- " +
                c.info.genes[3][0] + " -- Level " + c.info.genes[3][1]);
            }
        });
    },
    move: function (e) {
        //console.log(e.x + " | " + e.y);
    }
}