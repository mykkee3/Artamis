#!/bin/bash



# Artamis starting point
#
# TODO: add verbose features
#		add verbose features
#

# -=-=-=-=-=-=-=-=-=- #
#
# ArgParsing
#
# -=-=-=-=-=-=-=-=-=- #

# Globals and constants
VERBOSE=false;
DO_PYTHON=true;
DO_CHROME=true;

POSITIONAL=();
while [[ $# -gt 0 ]]
do
key="$1"

help_text(){
	echo 
	echo "help text"
	echo 
};

case $key in
    -t|--testing)
	VERBOSE=true;
	DO_PYTHON=true;
	DO_CHROME=flase;
    shift # past argument
	;;
    -v|--verbose)
	VERBOSE=true;
    shift # past argument
	;;
	-p|--python)
	DO_PYTHON="$2"
	shift; shift
	;;
    --no-python)
    DO_PYTHON=false;
    shift # past argument
    ;;
	-c|--chrome)
	DO_CHROME="$2"
	shift; shift
	;;
    --no-chrome)
    DO_CHROME=false;
    shift # past argument
    ;;
    -h|--help)
	help_text;
	exit 0;
    shift # past argument
	;;
    *)    # unknown option
    POSITIONAL+=("$1") # save it in an array for later
    shift # past argument
    ;;
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters

if $VERBOSE; then
	echo "VERBOSE   = ${VERBOSE}"
	echo "DO PYTHON = ${DO_PYTHON}"
	echo "DO CHROME = ${DO_CHROME}"
	if [[ -n $1 ]]; then
	    echo "Last line of file specified as non-opt/last argument:"
	    tail -1 "$1"
	fi
fi

# EOF


echo
echo \#------------------\#
echo \# Starting Artamis \#
echo \#------------------\#
echo

#echo "Checking for updates..."
#sh update.sh
#echo

# load manifest info
version="0.1.0 pre-alpha";
incarnation=0;

# Display version and startup information
echo "Version: $version \tIncarnaion: $incarnation \n"
echo "Some other important information regarding the startup system.\n"

# Starting Internal server
if [ ! -p server_inpipe ]; then mkfifo server_inpipe; fi
if [ ! -p server_outpipe ]; then mkfifo server_outpipe; fi

if $DO_PYTHON; then
	cmd="python ServerStart.py server_inpipe server_outpipe -v"
	echo "Starting: python ServerStart.py"
	$cmd &
fi

echo "Waiting for internal server."
while $DO_PYTHON;
do
	if read line < server_outpipe; then
		if [ ! -z "$line" ]; then
			break
			fi
		fi
done
echo "Server state up \tAddress: $line\n"

if ! $DO_CHROME; then
	echo "Stopping early!\n"
	if ! $DO_PYTHON; then exit 0; fi
	#
	echo "Press any key to stop server"
	read killing
	if $DO_PYTHON; then echo "kill" >server_inpipe; fi
	exit 0;
fi

# Main
unclutter -idle 1 &
# start chrome
echo "Starting Chromium browser"
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' ~/.config/chromium/'Local State'
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/; s/"exit_type":"[^"]\+"/"exit_type":"Normal"/' ~/.config/chromium/Default/Preferences
chromium-browser --new-window --disable-infobars --incognito --kiosk 'http://0.0.0.0:8080/Mirror/'
#wait
# cleanup routine
echo Starting Shutdown
echo "kill" >server_inpipe
echo
sleep 5
echo Done! 

# done now exiting
