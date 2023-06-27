#!/bin/bash
METHOD="GET"
ENDPOINT="content/mod"

# Dynamic
HOST="http://devtest.local:3000"
TOKEN="My Bearer Token"

# PARAM can be "id" or "url"
PARAM="id"
PARAM_VAL=1

echo "Sending mod retrieve to $HOST/api/$ENDPOINT?$PARAM=$PARAM_VAL..."

curl -X $METHOD -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" $HOST/api/$ENDPOINT?$PARAM=$PARAM_VAL