#!/bin/bash
METHOD="DELETE"
ENDPOINT="content/category"

# Dynamic
HOST="http://devtest.local:3000"
TOKEN="My Bearer Token"

ID=1

echo "Sending category delete to $HOST/api/$ENDPOINT?id=$ID..."

curl -X $METHOD -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" $HOST/api/$ENDPOINT?id=$ID