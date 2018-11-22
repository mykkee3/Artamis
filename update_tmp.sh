echo "\nStarting Update shell"

cur_ver=$(jq --raw-output '.info.version' manifest.json);
#new_ver=$(curl "" | jq --raw-output '.info.version')

echo "\nCurrent version: $cur_ver\nExpected version: $new_ver"

echo "\nUpdate shell Done"