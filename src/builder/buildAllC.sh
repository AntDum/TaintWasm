###!/bin/bash -e

dir=${1}

for FILE in ${dir}/*; do 
f=$(basename ${FILE});
src/builder/buildBrowser-c.sh ${f} ${dir};
done
# for FILE in *; do ../buildBrowser.sh ${FILE} ${analysis}; done
