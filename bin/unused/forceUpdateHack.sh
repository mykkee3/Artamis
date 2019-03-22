#!/bin/bash
# WARNING: Will not work if run with sh; run with bash, eg: `bash forceUpdateHack.sh`
cd /home/pi/Desktop/dev/Artamis/

# Set Variables #
p=4; #Place in the version to decrement including the dot
# WARNING: probably wont work with 0 or . so dont do it; besides a version '.0' should not need be force updated

cur_ver=$(jq --raw-output '.info.version' manifest.json);
new_ver=${cur_ver:0:p}$((${cur_ver:p}-1));

# Some Printing #
echo "~/bin/unused/forceUpdateHack.sh";
echo "changing ~/manifest.json/.info.version from $cur_ver to $new_ver.";

# Switch the Versions #
sed -i 's/$cur_ver/$new_ver/' manifest.json;
