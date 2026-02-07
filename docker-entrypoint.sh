#!/bin/sh
set -e
json-server --watch /app/db-step1.json --port 4001 --host 0.0.0.0 &
json-server --watch /app/db-step2.json --port 4002 --host 0.0.0.0 &
# Give json-server time to bind before nginx starts proxying
sleep 5
exec nginx -g "daemon off;"
