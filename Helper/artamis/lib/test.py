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
class HandlerForm(npyscreen.Form):
	def create(self):
		self.RETURN_ID = None;
		self.name = 'Test Menu'
		#
		msg = 'This is the Test Form for testing things, Thank You. \n\n    - Artamis ^v^';
		self.add(npyscreen.MultiLineEdit, value=msg, editable=False);

	def update(self):
		pass;

	def afterEditing(self):
		if self.RETURN_ID == None: self.RETURN_ID = 'MAIN';
		self.parentApp.setNextForm(self.RETURN_ID);


# -=-=- MAIN -=-=- #
#
def main():
	pass;
#
if __name__ == '__main__':
	main();
## EOF
