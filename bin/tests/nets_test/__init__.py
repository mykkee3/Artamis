# Networks

# Imports #

import logging

from rivescript import RiveScript

# Globals and Constants #
LOG = logging.getLogger('NETS')

# Functions and Classes #

class newNetwork():
	# birb
	def __init__(self, agent, data):
		self.agent = agent;
		self.data = data;
		#
		self.dir = data['dataPath'] or './test/'
		#
		self.bot = RiveScript();
		self.bot.load_directory(self.dir);
		self.bot.sort_replies();
		self.bot.set_uservar("localuser", 'topic', 'random');
		#
		self.msgs = []; # current memory segment
		self.msgsContext = [] #previous message segment after saving
		self.msgsMemory = {} #data flagged as important eg. name age etc

	def _store_msg(self, msg, data):
		self.msgs.append(msg);

	def parse(self, msg, data):
		LOG.info('Parsing Input - ' + msg);
		self._store_msg(msg, data);
		self.Execute();

	def Execute(self):
		#
		LOG.info('Running Network');
		reply = self.bot.reply("localuser", self.msgs[-1]);
		LOG.info('Bot Replied - '+reply);
		self.agent.msg_out(reply);