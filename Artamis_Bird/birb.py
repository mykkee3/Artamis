# handle

import urlparse
import json
from os.path import dirname as path_dirname
from os.path import join as path_join
from os.path import abspath as path_abspath

def handle(datastr, path):
	# parse data
	dir_ = path_dirname(path)
	data = urlparse.parse_qs(datastr, True)

	type_ = data['type'][0] or 'msg'
	msg = data['msg'][0]

	if (type_ == 'msg'):
		Birb.msg_in(msg, data)
		return 'msg recieved! ^v^'
	elif (type_ == 'start'):
		print 'starting'
		global Birb
		Birb = Birb_()
		return 'started birb!'
	elif(type_ == 'stop'):
		print 'stopping'
		return 'stopped birb!'
	else:
		return 'msg dunno! TvT'


class Birb_():
	# birb
	def __init__(self):
		pass

	def msg_in(self, msg, data):
		print 'birb heard: ', msg
		self.msg_out(msg)

	def msg_out(self, msg):
		pass