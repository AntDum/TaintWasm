###!/bin/bash -e
set -e
# Usage: ./buildBrowserTest.sh myProgram.wat

#

# Afterwards, load myProgram.html in browser.

name=${1%.*}

analysis=${2%.*}

dir=${3}

end_dir=$(basename $dir)

build_dir="build"

wat2wasm ${dir}/${name}.wat

wasabi ${name}.wasm

mv out/${name}.wasm ${name}_instr.wasm

mv out/${name}.wasabi.js ${name}.wasabi.js

wasm2wat ${name}_instr.wasm -o ${name}_tmp.wat

cat ${name}_tmp.wat | python3 src/builder/rename_func.py > ${name}_instr.wat

rm ${name}_tmp.wat

cp src/html/template_wat.html ${name}.html

cp src/html/template_wat_perf.html ${name}_perf.html

sed -i -e "s/FILENAME_TEST/${name}/g" ${name}.html

sed -i -e "s/FILENAME_INSTR/${name}_instr/g" ${name}.html

sed -i -e "s/FILENAME_ANALYSIS/${analysis}/g" ${name}.html

sed -i -e "s+DIRECTORY_WAT+${dir}+g" ${name}.html

sed -i -e "s/FILENAME_TEST/${name}/g" ${name}_perf.html

sed -i -e "s/FILENAME_INSTR/${name}_instr/g" ${name}_perf.html

sed -i -e "s/FILENAME_ANALYSIS/${analysis}/g" ${name}_perf.html

sed -i -e "s+DIRECTORY_WAT+${dir}+g" ${name}_perf.html

rm -rf ${build_dir}/${end_dir}/${name}_out

mkdir -p ${build_dir}/${end_dir}/${name}_out

mv ${name}.wasm ${build_dir}/${end_dir}/${name}_out

mv ${name}.wasabi.js ${build_dir}/${end_dir}/${name}_out

mv ${name}_instr.wasm ${build_dir}/${end_dir}/${name}_out

mv ${name}_instr.wat ${build_dir}/${end_dir}/${name}_out

mv ${name}.html ${build_dir}/${end_dir}/${name}_out/index.html

mv ${name}_perf.html ${build_dir}/${end_dir}/${name}_out/index_perf.html



