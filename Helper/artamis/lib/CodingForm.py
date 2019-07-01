#!/usr/bin/env python

# -=-=- Imports -=-=- #

from __future__ import absolute_import
import logging
import npyscreen

from lib.npyscreenClasses import ListSelect
from lib._templates import Template

# -=-=- Globals & Constants -=-=-  #
#

LOG = logging.getLogger('root');
#LOG.setLevel(logging.INFO);
#FH = logging.FileHandler('./bin/log.log');
#LOG.addHandler(FH);


# -=-=- Functions & Classes -=-=- #
#
class HandlerForm ( npyscreen.ActionFormMinimal ):
	def create(self):
		self.RETURN_ID = None;
		self.name = 'Coding Form';
		#
		self.s1 = self.add(ListSelect, action=self.handle, scroll_exit=True);

	def update(self):
		#self.ID = 'CODING_FORM';
		self.FILES = self.parentApp.DATA[self.ID]['files']
		self.LOOKUP = {value:key for (key,value) in self.FILES.items()};
		#
		vals = [i for i in self.LOOKUP];
		self.s1.values = vals;
		self.display();
	
	def handle(self, selected, key_press):
		filepath = self.LOOKUP[selected];
		#
		self.parentApp._loadForm(filepath, filepath, self.ID);
		self.parentApp.switchForm(filepath);
		#
		LOG.info('CODING_FORM handle : %s'%(filepath));

	def on_ok(self):
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
