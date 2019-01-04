# handle

import urlparse
import json
from os.path import dirname as path_dirname
from os.path import join as path_join
from os.path import abspath as path_abspath
from imp import load_source

load_source('Nets','./Birb/Nets/__init__.py')
from Nets import newNetwork


class Birb_():
	# birb
	def __init__(self):
		pass
		self.last_msg = '';
		self.net = newNetwork(self, {
			'type':'text',
			'dataPath':'/talk/'
		});
		self.out_data_def = {
			'msg':None
		};
		self.out_data = self.out_data_def;

	def init(self):
		pass

	def _store_msg(self, msg, data):
		pass
		self.last_msg = msg;

	def parse(self, msg, data):
		self.net.parse(msg, data);

	def msg_in(self, msg, data):
		print 'birb heard: ', msg
		print 'last msg:', self.last_msg;
		self._store_msg(msg, data);
		self.parse(msg, data);

	def msg_out(self, msg):
		self.out_data = {
			'msg':msg
		}

	def read(self): 
		ret = json.dumps(self.out_data);
		self.out_data = self.out_data_def;
		return ret;