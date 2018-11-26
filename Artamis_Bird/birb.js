// classes

function Birb() {

	this.anm = new Animator(this);
	this.AI = new AI(this);
	this.FSM = new SimpleFSM(this);
	//
	this.pointer = {
		update:function(){
			this.pos = createVector(mouseX, mouseY);
		},
		'pos':createVector(),
		'data':{}
	};
}
Birb.prototype.init = function () {
	//
	this.post({'type': 'start'});
}
Birb.prototype.update = function () {
	this.anm.update();
	this.pointer.update();
	this.AI.update();
	//
	this.FSM.Execute();
}
Birb.prototype.draw = function () {
	this.anm.draw();
	//this.AI.emote.draw();
}
Birb.prototype.onClick = function (mx, my) {
	//
}
Birb.prototype._states = {
	init:{
		Execute:function(){
			//
			this.FSM.setState('idle');
		}
	},
	idle:{
		Execute:function(){
			//console.log('idling');
		}
	}
}

//
Birb.prototype.input_change = function (obj) {
	this.anm.attr_data[obj.id] = obj.value;
}
Birb.prototype.post = function (data) {
	$.post("birb.py",Object.assign({
		'type': 'start',
		'msg': ''
	},data||{}), 
	function(data,status){
		console.log("Data: " + data + "\nStatus: " + status);
	}).fail(function(){
		console.log('post fail');
	});
}
Birb.prototype.msg_in = function (msg, data) {
	// after(2000, function(){enviroment.chat.message_add(msg, 'birb')});
	//
	this.post({
		'type': 'msg',
		'msg': msg
	});
}

function Animator (parent) {

	this.parent = parent;
	this.FSM = new SimpleFSM(this);

	this.attr_data = {
		'eye_pos' : createVector(),
		'eye_target' : null,
		'eye_brow_rot' : 0,
		'eye_brow_h' : 0,
		'eye_openess' : 1,
		'eye_spd' : 1,
		'eye_count' : 0,
		'eye_blink_count' : 0,
		'eye_blink_state' : 0,
		'eye_target_type' : 1,
		'blush_alpha' : 0
	};
}
Animator.prototype.update = function () {
	if(this.attr_data.eye_target && this.attr_data.eye_target.pos){
		var target = this.attr_data.eye_target.pos.copy();
		var d = p5.Vector.sub(target, this.attr_data.eye_pos);
		d.limit(this.attr_data.eye_spd*60);
		this.attr_data.eye_pos.add(d);
	}

	//sudo movements
	// var eye_x = constrain(map(mouseX, 0, width, -1,1), -1, 1) * 10;
	//this.attr_data.eye_openess = constrain(map(mouseY, 0, height, 0,1), -1, 1);
	if(this.attr_data.eye_count<frameCount){
		this.attr_data.eye_count = frameCount + random(10,500);
		if(this.attr_data.eye_target_type){
			this.attr_data.eye_target = this.parent.pointer;
		}else{
			this.attr_data.eye_target = {'pos':createVector(random(width), random(height))};
		}
		this.attr_data.eye_target_type = !this.attr_data.eye_target_type;
	}
	if(this.attr_data.eye_blink_count<frameCount){
		this.attr_data.eye_blink_count = frameCount + random(10,50);
		//do blink
	}
	this.attr_data.eye_brow_rot = constrain(map(noise(frameCount*0.001+1000), 0, 1, -1,1), -0.5, 0.5);
	this.attr_data.eye_brow_h = constrain(map(noise(frameCount*0.001), 0,1, -1,1), -1, 1);
}
Animator.prototype.draw = function () {
	push();
	var eye_openess = 1 - constrain(this.attr_data.eye_openess, 0,1);
	var brow_rot = constrain(this.attr_data.eye_brow_rot, -0.5, 0.5)/(0.75+eye_openess);
	var brow_h = max(map(eye_openess, 0,1, -1,1),
			constrain(
				(this.attr_data.eye_brow_h*0.75 + map(this.attr_data.eye_pos.y, 0,height, -1,1)),
				-1, 1)) * 8;
	var eye_x = constrain(map(this.attr_data.eye_pos.x, 0, width, -1,1), -1, 1) * 10;
	var eye_y = constrain(map(this.attr_data.eye_pos.y, 0, height, -1,1), -1, 1) * 10;
	var blush_alpha = constrain(this.attr_data.blush_alpha, 0,1) * 255;
	var blushd_alpha = constrain(this.attr_data.blushd_alpha, 0,1) * 255;
	
	translate(width/2, height/2);
	
	fill(255,255,255);
	ellipse(0,0,10,10);

	// back

	pop();
}
Animator.prototype._states = {
	init:{
		Execute:function(){}
	}
}

function AI (entity) {
	this.entity = entity;
	//
	this.emote = {
		//
		emotes : ['joy', 'trust', 'fear', 'suprise', 'sadness', 'disgust', 'anger', 'anticipation\ninterest'],
		base : [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
		pos : createVector(150,100),

		update:function () {
			var ofs = frameCount*0.001;
			this.base = [noise(ofs+100000),noise(ofs+200000),noise(ofs+300000),noise(ofs+400000),
				noise(ofs+500000),noise(ofs+600000),noise(ofs+700000),noise(ofs+800000)];
		},
		draw:function () {
			var opts = this.base;
			push();
			fill(100);
			beginShape();
			for (var i = opts.length - 1; i >= 0; i--) {
				var v = p5.Vector.fromAngle(i*(2*PI/opts.length)+PI);
				v.mult(50);
				vertex(this.pos.x+v.x, this.pos.y+v.y);
			}
			endShape(CLOSE);
			fill(100,230,100,150);
			beginShape();
			var avg = createVector(0,0);
			var avg2 = createVector(0,0);
			var avg3 = createVector(0,0);
			for (var i = opts.length - 1; i >= 0; i--) {
				var v = p5.Vector.fromAngle(i*(2*PI/opts.length)-PI*0.5);
				v.mult(opts[i]*50);
				avg.add(v.copy().mult(0.75));
				if(i%2 == 0){
					avg2.add(v.copy().mult(0.75));
				}else{
					avg3.add(v.copy().mult(0.75));
				}
				vertex(this.pos.x+v.x, this.pos.y+v.y);
			}
			endShape(CLOSE);
			fill(10);
			textAlign(CENTER);
			for (var i = opts.length - 1; i >= 0; i--) {
				var v = p5.Vector.fromAngle(i*(2*PI/opts.length)-PI*0.5);
				v.mult(80);
				text(this.emotes[i], this.pos.x+v.x, this.pos.y+v.y);
			}
			line(this.pos.x, this.pos.y, this.pos.x + avg.x, this.pos.y + avg.y);
			fill(100,240,100,255);
			ellipse(this.pos.x + avg2.x, this.pos.y + avg2.y, 5,5);
			fill(100,100,240,255);
			ellipse(this.pos.x + avg3.x, this.pos.y + avg3.y, 5,5);
			fill(240,100,120,255);
			ellipse(this.pos.x + avg.x, this.pos.y + avg.y, 5,5);
			//
			pop();
		}

	};
}
//
AI.prototype.update = function() {
	this.emote.update();
};