// p5 init stuff
/*
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- //
//				-=- Sketch -=-			   //
//										   //
// doc string thing						   //
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- //
*/

// Globals and Constants //
var enviroment;
//

function setup () {
	// Create Canvas //
	var myCanvas = createCanvas(780, 460);
	myCanvas.parent('game-container');
	// Init //
	enviroment = new Environment();

	enviroment.load_data('test');
}


function draw () {
	enviroment.update();
	enviroment.draw();
}

function mouseClicked(){
	enviroment.onClick(mouseX, mouseY);
}

function keyPressed(){
	enviroment.keyPressed(keyCode);
}

new p5();