#!/bin/bash

set -ex

cleanPrices() {
   rm -f spot_prices.db
}

rm -rf build/*
npm install
npx prettier . --write
npx tsc
if [ "$1" == "clean" ]; then
   cleanPrices
fi
node build/spot.js
