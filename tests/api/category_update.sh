#!/bin/bash
METHOD="PATCH"
ENDPOINT="content/category"

# Dynamic
HOST="http://devtest.local:3000"
TOKEN="My Bearer Token"

ID=1
JSON='{}'

echo "Sending category update to $HOST/api/$ENDPOINT?$PARAM=$PARAM_VAL. JSON data => $JSON..."

curl -X $METHOD -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d $JSON $HOST/api/$ENDPOINT?$PARAM=$PARAM_VAL