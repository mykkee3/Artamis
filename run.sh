#
# Artamis starting point
#
# TODO: add verbose features
#		add verbose features
#

echo
echo \#------------------\#
echo \# Starting Artamis \#
echo \#------------------\#
echo

echo "Checking for updates..."
sh update.sh
echo

# Globals and constants
verbose=false;
do_python=true;
do_chrome=true;

# load manifest info
version="0.1.0 pre-alpha";
incarnation=0;

# Display version and startup information
echo "Version: $version \tIncarnaion: $incarnation \n"
echo "Some other important information regarding the startup system.\n"

# Starting Internal server
if [ ! -p server_inpipe ]; then mkfifo server_inpipe; fi
if [ ! -p server_outpipe ]; then mkfifo server_outpipe; fi

if $do_python; then
	cmd="python ServerStart.py server_inpipe server_outpipe -v"
	echo "Starting: python ServerStart.py"
	$cmd &
fi

echo "Waiting for internal server."
while $do_python;
do
	if read line < server_outpipe; then
		if [ ! -z "$line" ]; then
			break
			fi
		fi
done
echo "Server state up \tAddress: $line\n"

if ! $do_chrome; then
	echo "Stopping early, '--testing' is set true.\n"
	echo "Press any key to stop server"
	read killing
	if $do_python; then echo "kill" >server_inpipe; fi
	exit 0;
fi

# Main
unclutter -idle 1 &
# start chrome
echo "Starting Chromium browser"
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' ~/.config/chromium/'Local State'
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/; s/"exit_type":"[^"]\+"/"exit_type":"Normal"/' ~/.config/chromium/Default/Preferences
chromium-browser --new-window --disable-infobars --incognito --kiosk 'http://0.0.0.0:8080/Artamis_Bird/'
#wait
# cleanup routine
echo Starting Shutdown
echo "kill" >server_inpipe
echo
sleep 5
echo Done! 

# done now exiting