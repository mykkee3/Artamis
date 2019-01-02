/*
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//				-=- Environment -=-	
//	
//	- notes:
// 
//
//  - viewport priorities
// default:-1
// background:0	
// foreground:1
// front:2
//	
// doc string thing	
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
*/

// Globals and Constants //


function textHeight(text, maxWidth) {
	//https://gist.github.com/studioijeoma/942ced6a9c24a4739199
	// modified*
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
	this.bg_color = {r:40,g:40,b:40};
	//
	this.viewports = new _Viewports(this);
	this.GUI = new _GUI(this);
	this.log_viewport = this.viewports.new('Log',{
		refresh:true,
		active:false,
		priority:1,
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
	enum_i = 1;
	win = this.GUI.new_window({
		name:'TopMenu',
		_build:[
			{build:'submenu', data:{
				name:'Menu',
				_build:[
					{build:'submenu', data:{
						name:'Options',
						_build:[
							{build:'special_button',data:{
								label:'Toggle Log',
								onClick:function(){this.GUI.parent.log_viewport.toggle()}
							}},
							{build:'button',data:{
								label:'Toggle Gender',
								onClick:function(){
									this.GUI.parent.birb.anm.data.default.gender = !this.GUI.parent.birb.anm.data.default.gender;
								}
							}},
							//{build:'button',data:{}},
							//{build:'button',data:{}},
						]
					}},
					{build:'submenu', data:{
						name:'Functions',
						_build:[
							{build:'special_button',data:{
								label:'Ping',
								onClick:function(){this.GUI.parent.chat.send('Ping!!! ^v^')}
							}},
							//{build:'button',data:{}},
							//{build:'button',data:{}},
						]
					}},
					{build:'submenu', data:{
						name:'Face Control',
						_build:[
							{build:'submenu', data:{
								name: 'Eye Target',
								_build:[
									{build:'special_button',data:{
										label:'Idle',
										onClick:function(){
											this.GUI.parent.birb.anm.data.default.eye_count = 0;
										}
									}},
									{build:'button',data:{
										label:'Pointer',
										onClick:function(){
											this.GUI.parent.birb.anm.data.default.eye_count = Infinity;
											this.GUI.parent.birb.anm.data.default.eye_target = this.GUI.parent.birb.pointer;
										}
									}},
								]
							}},
							{build:'special_button',data:{
								label:'Idle',
							}},
							{build:'button',data:{
								label:'Blink',
								onClick:function(){
									this.GUI.parent.birb.anm.data.default.eye_blink_count = 0;
								}
							}},
							{build:'button',data:{
								label:'Toggle Eyes Open',
								onClick:function(){
									if(this.GUI.parent.birb.anm.data.default.eye_openess){
										this.GUI.parent.birb.anm.data.default.eye_openess = 0;
										this.GUI.parent.birb.anm.data.default.eye_blink_count = Infinity;
									}else{
										this.GUI.parent.birb.anm.data.default.eye_openess = 1;
										this.GUI.parent.birb.anm.data.default.eye_blink_count = 0;
									}
								}
							}},
							{build:'button',data:{
								label:'Toggle Eyes Size',
								onClick:function(){
									switch(this.GUI.parent.birb.anm.data.default.eye_size){
										case 0:
											this.GUI.parent.birb.anm.data.default.eye_size = 0.5;
											break;
										case 0.5:
											this.GUI.parent.birb.anm.data.default.eye_size = 1;
											break;
										case 1:
											this.GUI.parent.birb.anm.data.default.eye_size = 0;
											break;
										default:
											this.GUI.parent.birb.anm.data.default.eye_size = 1;
											break;
									}
								}
							}},
							{build:'button',data:{
								label:'Blush',
							}},
							{build:'button',data:{
								label:'Talk',
							}},
							{build:'button',data:{
								label:'Suprised',
							}},
						]
					}},
					{build:'submenu', data:{
						name:'Body Control',
						_build:[
							{build:'button',data:{
								label:'Toggle Wing',
							}},
							{build:'button',data:{
								label:'Toggle LED',
							}},
						]
					}},
					{build:'submenu', data:{
						name:'Extras',
						_build:[
							{build:'special_button',data:{
								label:'None',
								onClick:function(){this.GUI.parent.birb.anm.FSM.setState('none', 'extras')}
							}},
							{build:'button',data:{
								label:'Xmass',
								onClick:function(){this.GUI.parent.birb.anm.FSM.setState('xmass', 'extras')}
							}},
							{build:'button',data:{
								label:'New Years',
								onClick:function(){this.GUI.parent.birb.anm.FSM.setState('newYear', 'extras')}
							}},
							{build:'button',data:{
								label:'Festive (temp)',
								onClick:function(){this.GUI.parent.birb.anm.FSM.setState('festive', 'extras')}
							}}
						]
					}},
					{build:'special_button',data:{
						label:'Run Test',
						onClick:function(){this.GUI.parent.test()}
					}},
				]
			}}
		]
	});
	//
};
Environment.prototype.init = function () {
	//
	this.log.log('Initializing Birb');
	this.birb.init();
	this.log.log('Done starting Artamis');
	this.chat.init();
};
Environment.prototype.test = function (){
	console.log('test');
	this.birb.anm.FSM.setState('blink', null, {speed:0.1})
};
//-=-//
Environment.prototype.update = function () {
	this.viewports.update();
	this.GUI.update();
	//
	this.birb.update();
	
};
Environment.prototype.draw = function () {
	background(this.bg_color.r, this.bg_color.g, this.bg_color.b);
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
		priority:-1,
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
	var arr = this._viewports.slice();
	arr.sort(function(a,b){return b.priority-a.priority;});
	for (var i = arr.length - 1; i >= 0; i--) {
		arr[i]._draw();
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
	this._IDP_enum = 0;
	this._named = {};
	this._objects = [this];
	this._popcorn = null;
	this._popqueue = [];
	this._active = [];
	this._children = [];
	this._id = 0;
	this._viewport = this.parent.viewports.new('GUI', {
		refresh:true,
		priority:2,
	});
	//
	this.log = Logger.get_log('info');
};
_GUI.prototype.update = function(){
	for (var i = this._active.length - 1; i >= 0; i--) {
		this._objects[this._active[i]].update();
	}
	if(this._popcorn){this._popcorn.update();}
	else if (this._popqueue.length){
		this._popcorn = this._popcorn_constructor(this._popqueue.shift());
	}
};
_GUI.prototype.draw = function(){
	this._viewport.graphic.clear();
	for (var i = this._active.length - 1; i >= 0; i--) {
		this._objects[this._active[i]].draw();
	}
	if (this._popcorn) this._popcorn.draw();
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
_GUI.prototype._popcorn_constructor = function (data) {
	popcorn = Object.assign({
		id:this._IDP_enum++,
		GUI:this,
		//
		pos:{x:width/2,y:height},
		dim:{x:width/2,y:50},
		col:{r:100,g:100,b:100},
		speed:1,
		wait_time:2,
		//
		_states:{
			init:'open',
			open:{
				Enter:function(){
					console.log('popcorn:', this.agent.message)
				},
				Execute:function(){
					this.agent.pos.y = constrain(this.agent.pos.y - this.agent.speed*5, height-this.agent.dim.y, height);
					if(this.agent.pos.y == height-this.agent.dim.y){this.FSM.setState('wait')}
				}
			},
			wait:{
				Enter:function(){
					console.log(`waiting ${this.agent.wait_time} seconds`);
					var self = this;
					after(1000*this.agent.wait_time, function(){self.FSM.setState('close')});
				},
				Execute:function(){}
			},
			close:{
				Execute:function(){
					this.agent.pos.y = constrain(this.agent.pos.y + this.agent.speed*5, height-this.agent.dim.y, height*2);
					if(this.agent.pos.y > height+20){
						this.FSM.setState('wait')
						this.agent.GUI._popcorn = null;
					}

				}
			},
		},
		//
		update:function(){this.FSM.Execute()},
		draw:function(){
			var graphic = this.GUI._viewport.graphic;
			graphic.push();
			graphic.rectMode(CORNER);
			graphic.stroke(0,0,0,200);
			graphic.fill(this.col.r, this.col.g, this.col.b, 100)
			graphic.rect(this.pos.x, this.pos.y, this.dim.x, this.dim.y);
			//
			graphic.fill(0,0,0,255);
			graphic.noStroke();
			graphic.text(this.message, this.pos.x+5, this.pos.y+10, this.dim.x, this.dim.y);
			graphic.pop();
		},
	}, data);
	popcorn.FSM = new SimpleFSM(popcorn);
	return popcorn;
};
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
		build:function () {
			var x_offset = 0;
			var y_offset = 0;
			//
			if (!this._build) return;
			//
			for (var i = 0; i < this._build.length; i++) {
				if (this._build[i].build) {
					obj = Object.assign({
						GUI:this.GUI,
						parent:this.id
					},this.GUI._menu_builds[this._build[i].build]);
					Object.assign(obj, this._build[i].data);
					//
			 		//
					if(obj._init_build) obj._init_build();
					if(obj._super_build) {
						for (var j = obj._super_build.length - 1; j >= 0; j--) {
							this._build.push(obj._super_build[j]);
						}
					}
					this._build[i] = obj;
				}					
			}
			this._build = this._build.sort(function(a,b){return (a.priority||0)-(b.priority||0);})
			for (var i = this._build.length - 1; i >= 0; i--) {
				switch (this._build[i].type) {
					case 'window':
						this.GUI.new_window(this._build[i], this.id);
						break;
					case 'button':
						if (this._build[i].pos == undefined) this._build[i].pos = {x:10+(100*x_offset++),y:10+(50*y_offset)};
						if (x_offset > 3) {x_offset=0;y_offset++;};
						this.GUI.new_button(this._build[i], this.id);
						break;
					default:
						break;
				}
			}
		},
		//
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
		col:{r:50,g:150,b:150},
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
_GUI.prototype._menu_builds = {

	forward_button:{
		type:'button',
		col:{r:200,g:50,b:50},
		priority:-1,
		onClick:function(){
			this.GUI.get_named_object(this.menu_f).set_active();
			this.GUI.get_named_object(this.menu_b).set_inactive();
		},
		_init_build:function(){
			this.label = this.label || this.menu_f;
		}
	},
	back_button:{
		type:'button',
		col:{r:150,g:50,b:50},
		priority:2,
		onClick:function(){
			this.GUI.get_named_object(this.menu_f).set_inactive();
			this.GUI.get_named_object(this.menu_b).set_active();
		},
		_init_build:function(){
			this.label = this.label || this.menu_b
		}
	},
	button:{
		type:'button',
	},
	special_button:{
		type:'button',
		col:{r:50,g:150,b:200},
		priority:1	
	},
	//
	submenu:{
		type:'window',
		active:false,
		//
		_init_build:function(){

			this.parent_name = this.GUI.get_object(this.parent).name;			
			this._build.push({
				build:'back_button',
				data:{
					menu_f:this.name,
					menu_b:this.parent_name
				}
			});
			this._super_build = [
				{
					build:'forward_button',
					data:{
						menu_f:this.name,
						menu_b:this.parent_name
					}
				}
			];
		}
	}
};
//
_GUI.prototype.popcorn = function (msg, data) {
	// displays a message on the bottom of the screen
	//
	msg = msg.trim().split(/\n\r|\n|\r/).join(' || ');
	this._popqueue.push(Object.assign({
		message:msg,
		dim:{x:width/2,y:textHeight(msg, width/2-10)+20}
	},data));
};
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
var SimpleFSM = function (agent, states) {
	this.agent = agent;
	this.states = {};
	this.current_state = {
		Execute:function(){console.log('FiniteStateMachine still initializing');},
		Exit:function(){}
	};
	this.current_isComplete = false;
	this.current_transition = null;
	//
	if(agent&&(agent._states||states)){
		var val;
		var states = states || agent._states;
		for (var key in states) {
			val = states[key];
			if(key=='init'){this.setState(val);}
			else if(key=='type'){}
			else {this.new_State(key,val);}
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



// -=-=-=-=- Segmented Finite State Machine -=-=-=-=- //
var StackedFSM = function(agent, states){
	this.agent = agent;
	this.states = {};
	this.current_states = [];
	this.current_transitions = [];
	//
	if(agent&&(agent._states||states)){
		var val;
		var states = agent._states || states;
		for (var key in states) {
			val = states[key];
			if(key=='init'){this.setState(val);}
			else if(key=='type'){}
			else {this.new_State(key,val);}
		}
	}
};
StackedFSM.prototype.new_State = SimpleFSM.prototype.new_State;
//
StackedFSM.prototype.Execute = function () {
	var state;
	var args;
	for (var i = this.current_states.length - 1; i >= 0; i--) {
		state = this.states[this.current_states[i]];
		state.Execute();
		if(state.complete){
			state.complete = false;
			state.Exit();
			this.removeState(this.current_states[i]);
		}
	}
	for (var i = this.current_transitions.length - 1; i >= 0; i--) {
		state = this.current_transitions[i][0];
		args = this.current_transitions[i][1];
		//
		if((this.current_states.indexOf(state)==-1)&&(this.states[state])){
			this.current_states.push(state);
			this.states[state].Enter(args);
			this.states[state].Execute(args);
		}
	}
	if(this.current_transitions.length > 0)this.current_transitions = [];
};
StackedFSM.prototype.setState = function (state, args) {
	this.current_transitions.push([state, args]);
};
StackedFSM.prototype.removeState = function (state) {
	this.current_states.splice(this.current_states.indexOf(state), 1);
};



// -=-=-=-=- Segmented Finite State Machine -=-=-=-=- //
var SegmentedFSM = function (agent, segments) {
	this.agent = agent;
	this.segments = {};
	this.initial_state = null;

	if(agent&&(agent._segments||segments)){
		var val;
		var segments = agent._segments || segments;
		for (var key in segments) {
			val = segments[key];
			this.new_Segment(key,val);
		}
	}
};
//
SegmentedFSM.prototype.Execute = function () {
	for (var key in this.segments) {
		this.segments[key].Execute();
	}
}
//
SegmentedFSM.prototype.new_Segment = function (segment, data) {
	switch(data.type){
		default:
		case 'SimpleFSM':
			this.segments[segment] = new SimpleFSM(this.agent, data);
			break;
		case 'StackedFSM':
			this.segments[segment] = new StackedFSM(this.agent, data);
			break;
		case 'SegmentedFSM':
			this.segments[segment] = new SegmentedFSM(this.agent, data);
			break;
	}
};
SegmentedFSM.prototype.getSegments = function () {
	return Object.keys(this.segments);
};
SegmentedFSM.prototype.setState = function (state, segment, args) {
	if (segment&&this.segments[segment]) {
		this.segments[segment].setState(state, args);
	}else {
		for (var key in this.segments) {
			if (this.segments[key].states[state]){
				this.segments[key].setState(state, args);
			}
		}
	}
};

