#!/bin/bash

set -x
set -e
cd client
yarn build
cd ..

rm -rf /tmp/op
git clone --depth 1 -b gh-pages git@github.com:gaspaio/operaprices.git /tmp/op

rm -r /tmp/op/index.html /tmp/op/static/js /tmp/op/static/css
cp -r client/dist/* /tmp/op

cd /tmp/op
git add -A
git commit -m "up web dist files"
git push origin gh-pages
cd ..
rm -rf op

exit 0

