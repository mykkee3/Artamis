// classes

Birb = function () {

	this.anm = new Animator(this);
	this.AI = new AI(this);
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
	this.anm.init();
	this.FSM = new SimpleFSM(this);
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

	this.data = {
		default:{
			'gender' : 0, // 0 : girl, 1: boy
			'pos' : createVector(),
			'eye_pos' : createVector(),
			'eye_target' : null,
			'eye_brow_rot' : 0,
			'eye_brow_h' : 0,
			'eye_openess' : 1,
			'eye_size': 1,
			'eye_spd' : 1,
			'eye_count' : 0,
			'eye_blink_count' : 0,
			'eye_blink_state' : 0,
			'eye_target_type' : 1,
			'blush_alpha' : 0
		},
		left_eye:{},
		right_eye:{},
		extras:{
			'headpiece':0,
			'mouth':0
		}
	}
}
Animator.prototype.init = function () {
	this.FSM = new SegmentedFSM(this);
}
//
Animator.prototype.update = function () {
	this.FSM.Execute();
}
Animator.prototype.draw = function () {
	var defaults = this.data.default;
	var left_eye = Object.assign(Object.assign({}, defaults), this.data.left_eye);
	var right_eye = Object.assign(Object.assign({}, defaults), this.data.right_eye);
	var extras = Object.assign({}, this.data.extras);

	eye_x = constrain(map(defaults.eye_pos.x, 0, width, -1,1), -1, 1);
	eye_y = constrain(map(defaults.eye_pos.y, 0, height, -1,1), -1, 1);
	var eye_pos = createVector(eye_x, eye_y);

	var eye_col = {r:50, g:150, b:120}

	var graphic = this.parent.graphic;
	
	graphic.clear();
	//graphic.background(40,40,40,100);
	//
	graphic.push();
	graphic.translate(width/2, height/2);
	graphic.translate(defaults.pos.x, defaults.pos.y);
	//
	graphic.fill(255,255,255);
	//

	//Eyes
	graphic.strokeJoin(ROUND);
	graphic.strokeWeight(40*(defaults.eye_openess+0.5)/2);
	graphic.stroke(eye_col.r, eye_col.g, eye_col.b);
	graphic.fill(eye_col.r, eye_col.g, eye_col.b);

	//Left Eye
	left_eye_openess = 1-left_eye.eye_openess;
	left_eye_x = eye_pos.x*20;
	left_eye_y = eye_pos.y*10*(1-left_eye_openess);
	pos_sclr = map(eye_pos.x, 1,-1, 1.05,0.85);
	eye_size = map(left_eye.eye_size*pos_sclr, -0.5, 1, 0,1);
	brow_w = 100;
	brow_h = 5;
	offset_x = -80*map(eye_size,0,1, 0.7,1);
	offset_y = -50;
	//
	L=left_eye_x+offset_x+(-40-30*left_eye_openess)*eye_size*pos_sclr;
	R=left_eye_x+offset_x+(+40+20*left_eye_openess)*eye_size*pos_sclr;
	T=left_eye_y+offset_y+(-40+50*left_eye_openess)*eye_size;
	B=left_eye_y+offset_y+(+40-30*left_eye_openess)*eye_size;
	//
	BrT=T-brow_h-10*(1-eye_size)+5*left_eye_openess;
	BrL=L-60*(1-left_eye.eye_size);
	BrR=R+30*(1-left_eye.eye_size**2);
	//
	graphic.beginShape();//Eye
	graphic.vertex(L, T);//TL
	graphic.vertex(L, B);//BL
	graphic.vertex(R, B);//BR
	graphic.vertex(R, T);//TR
	graphic.endShape(CLOSE);
	//
	graphic.push();//Brow
	graphic.strokeWeight(5+10*eye_size*(1.2-left_eye_openess));
	graphic.line(BrL, BrT, BrR, BrT);
	graphic.pop();
	//
	if(!defaults.gender){//Lashes
		graphic.push();
		graphic.strokeWeight(5);
		graphic.noFill();
		lash_x = BrL+15*(1-eye_size);
		lash_y = BrT;
		graphic.curve(lash_x+20, lash_y-40, lash_x, lash_y, lash_x-40, lash_y-15, lash_x-50, lash_y-85);
		lash_x = BrL;
		lash_y = BrT+(-10*(1-eye_size)+4+6*pos_sclr)*(1-left_eye_openess);
		graphic.curve(lash_x+20, lash_y-40, lash_x, lash_y, lash_x-40, lash_y, lash_x-50, lash_y-55);
		graphic.pop();
	}

	//Right Eye
	right_eye_openess = 1-right_eye.eye_openess;
	right_eye_x = eye_pos.x*20;
	right_eye_y = eye_pos.y*10*(1-right_eye_openess);
	pos_sclr = map(eye_pos.x, -1,1, 1.05,0.85);
	eye_size = map(right_eye.eye_size*pos_sclr, -0.5, 1, 0,1);
	brow_w = 100;
	brow_h = 5;
	offset_x = 80*map(eye_size,0,1, 0.7,1);
	offset_y = -50;
	//
	L=right_eye_x+offset_x+(-40-20*right_eye_openess)*eye_size*pos_sclr;
	R=right_eye_x+offset_x+(+40+30*right_eye_openess)*eye_size*pos_sclr;
	T=right_eye_y+offset_y+(-40+50*right_eye_openess)*eye_size;
	B=right_eye_y+offset_y+(+40-30*right_eye_openess)*eye_size;
	//
	BrT=T-brow_h-10*(1-eye_size)+5*right_eye_openess;
	BrR=R+60*(1-right_eye.eye_size);
	BrL=L-30*(1-right_eye.eye_size**2);
	//
	graphic.beginShape();
	graphic.vertex(L, T);//TL
	graphic.vertex(L, B);//BL
	graphic.vertex(R, B);//BR
	graphic.vertex(R, T);//TR
	graphic.endShape(CLOSE);
	//
	graphic.push();//Brow
	graphic.strokeWeight(5+10*eye_size*(1.2-right_eye_openess));
	graphic.line(BrL, BrT, BrR, BrT);
	graphic.pop();
	//
	if(!defaults.gender){
		graphic.push();
		graphic.strokeWeight(5);
		graphic.noFill();
		lash_x = BrR-15*(1-eye_size);
		lash_y = BrT;
		graphic.curve(lash_x-20, lash_y-40, lash_x, lash_y, lash_x+40, lash_y-15, lash_x+50, lash_y-85);
		lash_x = BrR;
		lash_y = BrT+(-10*(1-eye_size)+4+6*pos_sclr)*(1-right_eye_openess);
		graphic.curve(lash_x-20, lash_y-40, lash_x, lash_y, lash_x+40, lash_y, lash_x+50, lash_y-55);
		graphic.pop();
	}

	// Beak
	//
	graphic.push();
	//
	graphic.strokeWeight(5);
	//
	offset_x = 0+10*eye_pos.x;
	offset_y = 80+5*eye_pos.y;
	//
	L= -60+offset_x+10*eye_pos.x;
	M= offset_x+22*eye_pos.x;//middle
	R= 60+offset_x+10*eye_pos.x;
	CL= -20+offset_y+3*eye_pos.x;//cheek
	CR= -20+offset_y-3*eye_pos.x;//cheek
	T= 50+offset_y+5*eye_pos.y;//beak top
	B= 60+offset_y+4*eye_pos.y;//beak bottom
	//
	// Mouth Bottom
	graphic.beginShape();
	graphic.vertex(L, CL);//Left
	graphic.vertex(M, B);//Bottom
	graphic.vertex(R, CR);//Right
	graphic.vertex(M, T);//TOP
	graphic.endShape();
	//
	// mouthpiece extras
	graphic.push();
	switch(extras.mouth){
		case 0:
		default:
			break;
		case 'newYear': //new years
			ref = createVector(L+15+3*eye_pos.x, CL+19)
			col = {r:150,g:200,b:50}
			//
			graphic.strokeWeight(5);
			graphic.stroke(col.r,col.g,col.b);
			graphic.fill(col.r,col.g,col.b);
			//
			graphic.beginShape();
			graphic.vertex(ref.x, ref.y);//TL
			graphic.vertex(ref.x-35+10*eye_pos.x, ref.y+70+5*eye_pos.y+4*eye_pos.x);//BL
			graphic.vertex(ref.x-15+10*eye_pos.x, ref.y+70+5*eye_pos.y+3*eye_pos.x);//BR
			graphic.vertex(ref.x+5, ref.y+10);//TR
			graphic.endShape(CLOSE);
			//
			break;
	}
	graphic.pop();
	//
	// Mouth Top
	graphic.noFill();
	graphic.beginShape();
	graphic.vertex(L, CL);//Left
	graphic.vertex(M, T);//TOP
	graphic.vertex(R, CR);//Right
	graphic.endShape();

	graphic.pop();
	//


	// Extras
	//
	graphic.push();

	//head pieces:
	//
	offset_x = 0+15*eye_pos.x;
	offset_y = -150+10*eye_pos.y;
	depth = createVector(eye_pos.x, eye_pos.y);
	//
	switch(extras.headpeice){
		case 0:
		default:
			break;
		case 'xmass': // XMass Hat
			offset_x += 100;
			offset_y += 0;
			L = createVector(offset_x-70, offset_y-30);
			T = createVector(offset_x+105, offset_y-70);
			R = createVector(offset_x+30, offset_y);
			//
			graphic.fill(220);
			graphic.stroke(170);
			graphic.strokeWeight(10);
			graphic.ellipse(offset_x+45, offset_y, 50,50);
			//
			graphic.push();
			graphic.fill(170, 40, 50, 170);
			graphic.stroke(200,50,70);
			graphic.beginShape();
			graphic.vertex(L.x, L.y);//Left
			graphic.vertex(T.x-110+1*depth.x, T.y-20+1*depth.y);//TopBend
			graphic.vertex(T.x-50+2*depth.x, T.y-30+2*depth.y);//TopBend2
			graphic.vertex(T.x+4*depth.x, T.y+4*depth.y);//Top
			graphic.vertex(R.x+20+1*depth.x, R.y-65+1*depth.y);//BottomBend
			graphic.vertex(R.x+5+1*depth.x, R.y-50+1*depth.y);//BottomBend
			graphic.vertex(R.x, R.y);//Right
			graphic.endShape(CLOSE);
			graphic.pop();
			//
			graphic.ellipse(offset_x-70+1*depth.x, offset_y-30+1*depth.y, 50,50);
			graphic.ellipse(offset_x-40+2*depth.x, offset_y-23+3*depth.y, 50,50);
			graphic.ellipse(offset_x+30+2*depth.x, offset_y+2*depth.y, 50,50);
			graphic.ellipse(offset_x-5+3*depth.x, offset_y-10+3*depth.y, 50,50);
			//
			graphic.ellipse(T.x+10+5*depth.x, T.y+5+5*depth.y, 30,30);
			//
			break;
	}
	graphic.pop();
	//

	graphic.pop();
	//
	// back

}
Animator.prototype._segments = {
	eyes:{
		init:'idle',
		idle:{
			Execute:function(){
				if(this.agent.data.default.eye_target && this.agent.data.default.eye_target.pos){
					var target = this.agent.data.default.eye_target.pos.copy();
					var d = p5.Vector.sub(target, this.agent.data.default.eye_pos);
					d.limit(this.agent.data.default.eye_spd*60);
					this.agent.data.default.eye_pos.add(d);
				}

				//sudo movements
				//this.agent.data.default.eye_openess = constrain(map(mouseY, 0, height, 0,1), -1, 1);
				if(this.agent.data.default.eye_count<frameCount){
					this.agent.data.default.eye_count = frameCount + random(10,500);
					if(this.agent.data.default.eye_target_type){
						this.agent.data.default.eye_target = this.agent.parent.pointer;
					}else{
						this.agent.data.default.eye_target = {'pos':createVector(random(width), random(height))};
					}
					this.agent.data.default.eye_target_type = !this.agent.data.default.eye_target_type;
				}
				if(this.agent.data.default.eye_blink_count<frameCount){
					this.agent.data.default.eye_blink_count = frameCount + random(10,1000);
					//do blink
					this.FSM.setState('blink');
				}
				this.agent.data.default.eye_brow_rot = constrain(map(noise(frameCount*0.001+1000), 0, 1, -1,1), -0.5, 0.5);
				this.agent.data.default.eye_brow_h = constrain(map(noise(frameCount*0.001), 0,1, -1,1), -1, 1);
			}
		},
		blink:{
			Enter:function(args){
				if(!args)args = {};
				this.data.speed = args.speed || random(0.8,3);
				this.data.state = 0;
			},
			Execute:function(){
				this.FSM.states['idle'].Execute();
				switch(this.data.state){
					case 0:
						this.agent.data.default.eye_openess -= 0.25*this.data.speed;
						if(this.agent.data.default.eye_openess <= 0) this.data.state++;
						break;
					case 1:
						this.agent.data.default.eye_openess += 0.1*this.data.speed;
						if(this.agent.data.default.eye_openess >= 1) {
							this.agent.data.default.eye_openess = 1;
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
	},
	extras:{
		init:'none',
		none:{Execute:function(){}},
		xmass:{
			Enter:function(args){
				this.agent.data.default.pos.y = 50;
				this.agent.data.extras.headpeice = 'xmass';
			},
			Exit:function(){
				this.agent.data.default.pos = createVector();
				this.agent.data.extras.headpeice = 0;
			}
		},
		newYear:{
			Enter:function(args){
				this.agent.data.extras.mouth = 'newYear';
			},
			Exit:function(){
				this.agent.data.extras.mouth = 0;
			}
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