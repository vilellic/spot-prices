#!/bin/bash

set -ex

cleanPrices() {
   rm -rf data/spot_prices.db
   mkdir -p data
}

rm -rf build/*
npm install
npx prettier . --write
npx tsc
if [ "$1" == "clean" ]; then
   cleanPrices
fi
node build/spot.js
