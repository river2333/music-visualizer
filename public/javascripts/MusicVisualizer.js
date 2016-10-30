function  MusicVisualizer(obj){
	this.source = null;

	this.count = 0;
	//创建音频分析对象
	this.analyser = MusicVisualizer.ac.createAnalyser();
	this.size = obj.size;
	this.analyser.fftSize = this.size*2;
	//音量
	this.gainNode = MusicVisualizer.ac[MusicVisualizer.ac.createGain?"createGain":"createGainNode"]();
	this.gainNode.connect(MusicVisualizer.ac.destination);
	
	this.analyser.connect(this.gainNode);

	this.xhr = new XMLHttpRequest();

	this.visualizer  = obj.visualizer;
	this.visualize();

}
MusicVisualizer.ac = new (window.AudioContext||window.webkitAudioContext)();
//从服务器端获得音频数据
MusicVisualizer.prototype.load = function(url,fun){
	this.xhr.abort();
	this.xhr.open("GET",url);
	var self = this;
	this.xhr.responseType = "arraybuffer";//二进制数据
	this.xhr.onload = function(){//请求成功后的回调
		fun(self.xhr.response);//将arraybuffer给回调fun函数
	}
	this.xhr.send();
}
//解码音频资源
MusicVisualizer.prototype.decode = function(arraybuffer,fun){
	MusicVisualizer.ac.decodeAudioData(arraybuffer,function(buffer){
		fun(buffer);//将解码后的buffer数据给回调函数父女
	},function(err){
		console.log(err);
	});
}
//播放
MusicVisualizer.prototype.play = function(url){
	var n = ++this.count;
 	var self= this;
 	//如果source存在就，调用stop()
 	this.source && this.stop();
 	//加载数据
 	this.load(url,function(arraybuffer){
 		if (n != self.count) return;
 		self.decode(arraybuffer,function(buffer){
 			if (n != self.count) return;
 			var bs = MusicVisualizer.ac.createBufferSource();
 			bs.connect(self.analyser);
 			bs.buffer = buffer;
 			bs[bs.start ? "start" : "noteOn"](0);
 			self.source = bs;
 		})
 	});
}
//终止
MusicVisualizer.prototype.stop = function(){
	this.source[this.source.stop ? "stop" :"noteOff"](0);
}
//音量控制
MusicVisualizer.prototype.changeVolume = function(percent){
	this.gainNode.gain.value = percent * percent;
}

//实时得到音频频域部分
MusicVisualizer.prototype.visualize = function(){
	//创建用于分析的Uint8Array数组
	var arr = new Uint8Array(this.analyser.frequencyBinCount);
	
	//用于实时取数据的动画函数
	requestAnimationFrame = window.requestAnimationFrame||
	                      window.webkitRequestAnimationFrame||
	                      window.mozRequestAnimationFrame;
	var self=this;
	function v(){
		//把uint8array中数据复制到arr中
		self.analyser.getByteFrequencyData(arr);
		self.visualizer(arr);//绘制
		requestAnimationFrame(v);
	}
	requestAnimationFrame(v);
}
