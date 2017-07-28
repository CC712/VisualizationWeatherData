var grid = {
	//骨架
	page: null,
	cityName: null,
	upButton: null,
	//AJAX 属性
	url: 'https://api.asilu.com/weather/',
	dataType: 'jsonp',
	api: [],
	response: null,
	//储存属性
	valuelist: [],
	citylist: {},
	//公有存储
	download: {},
	//点击函数
	onUpClick: function() {
		var city = this.cityName.value;
		if(city != '') {
			this.onUpload(city)
		}
		//console.log(JSON.stringify(this.citylist));
	},
	//查询函数
	onNoload: function(name) {
		this.FNstoreData(this.download[name]);
		//渲染
		this.render();
	},
	onUpload: function(name) {

		var self = this;

		$.ajax({
			url: this.url,
			type: 'GET',
			dataType: this.dataType,
			data: {
				'city': name
			},
			success: function(r) {
				if(r.city == '北京' && !name.match(/北京/) || !r.date) {
					alert('没' + name + '的数据');
					delete self.citylist[name];
					return;
				}
				//console.log(JSON.stringify(r));
				self.citylist[r.city] = true; //名单
				self.download[r.city] = r; //数据
				// {广州：{city:广州，id:xxx,temp:xxx,...},香港：{}，};

				self.FNstoreData(self.download[r.city]);
				//渲染
				self.render();

			},
			error: function(r) {
				//console.log(r.status);
			}
		});
	},
	//储存函数    parmas{r:obj}
	FNstoreData: function(r, namelist) { //r =download
		var api = this.api; //arr
		var value = getApiValue(r, api, this.regexp);
		var key = r.city;
		var type = api[this.api.length - 1];
		//去重
		if(this.citylist[key]) {
			for(var i in this.valuelist) {
				if(this.valuelist[i]['city'] == key) {
					this.valuelist.splice(i, 1);
					break;
				}
			}
		}

		function getApiValue(r, api, regexp) {
			var v = r
			for(var i in api) {
				v = v[api[i]];
			}

			//console.log(v);
			return regexp(v); //是value
		}
		//创建新数组
		var arr = [];
		//[city:vlaue,]
		//插入
		var text = '{"city":"' + r.city + '","' + type + '":' + value + "}";
		arr.push(JSON.parse(text, function(k, v) {
			//console.log(k);
			return v;
		}));
		//[o1 o2 o3 
		//console.log(type);
		//console.log(JSON.stringify(arr));
		this.valuelist = this.valuelist.concat(arr); //无序 名单 且数据
	},
	//页面刷新  param [obj{city:xx,api:xx},obj{}...]
	render: function() {
		var arr = this.valuelist;
		var box = this.page.querySelector('.neirong');
		var html = '';
		var type = this.api[this.api.length - 1];
		//console.log(type);
		//排序
		var self = this;

		function objSort(arr) { //arr[obj{city:bj,value:100}]
			arr.sort(function(c, n) {
				if(self.sortOrder == true) {
					return c[type] - n[type];
				} else return n[type] - c[type];
			});
			if(self.sortOrder == true) {
				return arr[arr.length - 1][type];
			} else {
				return arr[0][type];
			}
		}
		var Max = objSort(arr);

		function getcolor(now, max) {
			var one = (255 + 255) / 100;
			var r = 0,
				g = 0,
				b = 0;
			var per = now / max * 100;
			if(per < 50) {

				r = one * per;
				g = 255;
			}
			if(per < 50) {

				r = one * per;
				g = 255;
				per
			}
			if(per >= 50) {

				g = 255 - ((per - 50) * one);
				r = 255;
			}
			r = parseInt(r); // 取整  
			g = parseInt(g); // 取整  
			b = parseInt(b); // 取整 
			return 'rgb(' + r + ',' + g + ',' + b + ')';
		}
		for(var i = 0, len = arr.length; i < len; i++) {
			html = html + '<div class="bar"value="' + arr[i]['city'] + '" style="width:calc(' + arr[i][type] + ' / ' + Max + ' *100%);background-color:' + getcolor(arr[i][type], Max) + ';">' + '<span>' + (i + 1) + ' </span>' + arr[i]["city"] + ':' + arr[i][type] + '</div>';
		}
		box.innerHTML = html;

		//bar监听
		this.barClick();
	},
	barClick: function() {
		//bar 监听
		var self = this;
		var handleclick = function(e) {
			var node;
			document.querySelector('.mask') ? node = document.querySelector('.mask') : node = document.createElement('div');
			node.setAttribute('class', 'mask');
			document.body.appendChild(node);
			//console.log(this.getAttribute('value'));
			//页面设计
			var r = self.download[this.getAttribute('value')];
			var html = "<legend>" + r['city'] + "    PM25  :" + r['pm25'] + "</legend><table><tr>";
			for(var i = 0, len = r['weather'].length; i < len; i++) {
				var v = r['weather'][i];
				html += "<td><fieldset ><legend data-id='date'>" + v['date'] +
					"</legend><dt data-id='weather'>" + v['weather'] +
					"<dd >白天：<span date-id='icon1'>" + v['icon1'] +
					"</span></dd><dd >夜间：<span date-id='icon2'>" + v['icon2'] +
					"</span></dd></dt><dt>温度<dd data-id='temp'>" + v['temp'] +
					"</dd></dt><dt>风况<dd data-id='wind'>" + v['wind'] +
					"</dd></dt></fieldset></td>";
			}
			html += "</tr></table>";
			node.innerHTML = html;
			node.onmouseout = function() {
				this.setAttribute('class', 'mask is-hide');
			};

		};
		var bar = document.querySelectorAll('.bar');
		for(var i = 0, len = bar.length; i < len; i++) {
			bar[i].onmouseenter = handleclick;
			bar[i].onclick = handleclick;
		}
	},
	//initialization
	init: function(param) {

		//传参
		if(param) {
			for(var i in param) {
				this[i] = param[i];
			}
		} //初始化
		this.valuelist = [];
		//执行参数
		this.cityName = this.page.querySelector('.cityName');
		this.upButton = this.page.querySelector('.cityName-btn');
		this.sortButton = this.page.querySelector('.cityName-sort');

		//ajax 请求数据 判断
		for(var i in this.citylist) {
			if(!this.download[i]) {
				this.onUpload(i);
			} else {
				this.onNoload(i);
			}
		}
		var self = this; //用在 Listener 的callback 防止域混乱
		//节点监听绑定
		this.bindflag = true;

		this.upButton.onclick = function(e) {
			self.onUpClick();
		};
		this.sortButton.onclick = function() {

			self.sortOrder = !self.sortOrder;
			//console.log(self.sortOrder);
			self.render();
		};
		var focushandle = function() {
			this.onkeypress = function(e) {
				if(e.keyCode === 13) {
					//console.log('key');
					self.onUpClick();
				}
			};
		}
		this.cityName.onfocus = focushandle;
		this.cityName.onblur = function() {
			this.onfocus = null;
		};

	}

};

var pm25Param = {
	//骨架
	page: document.querySelector('#page'),
	//AJAX 属性
	url: 'https://api.asilu.com/weather/',
	dataType: 'jsonp',
	api: ['pm25'],
	response: null,
	//数据处理
	regexp: function(v) {
		return v.match(/\d+/)[0];
	},
	//储存属性
	citylist: {
		上海: true,
		东莞: true,
		中山: true,
		佛山: true,
		兰州: true,
		北京: true,
		南京: true,
		南宁: true,
		南昌: true,
		南通: true,
		厦门: true,
		合肥: true,
		哈尔滨: true,
		嘉兴: true,
		大庆: true,
		大连: true,
		天津: true,
		太原: true,
		威海: true,
		宁波: true,
		常州: true,
		广州: true,
		贵阳: true,
		郑州: true,
		重庆: true,
		长春: true,
		长沙: true,
		青岛: true,
		香港: true
	},
	sortOrder: false

};

var tempParam = {
	//骨架
	page: document.querySelector('#page'),
	//AJAX 属性
	url: 'https://api.asilu.com/weather/',
	dataType: 'jsonp',
	api: ['weather', '0', 'temp'],
	response: null,
	//数据处理
	regexp: function(v) {
		return v.match(/\d+/)[0];
	},
	//储存属性
	citylist: {
		上海: true,
		威海: true

	},
	sortOrder: true

};

var wenchaParam = {
	//骨架
	page: document.querySelector('#page'),
	//AJAX 属性
	url: 'https://api.asilu.com/weather/',
	dataType: 'jsonp',
	api: ['weather', '0', 'temp'],
	response: null,
	//数据处理
	regexp: function(v) {
		return v.match(/\d+/g)[0] - v.match(/\d+/g)[1];
	},
	//储存属性
	citylist: {
		威海: true,
		宁波: true,
		常州: true,
		广州: true,
		贵阳: true
	},
	sortOrder: true

};
grid.init(pm25Param);
//grid.init(wenchaParam);
/* backToTop */
(function() {
	window.addEventListener('scroll', function() {
		var wy = window.scrollY;
		//console.log(wy);
		var node;
		//创建
		if(!document.querySelector('#back-to-top')) {
			node = document.createElement('a');
			node.setAttribute('id', 'back-to-top');
			node.setAttribute('class', 'back-to-top');
			document.body.appendChild(node);
			node.onclick = function() {
				//动作
				//document.querySelector('#banner').scrollIntoView();
				var st = document.body.scrollTop;
				step(30); // 60fps

			}
			node.innerText = '▲';
		} else {
			node = document.querySelector('#back-to-top');
			//console.log(wy);
		}
		//判断
		if(wy < 50) {
			node.setAttribute('class', 'is-hide') //set Attribute 是覆盖的

		} else {
			node.setAttribute('class', 'back-to-top');
		}

	});

	function step(duration) {

		var st = document.body.scrollTop;
		var sh = document.body.scrollHeight;
		var step = sh / duration;
		var timer = setInterval(function() {
			if(document.body.scrollTop > 0) {
				document.body.scrollTop -= step;
			} else {
				clearInterval(timer);
			}
		}, 16);

	}
})();
/* page switch*/
(function() {
	var p = [pm25Param, tempParam, wenchaParam];
	var btn = document.querySelectorAll('#page-btn');
	var page = document.querySelector('#page');
	var handle = function() {
		document.querySelector('.title').innerText = this.innerText;
		grid.init(p[this.getAttribute('value') - 1]);
	};
	for(var i = 0, len = btn.length; i < len; i++) {
		//闭包
		btn[i].onclick = handle;

	}

})();