// -=- Header stuff -=-
//
//
// -=-=-=-=-=-=-=-=-=-=- //

// pusher instancing
const tokenProvider = new Chatkit.TokenProvider({
	url: "https://us1.pusherplatform.io/services/chatkit_token_provider/v1/5b113d1c-cae2-4a82-a2af-86128968a7f5/token"
});

const chatManager = new Chatkit.ChatManager({
	instanceLocator: "v1:us1:5b113d1c-cae2-4a82-a2af-86128968a7f5",
	userId: "artamis",
	tokenProvider: tokenProvider
});

// functions

function after(ms, callback) {
	setTimeout(callback, ms);
}

// classes

function Chat(parent) {

	this.parent = parent;

	this.init = function () {
		//
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
		if (message.senderId == 'artamis') return;

		msg = `Received new message: ${message.senderId} >> ${message.text}`
		this.parent.log.log(msg);

		this.parse_msg(message.text);
	};

	this.send = function (msg) {
		// 
		var currentUser = chatManager.currentUser;
		currentUser.sendMessage({
			text: msg,
			roomId: currentUser.rooms[0].id
		});
		message = `Sending message: ${msg}`
		this.parent.log.log(message);
	}

	
	this.parse_msg = function (message) {
		if (message == 'ping') {
			msg = 'I heard a ping!!! Hello from Artamis ^v^';
			this.send(msg);
			this.parent.GUI.popcorn(msg);
		}else if (message == 'hello') {
			msg = 'Hi... please talk to me more... I am eager to learn ^v^';
			this.send(msg);
		}
	
	};
}