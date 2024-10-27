#!/bin/bash

set -ex

cleanPrices() {
   rm -f prices.json
}

rm -rf build/*
npm install
npx tsc
if [ "$1" == "clean" ]; then
   cleanPrices
fi
node build/spot.js
