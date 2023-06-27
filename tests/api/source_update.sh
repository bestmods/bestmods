#!/bin/bash
METHOD="PATCH"
ENDPOINT="content/source"

# Dynamic
HOST="http://devtest.local:3000"
TOKEN="My Bearer Token"

URL="testdomain.com"
JSON='{}'

echo "Sending source update to $HOST/api/$ENDPOINT?url=$URL. JSON data => $JSON..."

curl -X $METHOD -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d $JSON $HOST/api/$ENDPOINT?url=$URL