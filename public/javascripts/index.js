function $(s){
	return document.querySelectorAll(s);
}
var lis = $("#list li");

var size = 128;

var box = $("#box")[0];
var width, height;
//动态添加canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
box.appendChild(canvas);

var Dots =[];
var line;//线性渐变

var mv = new  MusicVisualizer({
	size: size,
	visualizer : draw
});
//给播放列表添加点击事件
for (var i = 0; i < lis.length; i++) {
	lis[i].onclick = function(){
		for (var j = 0; j < lis.length; j++) {
			lis[j].className = "";
		}
		this.className ="selected";
		//load("/medias/"+this.title);
		mv.play("/medias/"+this.title);
	}
}


//m到n随机整数
function random(m,n){
	return Math.round(Math.random()*(n-m) + m);
}
//获得随机的小圆点的坐标信息，颜色信息
function getDots(){
	//每次都先清空数组
	Dots =[];
	for (var i = 0; i < size; i++) {
		var x = random(0, width);
		var y = random(0, height);
		//取随机色
		var color = "rgba(" +random(0, 255)+ ","+random(0, 255)+ ","+random(0, 255)+",0)";
		Dots.push({//cap代表柱状图中小帽的最低端距离canvas最低端的距离，默认为0
			x: x,
			y: y,
			dx: random(1, 4),//小圆点移动距离
			color: color,
			cap: 0
		});
	}
}

//改变窗口大小动态获取大小
function resize(){
	width= box.clientWidth;
	height = box.clientHeight;
	canvas.height = height;
	canvas.width = width;
	//根据宽高定义线性渐变
	line = ctx.createLinearGradient(0,0,0,height);
	line.addColorStop(0,"red");
	line.addColorStop(0.5,"yellow");
	line.addColorStop(1,"green");
	getDots();//每次窗口改变都要重新计算随机圆点
}
//进入窗口还没有改变时，获得当前宽高
resize();
//赋值给onresize，当窗口改变时，触发resize函数
window.onresize = resize;
//根据分析音频得到的数据绘制
function draw(arr){
	ctx.clearRect(0,0,width,height);
	//每一个圆柱宽度包括间隙
	var w = width / size;
	//小帽是个正方形
	//圆柱和小帽实际宽度，不包括间隙
	var cw = w *0.6;
	var capH = cw > 10 ? 10 : cw;
	ctx.fillStyle = line;
	for (var i = 0; i < size; i++) {
		var o = Dots[i];
		if (draw.type == "column") {
			//根据分析音频得到的arr绘制圆柱的高度
			var h = arr[i] / 256 *height;
		     //绘制圆柱
		     ctx.fillRect(w*i,height-h,cw,h);
		     //绘制小帽
		     ctx.fillRect(w*i,height-(o.cap + capH),cw,capH);
		     o.cap--;//高度下降
		     if (o.cap < 0) {
		     	o.cap = 0;
		     }
		     if (h > 0 && o.cap < h +40) {
		     	//最高到顶端，不出去
		     	o.cap = h +40 >height - capH ? height - capH : h +40;
		     }

		} else if (draw.type == "dot") {
			ctx.beginPath();
			
			//跟当前的频域大小计算半径
			var r = 10 + arr[i]/256 *(height > width ?width :height)/10;
			ctx.arc(o.x, o.y, r, 0,Math.PI*2,true);
			//放射性渐变
			var grd=ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,r);
            grd.addColorStop(0,"#fff");
            grd.addColorStop(1,o.color);
            ctx.fillStyle = grd;
            ctx.fill();
            o.x += o.dx;//小圆点移动
            o.x = o.x > width ? 0 :o.x;//移动不出窗口

		}
	}
}
//默认柱状图
draw.type = "column";
var types = $("#type li");
//给选择按钮添加点击事件
for (var i = 0; i < types.length; i++) {
	types[i].onclick = function(){
		for (var j = 0; j < types.length; j++) {
			types[j].className = "";
		}
		this.className = "selected";
		draw.type = this.getAttribute("data-type");
	}
}

//给音量选择添加事件
$("#volume")[0].onchange = function(){
	mv.changeVolume(this.value/this.max);
}
//先调用，使默认的60生效
$("#volume")[0].onchange();


