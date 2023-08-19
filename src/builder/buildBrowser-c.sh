###!/bin/bash -e
# set -x      # Enabling debbug
set -e      # Stop on error
# Usage: ./buildBrowserTest.sh myProgram.c
# Afterwards, load index.html in browser with a local server.

name=${1%.*}

dir=${2}

end_dir=$(basename $dir)

build_dir="build"

# emcc temperature_warning.c -o temp.wasm -s EXPORTED_FUNCTIONS="['_launch']" -WL, --no-entry --js-library ../api.js -s STANDALONE_WASM
emcc ${dir}/${name}.c -o ${name}.wasm -Wl, --no-entry --js-library src/c/api.js -s STANDALONE_WASM -Os -Wl,--import-memory -s EXPORTED_FUNCTIONS="['_malloc', '_free']" 
# emcc ${dir}/${name}.c -o ${name}.wasm -Wl,--no-entry -s EXPORT_ALL=1 --js-library src/c/api.js -s STANDALONE_WASM

cp ${dir}/${name}.c .

wasabi ${name}.wasm

wasm2wat ${name}.wasm | python3 src/builder/rename_func.py > ${name}.wat
wasm2wat ${name}.wasm > ${name}_ori.wat

mv ${name}.wasm ${name}_ori.wasm

mv out/${name}.wasm ${name}.wasm

wasm2wat ${name}.wasm | python3 src/builder/rename_func.py > ${name}_instr.wat

mv out/${name}.wasabi.js ${name}.wasabi.js

cp src/html/template_c.html index.html

cp src/html/template_c_perf.html index_perf.html

sed -i -e "s/FILENAME_TEST/${name}/g" index.html

sed -i -e "s/FILENAME_INSTR/${name}_instr/g" index.html

sed -i -e "s/FILENAME_TEST/${name}/g" index_perf.html

sed -i -e "s/FILENAME_INSTR/${name}_instr/g" index_perf.html

sed -i -e "s/FILENAME_ORI/${name}_ori/g" index_perf.html

rm -rf ${build_dir}/${end_dir}/${name}_out 

mkdir -p ${build_dir}/${end_dir}/${name}_out

mv ${name}.wasm ${build_dir}/${end_dir}/${name}_out 

mv ${name}_instr.wat ${build_dir}/${end_dir}/${name}_out 

mv ${name}.wat ${build_dir}/${end_dir}/${name}_out 

mv ${name}_ori.wat ${build_dir}/${end_dir}/${name}_out

mv ${name}_ori.wasm ${build_dir}/${end_dir}/${name}_out 

mv ${name}.wasabi.js ${build_dir}/${end_dir}/${name}_out 

# mv ${name}.js ${build_dir}/${end_dir}/${name}_out 

mv ${name}.c ${build_dir}/${end_dir}/${name}_out 

mv index.html ${build_dir}/${end_dir}/${name}_out 

mv index_perf.html ${build_dir}/${end_dir}/${name}_out 

rm -rf out/

