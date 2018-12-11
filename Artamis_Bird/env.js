/*
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- //
//				-=- Environment -=-		   //
//										   //
// doc string thing						   //
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- //
*/

// Globals and Constants //

//


var Environment = function () {
	//
	this.GUI = new _GUI();
	this.log = Logger.get_log('info', {verbose:true});
	this.log.log('Starting Artamis!', {verbosity:true});
	//
	this.birb = new Birb();
	this.log.log('Initializing Birb');
	this.birb.init();
	this.chat = new Chat(this);
	this.chat.init();
	this.log.log('Done starting Artamis');
	//
	Logger.get_log('error', {verbose:true}).log('testing error');
	//
};
//-=-//
Environment.prototype.update = function () {
	this.GUI.update();
	//
	this.birb.update();
	
};
Environment.prototype.draw = function () {
	background(100);
	this.GUI.draw();
	//
	Logger.draw();
	this.birb.draw();
};
//-=-//
Environment.prototype.onClick = function (mx, my) {
	this.GUI.onClick(mx, my);
	//
	this.birb.onClick(mx, my);
};
Environment.prototype.keyPressed = function (key) {
	if (key == 53) document.location.reload();
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


// -=-=-=-=- Environment GUI -=-=-=-=- //
//
var _GUI = function () {
	this._data = {};
	this._ID_enum = 1;
	this._named = [];
	this._objects = [this];
	this._active = [];
	this._children = [];
	this._id = 0;
	//
};
_GUI.prototype.update = function(){
	for (var i = this._active.length - 1; i >= 0; i--) {
		this._objects[this._active[i]].update();
	}
};
_GUI.prototype.draw = function(){
	for (var i = this._active.length - 1; i >= 0; i--) {
		this._objects[this._active[i]].draw();
	}
};
_GUI.prototype.onClick = function(mx, my){
	for (var i = this._active.length - 1; i >= 0; i--) {
		this._objects[this._active[i]].onClick(mx, my);
	}
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
		build:function(){
			console.log('building window!');
		},
		update:function(){},
		draw:function(){},
		//
		onClick:function(mx, my){},
		append_child:function(id){this.children.push(id);}
	}, data);
	//
	win.build();
	if (win.name) this._named[win.name] = win.id;
	this._objects[win.id] = win;
	return win;
};
_GUI.prototype._button_constructor = function(parent, data) {
	o_id = this._get_new_id();
	o = Object.assign({
		id:o_id,
		parent:parent,
		//
		update:function(){},
		draw:function(){},
		onClick:function(){}
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
_GUI.prototype.get_object = function (id) {return this._objects[id];};
_GUI.prototype.append_child = function (id) {this._children.push(id);};


// -=-=-=-=- Javascript Log -=-=-=-=- //
var Logger = {
	_LOG_costructor : function (parent, name, data) {
		o = {
			parent : parent,
			name : name,
			data : data,
			_log_file : "",
			//
			log : function (msg, data) {
				time = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(11,-1);
				data = Object.assign({
					verbosity:false
				}, data);
				prefix = "Logger."+this.name+"("+time+"): ";
				if (!this.data.verbose && !data.verbosity) return;
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
		pos:[10,200],
		size:[300,300],
		verbose:false
	},
	//
	
	get_log : function (name, data) {
		if (! this._logs[name]) this._logs[name] = this._LOG_costructor(this, name, Object.assign(Object.assign({}, this._data), {"name":name}, data));
		return this._logs[name];
	},
	//
	draw : function (name) {
		log_obj = this._logs[name];
		if (!log_obj) log_obj = this;
		fill(0,0,0,0);
		stroke(0,0,0,100);
		rect(this._data.pos[0], this._data.pos[1], this._data.size[0], this._data.size[1]);
		fill(0,0,0,255);
		text(log_obj._log_file, this._data.pos[0], this._data.pos[1], this._data.size[0], this._data.size[1]);
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
