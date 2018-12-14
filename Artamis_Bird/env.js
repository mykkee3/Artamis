/*
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- //
//				-=- Environment -=-		   //
//										   //
// doc string thing						   //
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- //
*/

// Globals and Constants //


function textHeight(text, maxWidth) {
	//https://gist.github.com/studioijeoma/942ced6a9c24a4739199
	var words = text.split(' ');
	var line = '';
	var h = textLeading();

	for (var i = 0; i < words.length; i++) {
		var testLine = line + words[i] + ' ';
		var testWidth = drawingContext.measureText(testLine).width;

		if (testWidth > maxWidth && i > 0) {
			line = words[i] + ' ';
			h += textLeading();
		} else {
			line = testLine;
		}
	}

	return h;
}

//

// -=-=-=-=- Environment -=-=-=-=- //
var Environment = function () {
	//
	this.log = Logger.get_log('info', {verbose:true});
	//
	this.viewports = new _Viewports(this);
	this.GUI = new _GUI(this);
	this.log_viewport = this.viewports.new('Log',{
		refresh:true,
		active:false,
		debug:true,
		dim:{x:width/2, y:height/2},
		pos:{x:0, y:height/2},
		width:width/2,
		height:height/2
	});
	//
	this.log.log('Starting Artamis!', {verbosity:true});
	//
	this.birb = new Birb();
	this.chat = new Chat(this);
	//
	Logger.get_log('error', {verbose:true}).log('testing error');
	//

	win = this.GUI.new_window({
		name:'TopMenu',
		_build:[
			{type:'button',data:{
				label:'Open Menu',
				pos:{x:10,y:10},
				onClick:function(){
					this.GUI.get_named_object('TopMenu').set_inactive();
					this.GUI.get_named_object('Menu').set_active();
				}
			}},
			{type:'window',data:{
				name:'Menu',
				active:false,
				_build:[
					{type:'button',data:{
						label:'Close Menu',
						pos:{x:10,y:10},
						onClick:function(){
							this.GUI.get_named_object('TopMenu').set_active();
							this.GUI.get_named_object('Menu').set_inactive();
						}
					}},
					{type:'button',data:{
						label:'Ping',
						pos:{x:110,y:10},
						col:{r:50,g:100,b:200},
						onClick:function(){
							this.GUI.parent.chat.send('Ping... there was a button press. ^v^');
						}
					}},
					{type:'button',data:{
						label:'Toggle Log',
						pos:{x:210,y:10},
						col:{r:50,g:200,b:100},
						onClick:function(){
							this.GUI.parent.log_viewport.toggle();
						}
					}},
					{type:'button',data:{
						label:'Test',
						pos:{x:10,y:60},
						col:{r:50,g:100,b:200},
						onClick:function(){
							this.GUI.log.log('testing\ntesting');

						}
					}},
				]
			}},
		]
	});
	console.log('Menu:', win);

	//
};
Environment.prototype.init = function () {
	this.log.log('Initializing Birb');
	this.birb.init();
	this.log.log('Done starting Artamis');
	this.chat.init();
};
//-=-//
Environment.prototype.update = function () {
	this.viewports.update();
	this.GUI.update();
	//
	this.birb.update();
	
};
Environment.prototype.draw = function () {
	background(40);
	this.viewports.draw();
	this.GUI.draw();
	//
	Logger.draw(this.log_viewport.graphic);
	this.birb.draw();
};
//-=-//
Environment.prototype.onClick = function (mx, my) {
	this.GUI.onClick(mx, my);
	//
	this.birb.onClick(mx, my);
};
Environment.prototype.keyPressed = function (key) {
	if (key == 82) document.location.reload();
	console.log("key pressed:", key);
	//
	
}
//
Environment.prototype.load_data = function (name) {
	//load nets/'name'.json
	var data = {

	};
};
Environment.prototype.save_data = function (s) {
	
}



// -=-=-=-=- Environment Viewports -=-=-=-=- //
//
//
var _Viewports = function (parent) {
	this.parent = parent;
	this._ID_enum = 0;
	this._viewports = [];
	this._viewports_table = {};

};
_Viewports.prototype._get_new_id = function () {return this._ID_enum++};
_Viewports.prototype._viewport_constructor = function (name, data) {
	viewport = Object.assign({
		name:name,
		id:this._get_new_id(),
		parent:this,
		//
		width:width,
		height:height,
		pos:{x:0,y:0},
		dim:{x:width,y:height},
		active:true,
		refresh:false,
		debug:false,
		//
		_update:function(){
			if (!this.refresh || !this.active) return;
			this.update();
		},
		update:function(){},
		_draw:function(){
			if (!this.active) return;
			this.draw();
			image(this.graphic, this.pos.x, this.pos.y, this.dim.x, this.dim.y);
			//
			if (this.debug) {
				push()
				fill(0,0,0,0);
				stroke(0,0,0,255);
				rectMode(CORNER);
				rect(this.pos.x, this.pos.y, this.dim.x, this.dim.y);
				pop();
			};
		},
		draw:function(){},
		toggle:function(){this.active = !this.active},
		remove:function(){},

	}, data);
	viewport.graphic = createGraphics(viewport.width, viewport.height);
	viewport.update();
	this._viewports[viewport.id] = viewport;
	this._viewports_table[viewport.name] = viewport.id;
};
//
_Viewports.prototype.update = function () {
	for (var i = this._viewports.length - 1; i >= 0; i--) {
		this._viewports[i]._update();
	}
};
_Viewports.prototype.draw = function () {
	for (var i = this._viewports.length - 1; i >= 0; i--) {
		this._viewports[i]._draw();
	}
};
//
_Viewports.prototype.new = function (name, data) {
	this._viewport_constructor(name, data);
	return this.get(name);
};
_Viewports.prototype.get = function (name) {
	return this._viewports[this._viewports_table[name]];
};
_Viewports.prototype.get_graphic = function (name) {
	return this._viewports[this._viewports_table[name]].graphic;
};



// -=-=-=-=- Environment GUI -=-=-=-=- //
//
//
var _GUI = function (parent) {
	this.parent = parent;
	this._data = {};
	this._ID_enum = 1;
	this._named = {};
	this._objects = [this];
	this._active = [];
	this._children = [];
	this._id = 0;
	this._viewport = this.parent.viewports.new('GUI', {
		refresh:true
	});
	//
	this.log = Logger.get_log('info');
};
_GUI.prototype.update = function(){
	for (var i = this._active.length - 1; i >= 0; i--) {
		this._objects[this._active[i]].update();
	}
};
_GUI.prototype.draw = function(){
	this._viewport.graphic.clear();
	for (var i = this._active.length - 1; i >= 0; i--) {
		this._objects[this._active[i]].draw();
	}
};
_GUI.prototype.onClick = function(mx, my){
	for (var i = this._active.length - 1; i >= 0; i--) {
		this._objects[this._active[i]].onClick(mx, my);
	}
};
_GUI.prototype.show = function(){
	this.parent.viewports.get(this._viewport).active = true;
};
_GUI.prototype.hide = function(){
	this.parent.viewports.get(this._viewport).active = false;
};
//
_GUI.prototype._get_new_id = function () {return this._ID_enum++};
_GUI.prototype._window_constructor = function (parent, data) {
	win_id = this._get_new_id();
	win = Object.assign({
		GUI:this,
		id:win_id,
		parent:parent,
		children:[],
		//
		active:true,
		//
		build:function(){
			if (!this._build) return;
			for (var i = this._build.length - 1; i >= 0; i--) {
				var obj = this._build[i];
				switch (obj.type) {
					case 'window':
						this.GUI.new_window(obj.data, this.id);
						break;
					case 'button':
						this.GUI.new_button(obj.data, this.id);
						break;
					default:
						break;
				}
			}
			console.log('done building window')
		},
		update:function(){
			for (var i = this.children.length - 1; i >= 0; i--) {
				this.GUI.get_object(this.children[i]).update();
			}
		},
		draw:function(){
			for (var i = this.children.length - 1; i >= 0; i--) {
				this.GUI.get_object(this.children[i]).draw();
			}
		},
		//
		onClick:function(mx, my){
			for (var i = this.children.length - 1; i >= 0; i--) {
				if (this.GUI.get_object(this.children[i]).onClick) this.GUI.get_object(this.children[i])._onClick(mx,my);
			}
		},
		append_child:function(id){this.children.push(id);},
		set_active:function(){this.GUI._active.push(this.id)},
		set_inactive:function(){this.GUI._active.splice(this.GUI._active.indexOf(this.id),1)}
	}, data);
	//
	if (win.name) this._named[win.name] = win.id;
	if (win.active) win.set_active();
	this._objects[win.id] = win;
	win.build();
	return win;
};
_GUI.prototype._button_constructor = function(parent, data) {
	o_id = this._get_new_id();
	o = Object.assign({
		id:o_id,
		GUI:this,
		parent:parent,
		//
		pos:{x:100,y:100},
		dim:{x:90,y:40},
		col:{r:200,g:50,b:50},
		label:'Button',
		//
		update:function(){},
		draw:function(){
			graphic = this.GUI._viewport.graphic;
			graphic.push();
			graphic.fill(this.col.r, this.col.g, this.col.b, 255);
			graphic.stroke(0,0,0,255);
			graphic.rect(this.pos.x, this.pos.y, this.dim.x, this.dim.y);
			graphic.fill(0,0,0);
			graphic.noStroke();
			graphic.textAlign(CENTER, CENTER);
			graphic.text(this.label, this.pos.x, this.pos.y, this.dim.x, this.dim.y);
			graphic.pop();
		},
		_onClick:function(mx,my){
			if (collidePointRect(mx,my, this.pos.x, this.pos.y, this.dim.x, this.dim.y)) this.onClick();
		},
		onClick:function(){console.log(`Button#${this.id} pressed`)}
	}, data);
	this._objects[o.id] = o;
	this.get_object(parent).append_child(o.id);
	return o;
};
//
_GUI.prototype.new_window = function (data, parent) {
	if (!parent) parent = this._id;
	win = this._window_constructor(parent, data);
	return win.id;
};
_GUI.prototype.new_button = function (data, parent) {
	if (!parent) parent = this.new_window();
	this._button_constructor(parent, data);
	return parent;
};
_GUI.prototype.get_named_object = function(name) {return this.get_object(this._named[name])};
_GUI.prototype.get_object = function (id) {return this._objects[id];};
_GUI.prototype.append_child = function (id) {this._children.push(id);};



// -=-=-=-=- Javascript Log -=-=-=-=- //
//
//
var Logger = {
	_LOG_costructor : function (parent, name, data) {
		o = {
			parent : parent,
			name : name,
			data : data,
			_log_file : "",
			//
			log : function (msg, data) {
				if (!this.data.verbose && !data.verbosity) return;
				msg = msg.trim().replace(/\n\r|\n|\r|\t/, ' || ');
				time = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(11,-1);
				data = Object.assign({
					verbosity:false
				}, data);
				prefix = "Logger."+this.name+"("+time+"): ";
				this._log_file += prefix+msg+"\n";
				this.parent._log_file += prefix+msg+"\n";
				console.log(prefix+msg);
			}
		}
		return o;
	},
	
	// variable and constants	
	_logs : {},
	_log_file : "",
	_data : {
		verbose:false
	},
	//
	
	get_log : function (name, data) {
		if (! this._logs[name]) this._logs[name] = this._LOG_costructor(this, name, Object.assign(Object.assign({}, this._data), {"name":name}, data));
		return this._logs[name];
	},
	//
	draw : function (graphic, name) {
		log_obj = this._logs[name];
		if (!log_obj) log_obj = this;
		lines = log_obj._log_file.split('\n');
		output = [];
		count = 0;
		w = graphic.width;
		for (var i = lines.length - 1; i >= 0; i--) {
			h = textHeight(lines[i], w);
			count += h;
			output.push(lines[i]);
			if (count > graphic.height) break;
		}
		y_offset = graphic.height-count;
		//console.log(y_offset);
		output.reverse();
		output = output.join('\n');
		//
		graphic.clear();
		graphic.background(100,100,100,100);
		graphic.fill(0,0,0,255);
		graphic.text(output, 5, 25+y_offset, w);
	}
};


// -=-=-=-=- Finite State Machine -=-=-=-=- //
var SimpleFSM = function (agent) {
	this.agent = agent;
	this.states = {};
	this.current_state = {
		Execute:function(){console.log('FiniteStateMachine still initializing');},
		Exit:function(){}
	};
	this.current_isComplete = false;
	this.current_transition = null;
	//
	if(agent&&agent._states){
		var val;
		for (var key in agent._states) {
			val = agent._states[key];
			if(key=='init'){this.setState(key);}
			this.new_State(key,val);
		}
	}
};
SimpleFSM.prototype.Complete = function () {
	this.current_isComplete = true;
};
SimpleFSM.prototype.isComplete = function () {
	return this.current_isComplete;
};
SimpleFSM.prototype.getStates = function () {
	return Object.keys(this.states);
};
SimpleFSM.prototype.Execute = function () {
	if(this.current_transition){
		this.current_state.Exit();
		this.current_state = this.states[this.current_transition];
		this.current_isComplete = false;
		this.current_state.Enter(this.transition_args);
		this.current_transition = null;
		this.transition_args = null;
	}
	this.current_state.Execute();
};
SimpleFSM.prototype.setState = function (state, args) {
	this.current_transition = state;
	this.transition_args = args;
};
SimpleFSM.prototype.new_State = function (state, data) {
	function noExecuteWarning () {
		console.log('noExecuteWarning\n\tState: `'+state+'` has no execute function.');
		this.Execute = function(){};
	}
	var o = {
		FSM:this,
		agent:this.agent,
		state:state,
		Enter:data.Enter||function(){},
		Execute:data.Execute||noExecuteWarning,
		Exit:data.Exit||function(){},
		data:data
	};
	this.states[state]=o;
	return o;
};
