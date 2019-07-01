#!/usr/bin/env python

# -=-=- Imports -=-=- #

from __future__ import absolute_import
from os.path import join as path_join
from os.path import splitext as path_split_text

from lib._templates import Template

import logging
import npyscreen

# -=-=- Globals & Constants -=-=-  #
#

LOG = logging.getLogger('root');
#LOG.setLevel(logging.INFO);
#FH = logging.FileHandler('./bin/log.log');
#LOG.addHandler(FH);

template = Template();

# -=-=- Functions & Classes -=-=- #
#


class _EXT ( npyscreen.Form ):
	def _create (self):
		self.RETURN_ID = None;
		self.EXT_DATA = None;
		self.parent = None;
		#

	def update(self):
		"""A class for the user to overwrite"""
		pass;

	def pullData(self):
		"""A class for the user to overwrite"""
		pass;

	def afterEditing(self):
		self.pullData();
		#
		if self.RETURN_ID == None: self.RETURN_ID = 'MAIN';
		if isinstance(self.RETURN_ID, list):
			RETURN = self.RETURN_ID.pop(0);
		else:
			RETURN = self.RETURN_ID;
		#
		if RETURN in self.parent.EXT_FORMS.keys():
			self.parent.EXT_FORMS[RETURN].RETURN_ID = self.RETURN_ID;
			self.parent.EXT_FORMS[RETURN].EXT_DATA = self.EXT_DATA;
			self.parent.EXT_FORMS[RETURN].parent = self.parent;
			self.parent.EXT_FORMS[RETURN].update();
		else:
			self.parent.EXT_DATA = self.EXT_DATA;
		#
		self.parentApp.setNextForm(RETURN);


class EXT_Skip ( _EXT ):
	def create (self):
		self._create();
		self.name = 'Skipping EXT config';
		#
		msg = 'Skipping adding templates to the files below.';
		self.add(npyscreen.FixedText, value=msg, editable=False);
		self.nextrely += 1;
		self.t1 = self.add(npyscreen.FixedText, editable=False);

	def update(self):
		self.t1.value = 'files : %s'%(' '.join(self.EXT_DATA['SKIP']));
		#


class EXT_Blank ( _EXT ):	
	def create (self):
		self._create();
		self.name = 'Blank EXT Config';
		#
		self.add(npyscreen.FixedText, value='Blank File handler for now just leaves them blank for now.', editable=False);
		#self.nextrely += 1;
		self.t1 = self.add(npyscreen.FixedText, editable=False);
		self.nextrely += 1;
		#
		#self.s1 = self.add(npyscreen.TitleMultiSelect, name='Template Select', scroll_exit=True);
	

	def update(self):
		self.t1.value = 'files : %s'%(' '.join(self.EXT_DATA['BLANK']));
		self.s1.value = [];
		self.s1.values = template.get_lang_templates('blank');
	


class EXT_Python ( _EXT ):
	def create (self):
		self._create();
		self.name = "Python EXT Config"
		#
		self.t1 = self.add(npyscreen.FixedText, editable=False)
		self.nextrely += 1;
		#
		self.s1 = self.add(npyscreen.TitleSelectOne, name='Template Select', scroll_exit=True);

	def update (self):
		self.t1.value = 'files : %s'%(' '.join(self.EXT_DATA['.py']));
		self.s1.value = [];
		self.s1.values = template.get_lang_templates('python');

	def pullData (self):
		temps = [self.s1.values[i] for i in self.s1.value];
		for filename in self.EXT_DATA['.py']:
			self.parent.FILES[filename]['data'] = temps;


class HandlerForm( npyscreen.ActionFormMinimal, npyscreen.SplitForm ):
	def create (self):
		self.RETURN_ID = None;
		self.FILES = {};
		self.EXT_DATA = None;
		self.EXT = {
			'BLANK':EXT_Blank,
			'SKIP':EXT_Skip,
			'.py':EXT_Python
		};
		self.EXT_FORMS = {};
		#
		formKwargs = {'minimum_columns':20};
		for ID, formClass in self.EXT.items():
			self.EXT_FORMS[ID] = self.parentApp.addForm(ID, formClass, **formKwargs);
			#self.EXT_FORMS[ID].RETURN_ID = self.ID;
		#
		self.draw_line_at = 7;
		self.name = 'Populate Directory';
		#
		msg = 'Enter all the file paths, then configure the templates.'
		self.add(npyscreen.FixedText, value=msg, editable=False)
		#
		self.f1 = self.add(npyscreen.TitleText, name='Head Path', value='~/', rely=4);
		self.f2 = self.add(npyscreen.TitleText, name='File Path', value='');
		self.b1 = self.add(npyscreen.ButtonPress, name='Add File', when_pressed_function=self._add_file_button);
		#
		self.b2 = self.add(npyscreen.ButtonPress, name='Remove Selected Files', relx=25, rely=6, when_pressed_function=self._remove_file_button);
		self.s1 = self.add(npyscreen.TitleMultiSelect, name='File Select', rely=8, height=12,  scroll_exit=True)
		self.b3 = self.add(npyscreen.ButtonPress, name='Configure', when_pressed_function=self._configure_button);
		self.nextrely -= 1;
		self.b4 = self.add(npyscreen.ButtonPress, name='Populate', relx=25, when_pressed_function=self._populate_button);

		#LOG.info(str(dir(self.lines)));
	
	def on_ok (self):
		if self.RETURN_ID == None: self.RETURN_ID = 'MAIN';
		self.parentApp.setNextForm(self.RETURN_ID);

	def _switch_to_form (self, ID, data):
		_ID = ID;
		if isinstance(_ID, list): _ID = ID.pop(0);
		if _ID in self.EXT_FORMS.keys():
			self.EXT_FORMS[_ID].RETURN_ID = ID;
			self.EXT_FORMS[_ID].EXT_DATA = data;
			self.EXT_FORMS[_ID].parent = self;
			self.EXT_FORMS[_ID].update();
		self.parentApp.switchForm(_ID);

	def _add_file_button (self):
		if (self.f2.value == ''): return;
		#
		f1 = self.f1.value;
		f2 = self.f2.value;
		filename, ext = path_split_text(f2);
		filepath = path_join(f1, f2);
		if ext == '': ext = 'BLANK';
		if not ext in self.EXT.keys(): ext = 'SKIP';
		#
		self.f2.value = '';
		if (filepath in self.FILES.keys()):
			self.display();
			return;
		#
		data = {
			'filepath' : filepath,
			'filename' : filename,
			'ext' : ext,
			'data' : []
		};
		self.FILES[filepath] = data;
		self.s1.values.append(filepath);
		#
		self.display();
		msg = "adding filepath : %s\n\tfilename : %s\n\textention : %s"
		LOG.info(msg%(filepath, filename, ext));
		
	def _remove_file_button (self):
		if (self.s1.value == []): return;
		#
		s1 = self.s1.value;
		s1.sort();
		s1.reverse();
		#
		sv = self.s1.values;
		rm = [sv[i] for i in s1];
		#
		for i in s1:
			del self.FILES[sv[i]];
			del sv[i];
		#
		self.s1.value = [];
		self.s1.values = sv;
		#
		self.display();
		LOG.info('removing paths : %s'%(', '.join(rm)));

	def _configure_button (self):
		if (self.s1.value == []): return;
		#
		s1 = self.s1.value;
		s1.sort();
		#s1.reverse();
		#
		sv = self.s1.values;
		editing = [sv[i] for i in s1];
		#
		self.s1.value = [];
		self.display();
		#
		data = {};
		for filepath in editing:
			ext = self.FILES[filepath]['ext'];
			if (not ext in data.keys()): data[ext] = [];
			data[ext].append(filepath);
		#
		LOG.info('Configuring files');
		for (ext,files) in data.items():
			LOG.info('%s : \n\t%s'%(ext, '\n\t'.join(files)));
		#
		forms = [i for i in data.keys() if (i in self.EXT.keys())];
		forms.append(self.ID);
		self._switch_to_form(forms, data);
		#

	def _populate_button (self):
		if not npyscreen.notify_yes_no('Are you sure you want to populate files?'): return;
		#
		LOG.info('populating files');
		for (filepath, filedata) in self.FILES.items():
			data = filedata['data'];
			LOG.info('\t%s : %s'%(filepath, str(data)));
			if len(data) == 0:
				template.temp_to_file('', filepath);
			elif len(data) == 1:
				temp = template.get_template(data[0]);
				template.temp_to_file(temp, filepath);
			else:
				pass;


# -=-=- MAIN -=-=- #
#
def main():
	pass;
#
if __name__ == '__main__':
	main();
## EOF
