const seed = 1212//Math.floor(Math.random()*10000)+1;
var BlockType=1;
var BlockTypeFlag=false;
var sizeW = 17;
var sizeXY = 12;//6
var thr;
/*document.addEventListener("DOMContentLoaded", function() {
	thr = new Thread();
	thr.execute();
});*/

Number.prototype.toInt = String.prototype.toInt = function() {
	return parseInt(this, 10);
};

Array.prototype.random = function() {
	return this[Math.floor(Math.random() * this.length)];
};

let first = new Block.Grass(1, 1, 1, "Grass");

const $scene = $(".scene");
const $body = $("body");

for (let x = 0; x < sizeXY; x++) {
	for (let z = 0; z < sizeXY; z++) {
		let Fnoise = noise.perlin2(x/sizeW+seed, z/sizeW+seed);
		let y=Math.round(10*Fnoise+7);

		if (y > 0) {
			let next = new Block.Grass(x, z, y, "Grass");
			next.block.appendTo($scene);
			let rnd = Math.floor(Math.random()*50);
			if (rnd < 1) {
				for (tmpY=y+1;tmpY < y+5;tmpY++) {
					next = new Block.Log(x, z, tmpY, "Log");
					next.block.appendTo($scene);
				}
				for (tmpY=y+3;tmpY < y+6;tmpY++) {
					for (tmpZ=z-1;tmpZ < z+2;tmpZ++) {
						for (tmpX=x-1;tmpX < x+2;tmpX++) {
							if (tmpY ==y+5){
								if (tmpX == x || tmpZ == z){
									next = new Block.Leaf(tmpX, tmpZ, tmpY, "Leaf");
									next.block.appendTo($scene);
								}
							} else if (tmpX !=x || tmpZ !=z){
								next = new Block.Leaf(tmpX, tmpZ, tmpY, "Leaf");
								next.block.appendTo($scene);
							}
						}
					}
				}
			}
		}

		tmpY = y;
		for (y--;y > tmpY-3;y--) {
			if (y > 0) {
				next = new Block.Dirt(x, z, y, "Dirt");
				next.block.appendTo($scene);
			}
		}
		while (y > 0) {
			Fnoise = noise.perlin3(x/sizeW+seed*2, y/sizeW+seed*2, z/sizeW+seed*2);
			let fx=Math.round(20*Fnoise);
			if (fx>9) {
				next = new Block.IronOre(x, z, y, "IronOre");
			} else {
				next = new Block.Stone(x, z, y, "Stone");
			}
			next.block.appendTo($scene);
			y--;
		}
		next = new Block.Bedrock(x, z, 0, "Bedrock");
		next.block.appendTo($scene);
	}
	if (x % 4 == 0) {
		Redraws();
	}
}
Redraws();

var time = weather = wRGB = 0;
let wUpDn = true;
//時間の流れ
setInterval(function(){
	if(time % 100 == 0){
		document.getElementById("background").style.backgroundColor = "rgb("+wRGB+","+wRGB+","+wRGB+")";
		if(wUpDn){
			wRGB += 5;
			if(wRGB >=255){
				wUpDn = false;
			}
		}
		else
		{
			wRGB -= 5;
			if(wRGB <=0){
				wUpDn = true;
			}
		}

		weather = Math.floor(Math.random() * 10);
		if(weather < 7){
			weather = 0;
		}
		else
		{
			weather = 1;
		}
	}
	if(time > 2400){
		time = 0;
	}
	if(weather == 1){
		rainStart(".mostHigh",1);
	}
	
	time++;
},100);

function createCoordinatesFrom(side, x, y, z) {
	if (side == "top") {
		z += 1;
	}

	if (side == "side-1") {
		y += 1;
	}

	if (side == "side-2") {
		x += 1;
	}

	if (side == "side-3") {
		y -= 1;
	}

	if (side == "side-4") {
		x -= 1;
	}

	if (side == "bottom") {
		z -= 1;
	}

	return [x, y, z];
}

$body.on("click", ".side", function(e) {
	const $this = $(this);
	const previous = $this.data("block");

	if ($body.hasClass("subtraction")) {
		previous.block.remove();
		//previous = null;
		Redraws();
	} else {
		const coordinates = createCoordinatesFrom(
			$this.data("type"),
			previous.x,
			previous.y,
			previous.z
		);
		if (BlockType == 1) {
			next = new Block.Dirt(...coordinates, "Dirt");
		} else if (BlockType == 2) {
			next = new Block.CobbleStone(...coordinates, "CobbleStone");
		} else if (BlockType == 3) {
			next = new Block.Log(...coordinates, "Log");
		} else if (BlockType == 4) {
			next = new Block.Wood(...coordinates, "Wood");
		} else if (BlockType == 5) {
			next = new Block.Sand(...coordinates, "Sand");
		}

		var jobj = next.block.appendTo($scene);
/*		var ids = jobj.attr("class").split(' '); 
		var Sflag = false;
		ids.forEach(element => {
			if(element == "Sand"){
				Sflag = true;
			}
		});
		if(Sflag){
			jobj.wrap('<span>')
		}*/	

		Redraws();
	}
});

let ghost = null;

function removeGhost() {
	if (ghost) {
		ghost.block.remove();
		ghost = null;
	}
}

function createGhostAt(x, y, z) {
	if (BlockType == 1) {
		next = new Block.Dirt(x, y, z, "Dirt");
	} else if (BlockType == 2) {
		next = new Block.CobbleStone(x, y, z, "CobbleStone");
	} else if (BlockType == 3) {
		next = new Block.Log(x, y, z, "Log");
	} else if (BlockType == 4) {
		next = new Block.Wood(x, y, z, "Wood");
	} else if (BlockType == 5) {
		next = new Block.Sand(x, y, z, "Sand");
	}

	next.block
		.addClass("ghost")
		.appendTo($scene);

	ghost = next;
}

$body.on("mouseenter", ".side", function(e) {
	removeGhost();

	const $this = jQuery(this);
	const previous = $this.data("block");

	const coordinates = createCoordinatesFrom(
		$this.data("type"),
		previous.x,
		previous.y,
		previous.z
	);

	createGhostAt(...coordinates);
});

$body.on("mouseleave", ".side", function(e) {
	removeGhost();
});

let lastMouseX = null;
let lastMouseY = null;

let sceneTransformX = 60;
let sceneTransformY = 0;
let sceneTransformZ = 60;
let sceneTransformScale = 1;

$body.on("mousewheel", function(event) {
	if (event.originalEvent.deltaY > 0) {
		if (sceneTransformScale > 0.3) {
			sceneTransformScale -= 0.05;
		}
	} else {
		sceneTransformScale += 0.05;
	}
	changeViewport();
});

$scene.on("mousedown", function(e) {
	e.stopPropagation();
});

$body.on("mousedown", function(e) {
	lastMouseX = e.clientX / 10;
	lastMouseY = e.clientY / 10;
});

$body.on("mousemove", function(e) {
	if (!lastMouseX) {
		return;
	}

	let nextMouseX = e.clientX / 10;
	let nextMouseY = e.clientY / 10;

	if (nextMouseX !== lastMouseX) {
		let deltaX = nextMouseX.toInt() - lastMouseX.toInt();
		degrees = sceneTransformZ - deltaX;

		if (degrees > 360) {
			degrees -= 360;
		}

		if (degrees < 0) {
			degrees += 360;
		}

		sceneTransformZ = degrees;
		lastMouseX = nextMouseX;

		changeViewport();
	}

	if (nextMouseY !== lastMouseY) {
		let deltaY = nextMouseY.toInt() - lastMouseY.toInt();
		degrees = sceneTransformX - deltaY;

		if (degrees > 360) {
			degrees -= 360;
		}

		if (degrees < 0) {
			degrees += 360;
		}

		sceneTransformX = degrees;
		lastMouseY = nextMouseY;

		changeViewport();
	}
});

$body.on("mouseup", function(e) {
	lastMouseX = null;
	lastMouseY = null;
});

function changeViewport() {
	$scene.css({
		"transform": `
			rotateX(${sceneTransformX}deg)
			rotateY(${sceneTransformY}deg)
			rotateZ(${sceneTransformZ}deg)
			scaleX(${sceneTransformScale})
			scaleY(${sceneTransformScale})
			scaleZ(${sceneTransformScale})
  		`
	});
}

function Redraws() {
	var arrID = new Array();
	var Tx = Ty = Tz = 0;
	$(".side").each(function(i, elem) {
		arrID.push(elem.id);
	});
	arrID.sort();
	arrID.forEach(function(elem) {
		var getElem = document.getElementById(elem);
		elemId = elem.split('_');
		switch (elemId[4]) {
			case "top":
				tmp = "bottom";
				getElem.classList.remove('mostHigh');
				if(Tx == elemId[1]){
					if(Tz == elemId[2]){
						if(Ty < elemId[3]){
							Ty = elemId[3];
						}
					}
					else
					{
						topElem = document.getElementById('trans_'+Tx+'_'+Tz+'_'+Ty+'_top');
						topElem.classList.add('mostHigh');
						Tz = elemId[2];
						Ty = elemId[3];
					}
				}
				else
				{
					topElem = document.getElementById('trans_'+Tx+'_'+Tz+'_'+Ty+'_top');
					topElem.classList.add('mostHigh');
					Tx = elemId[1];
					Tz = elemId[2];
					Ty = elemId[3];
				}
				break;
			case "side-1":
				tmp = "side-3";
				break;
			case "side-2":
				tmp = "side-4";
				break;
			case "side-3":
				tmp = "side-1";
				break;
			case "side-4":
				tmp = "side-2";
				break;
			case "bottom":
				tmp = "top";
				break;
		}
		tmpele="trans_"+elemId[1]+"_"+elemId[2]+"_"+elemId[3]+"_";
		if (document.getElementById(tmpele+tmp) != null) {
			getElem.style.display ="none";
		}
		else
		{
			getElem.style.display ="inline";
		}
	});
}

$body.on("keydown", function(e) {
	if (e.ctrlKey) {
		$body.addClass("subtraction");
		if (ghost != null) {
			ghost.block.remove();
			ghost = null;
		}
	}
	if (e.shiftKey) {
		if (!BlockTypeFlag) {
			BlockTypeFlag=true;
			BlockType++;
			if (BlockType > 5) {
				BlockType=1;
			}
		}
	}
	if (e.key === 'w') {
		sceneTransformX--;
		changeViewport();
	} else if (e.key === 's') {
		sceneTransformX++;
		changeViewport();
	}
	if (e.key === 'a') {
		sceneTransformZ++;
		changeViewport();
	} else if (e.key === 'd') {
		sceneTransformZ--;
		changeViewport();
	}
	if (e.key === 'r') {
		sceneTransformScale += 0.05;
		changeViewport();
	} else if (e.key === 'f') {
		if (sceneTransformScale > 0.3) {
			sceneTransformScale -= 0.05;
		}
		changeViewport();
	}
});

$body.on("keyup", function(e) {
	if (e.key === 'Shift') {
		BlockTypeFlag=false;
	}
	if (e.key === 'Control') {
		$body.removeClass("subtraction");
	}
});
