#!/bin/bash

rm build/*.js
npx tsc
node build/spot.js
