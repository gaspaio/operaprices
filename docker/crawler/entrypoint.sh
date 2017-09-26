#!/bin/sh

echo "Running OP Crawler container [env:'$NODE_ENV']"

DB_PATH="/$OP_DATA_DIR/$NODE_ENV.db"
if [ ! -f "$DB_PATH"  ]; then
    echo "Initing the database at $DB_PATH"
    sqlite3 $DB_PATH < /src/crawler/dbinit.sql
fi

if [[ $1 = 'crawl' ]]; then
    node /src/crawler/crawler.js
else
    node /src/crawler/crawler.js start
fi

