# Networks

# Imports #

import logging

import json

from rivescript import RiveScript

# Globals and Constants #
LOG = logging.getLogger('root');
LOG.setLevel(logging.INFO);
FH = logging.FileHandler('./bin/log.log');
LOG.addHandler(FH);


HELP_TEXT = """
This is the Help Text.

I do hope you enjoy it

/k	/kill	: for killing the chatbot
/h	/help	: display help text
/f	/fix	: add line to msg.log for training and assume it as last output
/m	/mode	: change running mode of the bot
					0 - normal
					1 - bot vs bot
					2 - training

""";


# Functions and Classes #

class BotSettings():
	"""
	FileSettings:
	=============
		s1 : profile/file mode (not implemented)
		t1 : filepath (unused)
		p1 : pathList
		s2 : fileSelect
		s3 : profileSelect (not implemented)

	UserSettings:
	=============
		p1 : prompt input
		p2 : prompt output
		p3 : prompt input (training mode)
		s1 : chatMode (not implemented)
		s2 : waitMode (not implemented)

	RiveSettings:
	=============
		None:None		


	"""
	def __init__(self):
		try:
			with open('settings.json') as infile:
				self.DATA = json.load(infile);
		except IOError as error:		
			self.DATA = None;
			print "\nWarning: Chatbot may not function without a valid `settings.json` file\nRun `settings.py` to fix the issue\n";


class RiveChatbot():
	# birb
	def __init__(self, settings):
		self.settings = settings;
		if settings.DATA == None: return;
		#
		self.dir = settings.DATA['FILE_SETTINGS']['t1'];
		self.file_list= settings.DATA['FILE_SETTINGS']['p1'];
		self.file_sel = settings.DATA['FILE_SETTINGS']['s2'];
		self.msg_log_filepath = './bin/msgs.log';
		#
		self.bot = RiveScript();
		#
		for i in self.file_sel:
			self.bot.load_file(self.file_list[i])
		#
		self.bot.sort_replies();
		self.bot.set_uservar("localuser", 'topic', 'random');
		#
		self.msgs = []; # current memory segment
		self.msgsContext = [] #previous message segment after saving
		self.msgsMemory = {} #data flagged as important eg. name age etc
		
		with open(self.msg_log_filepath, "a+") as file:
			file.write("##\n");
	

	def _store_msg(self, msg):
		self.msgs.append(msg);

	def _log_msg(self, msg, reply):
		#self.msg_log.append(msg);
		#self.msg_log.append(reply);
		with open(self.msg_log_filepath, "a+") as file:
			file.write("++ " + msg + "\n");
			file.write("-- " + reply + "\n");

	def run(self):
		if (self.settings.DATA == None):
			print "Cannot run bot without valid settings\nexiting NOW";
			exit(0);

		p1 = self.settings.DATA['USER_SETTINGS']['p1'];
		p2 = self.settings.DATA['USER_SETTINGS']['p2'];
		p3 = self.settings.DATA['USER_SETTINGS']['p3'];
		rMode = self.settings.DATA['USER_SETTINGS']['s1'][0];

		if (rMode == 2):
			p_in = p3;
			p_out = p2;
		else:
			p_in = p1;
			p_out = p2;		

		usr_in = raw_input(p_in+" ")
		while( not usr_in in ["/k", "/kill"] ):
			while (usr_in in ['', ' ']):
				usr_in = raw_input('%s '%(p_in));
			if (usr_in[0] != '/'):
				if(rMode == 0):
					resp = self._parse(usr_in);
					print p2+" "+resp;
					usr_in = raw_input(p_in+" ");
				elif (rMode == 1):
					break;
				elif (rMode == 2):
					usr_in2 = raw_input('%s '%(p_out));
					self._log_msg(usr_in, usr_in2);
					usr_in = raw_input('%s '%(p_in));
				else:
					break;

			else:
				self._command(usr_in[1:len(usr_in)]);
				rMode = self.settings.DATA['USER_SETTINGS']['s1'][0];
				#
				if (rMode == 2):
					p_in = p3;
				else:
					p_in = p1;
				#
				if (rMode in [0, 2]):
					usr_in = raw_input('%s '%(p_in));
				else:
					usr_in = '.';

	def _command(self, cmd):
		#LOG.info(cmd);
		s= cmd.split(' ')
		c = s[0];
		o = ' '.join(s[1:len(s)]);
		#LOG.info(c+' : '+o);
		if (c in ['h', 'help']):
			print HELP_TEXT;
		elif (c in ['f', 'fix']):
			with open(self.msg_log_filepath, "a+") as file:
				file.write("-- %s\n"%(o));
			print "%s %s"%(self.settings.DATA['USER_SETTINGS']['p2'], o);
		elif (c in ['m', 'mode']):
			self.settings.DATA['USER_SETTINGS']['s1'][0] = int(o);
		else:
			print 'Unrecognised command `%s`. Try /h or /help for help'%(c)


	def _parse(self, msg):
		LOG.info('Parsing Input - ' + msg);
		self._store_msg(msg);
		reply = self._Execute(msg);
		self._log_msg(msg, reply);
		return reply;

	def _Execute(self, msg):
		#
		LOG.info('Running Network');
		reply = self.bot.reply("localuser", msg);
		LOG.info('Bot Replied - '+reply);
		#self.agent.msg_out(reply);
		return reply;

