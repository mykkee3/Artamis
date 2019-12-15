#!/bin/sh

# -=-=- 
#
# Header
#
# -=-=-

echo
echo "==========================="
echo
echo "Starting the Raspberry-Pi installation"
echo
echo "==========================="
echo

echo "Password is required for installation..."
sudo true

echo
echo "First a disk must be selected"

sleep 1;

disk=$(lsblk -l | awk '!/sda|sr.|sd.[0-9]/{if (NR!=1) {print $1, $4} }' | dmenu -l 6 -p "Seleck a Disk" | awk '{print $1}');

img_path=~/Inbox/raspi/

infile=$(grep -rl .*\.img $img_path | awk '/.img/{print $0}' | dmenu -l 6 -p "Select an Image");

echo
echo "Selected disk: $disk"
echo "Selected image: $infile" #TODO: display shorter
echo

#run check on $disk and $infile
 
echo "==========================="
echo

# unmount disk

lsblk -l | awk "/$disk/"'{print "/dev/" $1}' | xargs -n1 sudo umount -v

resp=$(lsblk -l | awk "/$disk/"'{if ($7!="") {print $1}}');

if [ ! -z "$resp" ]; then
	echo
	echo "$resp" | awk '{print $0, "was not unmounted properly."}'
	echo Installation not complete, exiting early.
	exit 0;
fi

echo 
echo "==========================="
echo
echo "Writing to disk"
echo

write_disk () {
	sudo dd bs=1M if=$infile of=/dev/$disk status=progress conv=fsync
	#sudo dd if=$infile of=/dev/$disk status=progress conv=fsync
};

while true; do
    read -p "Do you want to write to $disk? [Y/n] " yn
    case $yn in
        [Yy]* ) write_disk; break;;
        [Nn]* ) break;;
        * ) echo "Please answer with [Y/n]";;
    esac
done

#TODO: do checks on conpletion stuff

echo 
echo "==========================="
echo
echo "Changing OS stuff"
echo
echo "==========================="
echo

# mount usb

mnt_disk=/dev/"$disk"2

sudo mkdir -v /mnt/raspi-disk/
sudo mount -v $mnt_disk /mnt/raspi-disk/

echo

lsblk

echo
echo "==========================="
echo

# add installer
sudo cp -v .bash_profile /mnt/raspi-disk/home/pi/
sudo cp -v installation_line.sh /mnt/raspi-disk/home/pi/

# append to internet
# /etc/dhcpcd.conf
echo "
interface eth0
static ip_address=192.168.100.5/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1" | sudo tee -a /mnt/raspi-disk/etc/dhcpcd.conf
sudo umount -v $mnt_disk
sudo umount -v /dev/$disk

# =========================================================

sleep 1

echo
mnt_disk=/dev/"$disk"1
sudo umount -v $mnt_disk
sudo mount -v $mnt_disk /mnt/raspi-disk/

# enable ssh
sudo touch /mnt/raspi-disk/ssh

sudo umount -v $mnt_disk
sudo umount -v /dev/$disk

# =========================================================

echo
echo "==========================="
echo
echo "Finishing up"
echo

sleep 1

echo
echo "==========================="
echo
echo "\tDone!\t\t^v^"
echo
echo "==========================="
echo
# boot pi as vertual box

# EOF
