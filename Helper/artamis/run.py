#!/usr/bin/env python

# -=-=- Imports -=-=- #

import npyscreen
import logging
import imp as _import

from os.path import join as path_join

from lib.npyscreenClasses import ListSelect

# -=-=- Globals & Constants -=-=- #
#

LOG = logging.getLogger('root');
LOG.setLevel(logging.INFO);
FH = logging.FileHandler('./bin/log.log', 'w+');
LOG.addHandler(FH);


# -=-=- Functions & Classes -=-=- #


class MenuForm (npyscreen.ActionFormMinimal):
		"""
		Provides the list select for the App
		"""
		def create(self):
			self.name = 'Artamis App';
			#
			self.DATA = self.parentApp.DATA;
			self.LOOKUP = {value['text']:key for (key,value) in self.DATA.items()};
			#
			self.sel = self.add(ListSelect, action=self.handle, values=self.LOOKUP.keys(), scroll_exit=True);
		
		def on_ok(self):
			self.parentApp.setNextForm(None);
			#

		def handle(self, selected, key_press):
			# key_press 10 : Enter 32 : Space
			#
			if (selected in self.LOOKUP.keys()):
				self.parentApp.switchForm(self.LOOKUP[selected])
			else:
				self.parentApp.switchForm(None);



class ArtamisApp ( npyscreen.NPSAppManaged ):
	"""
	This is the Main app
	"""
	def onStart (self):
		#
		self.name = 'ArtamisApp V0.0.1';
		#
		self.FORMS = {};
		self.DATA = {
			'CODING_FORM':{
				'text':'Coding Form',
				'class': 'CodingForm.py',
				'files': {
					'populate_dir.py':'populate a directory with files',
					'test.py' : 'test option for testing'
				}
			},
			'TEST':{
				'text':'Test',
				'class': 'test.py'
			}
		};
		#
		self.addForm('MAIN', MenuForm, name=self.name, minimum_columns=20);
		for ID in self.DATA.keys():
			TXT = self.DATA[ID]['text'];
			CLASS = self.DATA[ID]['class'];
			if (isinstance(CLASS, str)):
				self._loadForm(ID, CLASS);
			else:
				self.FORMS[ID] = self.addForm(ID, CLASS, minimum_columns=20);
				self.FORMS[ID].ID = ID;
				self.FORMS[ID].RETURN_ID = 'MAIN';
			self.FORMS[ID].update();
		#

	def _loadForm (self, ID, filepath, RETURN_ID='MAIN'):
		filepath = path_join('./lib', filepath);
		"""
		import file (check against other imports for same path)
		
		look for a FormHandle object and switch to it
		when leaving switch back
		"""
		if not ID in self.FORMS.keys():
			module = _import.load_source(filepath[0:-3], filepath);
			CLASS = module.HandlerForm;
			self.FORMS[ID] = self.addForm(ID, CLASS, minimum_columns=20);
			self.FORMS[ID].ID = ID;
			self.FORMS[ID].RETURN_ID = RETURN_ID;
		#


# -=-=- MAIN -=-=- #
#
def main():
	app = ArtamisApp();
	app.run();
#
if __name__ == "__main__":
	main();


