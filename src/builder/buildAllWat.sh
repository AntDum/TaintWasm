###!/bin/bash -e

analysis=${1%.*}

dir=${2}

for FILE in ${dir}/*; do 
f=$(basename ${FILE});
src/builder/buildBrowser.sh ${f} ${analysis} ${dir};
done
# for FILE in *; do ../buildBrowser.sh ${FILE} ${analysis}; done
