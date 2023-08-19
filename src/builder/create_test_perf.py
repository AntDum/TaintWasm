import sys
import os
import random

template_path = os.path.join("src","html", "test_template_perf.html")
small_template_path = os.path.join("src","html", "small_template_perf.html")


with open(template_path, "r", encoding="utf-8") as file:
    template_file = file.read()

with open(small_template_path, "r", encoding="utf-8") as file:
    small_template_file = file.read()

directory = sys.argv[1]
directory = (os.path.join(os.getcwd(), directory))
old_dir = os.getcwd()

os.chdir(directory)

html = []
js = []

for dir in os.listdir():
    if os.path.isdir(dir):        
        name = dir[:-4]
        pathWasabi = f"{dir}/{name}.wasabi.js"
        pathWasm = f"{dir}/{name}_instr.wasm"
        pathWasmOri = f"{dir}/{name}.wasm"
        new_wasabi = f"{dir}/{name}_perf.new.wasabi.js"

        with open(pathWasabi, "r") as f:
            wasabi = f.read()

        with open(new_wasabi, "w") as f:
            f.write(f"const wasa_{name} = function (old_instantiate) "
                    "{ var wasabi_new_instantiate = null;")
            f.write(wasabi  .replace(   "WebAssembly.instantiate = ", 
                                        "wasabi_new_instantiate = WebAssembly.instantiate = ")
                            .replace(   "WebAssembly.instantiate ", 
                                        "old_instantiate")
                            .replace(   "WebAssembly.instantiate;", 
                                        "old_instantiate"))
            f.write("return {inst:wasabi_new_instantiate, wasabi:Wasabi};}")
        
        current_template = small_template_file.replace("/*NAME*/", name)
        current_template = current_template.replace("/*PATHWASM*/", pathWasm)
        current_template = current_template.replace("/*PATHWASMORI*/", pathWasmOri)
        current_template = current_template.replace("/*PATHWASABI*/", new_wasabi)
        current_template = current_template.replace("/*WASABNAME*/", f"wasa_{name}")

        template_html, template_js = current_template.split("/*=====*/")

        html.append(template_html)
        js.append(template_js)

# js = js[::-1]
# random.shuffle(js)
js.append("break;")

new_file = template_file.replace("/*HERE_LIST*/", "\n".join(html))
new_file = new_file.replace("/*HERE_SCRIPT*/", "\n".join(js))

with open("index_perf.html", "w") as f:
    f.write(new_file)