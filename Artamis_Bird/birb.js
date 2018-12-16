// classes

Birb = function () {

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
	this.viewport = enviroment.viewports.new('Birb',{
		refresh:true,
		priority:1
	});
	this.graphic = this.viewport.graphic
	this.post({'type': 'start'}); // let server know we are up.
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
	init:'idle',
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
	this.FSM = new SegmentedFSM(this);

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
	this.FSM.Execute();
}
Animator.prototype.draw = function () {
	var eye_openess = constrain(this.attr_data.eye_openess, 0,1);
	var brow_rot = constrain(this.attr_data.eye_brow_rot, -0.5, 0.5)/(0.75+eye_openess);
	var brow_h = max(map(eye_openess, 0,1, -1,1),
			constrain(
				(this.attr_data.eye_brow_h*0.75 + map(this.attr_data.eye_pos.y, 0,height, -1,1)),
				-1, 1)) * 8;
	var eye_x = constrain(map(this.attr_data.eye_pos.x, 0, width, -1,1), -1, 1) * 10;
	var eye_y = constrain(map(this.attr_data.eye_pos.y, 0, height, -1,1), -1, 1) * 10;
	var eye_pos = createVector(eye_x, eye_y);
	eye_y = eye_pos.y*eye_openess;
	var blush_alpha = constrain(this.attr_data.blush_alpha, 0,1) * 255;
	var blushd_alpha = constrain(this.attr_data.blushd_alpha, 0,1) * 255;

	var eye_col = {r:50, g:150, b:120}

	var graphic = this.parent.graphic;
	
	graphic.clear();
	//graphic.background(40,40,40,100);
	//
	graphic.push();
	graphic.translate(width/2, height/2);
	//
	graphic.fill(255,255,255);
	//graphic.ellipse(eye_x,eye_y,10,10);
	//graphic.ellipse(0,0,2,2);
	//

	//Eyes
	graphic.strokeJoin(ROUND);
	graphic.strokeWeight(40*(eye_openess+0.5)/2);
	graphic.stroke(eye_col.r, eye_col.g, eye_col.b);
	graphic.fill(eye_col.r, eye_col.g, eye_col.b);

	//Left Eye
	offset_x = -100;
	offset_y = -50;
	left_eye_openess = 1-eye_openess;
	graphic.beginShape();
	graphic.vertex(eye_x-40+offset_x-30*left_eye_openess, eye_y-40+offset_y+50*left_eye_openess);//TL
	graphic.vertex(eye_x-40+offset_x-30*left_eye_openess, eye_y+40+offset_y-30*left_eye_openess);//BL
	graphic.vertex(eye_x+40+offset_x+20*left_eye_openess, eye_y+40+offset_y-30*left_eye_openess);//BR
	graphic.vertex(eye_x+40+offset_x+20*left_eye_openess, eye_y-40+offset_y+50*left_eye_openess);//TR
	graphic.endShape(CLOSE);

	//Right Eye
	offset_x = 100;
	offset_y = -50;
	right_eye_openess = 1-eye_openess;
	graphic.beginShape();
	graphic.vertex(eye_x-40+offset_x-20*right_eye_openess, eye_y-40+offset_y+50*right_eye_openess);//TL
	graphic.vertex(eye_x-40+offset_x-20*right_eye_openess, eye_y+40+offset_y-30*right_eye_openess);//BL
	graphic.vertex(eye_x+40+offset_x+30*right_eye_openess, eye_y+40+offset_y-30*right_eye_openess);//BR
	graphic.vertex(eye_x+40+offset_x+30*right_eye_openess, eye_y-40+offset_y+50*right_eye_openess);//TR
	graphic.endShape(CLOSE);

	//Beak
	graphic.strokeWeight(5);
	//graphic.noFill();
	//
	offset_x = 0;
	offset_y = 80;
	graphic.beginShape();
	graphic.vertex(-60+offset_x, -20+offset_y);//Left
	graphic.vertex(offset_x, 60+offset_y);//Bottom
	graphic.vertex(60+offset_x, -20+offset_y);//Right
	graphic.vertex(offset_x, 50+offset_y);//TOP
	graphic.endShape(CLOSE);

	graphic.pop();
	// back

}
Animator.prototype._segments = {
	eyes:{
		init:'idle',
		idle:{
			Execute:function(){
						if(this.agent.attr_data.eye_target && this.agent.attr_data.eye_target.pos){
					var target = this.agent.attr_data.eye_target.pos.copy();
					var d = p5.Vector.sub(target, this.agent.attr_data.eye_pos);
					d.limit(this.agent.attr_data.eye_spd*60);
					this.agent.attr_data.eye_pos.add(d);
				}

				//sudo movements
				// var eye_x = constrain(map(mouseX, 0, width, -1,1), -1, 1) * 10;
				//this.agent.attr_data.eye_openess = constrain(map(mouseY, 0, height, 0,1), -1, 1);
				if(this.agent.attr_data.eye_count<frameCount){
					this.agent.attr_data.eye_count = frameCount + random(10,500);
					if(this.agent.attr_data.eye_target_type){
						this.agent.attr_data.eye_target = this.agent.parent.pointer;
					}else{
						this.agent.attr_data.eye_target = {'pos':createVector(random(width), random(height))};
					}
					this.agent.attr_data.eye_target_type = !this.agent.attr_data.eye_target_type;
				}
				if(this.agent.attr_data.eye_blink_count<frameCount){
					this.agent.attr_data.eye_blink_count = frameCount + random(10,50);
					//do blink
				}
				this.agent.attr_data.eye_brow_rot = constrain(map(noise(frameCount*0.001+1000), 0, 1, -1,1), -0.5, 0.5);
				this.agent.attr_data.eye_brow_h = constrain(map(noise(frameCount*0.001), 0,1, -1,1), -1, 1);
			}
		},
		blink:{
			Enter:function(){
				this.data.state = 0;
			},
			Execute:function(){
				this.FSM.states['idle'].Execute();
				switch(this.data.state){
					case 0:
						this.agent.attr_data.eye_openess -= 0.25;
						if(this.agent.attr_data.eye_openess <= 0) this.data.state++;
						break;
					case 1:
						this.agent.attr_data.eye_openess += 0.1;
						if(this.agent.attr_data.eye_openess >= 1) {
							this.agent.attr_data.eye_openess = 1;
							this.FSM.setState('idle');
						}
						break;
				}

			},
			Exit:function(){}
		}
	},
	//
	mouth:{
		init:'idle',
		idle:{
			Execute:function(){}
		}
	}
};

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