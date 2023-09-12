#!/bin/bash

rm -rf build/*
npx tsc
node build/spot.js
