//
// Inspire by the work of Michael Pradel
// 
// src : https://github.com/danleh/wasabi/blob/c243ecffe7bd4f0faa0107092dee8e7e5bc72ac2/examples/analyses/taint.js

Array.prototype.peek = function () {
    return this[this.length - 1];
};

Array.prototype.intersect = function (other) {
    return this.filter(value => other.includes(value))
};

// ================================================================================================//
// ================================================================================================//
// ==============================                                      ============================//
// ==============================               Analysis               ============================//
// ==============================                                      ============================//
// ================================================================================================//
// ================================================================================================//


const Analysis = {
    stack: null,
    option: {
        debug: {
            enable: false,
            logAll: true,
            logStack: true,
            logStackOp: true,
        },
        alert: {
            enable: false,
            source: true,
            sink: true,
            end: true,
        }
    },
    legalImport: ["env"],
    legalExport: ["init", "free", "malloc", "stackSave", "stackRestore", "stackAlloc", "__errno_location", "_initialize"],
    sourceFctIdx: [],
    sinkFctIdx: [],
    sourceFctName: {},
    sinkFctName: {},
    leakCallBack: (taint) => { },
    sourceSetter: (...names) => {},
    sinkSetter: (...names) => {},
};
const option = Analysis.option;
// ================================================================================================//
// ================================================================================================//
// ==============================                                      ============================//
// ==============================                 Taint                ============================//
// ==============================                                      ============================//
// ================================================================================================//
// ================================================================================================//


class Taint {
    constructor(explicit = 0, implicit = 0, potentialImplicit = 0) {
        this.explicit = explicit;
        this.implicit = implicit;
        this.potentialImplicit = potentialImplicit;
    }

    taintExplicit() { this.explicit = 1; }

    taintImplicit() { this.implicit = 1; }

    taintPotentialImplicit() { this.potentialImplicit = 1; }

    isTainted() { return this.isExplicit() || this.isImplicit() || this.isPotentialImplicit(); }

    isExplicit() { return this.explicit !== 0; }

    isImplicit() { return this.implicit !== 0; }

    isPotentialImplicit() { return this.potentialImplicit !== 0; }

    toString() {
        return this.isTainted() ? "(tainted)" : "(clear taint)"
    }

    copy() {
        return new Taint(this.explicit, this.implicit);
    }

    static join(taint1, taint2) {
        const resultTaint = new Taint();
        if ((taint1.explicit === 1) || (taint2.explicit === 1)) resultTaint.explicit = 1;
        if ((taint1.implicit === 1) || (taint2.implicit === 1)) resultTaint.implicit = 1;
        if ((taint1.potentialImplicit === 1) || (taint2.potentialImplicit === 1)) resultTaint.potentialImplicit = 1;
        return resultTaint;
    }

    static ensureTaint(value) {
        if (value instanceof Taint) {
            return value;
        }
        return new Taint();
    }
}

function deepCopy(object) {
    return object !== undefined ? JSON.parse(JSON.stringify(object)) : undefined;
}


// ================================================================================================//
// ================================================================================================//
// ==============================                                      ============================//
// ==============================                Stack                 ============================//
// ==============================                                      ============================//
// ================================================================================================//
// ================================================================================================//


class Stack {
    constructor() {
        this.stack = [
            // a function scope
            {
                blocks: [],
                // a block scope
                // { 
                //  blockTaint : Taint
                         //  values : []
                //  breaking : bool
                // }
                locals: [],
                funcIdx: -1,
                fromFuncIdx: -2,
            },
        ]
        this.memory = [];
        this.globals = [];

        this.historyValue = null;
        this.blockHistory = [];

        this.savedScopeBeforeReturn = null;
        this.lastFuncToBePop = null;
        this.lastFuncIdxToBePop = -1;
        this.idxFromTheSavedScope = -1;
    }
    //==================================================//
    //============ Block Taint helpers =================//

    //get the taint values a the current block
    get blockTaint() { return this.stack.peek().blocks.peek()?.blockTaint; }

    corruptCurrentBlock() {
        this.blockTaint.taintPotentialImplicit();
    }

    //==================================================//
    //================= Values helpers =================//

    //get the values of the current block of the function scope
    get values() { return this.stack.peek().blocks.peek().values; }
    //push a taint in the values of the current block of the function
    pushValue(taint) {
        if (option.debug.enable && option.debug.logStackOp) console.log("stack-op:", "push value");
        if (this.blockTaint.isExplicit() || this.blockTaint.isImplicit()) taint.taintImplicit();
        if (this.blockTaint.isTainted()) taint.taintPotentialImplicit();
        this.historyValue = null;
        return this.values.push(taint);
    }
    //pop the current value of the current block
    popValue() {
        if (option.debug.enable && option.debug.logStackOp) console.log("stack-op:", "pop value");
        const taint = this.values.pop();
        this.historyValue = taint;
        if (!taint) console.warn("No taint in pop");
        return taint;
    }
    //peek the current value of the current block
    peekValue() {
        if (option.debug.enable && option.debug.logStackOp) console.log("stack-op:", "peek value");
        return this.values.peek();
    }

    //==================================================//
    //================= Locals helpers =================//

    get locals() { return this.stack.peek().locals; }

    getLocal(localIndex) {
        if (option.debug.enable && option.debug.logStackOp) console.log("stack-op:", "get local");
        const local = this.locals[localIndex]
        if (!local) {
            if (option.debug.enable && option.debug.logStackOp) console.log("stack-op:", "local was not defined");
            this.locals[localIndex] = new Taint();
        }
        this.historyValue = null;
        return this.locals[localIndex];
    }

    setLocal(localIndex, taint) {
        if (option.debug.enable && option.debug.logStackOp) console.log("stack-op:", "set local");
        this.historyValue = null;
        this.locals[localIndex] = taint;
    }

    //==================================================//
    //================= Globals helpers ================//

    getGlobal(globalIndex) {
        if (option.debug.enable && option.debug.logStackOp) console.log("stack-op:", "get global");
        this.historyValue = null;
        const global = this.globals[globalIndex]
        if (!global) {
            if (option.debug.enable && option.debug.logStackOp) console.log("stack-op:", "global was not defined");
            this.globals[globalIndex] = new Taint();
        }
        return this.globals[globalIndex];
    }

    setGlobal(globalIndex, taint) {
        if (option.debug.enable && option.debug.logStackOp) console.log("stack-op:", "set global");
        this.historyValue = null;
        this.globals[globalIndex] = taint;
    }

    //==================================================//
    //================ Block helpers ===================//

    get blocks() { return this.stack.peek().blocks; }
    // push new block to the current function scope
    pushBlockScope() {
        if (option.debug.enable && option.debug.logStackOp) console.log("stack-op:block:", "push block scope");
        let newBlockTaint = (this.historyValue !== null && this.historyValue !== undefined) ? this.historyValue.copy() : new Taint();
        if (this.blockHistory.length > 0) {
            newBlockTaint = Taint.join(newBlockTaint, this.blockHistory.peek().blockTaint);
        }
        const new_block = { blockTaint: newBlockTaint, values: [], breaking: false };

        this.historyValue = null;
        this.blockHistory.push(new_block);
        return this.blocks.push(new_block);
    }
    // pop block from the current function scope
    popBlockScope() {
        if (option.debug.enable && option.debug.logStackOp) console.log("stack-op:block", "pop block scope");
        this.historyValue = null;
        this.blockHistory.pop();
        const block = this.blocks.pop();
        if (block.values.length > 0) {
            this.blocks.peek().values = this.blocks.peek().values.concat(block.values);
        }
        if (block.breaking === true && block.blockTaint.isTainted()) {
            this.corruptCurrentBlock();
        }
        return block;
    }

    breakBlock() {
        this.blocks.peek().breaking = true;
    }

    //==================================================//
    //============ function scope helpers ==============//

    //push a new function scope on the stack
    pushFunctionScope(locals = [], funcIdx = -1, fromFuncIdx = -2) {
        if (option.debug.enable && option.debug.logStackOp) console.log("stack-op:func:", "push function scope", "idx:", funcIdx, fromFuncIdx);
        this.stack.push({
            blocks: [],
            locals: locals,
            funcIdx: funcIdx,
            fromFuncIdx: fromFuncIdx,
        });
    }
    //pop the current function scope from the stack
    popFunctionScope() {
        const popFunc = this.stack.pop();
        if (option.debug.enable && option.debug.logStackOp) console.log("stack-op:func:", "pop function scope", "idx:", popFunc.funcIdx, popFunc);
        this.lastFuncIdxToBePop = popFunc.funcIdx;
        if (this.idxFromTheSavedScope === -1) this.setScopeBeforeReturn(popFunc);
        for (let index = 0; index < popFunc.blocks.length; index++) {
            this.blockHistory.pop();
        }
        return popFunc;
    }

    popFunctionScopeOnce(funcIdx = -1, isEnd = false) {
        this.historyValue = null;
        if (option.debug.enable && option.debug.logStackOp) console.log("stack-op:func:", "pop function scope once", funcIdx);
        if (this.getCurrentFunctionIdx() === -1) {
            console.error("POP FUNC:", this.getCurrentFunctionIdx(), "FROM:", funcIdx);
        }
        if (this.lastFuncIdxToBePop === -1) {
            const popFunc = this.popFunctionScope();
            return this.getScopeBeforeReturn();
        }
        if (!isEnd) {
            if (funcIdx !== this.lastFuncToBePop.fromFuncIdx) {
                const popFunc = this.popFunctionScope();
                return this.getScopeBeforeReturn();
            }
        }
        if (!isEnd && funcIdx !== this.lastFuncToBePop.fromFuncIdx) {
            console.error("DID YOU GO IN THE GOOD DIRECTION", funcIdx, this.lastFuncToBePop)
        }
        return this.getScopeBeforeReturn();
    }

    peekFunctionScopeOnce() {
        const peekFunc = this.stack.peek();
        if (option.debug.enable && option.debug.logStackOp) console.log("stack-op:func:", "peek function scope once", "idx:", peekFunc.funcIdx);
        this.setScopeBeforeReturn(peekFunc);
        return peekFunc;
    }

    setScopeBeforeReturn(functionScope) {
        const peekBlock = functionScope.blocks.peek();
        if (option.debug.enable && option.debug.logStackOp) console.log("stack-op:saved:", "set scope before return", deepCopy(peekBlock));
        this.savedScopeBeforeReturn = peekBlock !== undefined ? peekBlock : null;
        this.idxFromTheSavedScope = functionScope.funcIdx;
        this.lastFuncToBePop = functionScope;
    }

    getScopeBeforeReturn() {
        if (option.debug.enable && option.debug.logStackOp) console.log("stack-op:saved:", "get scope before return", deepCopy(this.savedScopeBeforeReturn));
        return this.savedScopeBeforeReturn;
    }

    isSameScopeBeforeReturn(functionScope) {
        return this.idxFromTheSavedScope === functionScope.funcIdx;
    }

    getIdxBeforeReturn() {
        return this.lastFuncIdxToBePop;
    }

    getLastFuncPop() {
        return this.lastFuncToBePop;
    }

    clearPopFunctionScope() {
        this.savedScopeBeforeReturn = null;
        this.lastFuncIdxToBePop = -1;
        this.lastFuncToBePop = null;
        this.idxFromTheSavedScope = -1;
    }

    getCurrentFunctionIdx() {
        return this.stack.peek().funcIdx;
    }

    //==================================================//
    //================ Memory helpers ==================//

    setMemory(effectiveAddr, taint) {
        this.memory[effectiveAddr] = taint;
    }

    getMemory(effectiveAddr) {
        const taint = this.memory[effectiveAddr];
        if (!taint) {
            this.memory[effectiveAddr] = new Taint();
        }
        return this.memory[effectiveAddr];
    }


    toString() {
        return deepCopy(this);
    }
}

// ================================================================================================//
// ================================================================================================//
// ==============================                                      ============================//
// ==============================                Wasabi                ============================//
// ==============================                                      ============================//
// ================================================================================================//
// ================================================================================================//

function get_taint_analysis(Wasabi) {

    function getFctIdx(name) {
        let fctIdx = -1;
        for (let i = 0; i < Wasabi.module.info.functions.length; i++) {
            const fct = Wasabi.module.info.functions[i];
            if (fct.import instanceof Array) {
                if (fct.import.includes(name)) { fctIdx = i; }
            }
        }
        if (fctIdx === -1) {
            for (let i = 0; i < Wasabi.module.info.functions.length; i++) {
                const fct = Wasabi.module.info.functions[i];
                if (fct.export.includes(name)) { fctIdx = i; }
            }
        }
        return fctIdx;
    }

    function setSourceIdx(...names) {
        let idxs = [];
        let FctNames = {};
        for (let name of names) {
            let idx = getFctIdx(name);
            idxs.push(idx);
            FctNames[idx] = name;
        }
        Analysis.sourceFctIdx = idxs;
        Analysis.sourceFctName = FctNames;
    }

    function setSinkIdx(...names) {
        let idxs = [];
        let FctNames = {};
        for (let name of names) {
            let idx = getFctIdx(name);
            idxs.push(idx);
            FctNames[idx] = name;
        }
        Analysis.sinkFctIdx = idxs;
        Analysis.sinkFctName = FctNames;
    }

    Analysis.sinkSetter = setSinkIdx;
    Analysis.sourceSetter = setSourceIdx;

    setSinkIdx("push_data", "push_data_dummy");
    setSourceIdx("get_data", "get_data_dummy");

    // Check for non api call

    for (let i = 0; i < Wasabi.module.info.functions.length; i++) {
        const fct = Wasabi.module.info.functions[i];
        if (fct.import instanceof Array) {
            if (!Analysis.legalImport.includes(fct.import[0])) {
                console.warn("App call function from outside the api", fct.import);
            }
        }
    }
    for (let i = 0; i < Wasabi.module.info.functions.length; i++) {
        const fct = Wasabi.module.info.functions[i];
        if (fct.export instanceof Array && fct.export.length > 0) {
            if (fct.export.intersect(Analysis.legalExport).length == 0) {
                console.warn("App export function", fct.export);
            }
        }
    }
    
    const stack = new Stack();

    Wasabi.analysis = {
        start(location) {
            if (option.debug.enable && option.debug.logAll) console.log("start:", location);
            // create taints for all globals
            for (let i = 0; i < Wasabi.module.info.globals.length; i++) {
                if (option.debug.enable) console.log("start: Creating taint for global #" + i);
                stack.globals[i] = new Taint();
            }
        },

        nop(location) {
            if (option.debug.enable && option.debug.logAll) console.log("nop:", location);
            //nop is the non operation operation it does nothing
        },

        unreachable(location) {
            if (option.debug.enable && option.debug.logAll) console.log("unreachable:", location);
            // does nothing since this code is unreachable
        },

        if_(location, condition) {
            if (option.debug.enable && option.debug.logAll) console.log("if_:", location, ", condition =", condition);
            if (option.debug.enable && option.debug.logStack) console.log("stack:if:", stack.toString());
            const taint = stack.popValue();
            if (taint.isTainted()) stack.corruptCurrentBlock();
        },

        br(location, target) {
            if (option.debug.enable && option.debug.logAll) console.log("br:", location, ", to label", target.label, "(", target.location, ")");
            if (option.debug.enable && option.debug.logStack) console.log("stack:br:", stack.toString());
            stack.breakBlock();
        },

        br_if(location, conditionalTarget, condition) {
            if (option.debug.enable && option.debug.logAll) console.log("br_if:", location, ", condition =", condition, ", to label", conditionalTarget.label, "(", conditionalTarget.location, ")");
            if (option.debug.enable && option.debug.logStack) console.log("stack:br_if:", stack.toString());
            const taint = stack.popValue();
            if (taint.isTainted()) stack.corruptCurrentBlock();
            if (condition) { stack.breakBlock(); }
        },

        br_table(location, table, defaultTarget, tableIdx) {
            if (option.debug.enable && option.debug.logAll) console.log("br_table:", location, ", table =", table, ", default target =", defaultTarget, ", table index =", tableIdx);
            if (option.debug.enable && option.debug.logStack) console.log("stack:br_table:", stack.toString());
            stack.breakBlock();
            stack.popValue();
        },

        //hint: explain the ordre of execution of call pre and begin
        begin(location, type) {
            if (option.debug.enable && option.debug.logAll) console.log("begin:", location, ", type =", type);
            if (option.debug.enable && option.debug.logStack) console.log("stack:begin:", stack.toString());
            if (type === "function" && (stack.getCurrentFunctionIdx() !== location.func)) {
                stack.clearPopFunctionScope();
                stack.pushFunctionScope([], location.func);
            }
            stack.pushBlockScope();
        },

        end(location, type, beginLocation, ifLocation) {
            if (option.debug.enable && option.debug.logAll) console.log("end:", location, ", type =", type, ", begin (", beginLocation, "), if (", ifLocation, ")");
            if (option.debug.enable && option.debug.logStack) console.log("stack:end:", stack.toString());
            if (type !== "function") {
                stack.popBlockScope();
            }
            else {
                stack.popFunctionScopeOnce(location.func, true);
                if (stack.getCurrentFunctionIdx() === -1) {
                    const scope = stack.getScopeBeforeReturn();
                    if (scope?.values?.length > 0) {
                        const taint = scope.values.pop();
                        if (taint.isTainted()) {
                            if (option.alert.enable && option.alert.end) {
                                if (taint.isTainted())
                                    console.warn("alert:end: Program end tainted", location, "with", taint);
                                else
                                    console.info("alert:end: Program end tainted", location, "with", taint);
                            }
                        }
                    }
                    const funcScope = stack.getLastFuncPop();
                    if (funcScope.from_wasm == false) {
                        console.warn("END FUNC NOT FROM WASM");
                    }
                }
            }
        },

        drop(location, value) {
            if (option.debug.enable && option.debug.logAll) console.log("drop:", location, ", value =", value);
            if (option.debug.enable && option.debug.logStack) console.log("stack:drop:", stack.toString());
            stack.popValue();
        },

        select(location, cond, first, second) {
            if (option.debug.enable && option.debug.logAll) console.log("select:", location, ", condition =", cond, ", first =", first, ", second =", second);
            if (option.debug.enable && option.debug.logStack) console.log("stack:select:", stack.toString());
            const taintCond = stack.popValue();
            const taint1 = stack.popValue();
            const taint2 = stack.popValue();
            if (taintCond.isTainted()) {
                taint1.taintImplicit();
                taint2.taintImplicit();
            }
            if (cond) stack.pushValue(taint2);
            else stack.pushValue(taint1);
        },

        call_pre(location, targetFunc, args, indirectTableIdx) {
            if (option.debug.enable && option.debug.logAll) console.log("call_pre:", location, (indirectTableIdx === undefined ? "direct" : "indirect"), "call", ", target =", targetFunc, ", args =", args, ", indirectIdx =", indirectTableIdx);
            if (option.debug.enable && option.debug.logStack) console.log("stack:call_pre:", stack.toString());
            stack.clearPopFunctionScope();

            // if indirect call the first value of the stack is the index of the call
            if (indirectTableIdx !== undefined) { // indirect call
                stack.popValue();
            }
            var locals = [];
            let containTainted = false;
            let argsTainted = [];
            for (const arg of args) {
                const taint = stack.popValue();
                locals.push(taint);
                if (Analysis.sinkFctIdx.includes(targetFunc)) {
                    // if (option.alert.enable && option.alert.sink) {
                    //     if (taint.isTainted())
                    //         console.warn("alert:sink: Sink function called", location, "with", taint);
                    //     else
                    //         console.info("alert:sink: Sink function called", location, "with", taint);
                    // }
                    if (taint.isTainted()) {
                        Analysis.leakCallBack(taint);
                        containTainted = true;
                    } 
                    argsTainted.push({ taint, arg });
                }
            }
            if (containTainted) {
                let mixedTaint = new Taint();
                for (const { taint } of argsTainted) {
                    mixedTaint = Taint.join(taint, mixedTaint);
                }
                let lvl = 0;
                if (mixedTaint.isPotentialImplicit()) lvl = 1;
                if (mixedTaint.isImplicit()) lvl = 2;
                if (mixedTaint.isExplicit()) lvl = 3;
                leakCallBack(Analysis.sinkFctName[targetFunc], argsTainted, lvl);
                if (option.alert.enable && option.alert.sink) {
                    console.warn("API:SINK: Func:", Analysis.sinkFctName[targetFunc], "args:", argsTainted);
                }
            }
            stack.pushFunctionScope(locals, targetFunc, location.func);
        },

        call_post(location, values) {
            if (option.debug.enable && option.debug.logAll) console.log("call_post:", location, ", values =", values);
            if (option.debug.enable && option.debug.logStack) console.log("stack:call_post:", stack.toString());

            const valueOfFunc = stack.popFunctionScopeOnce(location.func); // pop function scope
            const calledFuncIdx = stack.getIdxBeforeReturn();
            stack.clearPopFunctionScope();

            if (values.length > 0) { // if has value to push
                for (const value of values) {
                    var taint_value;
                    if (valueOfFunc !== undefined && valueOfFunc !== null) { // if has value to get 
                        // push value from the function scope in our
                        taint_value = valueOfFunc.values.pop();
                    }
                    else { // create new taint for each values
                        taint_value = new Taint();
                    }
                    if (Analysis.sourceFctIdx.includes(calledFuncIdx)) {
                        if (option.alert.enable && option.alert.source) {
                            console.log("alert:source: Source function return", location);
                        }
                        taint_value.taintExplicit();
                    }
                    stack.pushValue(taint_value);
                }
            }
        },

        return_(location, values) {
            if (option.debug.enable && option.debug.logAll) console.log("return:", location, (location.instr === -1) ? "implicit" : "explicit", "return", ", values =", values);
            if (option.debug.enable && option.debug.logStack) console.log("stack:return:", stack.toString());
            stack.clearPopFunctionScope();
            stack.peekFunctionScopeOnce()
        },

        const_(location, op, value) {
            if (option.debug.enable && option.debug.logAll) console.log("const:", location, ", op =", op, ", value =", value);
            if (option.debug.enable && option.debug.logStack) console.log("stack:const:", stack.toString());
            stack.pushValue(new Taint());
        },

        unary(location, op, input, result) {
            if (option.debug.enable && option.debug.logAll) console.log("op_unary:", location, ", op =", op, ", input =", input, ", result =", result);
            if (option.debug.enable && option.debug.logStack) console.log("stack:op_unary:", stack.toString());
            const taint = stack.popValue();
            if (!taint) console.warn(op, input, location)
            stack.pushValue(taint.copy());
        },

        binary(location, op, first, second, result) {
            if (option.debug.enable && option.debug.logAll) console.log("op_binary:", location, ", op =", op, ", first =", first, ", second =", second, ", result =", result);
            if (option.debug.enable && option.debug.logStack) console.log("stack:op_binary:", stack.toString());
            const taint1 = stack.popValue();
            const taint2 = stack.popValue();
            stack.pushValue(Taint.join(taint1, taint2));
        },

        load(location, op, memarg, value) {
            if (option.debug.enable && option.debug.logAll) console.log("load:", location, ", op =", op, ", value =", value, ", from =", memarg);
            if (option.debug.enable && option.debug.logStack) console.log("stack:load:", stack.toString());
            const effectiveAddr = memarg.addr + memarg.offset;
            const taint = stack.getMemory(effectiveAddr);   // Value
            const taint_position = stack.popValue();        // Position
            if (taint_position.isTainted()) {
                taint.taintImplicit();
            }
            stack.pushValue(taint);
        },

        store(location, op, memarg, value) {
            if (option.debug.enable && option.debug.logAll) console.log("store:", location, ", op =", op, ", value =", value, ", to =", memarg);
            if (option.debug.enable && option.debug.logStack) console.log("stack:store:", stack.toString());
            const effectiveAddr = memarg.addr + memarg.offset;
            const taint = stack.popValue();             // Value
            const taint_position = stack.popValue();    // Position
            if (taint_position.isTainted()) {
                taint.taintImplicit();
            }
            stack.setMemory(effectiveAddr, taint);
        },

        memory_size(location, currentSizePages) {
            if (option.debug.enable && option.debug.logAll) console.log("size:", location, ", size(in pages) =", currentSizePages);
            if (option.debug.enable && option.debug.logStack) console.log("stack:size:", stack.toString());
            stack.pushValue(new Taint());
        },

        memory_grow(location, byPages, previousSizePages) {
            if (option.debug.enable && option.debug.logAll) console.log("grow:", location, ", memory_grow, delta (in pages) =", byPages, ", previous size (in pages) =", previousSizePages);
            if (option.debug.enable && option.debug.logStack) console.log("stack:grow:", stack.toString());
            stack.popValue();
            stack.pushValue(new Taint());
        },

        local(location, op, localIndex, value) {
            if (option.debug.enable && option.debug.logAll) console.log("local:", location, ", op =", op, ", local #", localIndex, ", value =", value);
            if (option.debug.enable && option.debug.logStack) console.log("stack:local:", stack.toString());
            switch (op) {
                case "local.set": {
                    const taint = stack.popValue();
                    stack.setLocal(localIndex, taint);
                    return;
                }
                case "local.tee": {
                    const taint = stack.popValue();
                    if (!taint) console.warn(op, localIndex, value, location);
                    stack.setLocal(localIndex, taint);
                    stack.pushValue(taint);
                    return;
                }
                case "local.get": {
                    const taint = stack.getLocal(localIndex);
                    stack.pushValue(taint);
                    return;
                }
            }
        },

        global(location, op, globalIndex, value) {
            if (option.debug.enable && option.debug.logAll) console.log("global:", location, ", op =", op, ", global #", globalIndex, ", value =", value);
            if (option.debug.enable && option.debug.logStack) console.log("stack:global:", stack.toString());
            switch (op) {
                case "global.set": {
                    const taint = stack.popValue();
                    stack.setGlobal(globalIndex, taint);
                    return;
                }
                case "global.get": {
                    const taint = stack.getGlobal(globalIndex);
                    stack.pushValue(taint);
                    return;
                }
            }
        },
    };
    return stack;
}
