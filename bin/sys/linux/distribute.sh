#!/bin/bash

# This file distributes all of the linux system files around the file system ass needed
#
# INFO: The info for this folder can be found in /../README.md

sys_dir="/home/Artamis/"

cd /home/pi/Desktop/dev/Artamis/bin/sys/linux/

sudo cp -rf autoArtamis.desktop ~/.config/autostart/

sudo mkdir /home/Artamis/
sudo cp -rf artamis.sh $sys_dir
sudo cp -rf update.sh $sys_dir