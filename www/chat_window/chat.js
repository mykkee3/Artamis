


// pusher instancing
const tokenProvider = new Chatkit.TokenProvider({
	url: "https://us1.pusherplatform.io/services/chatkit_token_provider/v1/5b113d1c-cae2-4a82-a2af-86128968a7f5/token"
});

const chatManager = new Chatkit.ChatManager({
	instanceLocator: "v1:us1:5b113d1c-cae2-4a82-a2af-86128968a7f5",
	userId: "console",
	tokenProvider: tokenProvider
});


//-=-=-=-=- Chat stuff -=-=-=-=- //
//
//
function Chat() {

	this.init = function () {
		console.log('chat statrted!');

		msg_recieve = this.recieve_handlr();
		//
		chatManager
			.connect()
			.then(currentUser => {
				//console.log("Connected as user ", currentUser);
				currentUser.subscribeToRoom({
				roomId: currentUser.rooms[0].id,
				hooks: {
					onMessage: message => {
						msg_recieve(message);
					}
				},
				messageLimit: 0
				});
			})
			.catch(error => {
				console.error("error:", error);
			});
			this.start_birb();
	};

	this.keepAlive = function(){
		var self = this
		this.post({type:'read', cb:function(data, status){
			if(data){
				data = JSON.parse(data);
				if(data.msg != null){
					self.recieve({
						text:data.msg,
						senderId:'Artamis'
					})
				}
			} 
		}})
		setTimeout(function(){self.keepAlive()}, 5000);
	};

	this.recieve_handlr = function () {
		self = this
		return function (message) {
			self.recieve(message);
		}
	};

	this.recieve = function (message) {
		msg = `Received: ${message.senderId} >> ${message.text}`
		console.log(msg);
		this.message_add(message.text, message.senderId);
	};

	this.submit = function () {
		var msg = document.forms['input']['textbox'].value;
		if (msg !== '') {
			document.forms['input']['textbox'].value = '';
			//this.message_add(msg, 'user');
			var currentUser = chatManager.currentUser;
			currentUser.sendMessage({
				text: msg,
				roomId: currentUser.rooms[0].id
			});
			this.post({msg:msg});
			console.log('Sent:',msg);
		}
	};

	this.post = function (data){
		var cb = data.cb || function(data, status){console.log("Data: " + data + "\nStatus: " + status);};
		$.post("../Birb/hook.py",Object.assign({
			'type': 'msg',
			'msg': ''
		},data||{}), 
		function(data,status){
			cb(data, status);
		}).fail(function(){
			console.log('post fail');
		});
	};

	this.start_birb = function () {
		this.post({type:'start'})
		this.keepAlive();
	}
	// messages //

	this.alert = function (msg) {
		this.message_add(msg, null, 'alert');
	};

	this.message_add = function (msg, usr, typ) {
		typ = typ || 'msg';
		var msgs = document.getElementById('messages');
		var p = document.createElement('p');
		p.className = typ;
		p.innerHTML = msg;
		p.setAttribute('user', usr);
		msgs.appendChild(p);
	};
}