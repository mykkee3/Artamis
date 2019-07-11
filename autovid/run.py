#!/usr/bin/env python

# -=-=- Imports -=-=- #

import logging

import autovid

# -=-=- Globals & Constants -=-=-  #
#

LOG = logging.getLogger('root');
LOG.setLevel(logging.INFO);
FH = logging.FileHandler('./bin/log.log', 'w+');
LOG.addHandler(FH);


# -=-=- Functions & Classes -=-=- #
#


# -=-=- MAIN -=-=- #
#
def main():
	autovid.make_video({
		'inpath':'/home/share/Videos/bin/button_chip_1/',
		'outpath':'/home/share/Videos/bin/',
		'outfile':'test.mov'
	});
#
if __name__ == '__main__':
	main();
## EOF
