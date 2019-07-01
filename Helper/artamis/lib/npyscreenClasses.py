#!/usr/bin/env python

# -=-=- Imports -=-=- #

from __future__ import absolute_import
import logging
import npyscreen

# -=-=- Globals & Constants -=-=-  #
#

LOG = logging.getLogger('root');
#LOG.setLevel(logging.INFO);
#FH = logging.FileHandler('./bin/log.log');
#LOG.addHandler(FH);


# -=-=- Functions & Classes -=-=- #
#


class ListSelect (npyscreen.MultiLineAction):
	"""
	ListSelect is used to select an option from a list of forms and select it
		however the class is incomplete and shared across the settings manager
	"""
	def __init__(self, *args, **keywords):
		super(ListSelect, self).__init__(*args, **keywords);
		#
		def _action(sel, key):
			LOG.info('ListSelect _action - %s : %s'%(sel, str(key)));
		#
		if 'action' in keywords.keys():
			action = keywords['action'];
			if action == None: action = _action;
		else:
			action = _action;

		self.handle = action;


	def actionHighlighted(self, selected, keyPress):
		self.handle(selected, keyPress);



# -=-=- MAIN -=-=- #
#
def main():
	pass;
#
if __name__ == '__main__':
	main();
## EOF
