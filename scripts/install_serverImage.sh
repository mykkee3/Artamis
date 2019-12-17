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


# -=-=- disk select -=-=- #
#

disks=$(lsblk -l | awk '!/sda|sr.|sd.[0-9]/{if (NR!=1) {print $1, $4} }');
ndisks=$(echo $disks | wc -l | awk '{print $1}');
if [ -z i"$disks" ]; then
	echo "No disks available"
	exit 0
elif [ $ndisks -eq 1 ]; then
	disk=$(echo "$disks" | awk '{print $1}')
else
	echo "Please select a disk:"
	echo
	echo "$disks" | awk '{print NR " - " $0}'
	read -p "What disk do you want to select? " dsk_sel
	if [ $dsk_sel -gt $ndisks ]; then
		echo
		echo "Invalid selection"
		exit 0
	else
		disk=$(echo "$disks" | sed -n "$dsk_sel"p);
	fi
fi
#old code
#disk=$(lsblk -l | awk '!/sda|sr.|sd.[0-9]/{if (NR!=1) {print $1, $4} }' | dmenu -l 6 -p "Seleck a Disk" | awk '{print $1}');


# -=-=- image select -=-=- #
#

img_path=~/Downloads/raspi/
mkdir $img_path

infiles=$(grep -rl .*\.img $img_path | awk '/.img/{print $0}');
ninfiles=$(echo "$infiles" | wc -l);
if [ -z "$infiles" ]; then
	echo "No available images."
	#TODO: add auto download
	exit 0
elif [ $ninfiles -eq 1 ]; then
	infile=$infiles
else	
	echo "Please select an image file:"
	echo
	echo "$infiles" | awk '{print NR " - " $0}'
	read -p "What image do you wanto to select? " img_sel
	if [ $img_sel -gt $ninfiles ]; then
		echo
		echo "Invalid selection"
		exit 0
	else
		infile=$(echo "$infiles" | sed -n "$img_sel"p);
	fi
fi
#old code
#infile=$(grep -rl .*\.img $img_path | awk '/.img/{print $0}' | dmenu -l 6 -p "Select an Image");


# -=-=- Unmount disks -=-=- #
#

lsblk -l | awk "/$disk/"'{print "/dev/" $1}' | xargs -n1 sudo umount -v

resp=$(lsblk -l | awk "/$disk/"'{if ($7!="") {print $1}}');

if [ ! -z "$resp" ]; then
	echo
	echo "$resp" | awk '{print $0, "was not unmounted properly."}'
	echo Installation not complete, exiting early.
	exit 0;
fi


# -=-=- Data input -=-=- #
#

echo
echo "==========================="
echo
#read -p "Enter a hostname: " hostname
read -p "Enter an ip host 192.168.100." ip_host


# -=-=- Write to disks -=-=- #
#

echo 
echo "==========================="
echo
echo "Writing to disk"
echo
echo "==========================="
echo
echo "Selected disk: $disk"
echo "Selected image: $infile" #TODO: display shorter
echo
echo "==========================="
echo

write_disk () {
	sudo dd bs=1M if=$infile of=/dev/$disk status=progress conv=fsync
};

do_continue () {
	echo
	while true; do
	    read -p "Do you want to continue with formating? [Y/n]" yn
	    case $yn in 
	        [Yy]* ) break;; 
	        [Nn]* ) exit 0;;
	        * ) echo "Please answer with [Y/n]";;
	    esac
	done
}

while true; do
    read -p "Do you want to write to $disk? [Y/n] " yn
    case $yn in
        [Yy]* ) write_disk; break;;
        [Nn]* ) do_continue; break;;
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
sleep 1

echo
echo "==========================="
echo

# add installer
sudo cp -v raspi/.bash_profile /mnt/raspi-disk/home/pi/
sudo cp -v raspi_server/installation_line.sh /mnt/raspi-disk/home/pi/

echo
echo "==========================="
echo

echo "Setting up network"

# append to internet
# /etc/dhcpcd.conf
echo "
interface eth0
static ip_address=192.168.100.$ip_host/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1" | sudo tee -a /mnt/raspi-disk/etc/dhcpcd.conf

echo
echo "==========================="
echo

sudo umount -v $mnt_disk
sudo umount -v /dev/$disk

# =========================================================

echo
mnt_disk=/dev/"$disk"1
sudo umount -v $mnt_disk
sudo mount -v $mnt_disk /mnt/raspi-disk/

echo
lsblk
sleep 1

echo
echo "==========================="
echo

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
