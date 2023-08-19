(module
    (import "imports" "output" (func $print (;0;) (param i32)))

    (import "env" "get_data_dummy" (func $get_data (;1;) (result i32)))
    (import "env" "push_data_dummy" (func $push_data (;2;) (param i32)))

    (func $propagateArgToSink (param i32)   
                                ;; push 1 function scope
                                ;; push 1 block scope

        local.get 0             ;; push 1 value and get a local variable

                                ;; pop 1 value -> (param i32)
                                ;; push 1 function scope
        call $push_data         ;;  import function -> no follow
                                ;; pop 1 function scope

                                ;; pop 1 block scope
                                ;; pop 1 function scope
    )

    (func $f (local $loc i32)   ;; push 1 function scope
                                ;; push 1 block scope

                                ;; push 1 function scope
        call $get_data          ;;  import function -> no follow
                                ;; pop 1 function scope
                                ;; push 1 value -> (result i32)

        i32.const 33            ;; push 1 value
        i32.add                 ;; pop 2 values and push 1
        local.set $loc          ;; pop 1 value and set a local variable


        local.get $loc          ;; push 1 value and get a local variable

                                ;; pop 1 value -> (param i32)
        call $propagateArgToSink;; follow func

                                ;; pop 1 block scope
                                ;; pop 1 function scope
    )

    (start $f)
)