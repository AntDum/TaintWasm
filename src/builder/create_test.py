import sys
import os
import random

template_path = os.path.join("src","html", "test_template.html")
small_template_path = os.path.join("src","html", "small_template.html")


with open(template_path, "r", encoding="utf-8") as file:
    template_file = file.read()

with open(small_template_path, "r", encoding="utf-8") as file:
    small_template_file = file.read()

directory = sys.argv[1]
directory = (os.path.join(os.getcwd(), directory))
old_dir = os.getcwd()

os.chdir(directory)

style_red = "style='color:red;'"
style_green = "style='color:green;'"
style_orange = "style='color:orange;'"

html = []
js = []

for dir in os.listdir():
    if os.path.isdir(dir):        
        name = dir[:-4]
        pathWasabi = f"{dir}/{name}.wasabi.js"
        pathWasm = f"{dir}/{name}_instr.wasm"
        new_wasabi = f"{dir}/{name}.new.wasabi.js"

        with open(pathWasabi, "r") as f:
            wasabi = f.read()

        with open(new_wasabi, "w") as f:
            f.write("wasab = function () {")
            f.write(wasabi)
            f.write("return {inst:WebAssembly.instantiate, wasabi:Wasabi};}")
        
        current_template = small_template_file.replace("/*NAME*/", name)
        current_template = current_template.replace("/*PATHWASM*/", pathWasm)
        current_template = current_template.replace("/*PATHWASABI*/", new_wasabi)

        if (name.endswith("_leak_explicit")):
            current_template = current_template.replace("/*STYLE_EXPLICIT*/", style_green)
            current_template = current_template.replace("/*STYLE_IMPLICIT*/", style_orange)
            current_template = current_template.replace("/*STYLE_POTENTIAL*/", style_orange)
            current_template = current_template.replace("/*STYLE_CLEAN*/", style_red)
        elif (name.endswith("_leak_implicit")):
            current_template = current_template.replace("/*STYLE_EXPLICIT*/", style_red)
            current_template = current_template.replace("/*STYLE_IMPLICIT*/", style_green)
            current_template = current_template.replace("/*STYLE_POTENTIAL*/", style_orange)
            current_template = current_template.replace("/*STYLE_CLEAN*/", style_red)
        elif (name.endswith("_leak_potential_implicit")):
            current_template = current_template.replace("/*STYLE_EXPLICIT*/", style_red)
            current_template = current_template.replace("/*STYLE_IMPLICIT*/", style_red)
            current_template = current_template.replace("/*STYLE_POTENTIAL*/", style_green)
            current_template = current_template.replace("/*STYLE_CLEAN*/", style_orange)
        else:
            current_template = current_template.replace("/*STYLE_EXPLICIT*/", style_red)
            current_template = current_template.replace("/*STYLE_IMPLICIT*/", style_red)
            current_template = current_template.replace("/*STYLE_POTENTIAL*/", style_orange)
            current_template = current_template.replace("/*STYLE_CLEAN*/", style_green)
        

        template_html, template_js = current_template.split("/*=====*/")

        html.append(template_html)
        js.append(template_js)

# js = js[::-1]
# random.shuffle(js)
js.append("break;")

new_file = template_file.replace("/*HERE_LIST*/", "\n".join(html))
new_file = new_file.replace("/*HERE_SCRIPT*/", "\n".join(js))

with open("index.html", "w") as f:
    f.write(new_file)