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
	this.editor = new Editor(this);
	this.display = new Display(this);
	this.mode = 0; // 0 - framw ; 1 - animation
	//
	this.frames = [];
	this.animations = [];
	this.currentframe = 0;
	this.currentanm = 0;
	this.animframe = 0;
	//
	this.maxframes = 32;
	this.maxanims = 32;
	this.fwidth = 16;
	this.fheight = 8;
	//
};
//-=-//
Environment.prototype.update = function () {
	//
	if(!this.frames[this.currentframe]) this.editor.clearframe();
};
Environment.prototype.draw = function () {
	background(100);
	
	this.editor.draw();
	this.display.draw();

	switch(this.mode){
		case 0:
			push();
			fill(200,200,200,255);
			text("Frame edit mode:\n\
				left and right arrow to cycle frames\n\
				(leave 0 blank & 1 full)\n\
				m to change modes", 500, 100);
			//

			text("Current frame: "+ this.currentframe, 100, 200);
			pop();
			//
			break;
		case 1:
			fill(200,200,200,255);
			text("Animation edit mode:\n\
				left and right arrow to cycle frames\n\
				up and down to cycle animations\n\
				m to change modes\n\
				, and . to select frame\n\
				; and ' to change frame hangtime", 500, 100);
			//
			text("Current frame: "+ this.currentframe, 100, 200);
			text("Current anim#: "+ this.currentanm, 100, 220);
			text("Current animf: "+ this.animframe, 100, 240);
			text("Current hangt: "+ this.animations[this.currentanm][this.animframe][1], 100, 260);
			break;
	}

	
	
};
//-=-//
Environment.prototype.onClick = function (mx, my) {
	//
	if(this.mode == 0) this.editor.onClick(mx,my);
};
Environment.prototype.keyPressed = function (key) {
	console.log("key pressed:", key);
	//
	if(key == 37){ // LEFT_ARROW
		this.currentframe--;
		if(this.currentframe<0) this.currentframe = this.maxframes+this.currentframe;
	}
	if(key == 39){ // RIGHT_ARROW
		this.currentframe++;
		if(this.currentframe>=this.maxframes) this.currentframe = this.currentframe-this.maxframes;
	}
	if(key == 77){ // M
		this.mode = !this.mode?1:0;
	}
	if((this.mode == 1 ) & (key == 38)){ // UP_ARROW
		this.currentanm++;
		if(this.currentanm>=this.maxanims) this.currentanm = this.currentanm-this.maxframes;
	}
	if((this.mode == 1 ) & (key == 40)){ // DOWN_ARROW
		this.currentanm--;
		if(this.currentanm<0) this.currentanm = this.maxanims+this.currentanm;
	}
	if((this.mode == 1 ) & (key == 190)){ // COMMA
		this.animframe++;
	}
	if((this.mode == 1 ) & (key == 188)){ // PERIOD
		this.animframe--;
		if(this.animframe<0) this.animframe = 0;
	}
	if((this.mode == 1 ) & (key == 222)){ // APOSTROPHY
		this.animations[this.currentanm][this.animframe][1]++;
	}
	if((this.mode == 1 ) & (key == 186)){ // SEMI-COLON
		this.animations[this.currentanm][this.animframe][1]--;
		if(this.animations[this.currentanm][this.animframe][1]<0)
			this.animations[this.currentanm][this.animframe][1] = 0;
	}

	this.editor.keyPressed(key);
}
//
Environment.prototype.load_data = function (name) {
	//load nets/'name'.json
	var data = {

	};
};
Environment.prototype.save_data = function (s) {
	var opstr = "";
	var MAXLEN = 16
	//
	var bin_int = function (b) {
		var s = 0;
		for (var i = b.length - 1; i >= 0; i--) {
			s += b[i]*(2**i);
		}
		return s;
	}
	//
	opstr += "const int MAXLEN = "+MAXLEN+";"
	if(s) opstr += '\n\n';
	opstr += "const int framesHEX[][16] = {";
	if(s) opstr += '\n\t';
	for(f = 0; f < this.frames.length; f++){
		opstr += '{';
		for(i = 0; i < this.fwidth; i++){
			opstr += bin_int(this.frames[f][i]);
			// opstr += '{';
			// for(j = 0; j < this.fheight; j++){
			// 	opstr += this.frames[f][i][j]? '1,':'0,';
			// 	if(j==this.fheight-1)opstr = opstr.substr(0, opstr.length-1);
			// }
			opstr += ','
			if(i==this.fwidth-1)opstr = opstr.substr(0, opstr.length-1);
			// if(s) opstr += '\n\t\t';
			// if(i==this.fwidth-1)opstr = opstr.substr(0, opstr.length-1);
		}
		opstr += '},'
		if(f==this.frames.length-1)opstr = opstr.substr(0, opstr.length-1);
		if(s) opstr += '\n\t';
		if(f==this.frames.length-1)opstr = opstr.substr(0, opstr.length-1);
	}
	opstr += '};\n\n'
	//
	var fn, h;
	//
	opstr += 'const int animsHEX[][MAXLEN][2] = {';
	if(s) opstr += '\n\t';
	for (i = 0; i < this.animations.length ; i++) {
		opstr += '{';
		if(s) opstr += '\n\t\t';
		for (f = 0; f < MAXLEN; f++) {
			opstr += '{';
			fn = (this.animations[i][f]||[0,0])[0];
			h = (this.animations[i][f]||[0,0])[1];
			opstr += fn + ',' + h + '},';
			if(f==MAXLEN-1)opstr = opstr.substr(0, opstr.length-1);

		}
		if(s) opstr += '\n\t';
		opstr += '},';
		if(i==this.animations.length-1)opstr = opstr.substr(0, opstr.length-1);
		if(s) opstr += '\n\t';
		if(i==this.animations.length-1)opstr = opstr.substr(0, opstr.length-1);
	}
	opstr += '};';
	console.log(opstr);
}

var Editor = function (parent) {
	//
	this.parent = parent;
	//
	//this.framedata = [];
	this.pos = createVector(100,300);
	//
	this.fwidth = 16;
	this.fheight = 8;
};
// -=- //
Editor.prototype.update = function () {
	//
};
Editor.prototype.draw = function () {
	//
	switch(this.parent.mode){
		case 0:
			var i, j;
			//
			fill(30,30,30,0);
			for(i = 0; i < this.fwidth; i++){
				for(j = 0; j < this.fheight; j++){
					fill(30,30,30,255*this.parent.frames[this.parent.currentframe][i][j]);
					rect(this.pos.x+i*20, this.pos.y+j*20, 20, 20);
				}
			}
			break;
		case 1:
			//
			var f, t;
			fill(30,30,30,100);
			rect(this.pos.x, this.pos.y, this.fwidth*10+1, this.fheight*10+1);
			if(!this.parent.animations[this.parent.currentanm])
				this.parent.animations[this.parent.currentanm] = [];
			if(!this.parent.animations[this.parent.currentanm][this.parent.animframe])
				this.parent.animations[this.parent.currentanm][this.parent.animframe] = [0,10];
			//
			f = this.parent.animations[this.parent.currentanm][this.parent.animframe][0];
			t = this.parent.animations[this.parent.currentanm][this.parent.animframe][1];
			//
			for(i = 0; i < this.fwidth; i++){
				for(j = 0; j < this.fheight; j++){
					fill(200,0,0,255*this.parent.frames[f][i][j]);
					ellipse(this.pos.x+6+i*10, this.pos.y+6+j*10, 10);
				}
			}
			//
			break;
	}
};
//
Editor.prototype.onClick = function (mx,my) {
	//
	var pos = createVector(floor((mx-this.pos.x)*0.05), floor((my-this.pos.y)*0.05));
	if((pos.x>this.fwidth)||(pos.y>this.fheight)||(pos.x<0)||(pos.y<0)) return;
	console.log(pos.x,pos.y);
	this.parent.frames[this.parent.currentframe][pos.x][pos.y] = !this.parent.frames[this.parent.currentframe][pos.x][pos.y];
	//this.updateframe();
}
Editor.prototype.keyPressed = function (key){
	switch(this.parent.mode){
		case 1:
			if(key == 37 | key == 39){
				this.parent.animations[this.parent.currentanm]
				[this.parent.animframe][0] = this.parent.currentframe || 0;
			}
			if(key == 188 | key == 190){
				this.parent.currentframe = (this.parent.animations[this.parent.currentanm]
				[this.parent.animframe]||[0])[0];
			}
			break;
	}
}
//
Editor.prototype.updateframe = function () {
	var tmp = [];
	for(var i = 0; i < this.fwidth; i++){
		tmp[i] = [];
		for(var j = 0; j < this.fheight; j++){
			tmp[i][j] = this.framedata[i][j];
		}
	}
	this.parent.frames[this.parent.currentframe] = tmp;
}
Editor.prototype.clearframe = function (f) {
	f = f | this.parent.currentframe;
	if(!this.parent.frames[this.parent.currentframe]) this.parent.frames[this.parent.currentframe] = [];
	for(i = 0; i < this.fwidth; i++){
		if(!this.parent.frames[this.parent.currentframe][i]) this.parent.frames[this.parent.currentframe][i] = [];
		for(j = 0; j < this.fheight; j++){
			this.parent.frames[this.parent.currentframe][i][j] = 0;
		}
	}
	//this.parent.frames[f] = this.framedata;
}



var Display = function (parent) {
	//
	this.parent = parent;
	//
	//this.framedata = [];
	this.pos = createVector(100,100);
	this.currentframe = 0;
	this.framecount = 0;
	//
	this.fwidth = 16;
	this.fheight = 8;
};
// -=- //
Display.prototype.update = function () {
	//
};
Display.prototype.draw = function () {
	//
	switch(this.parent.mode){
		case 0:
			fill(30,30,30,100);
			rect(this.pos.x, this.pos.y, this.fwidth*10+1, this.fheight*10+1);
			for(i = 0; i < this.fwidth; i++){
				for(j = 0; j < this.fheight; j++){
					fill(200,0,0,255*this.parent.frames[this.parent.currentframe][i][j]);
					ellipse(this.pos.x+6+i*10, this.pos.y+6+j*10, 10);
				}
			}
			break;
		case 1:
			fill(30,30,30,100);
			rect(this.pos.x, this.pos.y, this.fwidth*10+1, this.fheight*10+1);
			if(this.framecount <= 0){
				this.currentframe++;
				if(!this.parent.animations[this.parent.currentanm][this.currentframe])
					this.currentframe = 0;
				this.framecount = this.parent.animations[this.parent.currentanm][this.currentframe][1];
				if(this.framecount == 0 & 
					this.parent.animations[this.parent.currentanm][this.currentframe][0] == 0){
						this.currentframe = 0;
						this.framecount = this.parent.animations[this.parent.currentanm][this.currentframe][1];
				}
			}
			this.framecount--;
			var frame_num = this.parent.animations[this.parent.currentanm][this.currentframe][0];
			var frame = this.parent.frames[frame_num];
			for(i = 0; i < this.fwidth; i++){
				for(j = 0; j < this.fheight; j++){
					fill(200,0,0,255*frame[i][j]);
					ellipse(this.pos.x+6+i*10, this.pos.y+6+j*10, 10);
				}
			}
			break;
	}
};



