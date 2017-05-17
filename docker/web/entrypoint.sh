#!/bin/sh

echo "Running OP Server container [env:'$NODE_ENV']"

DB_PATH="/data/$OP_DB_NAME"
if [ ! -f "$DB_PATH"  ]; then
    echo "Initing the database at $DB_PATH"
    sqlite3 $DB_PATH < /src/server/db/init.sql
fi

NODE_CONFIG_DIR=/src/server/config OP_DATA_DIR=/data node /src/server/server.js
