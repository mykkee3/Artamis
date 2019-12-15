#
# Artamis starting point
#
#

echo
echo \#------------------\#
echo \# Starting Artamis \#
echo \#------------------\#
echo

# Display version and startup information
echo "Test startup script for piping"

# Starting Internal server
if [ ! -p server_inpipe ]; then mkfifo server_inpipe; fi
if [ ! -p server_outpipe ]; then mkfifo server_outpipe; fi

python Test.py server_inpipe server_outpipe -v &

while true
do
	if read line <server_outpipe; then
		if [ -z "$line" ]; then
			break
			fi
			echo $line
		fi
done

sleep 1
echo "ping" >server_inpipe
sleep 1
echo "ping" >server_inpipe
sleep 1
echo "ping" >server_inpipe
sleep 1
echo "ping" >server_inpipe
sleep 1
echo "ping" >server_inpipe
sleep 1
echo "kill" >server_inpipe
sleep 1

#echo Waiting for internal server.
#sleep 5

# Main
#unclutter -idle 1 &
# start chrome
#echo "Starting Chromium browser"
#sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' ~/.config/chromium/'Local State'
#sed -i 's/"exited_cleanly":false/"exited_cleanly":true/; s/"exit_type":"[^"]\+"/"exit_type":"Normal"/' ~/.config/chromium/Default/Preferences
#chromium-browser --new-window --disable-infobars --incognito --kiosk 'http://0.0.0.0:8080/Artamis_Bird/'
#wait
# cleanup routine
#echo Starting Shutdown
#echo "kill" >server_inpipe
#echo
#echo Done! 

# done now exiting