#!/usr/bin/env python

# -=-=- Imports -=-=- #

from os.path import expanduser as path_expanduser

# -=-=- Globals & Constants -=-=-  #
#


# -=-=- Functions & Classes -=-=- #
#

class Template():
	def __init__ (self):
		pass;
	
	def get_template(self, ID):
		if ID in globals().keys():
			return globals()[ID];	

	def get_lang_templates(self, lang):
		return [i for i in globals() if i.startswith('%s_'%(lang))];

	def temp_to_file(self, temp, filepath):
		if filepath.startswith('~'):
			filepath = path_expanduser(filepath);
		with open(filepath, 'w+') as outfile:
			outfile.write(temp);

# -=-=- Templates -=-=- #
#
# BEGIN

# -=- Python -=- #
python_blank = '''\
#!/usr/bin/env python

# -=-=- Imports -=-=- #

import logging

# -=-=- Globals & Constants -=-=-  #
#

LOG = logging.getLogger('root');
#LOG.setLevel(logging.INFO);
#FH = logging.FileHandler('./bin/log.log');
#LOG.addHandler(FH);


# -=-=- Functions & Classes -=-=- #
#



# -=-=- MAIN -=-=- #
#
def main():
	pass;
#
if __name__ == '__main__':
	main();
## EOF\
'''

python_npyscreen_HandlerForm = '''\
#!/usr/bin/env python

# -=-=- Imports -=-=- #

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
		self.name = 'Form Name'
		#
		"""Start here!"""
		#

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
## EOF\
'''


# END #

# -=-=- MAIN -=-=- #
#
def main():
	pass;
	t = Template();
	temp = t.get_template('python_blank');
	#t.temp_to_file(temp, 'test.py');
#
if __name__ == '__main__':
	main();
## EOF
