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
from time import sleep

from imp import load_source

#-# Globals and Constants #-#
logging.basicConfig(stream=sys_stdout, filename='bin/log.log', filemode='w', level=logging.DEBUG)
LOG = logging.getLogger('root')
RUNNING_STATE = True

PARSER = argparse.ArgumentParser()
PARSER.add_argument("in_pipe", help="filepath to stdin pipe")
PARSER.add_argument("out_pipe", help="filepath to stdout pipe")

PARSER.add_argument("-v", "--verbose", help="increase output verbosity", action="store_true")

args = PARSER.parse_args()


#-# Functions and Classes #-#

def init():
	pass

def start_server():
	global RUNNING_STATE
	while RUNNING_STATE:
		sleep(5)
		push_output("Ping!!!")
	print "server dead"

def start_input():
	global RUNNING_STATE
	msg = "Starting input pipe\n"
	print msg
	filepath = "./"+args.in_pipe
	LOG.info(msg)
	
	with open(filepath, 'r') as pipe:
		print "input pipe open"
		while RUNNING_STATE:
			data = pipe.readline();
			if (data.strip() == "kill"):
				print "Server Dying"
				RUNNING_STATE = False
			if (data != ""):
				print 'Read: "{0}"'.format(data)
	
def push_output(msg):
	filepath = "./"+args.out_pipe
	print "Writing message: "+msg
	pipe = open(filepath, 'w+')
	pipe.write(msg+'\n')
	pipe.close();
#	msg = "Starting output pipe\n"
#	print msg
#	print args.out_pipe + "\n"
#	LOG.info(msg)

	pass
	
#-# Main#-#
def main():
	init()
	LOG.info('Done Initializing')	
	LOG.info('Starting Pipes')	
	print "starting pipes"
	t = Thread(target=start_server)
	t.daemon = True
	t.start()
	start_input()

if __name__ == '__main__':
	main()