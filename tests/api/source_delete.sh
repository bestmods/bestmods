#!/bin/bash
METHOD="DELETE"
ENDPOINT="content/source"

# Dynamic
HOST="http://devtest.local:3000"
TOKEN="My Bearer Token"

URL="testdomain.com"

echo "Sending source delete to $HOST/api/$ENDPOINT?url=$URL..."

curl -X $METHOD -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" $HOST/api/$ENDPOINT?url=$URL