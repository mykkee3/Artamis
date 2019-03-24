echo "Starting Update...";
echo
sudo apt-get update;
sudo apt-get upgrade -y;
echo
echo "Done!"

echo "Starting Reboot..."
sudo reboot;
