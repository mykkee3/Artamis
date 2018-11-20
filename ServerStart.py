#!/usr/bin/python

'''
Starting point
'''

#-# Imports #-#
from sys import stdout as sys_stdout
from os import chdir as os_chdir
from threading import Thread
import SimpleHTTPServer
import SocketServer
import logging

import argparse

from imp import load_source

#-# Globals and Constants #-#

PARSER = argparse.ArgumentParser()
PARSER.add_argument("in_pipe", help="filepath to stdin pipe")
PARSER.add_argument("out_pipe", help="filepath to stdout pipe")

PARSER.add_argument("-v", "--verbose", help="increase output verbosity", action="store_true")

args = PARSER.parse_args()

logging.basicConfig(stream=sys_stdout, filename='bin/log.log', filemode='w', level=logging.DEBUG)
LOG = logging.getLogger('root')
RUNNING_STATE = True

Handler = SimpleHTTPServer.SimpleHTTPRequestHandler

class HandlerClass(Handler):
	"""docstring for Handler"""
	def _set_headers(self):
		self.send_response(200)
		self.send_header('Content-type', 'text/html')
		self.end_headers()

	def do_POST(self):
		# print 'got post!!'
		# print self.path
		# print "post_body(%s)" % (post_body)
		content_len = int(self.headers.getheader('content-length', 0))
		post_body = self.rfile.read(content_len)

		resp = 'empty respopnse'
		try:
			handle = load_source('handle', '.'+self.path)
			resp = handle.handle(post_body, self.path)
		except Exception, e:
			print 'Handle error:', e

		self._set_headers()
		self.wfile.write(resp)

server = SocketServer.TCPServer(('0.0.0.0', 8080), HandlerClass)


#-# Functions and Classes #-#
#
#-#-#

def init():
	pass

def start_input():
	global RUNNING_STATE
	msg = "Server: Starting input pipe\n"
	print msg
	filepath = "./"+args.in_pipe
	LOG.info(msg)
	
	with open(filepath, 'r') as pipe:
		print "Server: Input pipe opened."
		while RUNNING_STATE:
			data = pipe.readline();
			if (data != ""):
				print 'Server Read: "{0}"'.format(data.strip())
			if (data.strip() == "kill"):
				print "Server: Kill received: Server Dying"
				RUNNING_STATE = False
	
def push_output(msg):
	filepath = "./"+args.out_pipe
	print "Server: Writing message: "+msg.strip()
	pipe = open(filepath, 'w+')
	pipe.write(msg+'\n')
	pipe.close();

def start_server():
	sa = server.socket.getsockname()
	msg = str(sa[0])+":"+str(sa[1]) + "\n"
	logging.getLogger('root.www').info(msg)
	push_output(msg)
	server.serve_forever()


#-# Main#-#
def main():
	init()
	LOG.info('Done Initializing')	
	LOG.info('Starting Pipes')	
	print "Server: starting pipes"
	t = Thread(target=start_server)
	t.daemon = True
	t.start()
	start_input()

if __name__ == '__main__':
	main()