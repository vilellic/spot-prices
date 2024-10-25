#!/bin/bash

set -ex

cleanPrices() {
   rm -f current.json prices.json
}

rm -rf build/*
npx tsc
if [ "$1" == "clean" ]; then
   cleanPrices
fi
node build/spot.js
