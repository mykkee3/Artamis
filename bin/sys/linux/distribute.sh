#!/bin/bash

# This file distributes all of the linux system files around the file system ass needed
#
# INFO: The info for this folder can be found in /../README.md

sys_dir="/home/Artamis/"

cd /home/pi/Desktop/dev/Artamis/bin/sys/

sudo cp autoArtamis.desktop ~/.config/autostart/

mkdir /home/Artamis/
sudo cp artamis.sh $sys_dir
sudo cp update.sh $sys_dir