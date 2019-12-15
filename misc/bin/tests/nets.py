# Networks

# Imports #

import logging

from time import sleep
from imp import load_source

load_source('Nets', './nets_test/__init__.py');
from Nets import newNetwork

# Variables and Constants #
net = None;
agent = None;
#
RUNNING = True;
LOG = logging.getLogger('ROOT')

# Functions and Classes #
class Agent():
	"""docstring for Agent"""
	def __init__(self):
		pass

	def msg_out(self, msg):
		LOG.info('Displaying Output - '+msg)
		print 'Output:', msg;

def init():
	global net, agent;
	agent = Agent();
	net = newNetwork(agent, {
		'type':'text',
		'dataPath':'./nets_test/'
	});

def loop():
	usr_in = raw_input("Input: ");
	global RUNNING;
	if(usr_in == 'kill'):
		print '\nShutting down...'
		RUNNING = False;
		return;
	LOG.info('User Input - '+usr_in)
	net.parse(usr_in, {})

def serve_loop():
	while RUNNING:
		loop();


def main ():
	print '\nStarting Neural Networks Test\n\nInitializing Network'
	init();
	print 'Done Initializing\nServing Main Loop\n'
	serve_loop();
	print 'Testing Complete.'



if __name__ == '__main__':
	logging.basicConfig(filename='log.log', filemode='w', level=logging.DEBUG)
	main()