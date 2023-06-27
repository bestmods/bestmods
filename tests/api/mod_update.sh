#!/bin/bash
METHOD="PATCH"
ENDPOINT="content/mod"

# Dynamic
HOST="http://devtest.local:3000"
TOKEN="My Bearer Token"

# PARAM can be "id" or "url"
PARAM="id"
PARAM_VAL=1

JSON='{}'

echo "Sending mod update to $HOST/api/$ENDPOINT?$PARAM=$PARAM_VAL. JSON data => $JSON..."

curl -X $METHOD -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d $JSON $HOST/api/$ENDPOINT?$PARAM=$PARAM_VAL