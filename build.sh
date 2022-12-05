#!/bin/bash


grunt dist -v
chmod 777 -R dist/

cp public/sw.js  dist/sw.js
cp public/manifest.json  dist/manifest.json
cp dist/views/live.ejs  dist/views/index.ejs

TIMESTAMP=$(date +%s)

#RENAME STYLES AND SCRIPTS
mv ./dist/stylesheets/common.min.css ./dist/stylesheets/common_$TIMESTAMP.min.css
mv ./dist/scripts/main.min.js ./dist/scripts/main_$TIMESTAMP.min.js
mv ./dist/scripts/vendors.min.js ./dist/scripts/vendors_$TIMESTAMP.min.js

echo "=================== Files Renamed vendors_$TIMESTAMP ==========="

#REPLACE THE FILE NAMES IN LIVE.EJS
sed -i "s/common/common_$TIMESTAMP/g" dist/views/index.ejs
sed -i "s/main/main_$TIMESTAMP/g" dist/views/index.ejs
sed -i "s/vendors.min/vendors_$TIMESTAMP.min/g"  dist/views/index.ejs

sed -i "s/common/common_$TIMESTAMP/g" dist/service-worker.js
sed -i "s/main/main_$TIMESTAMP/g"  dist/service-worker.js
sed -i "s/vendors.min/vendors_$TIMESTAMP.min/g"   dist/service-worker.js

gulp service-worker


echo "\n"
echo "=================== Build complete ============================="
echo "\n"



# SCP TO SERVER
echo -n "Make it Live ?"
read answer
if echo "$answer" | grep -iq "^y" ;then
    echo "copying"
    pm2 restart 0
    echo "Completed"
fi
