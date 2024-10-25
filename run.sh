#!/bin/bash

rm -rf build/*
#rm -f current.json prices.json
npx tsc
node build/spot.js
