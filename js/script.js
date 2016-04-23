;(function($){
	var Carousel = function(poster){
		var self = this;
		// 缓存这个类
		this.poster = poster;
		this.posterItemMain = poster.find("ul.poster-list");
		this.nextBtn = poster.find("div.poster-next-btn");
		this.prevBtn = poster.find("div.poster-prev-btn");
		this.posterItems = poster.find("li.poster-item");
		// 当传入的是偶数张图片时，把第一张插进去变为奇数张
		if(this.posterItems.size()%2==0){
			this.posterItemMain.append(this.posterItems.eq(0).clone());
			this.posterItems = this.posterItemMain.children();
		}
		this.posterFirstItem  = this.posterItems.first();
		this.posterLastItem  = this.posterItems.last();
		// 设置节流阀 防止快速点击bug(当动画每次结束后再开启)
		this.rotateFlag = true;
		this.setting = {
			"width":1000,			//幻灯片的宽度
			"height":270,			//幻灯片的高度
			"posterWidth":640,	    //幻灯片第一帧的宽度
			"posterHeight":270,	    //幻灯片第一帧的高度
			"scale":0.9,			//记录显示比例关系
			"speed":500,
			"autoPlay":true,
			"delay":5000,
			"verticalAlign":"middle" //top bottom
		}
		$.extend(this.setting, this.getSetting());
		console.log(this.setting)
		this.setSettingValue();
		this.setPosterPos();
		this.nextBtn.click(function() {
			if(self.rotateFlag){
				self.rotateFlag = false;
				self.carouseRotate('left');
			}
		});
		this.prevBtn.click(function() {
			if(self.rotateFlag){
				self.rotateFlag = false;
				self.carouseRotate('right');
			}
		});
		// 是否开启自动播放
		if(this.setting.autoPlay){
			this.autoPlay();
			this.poster.hover(function() {
				clearInterval(self.timer);
			}, function() {
				self.autoPlay();
			});
		}
	}
	Carousel.prototype = {
		// 1.获取人工配置参数
		getSetting: function(){
			var setting = this.poster.attr('data-setting');
			// 容错(当传入对象)
			if(setting && setting!=''){
				return JSON.parse(setting);
			}else{
				return {};
			}
		},
		// 2.设置配置参数值去控制基本的宽度高度
		setSettingValue: function(){
			this.poster.css({
				width: this.setting.width,
				height: this.setting.height
			});
			this.posterItemMain.css({
				width: this.setting.width,
				height: this.setting.height
			});
			var btnWidth = (this.setting.width - this.setting.posterWidth)/2;
			this.nextBtn.css({
				width: btnWidth,
				height: this.setting.height,
				zIndex: Math.ceil(this.posterItems.size()/2)
			});
			this.prevBtn.css({
				width: btnWidth,
				height: this.setting.height,
				zIndex: Math.ceil(this.posterItems.size()/2)
			});
			this.posterFirstItem.css({
				width: this.setting.posterWidth,
				height: this.setting.posterHeight,
				left: btnWidth,
				top: 0,
				zIndex: Math.floor(this.posterItems.size()/2)
			});
		},
		// 3.设置剩余帧的位置关系
		setPosterPos: function(){
			var self = this;
			var sliceItems = this.posterItems.slice(1);
			var sliceSize = sliceItems.size()/2;
			// 拿到右边所有帧
			var rightSlice = sliceItems.slice(0,sliceSize);
			var level = Math.floor(this.posterItems.size()/2);
			// 拿到左边所有帧
			var leftSlice = sliceItems.slice(sliceSize);
			// 配置右边帧的参数
			var rw = this.setting.posterWidth;
			var rh = this.setting.posterHeight;
			var gap = (this.setting.width - this.setting.posterWidth)/2/level;
			var firstLeft = (this.setting.width - this.setting.posterWidth)/2;
			var offsetLeft = firstLeft + rw ;
			// 配置左边帧的参数
			rightSlice.each(function(i) {
				rw = rw * self.setting.scale;
				rh = rh * self.setting.scale;
				level--;
				var j = i;
				$(this).css({
					zIndex: level,
					opacity: 1/(++i),
					width: rw,
					height: rh,
					left: offsetLeft + gap*(++j) - rw,
					top: self.setVerticalAlign(rh)
				});
			});
			var lw = rightSlice.last().width();
			var lh = rightSlice.last().height();
			var oloop = Math.floor(this.posterItems.size()/2);
			leftSlice.each(function(i) {
				$(this).css({
					width: lw,
					height: lh,
					zIndex: i,
					opacity: 1/oloop,
					left: gap * i,
					top: self.setVerticalAlign(lh)
				});
				lw = lw/(self.setting.scale);
				lh = lh/(self.setting.scale);
				oloop--;
			});
		},
		// 4.设置垂直排列对齐
		setVerticalAlign: function(height){
			var verticalType = this.setting.verticalAlign;
			var top = 0;
			if(verticalType == "middle"){
				top = (this.setting.height - height)/2;
			}else if(verticalType == 'top'){
				top = 0;
			}else if(verticalType == 'bottom'){
				top = this.setting.height - height;
			}else{
				top = (this.setting.height - height)/2;
			}
			return top;
		},
		// 5.旋转所有帧
		carouseRotate: function(dir){
			var self = this;
			var zIndexArr = [];
			if(dir == 'left'){
				this.posterItems.each(function(i) {
					var _this = $(this);
					// 将当前帧的参数设为上一帧
					var prev = _this.prev().get(0)?_this.prev():self.posterLastItem;
					var width = prev.width(),
						height =prev.height(),
						zIndex = prev.css("zIndex"),
						opacity = prev.css("opacity"),
						left = prev.css("left"),
						top = prev.css("top");
					zIndexArr.push(zIndex)			
					_this.animate({
						width: width,
						height: height,
						opacity: opacity,
						left: left,
						top: top
					}, self.setting.speed,function(){
						self.rotateFlag = true;
					})
				});
				this.posterItems.each(function(i){
					$(this).css("zIndex",zIndexArr[i]);
				});
			}else if(dir == 'right'){
				this.posterItems.each(function(i) {
					var _this = $(this);
					// 将当前帧的参数设为上一帧
					var next = _this.next().get(0)?_this.next():self.posterFirstItem;
					var width = next.width(),
						height =next.height(),
						zIndex = next.css("zIndex"),
						opacity = next.css("opacity"),
						left = next.css("left"),
						top = next.css("top");
					zIndexArr.push(zIndex);
					_this.animate({
						width: width,
						height: height,
						opacity: opacity,
						left: left,
						top: top
					}, self.setting.speed,function(){
						self.rotateFlag = true;
					})
				});
				this.posterItems.each(function(i) {
					$(this).css('zIndex', zIndexArr[i]);
				});
			}
		},
		// 6.自动播放
		autoPlay: function(){
			var self = this;
			this.timer = setInterval(function(){
				self.nextBtn.click();
			}, self.setting.delay);
		}
	}
	// 为Carousel这个类添加一个静态属性，目的是当页面出现多个轮播图时不需要new多次
	// var carousel = new Carousel($(".J_Poster").eq(0));
	Carousel.init = function(posters){
		var _this = this;
		posters.each(function(){
			new _this($(this));
		})
	}
	window['Carousel'] = Carousel;
})(jQuery);