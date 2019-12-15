# handle

import urlparse
import json
from os.path import dirname as path_dirname
from os.path import join as path_join
from os.path import abspath as path_abspath
from imp import load_source

load_source('Nets','./Birb/Nets/__init__.py')
from Nets import newNetwork

def handle(Network, datastr, path):
	Birb = Network['Birb'];
	# parse data
	dir_ = path_dirname(path)
	data = urlparse.parse_qs(datastr, True)

	type_ = data['type'][0] or 'msg'
	msg = data['msg'][0]

	if (type_ == 'msg'):
		Birb.msg_in(msg, data)
		return 'msg recieved! ^v^'
	elif (type_ == 'read'):
		return Birb.read();
	elif (type_ == 'start'):
		print 'starting'
		Birb.init();
		return 'started birb!'
	elif(type_ == 'stop'):
		print 'stopping'
		return 'stopped birb!'
	else:
		return 'msg dunno! TvT'

