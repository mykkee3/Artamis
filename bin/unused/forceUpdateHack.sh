cd /home/pi/Desktop/dev/Artamis/
#cd /e/dev/Artamis/Artamis

p=4

cur_ver=$(jq --raw-output '.info.version' manifest.json);
echo cur_ver;
new_ver="${cur_ver:0:p}$((${cur_ver:p}-1))";

echo "changing version $cur_ver to $new_ver";

sed 's/${cur_ver}/${new_ver}/' manifest.json;
