


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
			console.log('Sent:',msg);
		}
	};

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