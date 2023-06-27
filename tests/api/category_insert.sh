#!/bin/bash
METHOD="POST"
ENDPOINT="content/category"

# Dynamic
HOST="http://devtest.local:3000"
TOKEN="My Bearer Token"

JSON='{}'

echo "Sending category insert to $HOST/api/$ENDPOINT. JSON data => $JSON..."

curl -X $METHOD -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" $HOST/api/$ENDPOINT