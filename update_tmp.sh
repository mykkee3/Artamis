echo "\nStarting Update shell"

cur_ver=$(jq --raw-output '.info.version' manifest.json);
new_ver=$(curl "https://raw.githubusercontent.com/mykkee3/Artamis/master/manifest.json" | jq --raw-output '.info.version')

echo "\nCurrent version: $cur_ver\nExpected version: $new_ver"
if [ "$cur_ver" != "$new_ver" ] && [ ! -z "$new_ver" ]; then
	echo "Version Mismatch - comparing versions";
	dpkg --compare-versions "$cur_ver" "lt" "$new_ver"
	res=$?
	if [ "$res" = "0" ]; then
		echo "Older Version - starting update";
		git fetch --all
		git pull origin master
		git reset --hard origin/master
		
	else
		echo "Version $cur_ver is up to date"
	fi
fi

echo "\nUpdate shell Done"