#!/bin/sh

if [ ! -d $1 ] || [ ! -d $2 ]; then
    echo "files or temp dirs don't exist"
    exit 1
fi

cd $2
rm -rf op
git clone --depth 1 -b gh-pages git@github.com:gaspaio/operaprices.git op
cd op
git rm -r static/json
cp -r $1 static
git add -A
git commit -m "up api files"
if [ $3 = "true" ]; then
    git push origin gh-pages
    cd ..
    rm -rf op
fi

exit 0

