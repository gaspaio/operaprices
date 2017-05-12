#!/bin/sh

echo "Starting OP server container for env '$NODE_ENV'"

DB_PATH="$OP_DATA_DIR/$OP_DB_NAME"
if [ ! -f "$DB_PATH"  ]; then
    echo "Initing the database at $DB_PATH"
    sqlite3 $DB_PATH < db/init.sql
fi

node crawler.js

