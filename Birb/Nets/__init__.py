# Networks

class newNetwork():
	# birb
	def __init__(self, agent, data):
		self.agent = agent;
		self.data = data;
		#
		self.msgsContext = [] #previous message segment after saving
		self.msgs = []; # current memory segment

	def _store_msg(self, msg, data):
		pass

	def parse(self, msg, data):
		print 'Parsing:', msg
		self.agent.msg_out(msg);
		pass