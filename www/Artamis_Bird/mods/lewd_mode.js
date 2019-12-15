/*
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//				-=- Lewd Mode Mod -=-	
//	
//	adds lewd faces and sexual minigame
//	
//	- notes:
// 
//
// doc string thing	
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
*/

Object.assign(Animator.prototype._segments.eyes, {
	test:{
		Execute:function(){console.log('Test from lewd mod')}
	},
	wink:{
		Enter:function(args){
			this.data.speed = (args||{}).speed || 1;
			this.data.state = 0;
			this.agent.data.right_eye.eye_openess = this.agent.data.default.eye_openess || 1;
		},
		Execute:function(){
			this.FSM.states['idle'].Execute();
			switch(this.data.state){
				case 0:
					this.agent.data.right_eye.eye_openess -= 0.3*this.data.speed;
					if(this.agent.data.right_eye.eye_openess <= 0) this.data.state++;
					break;
				case 1:
					this.agent.data.right_eye.eye_openess += 0.2*this.data.speed;
					if(this.agent.data.right_eye.eye_openess >= 1) {
						this.agent.data.right_eye.eye_openess = 1;
						this.FSM.setState('idle');
					}
					break;
			}

		},
		Exit:function(){
			delete this.agent.data.right_eye.eye_openess;
		}
	}
});