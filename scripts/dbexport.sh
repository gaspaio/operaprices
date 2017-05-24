#!/bin/bash
set -e

cd data
mkdir -p csv
rm -f csv/*
sqlite3 -header -csv development.db "select * from show;" > csv/show.csv
sqlite3 -header -csv development.db "select * from crawl;" > csv/crawl.csv
sqlite3 -header -csv development.db "select * from performance;" > csv/performance.csv
sqlite3 -header -csv development.db "select * from price;" > csv/price.csv

