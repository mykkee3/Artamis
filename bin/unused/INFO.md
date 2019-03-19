# INFO.md

**DO NOT REMOVE `/unused/` It is essential**

Add usefull info here.

## autostart solution
issue: unable to autostart from rc.local but was unable to. 

solution from : https://www.reddit.com/r/raspberry_pi/comments/7xi5zl/command_to_open_browser_on_startup/

	bashrc only alters the bash shell if you happen to use it, and rc.local does not impact your window manager of choice.

	Here's how with raspbian and the default window manager that comes with the operating system.

	Create a new `.desktop` file in `~/.config/autostart/` e.g.

	`sudo nano ~/.config/autostart/autoChromium.desktop`

	Then add the following.
	`
	[Desktop Entry]
	Type=Application
	Exec=/usr/bin/chromium-browser --noerrdialogs --disable-session-crashed-bubble --disable-infobars --kiosk http://www.website.com
	Hidden=false
	X-GNOME-Autostart-enabled=true
	Name[en_US]=AutoChromium
	Name=AutoChromium
	Comment=Start Chromium when GNOME starts
	`
	Then reboot. Chromium should automatically launch in kiosk mode after the desktop has loaded.

## Empty