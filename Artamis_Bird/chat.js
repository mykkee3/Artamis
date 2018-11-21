// functions

function after(ms, callback) {
  setTimeout(callback, ms);
}

// classes

function Chat(parent) {

	this.parent = parent;

	this.init = function () {
		//
	};

	this.submit = function () {
		var msg = document.forms['input']['textbox'].value;
		if (msg !== '') {
			document.forms['input']['textbox'].value = '';
			this.message_add(msg, 'user');
			//
			if(this.parent.birb) this.parent.birb.msg_in(msg, {});
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