#!/bin/sh

echo "Running OP Crawler container [env:'$NODE_ENV']"

DB_PATH="/data/$OP_DB_NAME"
if [ ! -f "$DB_PATH"  ]; then
    echo "Initing the database at $DB_PATH"
    sqlite3 $DB_PATH < /src/server/db/init.sql
fi

# Arguments are: start (default), crawl

if [ $1 = 'crawl' ]; then
    NODE_CONFIG_DIR=/src/server/config OP_DATA_DIR=/data  node /src/server/crawler.js
elif [ $1 != 'start' ]; then
    echo "Unknown command '$1'"
    exit 1
else
    NODE_CONFIG_DIR=/src/server/config OP_DATA_DIR=/data node /src/server/crawler.js start
fi
