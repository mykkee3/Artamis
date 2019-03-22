#cd /home/pi/Desktop/dev/Artamis/
cd /e/dev/Artamis/Artamis

cur_ver=$(jq --raw-output '.info.version' manifest.json);
echo $cur_ver

n=`-n $str | tail -c 1`
n2='${n-1}'
echo $n $n2



