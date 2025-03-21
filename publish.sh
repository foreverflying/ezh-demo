#!/bin/sh

set -ex

npx minify-ts ./src ./min/src ezh/index.ts ezh/debugCheck.ts
cp tsconfig.json ./min

mkdir -p lib

npx tsc -p ./min
cp ./min/out/ezh/*.js lib/
cp ./min/out/ezh/debugCheck.d.ts lib/

npx dts-bundle-generator src/ezh/index.ts -o lib/index.d.ts

npx webpack ./min/out/ezh/index.js \
    --experiments-output-module \
    --output-library-type module \
    --mode production \
    -c /dev/null \
    -o ./dist
cp ./dist/main.mjs lib/bundle.min.js
