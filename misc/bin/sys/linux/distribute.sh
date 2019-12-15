#!/bin/bash

# This file distributes all of the linux system files around the file system ass needed
#
# INFO: The info for this folder can be found in /../README.md

echo "Distributing [~/bin/sys/linux/] Files..."

sys_dir="/home/Artamis/"

cd /home/pi/dev/Artamis/bin/sys/linux/

echo "[~/.config/autostart/autoArtamis.desktop]"
sudo cp -rf autoArtamis.desktop ~/.config/autostart/

sudo mkdir /home/Artamis/
echo "[/home/Artamis/artamis.sh]"
sudo cp -rf artamis.sh $sys_dir
echo "[/home/Artamis/update.sh]"
sudo cp -rf update.sh $sys_dir

echo "... Done"
