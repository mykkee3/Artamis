echo "Starting Update...";
echo
sudo apt-get update;
sudo apt-get upgrade -y;
sudo apt-get dist-upgrade -y;
echo
echo "Done!"

echo "Starting Reboot..."
sudo reboot;
