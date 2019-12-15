#!/usr/bin/env python


# -=-=- Imports -=-=- #
#

import npyscreen
import logging

import os
import fnmatch

import json

# -=-=- Globals & Constants -=-=- #
#

LOG = logging.getLogger('root');
LOG.setLevel(logging.INFO);
FH = logging.FileHandler('./bin/log.log');
LOG.addHandler(FH);


# -=-=- Functions & CLasses -=-=- #
#


class ListSelect (npyscreen.MultiLineAction):
	def actionHighlighted(self, selected, key_press):
		# key_press 10 : Enter 32 : Space
		#
		SETTINGS = self.parent.parentApp.SETTINGS;
		FORMS = { key:SETTINGS[key][0] for key in SETTINGS.keys() }
		if (selected in FORMS.keys()):
			self.parent.parentApp.switchForm(FORMS[selected])
		else:
			self.parent.parentApp.switchForm(None);


class SettingsForm ( npyscreen.Form ):
	def afterEditing(self):
		self.parentApp.setNextForm('MAIN');


class FileSettings ( SettingsForm ):

	def create(self):

		if (self.parentApp.DATA == None):
			self.DATA = None;
		else:
			self.DATA = self.parentApp.DATA["FILE_SETTINGS"];

		self.s1 = self.add(npyscreen.TitleSelectOne, name="Mode Select", scroll_exit=True, height=3, values=["Files","Profile"], value=0);
		self.t1 = self.add(npyscreen.TitleText, name="Script Path", value="./rive/");
		self.b1 = self.add(npyscreen.ButtonPress, name="Refresh", when_pressed_function=self._refreshButton );
		self.s2 = self.add(npyscreen.TitleMultiSelect, name="File Select", scroll_exit=True, rely=8, height=5, values=[]);
		self.s3 = self.add(npyscreen.TitleSelectOne, name="Profile Sel", scroll_exit=True, rely=14, height=3, values=["All", "Bot1", "Bot2"]);
		self.b2 = self.add(npyscreen.ButtonPress, name="Edit Profiles");
		
		# Setup
		self._setValues(self.DATA);
		#self._refreshButton();

	def _refreshButton(self):
		root_dir = self.t1.value;
		#root_dir = "./rive/"
		ret = [];
		for root, dirr, files in os.walk(root_dir):
			#LOG.info(root)
			#LOG.info(dirr)
			for item in fnmatch.filter(files, "*.rive"):
				#LOG.info(root+'/'+item)
				ret.append(root+'/'+item);
		ret.sort();
		self.s2.value = [];
		self.s2.values = ret;
		self.display();
	
	def _setValues(self, data):
		if (data == None): return;
		self.s1.value = data['s1'];
		self.t1.value = data['t1'];
		self.s2.values= data['p1'];
		self.s2.value = data['s2'];
		self.s3.value = data['s3'];

	def _getValues(self):
		ret = {
			's1':self.s1.value,
			't1':self.t1.value,
			'p1':self.s2.values,
			's2':self.s2.value,
			's3':self.s3.value
		};
		return ret;

class UserSettings ( SettingsForm ):

	def create(self):

		if (self.parentApp.DATA == None):
			self.DATA = None;
		else:
			self.DATA = self.parentApp.DATA["USER_SETTINGS"];


		self.p1 = self.add(npyscreen.TitleText, name="User Prompt", value=">>");
		self.p2 = self.add(npyscreen.TitleText, name="Bot  Prompt", value="--");
		self.p3 = self.add(npyscreen.TitleText, name="Train Prompt", value="++");
		self.s1 = self.add(npyscreen.TitleSelectOne, name="Chat Mode", values=["Human", "Bot", "Train"], value=0, rely=6, height=3, scroll_exit=True);
		self.s2 = self.add(npyscreen.TitleSelectOne, name="Waiting Mode", values=["On","Off"], value=1, rely=10, height=3, scroll_exit=True);
		
		# Setup
		self._setValues(self.DATA);

	def _setValues(self, data):
		if (data == None): return;
		self.p1.value = data['p1'];
		self.p2.value = data['p2'];
		self.p3.value = data['p3'];
		self.s1.value = data['s1'];
		self.s2.value = data['s2'];

	def _getValues(self):
		ret = {
			'p1':self.p1.value,
			'p2':self.p2.value,
			'p3':self.p3.value,
			's1':self.s1.value,
			's2':self.s2.value
		};
		return ret;

class RiveSettings ( SettingsForm ):

	def create(self):
		
		if (self.parentApp.DATA == None):
			self.DATA = None;
		else:
			self.DATA = self.parentApp.DATA["RIVE_SETTINGS"];
	
		# Setup
		self._setValues(self.DATA);


	def _setValues(self, data):
		if (data == None): return;
		pass;

	def _getValues(self):
		ret = {};
		return ret;

class MenuForm (npyscreen.ActionFormMinimal):

	def create(self):
		self.sel = self.add(ListSelect, values = self.parentApp.SETTINGS.keys(), scroll_exit=True);
	
	def afterEditing(self):
		pass;

	def on_ok (self):
		self.parentApp.setNextForm(None);
		
		values = {};

		for key in self.parentApp.SETTINGS.keys():
			ID, Class = self.parentApp.SETTINGS[key];
			values[ID] = self.parentApp.FORMS[ID]._getValues();

		#LOG.info(str(values));
		with open('settings.json', 'w+') as outfile:
			json.dump(values, outfile);

class SettingsManager ( npyscreen.NPSAppManaged ):
	def onStart (self):
		
		try:
			with open("settings.json") as infile:
				self.DATA = json.load(infile);
		except IOError as error:
			self.DATA = None;
		
		self.FORMS = {};

		self.SETTINGS = {
			'File Settings':['FILE_SETTINGS', FileSettings],
			'User Settings':['USER_SETTINGS', UserSettings],
			'Rivescript Settings':['RIVE_SETTINGS', RiveSettings]
		}


		self.addForm('MAIN', MenuForm, name='Settings Menu', minimum_columns=20);
		#
		for key in self.SETTINGS.keys():
			ID, Class = self.SETTINGS[key];
			self.FORMS[ID] = self.addForm(ID, Class, name=key, minimum_columns=20);
		#self.addForm('TWO', UserSettings, name='User Settings');
		#self.addForm('THREE', RiveSettings, name='Rivescript Settings');

		#

# -=-=- MAIN -=-=- #
#

def main ():
	pass;
	print "running test";
	man = SettingsManager();
	man.run();

if __name__ == "__main__":
	main();

# EOF
