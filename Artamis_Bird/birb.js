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
	//
	this.viewport = enviroment.viewports.new('Birb',{
		refresh:true
	});
	this.graphic = this.viewport.graphic
	this.post({'type': 'start'}); // let server know we are up.

	// some temp init settings

	//set target to pointer
	this.anm.data.default.eye_count = Infinity;
	this.anm.data.default.eye_target = this.pointer;

	//set extras to current working theme
	//this.anm.setState('newYear', 'extras');

	//
}
Birb.prototype.update = function () {
	this.anm.update();
	this.pointer.update();
}
Birb.prototype.draw = function () {
	this.anm.draw();
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
		'type': 'msg',
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
			//'eye_brow_rot' : 0,
			//'eye_brow_h' : 0,
			'eye_openess' : 1,
			'eye_size': 1,
			'eye_spd' : 1,
			'eye_count' : 0,
			'eye_blink_count' : 0,
			'eye_blink_state' : 0,
			//'eye_target_type' : 1,
			//'blush_alpha' : 0,
			'eye_bottom_curve' : 0
		},
		left_eye:{},
		right_eye:{},
		extras:{
			'headpiece':0,
			'mouth':0,
			'eyes':0,
			data:{}
		}
	}
}
Animator.prototype.init = function () {
	this.FSM = new SegmentedFSM(this);
}
//
Animator.prototype.update = function () {
	this.FSM.Execute();
	this.particles.update();
	//
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
	//
	graphic.push();
	graphic.translate(width/2, height/2);
	graphic.translate(defaults.pos.x, defaults.pos.y);
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
	left_eye_bottom_curve = (-left_eye.eye_bottom_curve)*(1-left_eye_openess)*eye_size;
	//
	TL=left_eye_x+offset_x+(-40-30*left_eye_openess)*eye_size*pos_sclr;
	TR=left_eye_x+offset_x+(+40+20*left_eye_openess)*eye_size*pos_sclr;
	BL=TL+7*Math.abs(left_eye_bottom_curve);
	BR=TR-7*Math.abs(left_eye_bottom_curve);
	T=left_eye_y+offset_y+(-40+50*left_eye_openess)*eye_size;
	B=left_eye_y+offset_y+(+40-30*left_eye_openess)*eye_size;
	// 
	BCLx = BL+20*Math.abs(left_eye_bottom_curve); //BottomControlLeft
	BCLy = B-10*left_eye_bottom_curve*pos_sclr;
	BCRx = BR-20*Math.abs(left_eye_bottom_curve);
	BCRy = B-10*left_eye_bottom_curve*pos_sclr;
	//
	LCBx = BL - 20*Math.abs(left_eye_bottom_curve); //LeftControlBottom
	LCBy = B - 25*Math.abs(left_eye_bottom_curve);
	RCBx = BR + 20*Math.abs(left_eye_bottom_curve);
	RCBy = B - 25*Math.abs(left_eye_bottom_curve);
	//
	BrT=T-brow_h-10*(1-eye_size)+5*left_eye_openess;
	BrL=TL-60*(1-left_eye.eye_size);
	BrR=TR+30*(1-left_eye.eye_size**2);
	//
	left_eye_tmp_data = {
		pos:createVector(BL, T),
		dim:p5.Vector.sub(createVector(BR, B), createVector(BL, T))
	}
	//
	graphic.beginShape();//Eye
	graphic.vertex(TL, T);//TL
	graphic.bezierVertex(TL, T, LCBx, LCBy, BL, B);//BL
	graphic.bezierVertex(BCLx, BCLy, BCRx, BCRy, BR, B);//BR
	graphic.bezierVertex(RCBx, RCBy, TR, T, TR, T);//TR
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
	right_eye_bottom_curve = (-right_eye.eye_bottom_curve)*(1-right_eye_openess)*eye_size;
	//
	TL=right_eye_x+offset_x+(-40-20*right_eye_openess)*eye_size*pos_sclr;
	TR=right_eye_x+offset_x+(+40+30*right_eye_openess)*eye_size*pos_sclr;
	BL=TL+5*Math.abs(right_eye_bottom_curve);
	BR=TR-5*Math.abs(right_eye_bottom_curve);
	T=right_eye_y+offset_y+(-40+50*right_eye_openess)*eye_size;
	B=right_eye_y+offset_y+(+40-30*right_eye_openess)*eye_size;
	//
	BCLx = BL+20*Math.abs(right_eye_bottom_curve); //BottomControlLeft
	BCLy = B-10*right_eye_bottom_curve*pos_sclr;
	BCRx = BR-20*Math.abs(right_eye_bottom_curve);
	BCRy = B-10*right_eye_bottom_curve*pos_sclr;
	//
	LCBx = BL - 20*Math.abs(right_eye_bottom_curve); //LeftControlBottom
	LCBy = B - 30*Math.abs(right_eye_bottom_curve);
	RCBx = BR + 20*Math.abs(right_eye_bottom_curve);
	RCBy = B - 30*Math.abs(right_eye_bottom_curve);
	//
	BrT=T-brow_h-10*(1-eye_size)+5*right_eye_openess;
	BrR=TR+60*(1-right_eye.eye_size);
	BrL=TL-30*(1-right_eye.eye_size**2);
	//
	right_eye_tmp_data = {
		pos:createVector(BL, T),
		dim:p5.Vector.sub(createVector(BR, B), createVector(BL, T))
	}
	//
	graphic.beginShape();//Eye
	graphic.vertex(TL, T);//TL
	graphic.bezierVertex(TL, T, LCBx, LCBy, BL, B);//BL
	graphic.bezierVertex(BCLx, BCLy, BCRx, BCRy, BR, B);//BR
	graphic.bezierVertex(RCBx, RCBy, TR, T, TR, T);//TR
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
	//
	// Eye extras
	switch(extras.eyes){
		case 0:
		default:
			break;
		case 'number':
			//
			pos = left_eye_tmp_data.pos;
			dim = left_eye_tmp_data.dim;
			if(dim.y!=0 && dim.x!=0){
				graphic.image(extras.data.left_eye_graphic, pos.x, pos.y, dim.x, dim.y);
			}
			pos = right_eye_tmp_data.pos;
			dim = right_eye_tmp_data.dim;
			if(dim.y!=0 && dim.x!=0){
				graphic.image(extras.data.right_eye_graphic, pos.x, pos.y, dim.x, dim.y);
			}
			break;
	}


	// Beak
	//
	graphic.push();
	//
	graphic.strokeWeight(5);
	//
	points = this.Math.beakPos(eye_pos);
	//
	// Mouth Bottom
	//graphic.noFill();
	graphic.beginShape();
	graphic.vertex(points.L, points.CL);//Left
	graphic.vertex(points.M, points.B);//Bottom
	graphic.vertex(points.R, points.CR);//Right
	graphic.vertex(points.M, points.T);//TOP
	graphic.endShape();
	//
	// mouthpiece extras
	graphic.push();
	switch(extras.mouth){
		case 0:
		default:
			break;
		case 'newYear': //new years
			//
			var L = this.Math.beakPos(eye_pos, 0.5).LB;
			var R = this.Math.beakPos(eye_pos, 0.55).RB;
			var TL = p5.Vector.add(this.Math.extendLine(L, R, 230).p1, L);
			var TR = p5.Vector.add(this.Math.extendLine(L, R, 150).p2, R);
			//
			graphic.strokeWeight(5);
			graphic.stroke(120);
			//
			graphic.line(TL.x, TL.y, TR.x, TR.y);
			//
			this.draw_effect('sparkle', graphic, TL);
			//
			break;
		case 'joint': 
			ref = this.Math.beakPos(eye_pos, 0.5).LT
			col = {r:80,g:150,b:50}
			//
			tipRef = ref.x-25+10*eye_pos.x
			tip_y = ref.y+70+5*eye_pos.y;
			//
			graphic.strokeWeight(5);
			graphic.stroke(col.r,col.g,col.b);
			graphic.fill(col.r,col.g,col.b);
			//
			graphic.beginShape();
			graphic.vertex(ref.x, ref.y);//TL
			graphic.vertex(tipRef-10, ref.y+70+5*eye_pos.y+2*(eye_pos.x-1));//BL
			graphic.vertex(tipRef+10, tip_y);//BR
			graphic.vertex(ref.x+5, ref.y+10);//TR
			graphic.endShape(CLOSE);
			//
			
			graphic.fill(col.r-40,col.g-20,col.b-20);
			graphic.ellipse(tipRef, tip_y-2, 20,19+1*eye_pos.x)
			break;
	}
	graphic.pop();
	//
	bg_color = enviroment.bg_color;
	// Mouth Top
	graphic.fill(bg_color.r, bg_color.g, bg_color.b);
	graphic.beginShape();
	graphic.vertex(points.L, points.CL);//Left
	graphic.vertex(points.M, points.T);//TOP
	graphic.vertex(points.R, points.CR);//Right
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
			graphic.strokeWeight(5);
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
	this.particles.draw()

	graphic.pop();
	//

	//
	//
}
Animator.prototype._segments = {
	body:{
		init:'start_up',
		start_up:{},
		idle:{},
		shut_down:{}
	},
	eyes:{
		init:'idle',
		type:'StackedFSM',
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
					if(random(0,100)>75){
						this.agent.data.default.eye_target = this.agent.parent.pointer;
					}else{
						this.agent.data.default.eye_target = {'pos':createVector(random(width), random(height))};
					}
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
				switch(this.data.state){
					case 0:
						this.agent.data.default.eye_openess -= 0.25*this.data.speed;
						if(this.agent.data.default.eye_openess <= 0) this.data.state++;
						break;
					case 1:
						this.agent.data.default.eye_openess += 0.1*this.data.speed;
						if(this.agent.data.default.eye_openess >= 1) {
							this.agent.data.default.eye_openess = 1;
							this.complete = true;
						}
						break;
				}

			},
			Exit:function(){}
		}
	},
	//
	// mouth:{
	// 	init:'idle',
	// 	type:'StackedFSM',
	// 	idle:{
	// 		Execute:function(){}
	// 	}
	// },
	extras:{
		init:'none',
		none:{Execute:function(){}},
		eye_number:{
			Enter:function(args){
				if(!args)args={};
				this.data.left_number = args.left || '00';
				this.data.right_number = args.right || '00';
				//
				this.agent.data.extras.eyes = 'number';
				left_eye_graphic = this.agent.data.extras.data.left_eye_graphic = createGraphics(110,70);
				right_eye_graphic = this.agent.data.extras.data.right_eye_graphic = createGraphics(110,70);

				//
				left_eye_graphic.fill(30, 120, 100);
				left_eye_graphic.stroke(30, 120, 100);
				left_eye_graphic.strokeWeight(7);
				left_eye_graphic.textFont('Courier New');
				left_eye_graphic.textSize(90);
				left_eye_graphic.text(this.data.left_number, 0,65);
				//
				right_eye_graphic.fill(30, 120, 100);
				right_eye_graphic.stroke(30, 120, 100);
				right_eye_graphic.strokeWeight(7);
				right_eye_graphic.textFont('Courier New');
				right_eye_graphic.textSize(90);
				right_eye_graphic.text(this.data.right_number, 0,65);
			},
			Exit:function(){
				delete this.agent.data.extras.data.left_eye_graphic;
				delete this.agent.data.extras.data.right_eye_graphic;
			}
		},
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
				this.FSM.states['eye_number'].Enter({left:20,right:19});
				this.agent.data.extras.mouth = 'newYear';
			},
			Exit:function(){
				this.agent.data.extras.eyes = 0;
				delete this.agent.data.extras.data.left_number;
				delete this.agent.data.extras.data.right_number;
				this.agent.data.extras.mouth = 0;
				this.FSM.states['eye_number'].Exit();
			}
		},
		festive:{
			Enter:function(args){
				this.agent.data.default.pos.y = 50;
				this.agent.data.extras.headpeice = 'xmass';
				this.agent.data.extras.mouth = 'newYear';
			},
			Exit:function(){
				this.agent.data.default.pos = createVector();
				this.agent.data.extras.headpeice = 0;
				this.agent.data.extras.mouth = 0;
			}
		}
	}
};
Animator.prototype._effects = {
	sparkle:function(anm, graphic, pos, args){
		graphic.push();
		graphic.translate(pos.x, pos.y);
		graphic.noStroke();
		//
		graphic.fill(250, 100, 100);
		graphic.ellipse(0,0, 10, 10);
		//
		graphic.fill(250, 170, 150);
		graphic.ellipse(0,0, 5, 5);
		//
		for (var i = 3; i >= 0; i--) {
			tri = anm.Math.genTriangle(15,25);
			graphic.fill(random(160,230), random(80,180), 30, 120);
			graphic.triangle(tri[0],tri[1],tri[2],tri[3],tri[4],tri[5])
		}
		graphic.pop();
		this.smoke(anm, graphic, p5.Vector.add(pos, createVector(0,-10)), args);
	},
	smoke:function(anm, graphic, pos, args){
		if(random(0,100)>75){
			p = {
				graphic:graphic,
				life:60,
				frameCount:0,
				seed:random(1000,3000),
				noiseCount:0,
				//
				col:random(80, 120),
				pos:pos.copy(),
				mov:createVector(),
				//
				update:function(){
					this.life--;
					this.frameCount++;
					if (this.life < 0) {
						this.particles.remove(this);
					}
					this.pos.add(this.mov);
					this.mov.y = this.mov.y-0.1;
				},
				draw:function(){
					var size = (10+40*noise(this.seed+this.noiseCount))*constrain(this.frameCount*0.02, 0,1);
					var col = this.col;
					this.noiseCount += 0.01;
					this.graphic.push();
					this.graphic.noStroke();
					this.graphic.fill(col,col,col,this.life*0.5);
					this.graphic.ellipse(this.pos.x, this.pos.y, size,size)
					this.graphic.pop();
				}
			};
			anm.particles.add(p);
		}
	}
}
Animator.prototype.draw_effect = function (effect, graphic, pos, args) {
	if(this._effects[effect]){this._effects[effect](this, graphic, pos, args)};
}
//
Animator.prototype.Math = {
	//
	extendLine : function (p1, p2, len){
		// calculates the extended points `len` distance from either point on a line that 
		// intersects both points
		//
		// p1 : vector2d - the first point
		// p2 : vector2d - the second point
		// len : number - length of the extention
		// returns {
		//    p1 : vector2d : extention on p1
		//    p2 : vector2d : extention on p2
		// }
		//
		r1 = p5.Vector.sub(p2, p1);
		r1.setMag(len);
		r2 = p5.Vector.sub(p1, p2);
		r2.setMag(len);
		//
		return {
			p1:r1,
			p2:r2
		}
	},
	genTriangle : function (min, max) {
		// generates a triangle
		rot = random(0,360)
		p1 = p5.Vector.fromAngle(radians(rot+random(360*(1/3)-10, 360*(1/3)+10)));
		p1.setMag(random(min, max));
		p2 = p5.Vector.fromAngle(radians(rot+random(360*(2/3)-10, 360*(2/3)+10)));
		p2.setMag(random(min, max));
		p3 = p5.Vector.fromAngle(radians(rot+random(360-10, 360+10)));
		p3.setMag(random(min, max));
		return [p1.x,p1.y, p2.x,p2.y, p3.x,p3.y]
	},
	//
	eyePos : function (pos) {

	},
	beakPos : function (eye_pos, h) {
		// calculates the key points of the beak or the intersecting point at height `h`
		//
		// h == none
		// returns : {L, M, R, CL, CR, T, B}
		//
		// eye_pos : vector2d [-1 - 1] - pos the eyes are looking 
		// h : float [0-1] - represents the height to the tip of the mouth
		// returns : {
		//     left : vector2d - the left position at height `h`	
		//     right : vector2d - the right position at height `h`	
		// }
		//
		offset_x = 0+10*eye_pos.x;
		offset_y = 70+5*eye_pos.y;
		//
		R= -60+offset_x+10*eye_pos.x;
		M= offset_x+22*eye_pos.x;//middle
		L= 60+offset_x+10*eye_pos.x;
		CR= -20+offset_y+3*eye_pos.x;//cheek
		CL= -20+offset_y-3*eye_pos.x;//cheek
		T= 50+offset_y+5*eye_pos.y;//beak top
		B= 60+offset_y+4*eye_pos.y;//beak bottom
		//
		if(h == null){
			return {
				L:L,
				M:M,
				R:R,
				CL:CL,
				CR:CR,
				T:T,
				B:B
			}
		}else {
			h = constrain(h, 0,1);
			LT = createVector(map(h, 0,1, L, M), map(h, 0,1, CL, T));
			LB = createVector(map(h, 0,1, L, M), map(h, 0,1, CL, B));
			RT = createVector(map(h, 0,1, R, M), map(h, 0,1, CR, T));
			RB = createVector(map(h, 0,1, R, M), map(h, 0,1, CR, B));
			//
			return {
				LT:LT,
				LB:LB,
				RT:RT,
				RB:RB
			}
		}
	}
}
Animator.prototype.particles = {
	particles:[],
	update:function(){
		for (var i = this.particles.length - 1; i >= 0; i--) {
			this.particles[i].update();
		}
	},
	draw:function(){
		for (var i = this.particles.length - 1; i >= 0; i--) {
			this.particles[i].draw();
		}
	},
	//
	add:function(particle){
		particle.particles = this;
		this.particles.push(particle);
	},
	remove:function(particle){
		this.particles.splice(this.particles.indexOf(particle), 1);
	}
}
//
Animator.prototype.setState = function (state, segment, args){
	this.FSM.setState(state, segment, args);
}



// AI //
//
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