
var backOver;
var mainOver;
var backImage;

var Scanvas, Sctx;
var Acanvas, Actx;
var Ucanvas, Uctx;
var [width, height] = [0, 0];

var fps = 0;
var doFps = 0;
var frameCount = 0;
var doFrameCount = 0;

var BBForward = 0;
var frame,oldFrame = 0;

var isDrawing = true;
var playDrawing = false;
var isGame = false;

var isLoadFlag = false;
var keyState = [];
var devKeyState = [];
var isDebug = false;

var imageCache = {
	snails: {
		url: "pictures/snails.png",
		cx: 90,
		cy: 120,
		animation: {
			sw: 30,
			sh: 30,
			bottom: {
				atc: 0,
				cou: 3,
			},
			left: {
				atc: 1,
				cou: 3,
			},
			right: {
				atc: 2,
				cou: 3,
			},
			top: {
				atc: 3,
				cou: 3,
			},
		},
	},
	dog: {
		url: "pictures/dog.png",
		cx: 120,
		cy: 160,
		animation: {
			sw: 40,
			sh: 40,
			bottom: {
				atc: 0,
				cou: 3,
			},
			left: {
				atc: 1,
				cou: 3,
			},
			right: {
				atc: 2,
				cou: 3,
			},
			top: {
				atc: 3,
				cou: 3,
			},
		},
	},
	water: {
		url: "pictures/water.png",
		cx: 32,
		cy: 160,
		auto: true,
	},
	ice: {
		url: "pictures/ice.png",
		cx: 32,
		cy: 160,
		auto: true,
	},
	wall: {
		url: "pictures/wall.png",
		cx: 32,
		cy: 160,
		auto: true,
	},
	door: {
		url: "pictures/door.png",
		cx: 32,
		cy: 32,
	},
	stone: {
		url: "pictures/stone.png",
		cx: 36,
		cy: 36,
	},
	key: {
		url: "pictures/key.png",
		cx: 32,
		cy: 32,
	},
	flag: {
		url: "pictures/flag.png",
		cx: 22,
		cy: 22,
	},
};

var mapObjArr = [];
var effectObjArr = [];

var initState = {};
var objState = {
	trans: [],
	you: [],
	win: [],
	stop: [],
	push: [],
	defeat: [],
	sink: [],
	float: [],
	shut: [],
	open: [],
	hot: [],
	melt: [],
	move: [],
	fall: [],
	weak: [],
	word: [],
};
var objLevel = {};
var hasObj = {};
var makeObj = {};

var timeStop = false;
var startTime = 0;

var aGsize = 40;		//1ブロックの大きさ
var fontSize = 17;		//fontのサイズ
var mapSetData = {};		//mapの設定
var isUndo = false;		//undo処理中か
var keyLog = [];		//キーの入力のログ


//変更可
var setFps = 60;		//等倍速
var BBFCapacity = 30;		//1フレームの実行限界数(溢れは持ち越し)
var animationNextCou = 10;	//画像変更速度
var maxMapSize = [20, 20];
var nowMapId = 1;		//現在のmap

//####################################################################################################
//フレーム安定化用
var requestAnimationFrame = (function(){
	return window.requestAnimationFrame
		|| window.webkitRequestAnimationFrame
		|| window.mozRequestAnimationFrame
		|| window.oRequestAnimationFrame
		|| window.msRequestAnimationFrame
		|| function( callback ){
			window.setTimeout( callback, 1000.0 / 60.0 );
		};
})();
var now = window.performance
	&& (performance.now
	|| performance.mozNow
	|| performance.msNow
	|| performance.oNow
	|| performance.webkitNow
);
function getTime(){
	return (now && now.call(performance)) || (new Date().getTime());
}
var startTime = getTime();
//####################################################################################################

//map上のもの
class mapObj {
	constructor(x, y, name, data, lnklv=-1){
		this.death = false;
		this.win = false;
		this.trans = false;

		this.animaCou = 0;
		this.animaNowCou = 0;
		this.effectCoolTime = 0;
		this.notCheckMe = false;	//判定チェック中に自分を判定しないよう

		this.lastDirection = "bottom";
		this.useText = false;

		this.x = x;
		this.y = y;
		this.oldx = x;
		this.oldy = y;
		this.name = name;

		this.data = data;	//多目的データ
		this.lnklv = lnklv; //移管先Lv
		if (lnklv == -1) {
			this.lnklv = 99;
		}

		switch(this.data){
			case "top":
			case "bottom":
			case "left":
			case "right":
				this.lastDirection = this.data;
				break;
		}


		this.textType  = 0;
		this.isWordObj = false;
		this.fontColor = null;
		this.backColor = null;
		this.doAnima = false;
		this.doAuto = false;
		if(this.name == "text"){
			this.doAnima = true;
			this.textType = objDataList[this.data][0];
			switch(this.textType){
				case 0:
					this.fontColor = new rgba(252,122,98,0.9);
					this.backColor = new rgba(255,255,255,0);
					break;
				case 1:
					this.fontColor = new rgba(0,0,0,0.9);
					this.backColor = new rgba(255,255,255,0);
					break;
				case 2:
					this.fontColor = new rgba(255,255,255,0.9);
					this.backColor = new rgba(252,122,98,0.9);
					break;
			}
		}
		else if(this.name == "level"){
			this.doAnima = true;

			this.fontColor = new rgba(192,48,192,0.9);
			this.backColor = new rgba(255,255,255,0);
		}
		else{
			//アニメーション設定
			if(imageCache[this.name].animation){
				this.doAnima = true;

				this.useDirection = false;
				if(imageCache[this.name].animation.top){
					this.useDirection = true;
				}
			}
			//オートチップか
			if(imageCache[this.name].auto){
				this.doAuto = true;
			}
		}
	}
	update(obligaDo=false,isMove=false,isFall=false){
		if(this.x < 0){
			this.x = 0;
			if(isMove){
				this.lastDirection = "right";
			}
		}
		if(this.y < 0){
			this.y = 0;
			if(isMove){
				this.lastDirection = "bottom";
			}
		}
		if(this.x >= maxMapSize[0]){
			this.x = maxMapSize[0] -1;
			if(isMove){
				this.lastDirection = "left";
			}
		}
		if(this.y >= maxMapSize[1]){
			this.y = maxMapSize[1] -1;
			if(isMove){
				this.lastDirection = "top";
			}
		}
		if(this.death){
			return;
		}

		if(obligaDo || this.oldx != this.x || this.oldy != this.y){
			//obj向き
			let moveXY = [this.oldx - this.x, this.oldy - this.y];
			switch(moveXY[0]){
				case 1:
					this.lastDirection = "left";
					break;
				case -1:
					this.lastDirection = "right";
					break;
			}
			switch(moveXY[1]){
				case 1:
					this.lastDirection = "top";
					break;
				case -1:
					this.lastDirection = "bottom";
					break;
			}

			this.notCheckMe = true;
			//float(浮く)に対応
			let isFloat = false;
			for(let i=0,li=objState.float.length;i<li;i++){
				if(objState.float[i] == this.name){
					isFloat = true;
					break;
				}
			}
			//shut(閉じる)に対応
			let getObj = stateCheck(objState.shut, [this.x, this.y], true);
			if(getObj){
				for(let i=0,li=objState.open.length;i<li;i++){
					if(objState.open[i] == this.name){
						mapObjArr[getObj[0]].death = true;
						this.death = true;

						//座標更新
						this.oldx = this.x;
						this.oldy = this.y;

						effectEstab(this.x,this.y, "#fff",10);
						return;
					}
				}
			}
			//push(押す)に対応
			getObj = stateCheck(objState.push, [this.x, this.y], false);
			let isStop = false;
			if(getObj){
				for(let i=0,li=getObj.length;i<li;i++){
					if(moveXY[0] == 0 && moveXY[1] == 0){
						continue;
					}
					let tmpPos = [mapObjArr[getObj[i]].x,mapObjArr[getObj[i]].y];

					//fall(落ちる)対応
					if(!isFall){
						mapObjArr[getObj[i]].x -= moveXY[0];
						mapObjArr[getObj[i]].y -= moveXY[1];
						mapObjArr[getObj[i]].update();
					}

					if(mapObjArr[getObj[i]].x == tmpPos[0] && mapObjArr[getObj[i]].y == tmpPos[1]){
						for(let j=0,lj=objState.weak.length;j<lj;j++){
							if(objState.weak[j] == mapObjArr[getObj[i]].name){
								mapObjArr[getObj[i]].death = true;

								effectEstab(mapObjArr[getObj[i]].x,mapObjArr[getObj[i]].y, "#888",20);
								break;
							}
						}
						if(!mapObjArr[getObj[i]].death){
							isStop = true;
						}
					}
					else{
						//weak(脆い)に対応
						mapObjArr[getObj[i]].notCheckMe = true;
						let getObjTmp = stateCheck(objState.weak, [mapObjArr[getObj[i]].x, mapObjArr[getObj[i]].y], false);
						mapObjArr[getObj[i]].notCheckMe = false;
						for(let j=0,lj=getObjTmp.length;j<lj;j++){
							for(let k=0,lk=objState.weak.length;k<lk;k++){
								if(objState.weak[k] == mapObjArr[getObjTmp[j]].name){
									mapObjArr[getObjTmp[j]].death = true;

									effectEstab(mapObjArr[getObjTmp[j]].x,mapObjArr[getObjTmp[j]].y, "#888",20);
									break;
								}
							}
						}
					}
				}
			}
			//stop(止まる)に対応
			getObj = stateCheck(objState.stop, [this.x, this.y], true);
			if(isStop || getObj){
				//weak(脆い)に対応
				if(!isStop){
					for(let j=0,lj=objState.weak.length;j<lj;j++){
						if(objState.weak[j] == mapObjArr[getObj[0]].name){
							mapObjArr[getObj[0]].death = true;

							effectEstab(mapObjArr[getObj[0]].oldx,mapObjArr[getObj[0]].oldy, "#888",20);
							break;
						}
					}
				}
				//move(動く)に対応
				if(isMove){
					switch(this.lastDirection){
						case "top":
							this.lastDirection = "bottom";
							break;
						case "bottom":
							this.lastDirection = "top";
							break;
						case "left":
							this.lastDirection = "right";
							break;
						case "right":
							this.lastDirection = "left";
							break;
					}
				}
				else{
					//weak(脆い)に対応
					for(let j=0,lj=objState.weak.length;j<lj;j++){
						if(objState.weak[j] == this.name){
							this.death = true;

							effectEstab(this.oldx,this.oldy, "#888",20);
							break;
						}
					}
				}
				this.x = this.oldx;
				this.y = this.oldy;
			}
			//sink(沈む)に対応
			getObj = stateCheck(objState.sink, [this.x, this.y], false);
			if(getObj){
				let isAction = -1;
				if(isFloat){
					for(let i=0,li=getObj.length;i<li;i++){
						for(let j=0,lj=objState.float.length;j<lj;j++){
							if(objState.float[j] == mapObjArr[getObj[i]].name){
								isAction = getObj[i];
								break;
							}
						}
						if(isAction != -1){
							break;
						}
					}
				}
				else{
					isAction = getObj[0];
				}
				if(isAction != -1){
					mapObjArr[isAction].death = true;
					this.death = true;
					effectEstab(this.x,this.y, "#48f",20);
				}
			}
			//melt(溶ける)に対応
			getObj = stateCheck(objState.melt, [this.x, this.y], false);
			if(getObj){
				let isAction = -1;
				if(isFloat){
					for(let i=0,li=getObj.length;i<li;i++){
						for(let j=0,lj=objState.float.length;j<lj;j++){
							if(objState.float[j] == mapObjArr[getObj[i]].name){
								isAction = getObj[i];
								break;
							}
						}
						if(isAction != -1){
							break;
						}
					}
				}
				else{
					isAction = getObj[0];
				}
				if(isAction != -1){
					for(let i=0,li=objState.hot.length;i<li;i++){
						if(objState.hot[i] == this.name){
							mapObjArr[isAction].death = true;

							effectEstab(this.x,this.y, "#bbb",20);
						}
					}
				}
			}
			//hot(熱い)に対応(melt代替)
			getObj = stateCheck(objState.hot, [this.x, this.y], false);
			if(getObj){
				let isAction = -1;
				if(isFloat){
					for(let i=0,li=getObj.length;i<li;i++){
						for(let j=0,lj=objState.float.length;j<lj;j++){
							if(objState.float[j] == mapObjArr[getObj[i]].name){
								isAction = getObj[i];
								break;
							}
						}
						if(isAction != -1){
							break;
						}
					}
				}
				else{
					isAction = getObj[0];
				}
				if(isAction != -1){
					for(let i=0,li=objState.melt.length;i<li;i++){
						if(objState.melt[i] == this.name){
							this.death = true;

							effectEstab(this.x,this.y, "#bbb",20);
						}
					}
				}
			}
			//defeat(失う)に対応
			getObj = stateCheck(objState.defeat, [this.x, this.y], false);
			if(getObj){
				let isAction = -1;
				if(isFloat){
					for(let i=0,li=getObj.length;i<li;i++){
						for(let j=0,lj=objState.float.length;j<lj;j++){
							if(objState.float[j] == mapObjArr[getObj[i]].name){
								isAction = getObj[i];
								break;
							}
						}
						if(isAction != -1){
							break;
						}
					}
				}
				else{
					isAction = getObj[0];
				}
				if(isAction != -1 && !mapObjArr[isAction].death){
					for(let i=0,li=objState.you.length;i<li;i++){
						if(objState.you[i] == this.name){
							this.death = true;

							effectEstab(this.x,this.y, "#888",20);
						}
					}
				}
			}
			//win(勝つ)に対応
			getObj = stateCheck(objState.win, [this.x, this.y], false);
			if(getObj){
				let isAction = -1;
				if(isFloat){
					for(let i=0,li=getObj.length;i<li;i++){
						for(let j=0,lj=objState.float.length;j<lj;j++){
							if(objState.float[j] == mapObjArr[getObj[i]].name){
								isAction = getObj[i];
								break;
							}
						}
						if(isAction != -1){
							break;
						}
					}
				}
				else{
					isAction = getObj[0];
				}
				if(isAction != -1 && !mapObjArr[isAction].death){
					for(let i=0,li=objState.you.length;i<li;i++){
						if(objState.you[i] == this.name){
							this.win = true;
						}
					}
				}
			}
			//trans(挑戦)に対応
			getObj = stateCheck(objState.trans, [this.x, this.y], true);
			if(getObj){
				for(let i=0,li=objState.you.length;i<li;i++){
					if(objState.you[i] == this.name){
						this.trans = mapObjArr[getObj[0]].lnklv;
					}
				}
			}

			this.notCheckMe = false;

			//座標更新
			this.oldx = this.x;
			this.oldy = this.y;
		}

		this.draw(true);
	}
	draw(playAnimation){
		//float(浮く)に対応
		let isFloat = false;
		for(let i=0,li=objState.float.length;i<li;i++){
			if(objState.float[i] == this.name){
				isFloat = true;
				break;
			}
		}

		if(this.doAnima){
			if(!playAnimation){
				return;
			}
			if(this.name == "text"){
				//テキストブロック
				if(this.backColor){
					let tmpColor = this.backColor;
					if(!this.useText){
						tmpColor = tmpColor.divide(2,2,2,1.5);
					}
					drawSquare(Actx,
						this.x * aGsize, this.y * aGsize - (isFloat?aGsize/4:0),
						aGsize,aGsize,
						`rgba(${tmpColor.r},${tmpColor.g},${tmpColor.b},${tmpColor.a}`,
						"rgba(0,0,0,0.1)"
					);
				}
				if(this.fontColor){
					let tmpColor = this.fontColor;
					if(!this.useText){
						tmpColor = tmpColor.divide(1,1,1,1.5);
					}
					let texts = objDataList[this.data][1];
					let isOne = !!texts.match(/\n/);
					drawText(Actx,texts,
						this.x * aGsize + aGsize/2, this.y * aGsize + (isOne?0:aGsize/4) - (isFloat?aGsize/4:0),
						fontSize,
						`rgba(${tmpColor.r},${tmpColor.g},${tmpColor.b},${tmpColor.a}`,
						"center",
						"top"
					);
				}
				return;
			}
			else if(this.name == "level"){
				let levels = this.lnklv;
				let nowlevel = +localStorage.getItem('clearId');
				//レベルブロック
				if(this.backColor){
					let tmpColor = this.backColor;
					if(levels > nowlevel){
						tmpColor = tmpColor.divide(2,2,2,1.5);
					}
					drawSquare(Actx,
						this.x * aGsize, this.y * aGsize - (isFloat?aGsize/4:0),
						aGsize,aGsize,
						`rgba(${tmpColor.r},${tmpColor.g},${tmpColor.b},${tmpColor.a}`,
						"rgba(0,0,0,0.1)"
					);
				}
				if(this.fontColor){
					let tmpColor = this.fontColor;
					if(levels > nowlevel){
						tmpColor = tmpColor.divide(1,1,1,1.5);
					}
					drawText(Actx,""+levels,
						this.x * aGsize + aGsize/2, this.y * aGsize + aGsize/4 - (isFloat?aGsize/4:0),
						fontSize,
						`rgba(${tmpColor.r},${tmpColor.g},${tmpColor.b},${tmpColor.a}`,
						"center",
						"top"
					);
				}
				return;
			}

			//アニメーションあり
			let animaDirect = "all";
			if(this.useDirection){
				animaDirect = this.lastDirection;
			}

			this.animaCou++;
			if(this.animaCou > animationNextCou){
				this.animaCou = 0;
				this.animaNowCou++;
				if(this.animaNowCou >= imageCache[this.name].animation[animaDirect].cou){
					this.animaNowCou = 0;
				}
			}
			imageScraps(imageCache[this.name], animaDirect, this.animaNowCou, Actx, [this.x * aGsize, this.y * aGsize - (isFloat?aGsize/4:0)]);
		}
		else{
			if(playAnimation){
				return;
			}

			if(this.doAuto){
				//オートチップ
				autoScraps(this.name, Sctx, [this.x, this.y]);
			}
			else{
				//アニメーションなし
				Sctx.drawImage(imageCache[this.name].img,
					0, 0,
					imageCache[this.name].cx,
					imageCache[this.name].cy,
					this.x * aGsize,
					this.y * aGsize - (isFloat?aGsize/4:0),
					aGsize, aGsize
				);
			}
		}
	}
}

//エフェクト
class effectObj {
	constructor(x, y, color){
		this.death = false;

		this.x = x;
		this.y = y;
		this.color = color;

		this.alpha = 0.8;
		this.animaCou = randInt(0,30);

		this.effectSize = 3;
	}
	update(){
		this.alpha -= 0.01;
		if(this.alpha < 0){
			this.death = true;
			return;
		}
		this.animaCou++;
		if(this.animaCou > 30){
			this.animaCou = 0;
		}

		if(this.animaCou < 15){
			drawSquare(Actx,
				this.x-this.effectSize, this.y,
				this.effectSize * 3, this.effectSize,
				this.color, null,
				this.alpha
			);
			drawSquare(Actx,
				this.x, this.y-this.effectSize,
				this.effectSize, this.effectSize * 3,
				this.color, null,
				this.alpha
			);
		}
		else{
			drawSquare(Actx,
				this.x-this.effectSize, this.y-this.effectSize,
				this.effectSize, this.effectSize,
				this.color, null,
				this.alpha
			);
			drawSquare(Actx,
				this.x+this.effectSize, this.y-this.effectSize,
				this.effectSize, this.effectSize,
				this.color, null,
				this.alpha
			);
			drawSquare(Actx,
				this.x, this.y,
				this.effectSize, this.effectSize,
				this.color, null,
				this.alpha
			);
			drawSquare(Actx,
				this.x-this.effectSize, this.y+this.effectSize,
				this.effectSize, this.effectSize,
				this.color, null,
				this.alpha
			);
			drawSquare(Actx,
				this.x+this.effectSize, this.y+this.effectSize,
				this.effectSize, this.effectSize,
				this.color, null,
				this.alpha
			);
		}
	}
}


//####################################################################################################

function randInt(min,max){
	return (Math.random() * (max - min + 1)|0) + min;
}

rgba = function(r=0,g=0,b=0,a=1){
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;
	this.divide = function(r1,g1,b1,a1){
		var ret = new rgba(this.r,this.g,this.b,this.a);
		ret.r /= r1;
		ret.g /= g1;
		ret.b /= b1;
		ret.a /= a1;
		return ret;
	};
};
function drawSquare(ctx,x,y,sx,sy,color1=null,color2=null,alpha=1){
	if(!isDrawing){
		return;
	}
	ctx.fillStyle = color1;
	ctx.strokeStyle = color2;
	ctx.globalAlpha = alpha;
	ctx.beginPath();
	ctx.rect(x,y,sx|0,sy|0);
	if(color2 != null)
		ctx.stroke();
	if(color1 != null)
		ctx.fill();
	ctx.globalAlpha = 1;
}
function drawText(ctx,text,x,y,size,color,align="center",base="middle"){
	if(!isDrawing){
		return;
	}
	ctx.font = 'bold '+ size +'px TanukiMagic, "Hannotate SC", "HanziPen SC", "ヒラギノ丸ゴ Pro"';
	ctx.textAlign = align;
	ctx.textBaseline = base;
	ctx.fillStyle = color;
	let lines = text.split("\n");
	for(let i=0,li=lines.length;i<li;i++){
		let addY = 0;
		if(i){
			addY += size * i;
		}
		ctx.fillText(lines[i],x|0,(y + addY)|0);
	}
}
//####################################################################################################

//画像切り抜き&表示
function imageScraps(imgObj, type, cou, ctx, pos){
	if(!isDrawing){
		return;
	}
	if(!imgObj.animation[type]){
		console.log("画像タイプが見つかりませんでした :" + type);
	}

	ctx.drawImage(imgObj.img,
		imgObj.animation.sw * cou,
		imgObj.animation.sh * imgObj.animation[type].atc,
		imgObj.animation.sw,
		imgObj.animation.sh,
		pos[0], pos[1],
		aGsize, aGsize
	);
}

//オートチップ表示
function autoScraps(names, ctx, pos){
	if(!isDrawing){
		return;
	}
	let imgObj = imageCache[names];
	let chipSize = imageCache[names].cx;
	let objTable = [];
	for(let y=0;y<maxMapSize[1];y++){
		objTable[y] = [];
	}
	for(let i=0,li=mapObjArr.length;i<li;i++){
		if(mapObjArr[i].name == names){
			objTable[mapObjArr[i].y][mapObjArr[i].x] = i;
		}
	}

	let adjoin = existBlock(pos[0],pos[1]-1) * 1
		+ existBlock(pos[0]-1,pos[1]) * 2
		+ existBlock(pos[0]+1,pos[1]) * 4
		+ existBlock(pos[0],pos[1]+1) * 8
		+ existBlock(pos[0]-1,pos[1]-1) * 16
		+ existBlock(pos[0]+1,pos[1]-1) * 32
		+ existBlock(pos[0]-1,pos[1]+1) * 64
		+ existBlock(pos[0]+1,pos[1]+1) * 128;
	let renderingArea = [];
	//左上
	let bitTmp = adjoin & 19;
	renderingArea[0] = [0];
	switch(bitTmp){
		case 0:
		case 16:
			/* コーナー */
			renderingArea[0][1] = 0;
			break;
		case 1:
		case 17:
			/* 縦方向の道 */
			renderingArea[0][1] = chipSize;
			break;
		case 2:
		case 18:
			/* 横方向の道 */
			renderingArea[0][1] = chipSize*2;
			break;
		case 3:
			/* 交差 */
			renderingArea[0][1] = chipSize*3;
			break;
		case 19:
			/* 境界なし */
			renderingArea[0][1] = chipSize*4;
			break;
	}
	//右上
	bitTmp = adjoin & 37;
	renderingArea[1] = [chipSize/2];
	switch(bitTmp){
		case 0:
		case 32:
			renderingArea[1][1] = 0;
			break;
		case 1:
		case 33:
			renderingArea[1][1] = chipSize;
			break;
		case 4:
		case 36:
			renderingArea[1][1] = chipSize*2;
			break;
		case 5:
			renderingArea[1][1] = chipSize*3;
			break;
		case 37:
			renderingArea[1][1] = chipSize*4;
			break;
	}
	//左下
	bitTmp = adjoin & 74;
	renderingArea[2] = [0];
	switch(bitTmp){
		case 0:
		case 64:
			renderingArea[2][1] = chipSize*0.5;
			break;
		case 8:
		case 72:
			renderingArea[2][1] = chipSize*1.5;
			break;
		case 2:
		case 66:
			renderingArea[2][1] = chipSize*2.5;
			break;
		case 10:
			renderingArea[2][1] = chipSize*3.5;
			break;
		case 74:
			renderingArea[2][1] = chipSize*4.5;
			break;
	}
	//右下
	bitTmp = adjoin & 140;
	renderingArea[3] = [chipSize/2];
	switch(bitTmp){
		case 0:
		case 128:
			renderingArea[3][1] = chipSize*0.5;
			break;
		case 8:
		case 136:
			renderingArea[3][1] = chipSize*1.5;
			break;
		case 4:
		case 132:
			renderingArea[3][1] = chipSize*2.5;
			break;
		case 12:
			renderingArea[3][1] = chipSize*3.5;
			break;
		case 140:
			renderingArea[3][1] = chipSize*4.5;
			break;
	}
	let posAdjus = [
		[0,0],
		[aGsize/2,0],
		[0,aGsize/2],
		[aGsize/2,aGsize/2]
	];
	for(let i=0;i<4;i++){
		ctx.drawImage(imgObj.img,
			renderingArea[i][0],
			renderingArea[i][1],
			chipSize/2,
			chipSize/2,
			pos[0] * aGsize + posAdjus[i][0], pos[1] * aGsize + posAdjus[i][1],
			aGsize/2, aGsize/2
		);
	}


	function existBlock(x,y){
		if(0 > x || x >= maxMapSize[0] || 0 > y || y >= maxMapSize[1]){
			return 1;
		}
		if(objTable[y][x] !== undefined){
			return 1;
		}
		return 0;
	}
}

//####################################################################################################

window.addEventListener("resize", function(){
	if(isLoadFlag){
		canvasReSize();
	}
});
window.addEventListener('contextmenu', (e) => {
	e.preventDefault();
});

document.addEventListener('keydown', function(e){
	switch(e.code){
		case 'ArrowUp':
		case 'KeyW':
			if(!keyState[0]){
				keyState[0] = 1;
			}
			break;
		case 'ArrowDown':
		case 'KeyS':
			if(!keyState[1]){
				keyState[1] = 1;
			}
			break;
		case 'ArrowLeft':
		case 'KeyA':
			if(!keyState[2]){
				keyState[2] = 1;
			}
			break;
		case 'ArrowRight':
		case 'KeyD':
			if(!keyState[3]){
				keyState[3] = 1;
			}
			break;

		case 'KeyP':
			if(!keyState[4]){
				keyState[4] = 1;
			}
			break;
		case 'Space':
			if(!keyState[5]){
				keyState[5] = 1;
			}
			break;
		case 'Backspace':
			if(!keyState[6]){
				keyState[6] = 1;
			}
			break;

		case 'ControlLeft':
			devKeyState[0] = true;
			break;
		case 'IntlYen':
			if(!devKeyState[1]){
				devKeyState[1] = 1;
			}
			break;
	}
	if(!(isDebug && devKeyState[1])){
		e.preventDefault();
	}
});
document.addEventListener('keyup', function(e){
	switch(e.code){
		case 'ArrowUp':
		case 'KeyW':
			keyState[0] = 0;
			break;
		case 'ArrowDown':
		case 'KeyS':
			keyState[1] = 0;
			break;
		case 'ArrowLeft':
		case 'KeyA':
			keyState[2] = 0;
			break;
		case 'ArrowRight':
		case 'KeyD':
			keyState[3] = 0;
			break;

		case 'KeyP':
			keyState[4] = 0;
			break;
		case 'Space':
			keyState[5] = 0;
			break;
		case 'Backspace':
			keyState[6] = 0;
			break;

		case 'ControlLeft':
			devKeyState[0] = false;
			break;
		case 'IntlYen':
			devKeyState[1] = 0;
			break;
	}
});

function keyStateJudge(){

	if(isGame){
		if(keyState[0] == 1){
			keyState[0] = 2;
			doMove(0, -1);
		}
		if(keyState[1] == 1){
			keyState[1] = 2;
			doMove(0, 1);
		}
		if(keyState[2] == 1){
			keyState[2] = 2;
			doMove(-1, 0);
		}
		if(keyState[3] == 1){
			keyState[3] = 2;
			doMove(1, 0);
		}
		if(keyState[4] == 1){
			keyState[4] = 2;
			keyLog = [];
			mapCreate(nowMapId);
		}
		if(keyState[5] == 1){
			keyState[5] = 2;
			doMove(0, 0);
		}
		if(keyState[6] == 1){
			keyState[6] = 2;
			doUndo();
		}
	}

	if(devKeyState[0]){
		if(devKeyState[1] == 1){
			devKeyState[1] = 2;
			isDebug = !isDebug;
		}
	}
}

//####################################################################################################

//静止画更新
function stillRenewal(){
	playDrawing = false;
	if(isDrawing){
		playDrawing = true;
		Sctx.clearRect(0,0,width,height);
		for(let i=0,li=mapObjArr.length;i<li;i++){
			mapObjArr[i].draw(false);
		}
	}
}

//全体進行
function doMove(x, y){
	//undo処理用
	if(!isUndo){
		keyLog.push([x,y]);
	}

	for(let i=0,li=mapObjArr.length;i<li;i++){
		//youを動かす
		for(let j=0,lj=objState.you.length;j<lj;j++){
			if(mapObjArr[i].name == objState.you[j]){
				mapObjArr[i].x += x;
				mapObjArr[i].y += y;
				mapObjArr[i].update();
				break;
			}
		}

		//move(動く)に対応
		for(let j=0,lj=objState.move.length;j<lj;j++){
			if(mapObjArr[i].name == objState.move[j]){
				switch(mapObjArr[i].lastDirection){
					case "top":
						mapObjArr[i].y--;
						break;
					case "bottom":
						mapObjArr[i].y++;
						break;
					case "left":
						mapObjArr[i].x--;
						break;
					case "right":
						mapObjArr[i].x++;
						break;
				}
				mapObjArr[i].update(false,true);
				break;
			}
		}

		//fall(落ちる)に対応
		for(let j=0,lj=objState.fall.length;j<lj;j++){
			if(mapObjArr[i].name == objState.fall[j]){
				let oldY;
				do{
					oldY = mapObjArr[i].y;
					mapObjArr[i].y++;
					mapObjArr[i].update(false,false,true);
				}while(oldY != mapObjArr[i].y);
				break;
			}
		}
	}
	for(let i=0,li=mapObjArr.length;i<li;i++){
		//make(aはbを作成する)対応
		for(let key in makeObj){
			if(key == mapObjArr[i].name){
				let isMake = false;
				let keyName = makeObj[key];
				let pos = [mapObjArr[i].x,mapObjArr[i].y];
				for(let j=0;j<li;j++){
					if(keyName == mapObjArr[j].name && i != j){
						if(pos[0] == mapObjArr[j].x && pos[1] == mapObjArr[j].y){
							isMake = true;
							break;
						}
					}
				}
				if(!isMake){
					let data = key;
					if(keyName != "text"){
						data = mapObjArr[i].lastDirection;
					}
					mapObjArr.push(new mapObj(mapObjArr[i].x, mapObjArr[i].y, keyName, data, objLevelSet(keyName, mapObjArr[i].lnklv)));
				}
				break;
			}
		}
	}

	//text字句解析
	textAnalysis();

	if(!isUndo){
		//静止画更新
		stillRenewal();
	}
}

//objごとのLv設定
function objLevelSet(name, lv = -1) {
	if (objLevel[name] !== undefined){
		return objLevel[name];
	}
	else if (name == "level") {
		return lv;
	}
	return -1;
}

//状態判定
function stateCheck(names, pos, ctype){
	if(names.length == 0){
		return false;
	}
	let ans = [];
	for(let i=0,li=mapObjArr.length;i<li;i++){
		if(mapObjArr[i].notCheckMe){
			continue;
		}
		let eflag = false;
		for(let j=0,lj=names.length;j<lj;j++){
			if(mapObjArr[i].name == names[j]){
				if(mapObjArr[i].x == pos[0] && mapObjArr[i].y == pos[1]){
					ans.push(i);
					if(ctype){
						eflag = true;
					}
				}
				break;
			}
		}
		if(eflag){
			break;
		}
	}
	if(ans.length == 0){
		ans = false;
	}
	return ans;
}

//textの字句解析
function textAnalysis(){
	let textTable = [];
	let idArr = [];

	//リセット
	tmpWordState = objState.word.slice();
	for(key in objState){
		objState[key] = [];
		if(initState[key]){
			objState[key] = initState[key].slice();
		}
	}
	hasObj = {};
	makeObj = {};

	for(let y=0;y<maxMapSize[1];y++){
		textTable[y] = [];
	}
	for(let i=0,li=mapObjArr.length;i<li;i++){
		if(mapObjArr[i].name == "text"){
			textTable[mapObjArr[i].y][mapObjArr[i].x] = i;
			mapObjArr[i].useText = false;
		}
		//word(文字)対応
		for(let j=0,lj=tmpWordState.length;j<lj;j++){
			if(mapObjArr[i].name == tmpWordState[j]){
				textTable[mapObjArr[i].y][mapObjArr[i].x] = i;
				mapObjArr[i].useText = false;
				mapObjArr[i].isWordObj = true;
			}
		}
	}
	for(let y=0;y<maxMapSize[1];y++){
		for(let x=0;x<maxMapSize[0];x++){
			if(textTable[y][x] !== undefined){
				if(mapObjArr[textTable[y][x]].textType == 0){
					idArr = [];
					existCheck(x,y,1)
					if(idArr.length >= 3){
						isRuleSet();
					}
					idArr = [];
					existCheck(x,y,2)
					if(idArr.length >= 3){
						isRuleSet();
					}
				}
			}
		}
	}

	//重複削除
	for(key in objState){
		objState[key] = [...new Set(objState[key])];
	}
	//youとpushの共存判定
	objState.push = objState.push.filter(i => objState.you.indexOf(i) == -1);


	function existCheck(x,y,direct){
		if(0 > x || x >= maxMapSize[0] || 0 > y || y >= maxMapSize[1]){
			return false;
		}
		if(textTable[y][x] !== undefined){
			idArr.push([textTable[y][x],mapObjArr[textTable[y][x]].textType]);
			switch(direct){
				case 1:
					existCheck(x+1,y,direct)
					break;
				case 2:
					existCheck(x,y+1,direct)
					break;
			}
		}
	}

	function isRuleSet(){
		let cache = [];
		let nextType = 0;
		let doFlag = false;
		let DNtype = "data";
		for(let i=0,li=idArr.length;i<li;i++){
			if(nextType == 0 && idArr[i][1] == 0){
				cache.push(idArr[i][0]);
				nextType = 1;
			}
			else if(nextType == 2){
				if(idArr[i][1] == 0){
					//obj置き換え
					let tmpName = mapObjArr[cache[cache.length-1]];
					tmpName = tmpName.isWordObj?tmpName.name:tmpName.data;
					let repName = mapObjArr[idArr[i][0]];
					repName = repName.isWordObj?repName.name:repName.data;
					for(let j=0,lj=mapObjArr.length;j<lj;j++){
						if(mapObjArr[j].name == tmpName){
							let data = mapObjArr[j].name;
							if(repName != "text"){
								data = mapObjArr[j].lastDirection;
							}
							mapObjArr[j] = new mapObj(mapObjArr[j].x, mapObjArr[j].y, repName, data, objLevelSet(repName, mapObjArr[j].lnklv));
						}
					}
					useSet(i);
					return;
				}
				else if(idArr[i][1] == 2){
					//ルール設定
					let tmpName = mapObjArr[idArr[i][0]];
					tmpName = tmpName.isWordObj?tmpName.name:tmpName.data;
					for(let j=0,lj=cache.length;j<lj;j++){
						let repName = mapObjArr[cache[j]];
						objState[tmpName].push(repName.isWordObj?repName.name:repName.data);
					}
					nextType = 1;
					useSet(i);
				}
				else{
					return;
				}
			}
			else if(nextType == 3){
				if(idArr[i][1] == 0){
					let tmpName = mapObjArr[cache[cache.length-1]];
					tmpName = tmpName.isWordObj?tmpName.name:tmpName.data;
					let repName = mapObjArr[idArr[i][0]];
					hasObj[tmpName] = repName.isWordObj?repName.name:repName.data;
					useSet(i);
				}
				return;
			}
			else if(nextType == 4){
				if(idArr[i][1] == 0){
					let tmpName = mapObjArr[cache[cache.length-1]];
					tmpName = tmpName.isWordObj?tmpName.name:tmpName.data;
					let repName = mapObjArr[idArr[i][0]];
					makeObj[tmpName] = repName.isWordObj?repName.name:repName.data;
					useSet(i);
				}
				return;
			}
			else if(nextType == 1 && idArr[i][1] == 1){
				switch(mapObjArr[idArr[i][0]].data){
					case "is":
						if(doFlag){
							return;
						}
						nextType = 2;
						doFlag = true;
						break;
					case "and":
						if(doFlag){
							nextType = 2;
						}
						else{
							nextType = 0;
						}
						break;
					case "has":
						nextType = 3;
						break;
					case "make":
						nextType = 4;
						break;
				}
			}
			else{
				return;
			}
		}

		function useSet(max){
			for(let i=0,li=max;i<=li;i++){
				mapObjArr[idArr[i][0]].useText = true;
			}
		}
	}
}

//エフェクト設置
function effectEstab(x,y, color, count){
	if(isUndo){
		return;
	}
	let tmp = 0.2;
	for(let c=0;c<count;c++){
		effectObjArr.push(new effectObj(
			(x + randInt(-tmp,10+tmp)/10) * aGsize,
			(y + randInt(-tmp,10+tmp)/10) * aGsize,
			color
		));
	}
}

//####################################################################################################

//マップ生成
function mapCreate(id){
	mapObjArr = [];
	for(let key in mapObjList[id]){
		let tmp = mapObjList[id][key];
		if (key == "data") {
			mapSetData = tmp;
			maxMapSize = [mapSetData.mapX, mapSetData.mapY]
			continue;
		}
		else if (key == "rule") {
			initState = tmp;
			continue;
		}
		else if (key == "objlevel") {
			objLevel = tmp;
			continue;
		}
		for (let i = 0, li = tmp.length; i < li; i++){
			if (tmp[i][4] == undefined
				|| (tmp[i][4] == 1 && +localStorage.getItem('clearId') < 21)
				|| (tmp[i][4] == 2 && +localStorage.getItem('clearId') > 20)) {
				mapObjArr.push(new mapObj(tmp[i][0], tmp[i][1], key, tmp[i][2], objLevelSet(key, tmp[i][3])));
			}
		}
	}

	//text字句解析
	textAnalysis();

	//静止画更新
	stillRenewal();
}

//undo機能
function doUndo(){
	if(keyLog.length < 1){
		return;
	}

	keyLog.pop();

	mapCreate(nowMapId);

	isUndo = true;
	for(let i=0,li=keyLog.length;i<li;i++){
		doMove(...keyLog[i]);
		doAnimation();
	}
	isUndo = false;

	//静止画更新
	stillRenewal();
}

//####################################################################################################

function acq(id){
	return document.getElementById(id);
}

//マップ名表示
function mapNameCation(){
	isGame = false;
	backOver.style.display = "block";
	mainOver.style.display = "block";
	backOver.style.opacity = 1;
	mainOver.style.opacity = 1;

	mapCreate(nowMapId);

	acq("level").innerText = "LEVEL " + (nowMapId -1);
	acq("title").innerText = mapSetData.title;

	canvasReSize();

	keyLog = [];

	if(nowMapId == 0){
		mainOver.style.display = "none";
		setTimeout(backOpens,1000);
	}
	else{
		setTimeout(mainOpens,3000);
	}
	function mainOpens(){
		mainOver.style.opacity -= 0.01;
		if(mainOver.style.opacity <= 0){
			mainOver.style.display = "none";
			setTimeout(backOpens,200);
			return;
		}
		else{
			setTimeout(mainOpens,2);
		}
	}
	function backOpens(){
		backOver.style.opacity -= 0.01;
		if(backOver.style.opacity <= 0){
			backOver.style.display = "none";
			isGame = true;
			return;
		}
		else{
			setTimeout(backOpens,2);
		}
	}
}

//マップクリア
function mapClear(){
	isGame = false;
	console.log("win");

	backOver.style.display = "block";
	mainOver.style.display = "block";
	mainOver.style.opacity = 1;
	acq("level").innerText = "";
	acq("title").innerText = "クリア！";

	setTimeout(backClose,1000);
	function backClose(){
		backOver.style.opacity = +backOver.style.opacity + 0.002;
		if(backOver.style.opacity >= 1){
			if(+localStorage.getItem('clearId') < nowMapId){
				localStorage.setItem('clearId', nowMapId);
				if (nowMapId < 21) {
					nowMapId++;
				}
				else {
					nowMapId = 0;
				}
			}
			else{
				nowMapId = 0;
			}
			mapNameCation();
		}
		else{
			setTimeout(backClose,2);
		}
	}
}

//マップ移動
function mapTrans(id){
	isGame = false;
	backOver.style.display = "block";

	setTimeout(backClose,1000);
	function backClose(){
		backOver.style.opacity = +backOver.style.opacity + 0.01;
		if(backOver.style.opacity >= 1){
			nowMapId = id+1;
			mapNameCation();
		}
		else{
			setTimeout(backClose,2);
		}
	}
}

//####################################################################################################


function imgCacheInit(){
	return new Promise((resolve, reject) => {
		var keys = Object.keys(imageCache);

		function loop(i){
			let key = keys[i]
			let img = new Image;
			img.addEventListener("load", function(){
				imageCache[key].img = img;
				imageCache[key].sw = img.naturalWidth;
				imageCache[key].sh = img.naturalHeight;
				if(i+1 < keys.length){
					loop(i+1);
				}
				else{
					resolve();
				}
			});
			img.src = imageCache[key].url;
		}
		loop(0);
	});
}

function init(){
	backOver = acq("backOverlays");
	mainOver = acq("mainOverlays");

	backImage = acq("backgrounds");
	Scanvas = acq("stills");
	Acanvas = acq("animations");
	Ucanvas = acq("uis");

	Sctx = Scanvas.getContext("2d");
	Actx = Acanvas.getContext("2d");
	Uctx = Ucanvas.getContext("2d");

	canvasReSize();

	[wx,wy] = [width/2,height/2];


	imgCacheInit().then(() =>{
		isLoadFlag = true;

		if(!localStorage.getItem('clearId')){
			localStorage.setItem('clearId',0);
		}
		else{
			//mapに戻す
			nowMapId = 0;
		}

		mapNameCation();

		update();
	})
	.catch((e) =>{
		console.log(e);
		alert("リソースの読み込みに失敗しました。");
	});
}
function update(){
	let times = getTime() - startTime;
	frame = (times / (1000 / setFps))|0;

	let cou = frame - oldFrame + BBForward;
	if(cou >= 1){
		if(cou > BBFCapacity){
			BBForward = cou - BBFCapacity;
			cou = BBFCapacity;
			if(BBForward > 50){
				BBForward = 50;
			}
		}
		else{
			BBForward = 0;
		}

		isDrawing = false;
		for(let i=cou-1;i>=0;i--){
			if(!i){
				isDrawing = true;
			}
			if(frameUpdate()){
				return;
			}
		}
		frameCount++;
		doFrameCount += cou;
		oldFrame = frame;
	}
	if(times >= 1000){
		fps = frameCount;
		doFps = doFrameCount;
		frameCount = 0;
		doFrameCount = 0;
		startTime = getTime();
		oldFrame = 0;
	}

	window.requestAnimationFrame(update);
}
function frameUpdate(){
	if(!timeStop){
		doAnimation();
	}

	//重要度高のui
	Uctx.clearRect(0,0,width,height);
	if(isDebug){
		drawText(Uctx,fps + "(" + doFps + ")/" + setFps + "fps",2,0,15,"lightgreen","left","top");

		drawText(Uctx,"Debug",width-100,0,14,"pink","left","top");
		drawText(Uctx,"moL:" + mapObjArr.length,width-100,14,14,"blue","left","top");
		drawText(Uctx,"eoL:" + effectObjArr.length,width-100,28,14,"blue","left","top");
		drawText(Uctx,"keL:" + keyLog.length,width-100,42,14,"blue","left","top");
	}
}
function doAnimation(){

	if(isDrawing){
		Actx.clearRect(0,0,width,height);

		if(!playDrawing){
			//静止画更新
			stillRenewal();
			console.log("静止画更新が正常行われませんでした");
		}
	}

	//mapObj更新
	let isDeath = false;
	for(let i=mapObjArr.length-1,li=0;i>=li;i--){
		mapObjArr[i].update(true);
		//消滅判定
		if(mapObjArr[i].death){
			//has(aはbを持っている)対応
			let isHas = false;
			for(let key in hasObj){
				if(key == mapObjArr[i].name){
					let data = key;
					if(hasObj[key] != "text"){
						data = mapObjArr[i].lastDirection;
					}
					mapObjArr[i] = new mapObj(mapObjArr[i].x, mapObjArr[i].y, hasObj[key], data, objLevelSet(hasObj[key], mapObjArr[i].lnklv));
					isHas = true;
					break;
				}
			}

			if(!isHas){
				mapObjArr.splice(i,1);
			}
			isDeath = true;
			continue;
		}

		if(mapObjArr[i].effectCoolTime <= 0){
			//trans
			for(let j=0,lj=objState.trans.length;j<lj;j++){
				if(mapObjArr[i].name == objState.trans[j]){
					if (mapObjArr[i].lnklv <= +localStorage.getItem('clearId')){
						effectEstab(mapObjArr[i].x, mapObjArr[i].y, "#ff00fc", 1);
						mapObjArr[i].effectCoolTime = 30;
					}
				}
			}
			//win
			for(let j=0,lj=objState.win.length;j<lj;j++){
				if(mapObjArr[i].name == objState.win[j]){
					effectEstab(mapObjArr[i].x, mapObjArr[i].y, "#e6b422", 1);
					mapObjArr[i].effectCoolTime = 30;
				}
			}
			//float
			for(let j=0,lj=objState.float.length;j<lj;j++){
				if(mapObjArr[i].name == objState.float[j]){
					effectEstab(mapObjArr[i].x, mapObjArr[i].y, "#d3edfb", 1);
					mapObjArr[i].effectCoolTime = 30;
				}
			}
			//hot
			for(let j=0,lj=objState.hot.length;j<lj;j++){
				if(mapObjArr[i].name == objState.hot[j]){
					effectEstab(mapObjArr[i].x, mapObjArr[i].y, "#ff8500", 1);
					mapObjArr[i].effectCoolTime = 30;
				}
			}
		}
		else{
			mapObjArr[i].effectCoolTime--;
		}

		if(isGame){
			if(mapObjArr[i].win){
				mapClear();
				break;
			}
			if(mapObjArr[i].trans !== false){
				if(mapObjArr[i].trans <= +localStorage.getItem('clearId')){
					mapTrans(mapObjArr[i].trans);
					break;
				}
			}
		}
	}
	if(isDeath && !isUndo){
		stillRenewal();
	}

	if(isGame){
		let isRenewal = false;

		//youとdefeat&winの共存判定
		for(let i=0,li=objState.you.length;i<li;i++){
			//defeat
			for(let j=0,lj=objState.defeat.length;j<lj;j++){
				if(objState.you[i] == objState.defeat[j]){
					for(let k=mapObjArr.length-1,lk=0;k>=lk;k--){
						if(mapObjArr[k].name == objState.you[i]){
							effectEstab(mapObjArr[k].x,mapObjArr[k].y, "#888",20);

							mapObjArr.splice(k,1);
							isRenewal = true;
							continue;
						}
					}
					break;
				}
			}
			//win
			for(let j=0,lj=objState.win.length;j<lj;j++){
				if(objState.you[i] == objState.win[j]){
					mapClear();
					break;
				}
			}
			if(!isGame){
				break;
			}
		}
		//meltとhotの共存判定
		for(let i=0,li=objState.melt.length;i<li;i++){
			for(let j=0,lj=objState.hot.length;j<lj;j++){
				if(objState.melt[i] == objState.hot[j]){
					for(let k=mapObjArr.length-1,lk=0;k>=lk;k--){
						if(mapObjArr[k].name == objState.melt[i]){
							effectEstab(mapObjArr[k].x,mapObjArr[k].y, "#bbb",20);

							mapObjArr.splice(k,1);
							isRenewal = true;
							continue;
						}
					}
					break;
				}
			}
		}
		//openとshutの共存判定
		for(let i=0,li=objState.open.length;i<li;i++){
			for(let j=0,lj=objState.shut.length;j<lj;j++){
				if(objState.open[i] == objState.shut[j]){
					for(let k=mapObjArr.length-1,lk=0;k>=lk;k--){
						if(mapObjArr[k].name == objState.melt[i]){
							effectEstab(mapObjArr[k].x,mapObjArr[k].y, "#fff",10);

							mapObjArr.splice(k,1);
							isRenewal = true;
							continue;
						}
					}
					break;
				}
			}
		}

		if(isRenewal){
			//静止画更新
			stillRenewal();
		}
	}

	if(!isUndo){
		//effectObj更新
		for(let i=effectObjArr.length-1,li=0;i>=li;i--){
			effectObjArr[i].update();
			if(effectObjArr[i].death){
				effectObjArr.splice(i,1);
				continue;
			}
		}

		//キー判定
		keyStateJudge();
	}

}

function canvasReSize(){
	let dpr = window.devicePixelRatio;
	let rect = document.body.getBoundingClientRect();

	[width,height] = [rect.width,rect.height];

	resize(Scanvas,Sctx);
	resize(Acanvas,Actx);
	resize(Ucanvas,Uctx);

	//objSize修正
	if(width / maxMapSize[0] > height / maxMapSize[1]){
		aGsize = (height / maxMapSize[1])|0;
	}
	else{
		aGsize = (width / maxMapSize[0])|0;
	}
	fontSize = (aGsize / 2)|0;

	backImage.style.width = (aGsize * maxMapSize[0]) + "px";
	backImage.style.height = (aGsize * maxMapSize[1]) + "px";

	stillRenewal();

	function resize(canvas,ctx){
		canvas.width = width * dpr;
		canvas.height = height * dpr;

		ctx.scale(dpr, dpr);

		canvas.style.width = width + 'px';
		canvas.style.height = height + 'px';
	}
}

