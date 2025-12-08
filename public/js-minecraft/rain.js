//rainStart(".target",10);

function printCircle(target){
	const box = {
		"width":"10",
		"height":"10"
	};
	$(target).each(function(i, elem) {
		if(Math.floor(Math.random() * 10) == 1){
			setTimeout(function(){
				var target_width = $(elem).css("width").replace(/px/g,'');
				var target_height = $(elem).css("height").replace(/px/g,'');
				//指定範囲内に収まるように計算する
				var x = Math.round( Math.random()*(target_width-box.width)+box.width/2 );
				var y = Math.round( Math.random()*(target_height-box.height)+box.height/2 );
				var style = {
					"position":"absolute",
					"top":y,
					"left":x,
					"z-index":100,
					"border":"solid",
					"border-width":"1px",
					//丸くする
					"border-radius":box.width/2
				};
				//適当な位置に追加
				$(elem).append('<div class="circle"></div>');
				//見つけて、装飾して、動かして、消す
				$(elem).find(".circle:last").css(style).animate({
					"width":box.width,
					"height":box.height,
					"top":(y - box.height/2),
					"left":(x - box.width/2),
				},{
					"duration": 500,
					"queue":false,
				}).fadeOut(500,function(){
					$(this).remove();
				});
			},10);
		}

	});
}
function rainStart(target,loop){
	var i;
	for(i=0;i<loop;i++){
		setTimeout(printCircle,(Math.round( Math.random()*600)),target);
	}
}