#!/usr/bin/env python

# -=-=- Imports -=-=- #

import npyscreen
import logging
import imp as _import

import os
import fnmatch

import subprocess

# -=-=- Globals & Constants -=-=- #
#

LOG = logging.getLogger('root');
LOG.setLevel(logging.INFO);
FH = logging.FileHandler('./bin/log.log', 'w+');
LOG.addHandler(FH);


# -=-=- Functions & Classes -=-=- #

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

class SubForm ( npyscreen.ActionFormMinimal ):
	"""
	SettingsManager sub form. it redirects back to 'MAIN' when finished
	"""
	def on_ok(self):
		self.parentApp.setNextForm('MAIN');

###


class MainForm (npyscreen.ActionFormMinimal):
		"""
		Provides the list select for the App
		"""
		def create(self):
			self.DATA = self.parentApp.DATA;
			self.LOOKUP = {value['text']:key for (key,value) in self.DATA.items()};
			#
			msg1 = 'To compile a `.ino` file select it from the list below.'
			self.add(npyscreen.FixedText, value=msg1, editable=False);
			self.nextrely += 1;
			self.add(npyscreen.ButtonPress, name='Configure ArduinoIDE', on_pressed_function=self._configure_button, relx=30);
			self.nextrely += 1;
			#
			self.s1 = self.add(ListSelect, name='File Select', action=self.handle, values=self._get_files(), scroll_exit=True);
			#
			
		def on_ok(self):
			self.parentApp.setNextForm(None);
			#

		def handle(self, selected, keyPress):
			tmp_dir = '/home/artamis/sketchbook/tmp';
			makefile = '/home/artamis/sketchbook/Makefile';
			rp = lambda a, x, y: y.join(a.split(x));
			ex = """
			rm -rf <tmp_dir>/*
			cp %(selected)s <tmp_dir>
			cp %(makefile)s <tmp_dir>
			cd <tmp_dir>
			make upload clean
			rm -rf <tmp_dir>/*
			"""%locals();
			ex = rp(rp(ex, '\t',''), '<tmp_dir>', tmp_dir);
			#LOG.info(ex);
			#
			npyscreen.notify('Running command')
			#
			p = subprocess.Popen(ex, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE);
			#p = subprocess.Popen(ex, shell=True);
			stdout, stderr = p.communicate();
			LOG.info(stdout);
			LOG.info(stderr);
			#
			npyscreen.notify('Done!!')
			#self.display();
			exit(0);

		def _configure_button(self):
			pass;

		def _get_files(self):
			pass;
			root_dir = '/home/artamis/sketchbook';
			ret = [];
			for root, dirr, files in os.walk(root_dir):
				for item in fnmatch.filter(files, "*.ino"):
					ret.append('%s/%s'%(root, item));
			ret.sort();
			return ret;
	

		def _switch_form(self, ID):
			# key_press 10 : Enter 32 : Space
			#
			if (ID in self.LOOKUP.keys()):
				self.parentApp.switchForm(self.LOOKUP[ID])
			else:
				self.parentApp.switchForm(None);



class ArduinoIdeApp ( npyscreen.NPSAppManaged ):
	"""
	This is the Main app
	"""
	def onStart (self):
		#
		self.name = 'ArtamisApp V0.0.1';
		#
		self.FORMS = {};
		self.DATA = {
			'MAIN':{
				'text':'Main',
				'class': MainForm 
			},
			'TEST':{
				'text':'Test',
				'class': SubForm
			}
		};
		#	
		for ID in self.DATA.keys():
			TXT = self.DATA[ID]['text'];
			CLASS = self.DATA[ID]['class'];
			self.FORMS[ID] = self.addForm(ID, CLASS, name=TXT, minimum_columns=20);
		#
		


# -=-=- MAIN -=-=- #
#
def main():
	app = ArduinoIdeApp();
	app.run();
#
if __name__ == "__main__":
	main();


