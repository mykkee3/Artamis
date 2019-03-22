#cd /home/pi/Desktop/dev/Artamis/
cd /e/dev/Artamis/Artamis

cur_ver=$(jq --raw-output '.info.version' manifest.json);
echo $cur_ver

# Usage: increment_version <version> [<position>]
increment_version() {
 local v=$1
 if [ -z $2 ]; then 
    local rgx='^((?:[0-9]+\.)*)([0-9]+)($)'
 else 
    local rgx='^((?:[0-9]+\.){'$(($2-1))'})([0-9]+)(\.|$)'
    for (( p=`grep -o "\."<<<".$v"|wc -l`; p<$2; p++)); do 
       v+=.0; done; fi
 val=`echo -e "$v" | perl -pe 's/^.*'$rgx'.*$/$2/'`
 echo "$v" | perl -pe s/$rgx.*$'/${1}'`printf %0${#val}s $(($val+1))`/
}

# Usage: increment_version <version> [<position>]
decrement_version() {
 local v=$1
 if [ -z $2 ]; then 
    local rgx='^((?:[0-9]+\.)*)([0-9]+)($)'
 else 
    local rgx='^((?:[0-9]+\.){'$(($2-1))'})([0-9]+)(\.|$)'
    for (( p=`grep -o "\."<<<".$v"|wc -l`; p<$2; p++)); do 
       v+=.0; done; fi
 val=`echo -e "$v" | perl -pe 's/^.*'$rgx'.*$/$2/'`
 echo "$v" | perl -pe s/$rgx.*$'/${1}'`printf %0${#val}s $(($val-1))`/
}

# EXAMPLE   ------------->   # RESULT
increment_version 1          # 2
increment_version 1.0.0      # 1.0.1
increment_version 1 2        # 1.1
increment_version 1.1.1 2    # 1.2
increment_version 00.00.001  # 00.00.002
#sed -i 's/0.0.3/0.0.2/g' manifest.json
