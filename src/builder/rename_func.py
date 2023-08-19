import sys
import re

file = "".join(line for line in sys.stdin)

def tokenize(file):
    def create_ast() -> list:
        ast = []
        curr_stack = [[]]
        for c in file:
            if c == "(":
                curr_stack.append([])
                continue
            if c == ")":
                v = curr_stack.pop()
                curr_stack[-1].append(v)
                continue
            curr_stack[-1].append(c)
        ast.append(curr_stack.pop())
        return ast

    def flatten_word(ast :list):
        current_word = ""
        for e in ast:
            if isinstance(e, list):
                if current_word:
                    yield current_word
                    current_word = ""
                yield list(flatten_word(e))
            else:
                current_word += e
        if current_word:
            yield current_word

    def strip_split(ast_word : list) -> list:
        lis = []
        for s in ast_word:
            if isinstance(s, list):
                l = strip_split(s)
                if l:
                    lis.append(l)
            else:
                # if s.startswith(";") and s.endswith(";"):
                #     continue
                l = [ele.strip() for ele in re.split("[\n|\r]",s) if ele.strip()]
                l = [list(re.split(";;", ele, 1)) for ele in l]
                li = []
                for ele in l:
                    li.extend(ele[0].split())
                    if len(ele) > 1:
                        li.append({"content":ele[1]})
                if li:
                    lis.extend(li)
                # lis.append(s)
        return lis

    return strip_split(flatten_word(create_ast()))

def parse(tokens: list, in_type : bool= False):
    global id_func
    type_ = tokens[0]
    # print("Type:", tokens[0])
    if type_ == "import":
        # print(f"Import {tokens[1]} {tokens[2]}")
        last_import.append((tokens[1], tokens[2]))
    if type_ == "export":
        # print(f"Import {tokens[1]} {tokens[2]}")
        last_export.append((tokens[1],))
    if type_ == "type":
        in_type = True
    if type_ == "start":
        try:
            curr_func = func[int(tokens[1])]
            if curr_func["name"] == None:
                curr_func["name"] = "$main"
        except:
            pass

    if type_ == "func" and not in_type:
        unseen = True
        func_name = None
        func_id = id_func
        for token in tokens[1:]:
            if isinstance(token, list):
                break
            if token.startswith("$"):
                func_name = token
            else:
                # print(f"other {token}", file=sys.stderr)
                try:
                    func_id = int(token)
                except:
                    pass


        if func_name:
            if func_name not in func_names:
                func_names[func_name] = id_func
            else:
                func_id = func_names[func_name]
                unseen = False

            # print(f"Func:{id_func} with name {func_name}")
        # if len(last_import) > 0:
        #     print(f"Func:{id_func} with import {last_import[-1]}")
        # if not func_name and len(last_import) == 0:
        #     print(f"Func:{id_func} with no name")
        # print(f"Func: {func_id} with {func_name}")

        if func_id not in func:
            func[func_id] = {
                "name":None,
                "import":tuple(),
                "export":tuple()
            }

        curr_func = func[func_id]
        if func_name:
            curr_func["name"] = func_name
        if len(last_import) > 0:
            curr_func["import"] = tuple(imp.strip('"') for imp in last_import[-1])
        if len(last_export) > 0:
            curr_func["export"] = tuple(imp.strip('"') for imp in last_export[-1])
        if unseen:
            id_func+=1

    for token in tokens:
        if not isinstance(token, list):
            # print(token, file=sys.stderr)
            pass
        else:
            parse(token, in_type=in_type)

    if type_ == "import":
        last_import.pop()


def rename():
    for fu_id, fu_par in func.items():
        if fu_par["name"] == None:
            name = None
            if len(fu_par["import"]) > 0:
                name = fu_par["import"][-1]
            elif len(fu_par["export"]) > 0:        
                name = fu_par["export"][-1]
            if name:
                fu_par["name"] = f"${name}"
        # print(fu_id, fu_par, file=sys.stderr)

def is_operation(token : str):
    return (token.startswith("i32.") or 
            token.startswith("i64.") or 
            token.startswith("f32.") or 
            token.startswith("f64.") or 
            token.startswith("local.") or
            token.startswith("global.") or
            token == "call" or
            token == "loop" or
            token == "if" or
            token == "else" or
            token == "then" or
            token == "end" or
            token == "select" or
            token == "block" or
            token == "br" or
            token == "drop" or
            token == "nop" or
            token == "return" or
            token == "unreachable" or
            token == "br_if"
            )

def amount_of_arg(operation : str):
    if (".sub" in operation or
        ".add" in operation or
        ".mul" in operation or
        ".div" in operation or
        ".ne" in operation or
        ".eq" in operation or
        ".eqz" in operation or
        ".gt" in operation or
        ".lt" in operation or
        (".ge" in operation and ".get" not in operation) or
        ".le" in operation or
        ".min" in operation or
        ".rem" in operation or
        ".max" in operation or
        ".nearest" in operation or
        ".ceil" in operation or
        ".floor" in operation or
        ".trunc" in operation or
        ".sqrt" in operation or
        ".copysign" in operation or
        ".and" in operation or
        ".or" in operation or
        ".xor" in operation or
        ".shl" in operation or
        ".shr" in operation or
        ".rotl" in operation or
        ".rotr" in operation or
        ".clz" in operation or
        ".ctz" in operation or
        ".popcnt" in operation or
        ".convert" in operation or
        ".demote" in operation or
        ".promote" in operation or
        ".wrap" in operation or
        ".extend" in operation or
        ".reinterpret" in operation or
        operation == "loop" or
        operation == "if" or
        operation == "then" or
        operation == "else" or
        operation == "end" or
        operation == "select" or
        operation == "drop" or
        operation == "nop" or
        operation == "return" or
        operation == "block" or
        operation == "unreachable"
        ):
        return 0
    return 1

def save(tokens: list):
    content = []
    def last_print():
        if len(content) > 0:
            return content[-1]
        return " "
    def last_printable():
        try:
            return last_print().strip()[-1]
        except:
            pass
        return " "

    def recu(tokens: list, deep : int = 0, parent_type : str = "") -> None:
        length = len(tokens)
        type_ = tokens[0]
        operation = ""
        num_arg = -1
        indent_bonus = 0
        if type_ == "module":
            deep = 0
        for i, token in enumerate(tokens):
            if type_ == "module" and i == 1:
                content.append("\n  ")
            if isinstance(token, list):
                if last_print()[-1] not in "\n\r (":
                    content.append(" ")
                content.append("(")
                recu(token, deep+1, parent_type=type_)
                content.append(")")
                if type_ == "module":
                    content.append("\n  ")
            elif isinstance(token, dict):
                content.append(f" ;;{token['content']}")
            else:
                if token.startswith(";") and token.endswith(";"):
                    # print("\nDEBUG", token, deep, parent_type, type_, file=sys.stderr)
                    if parent_type == "func":
                        try:
                            func_id = int(token[1:-1])
                            functio = func.get(func_id, {})
                            name = functio.get("name", "")
                            # print(func_id, functio,file=sys.stderr)
                            if name:
                                content.pop()
                                content.append(f"{name} (")
                        except ValueError:
                            pass
                            # print("\nDEBUG", token, deep, parent_type, type_, file=sys.stderr)
                    content.append(token)
                else:
                    if operation in ["if", "loop", "block"]:
                        indent_bonus += 1
                    if token in ["end"]:
                        indent_bonus -= 1

                    # print(f"DEBUG d:{deep} p:{parent_type} t:{type_} n:{num_arg}", token, last_print(),file=sys.stderr)
                    if num_arg == 0 or last_printable() == ')':
                        content.append("\n")
                        content.append("  " + " "*(deep+indent_bonus)*2)
                    # elif i < length-1:
                    elif i>0:
                        content.append(" ")

                    num_arg -= 1

                    content.append(token)

                    if (operation == "call" or
                        (type_ == "start" and i>0)
                        ):
                        if token not in func_names:
                            curr_func = func.get(int(token), {})
                            name = curr_func.get("name", "")
                            if name:
                                content.pop()
                                content.append(name)

                    

                    if operation:
                        operation = ""
                    if is_operation(token):
                        operation = token
                        num_arg = amount_of_arg(operation)
    recu(tokens)
    # print(content, flush=True)
    print("".join(content),end="")

id_func : int = 0
last_import = []
last_export = []
func_names = {}
func = {}

ast = tokenize(file)
parse(ast)

rename()

id_func = 0
save(ast)