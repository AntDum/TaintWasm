(module
  (import "imports" "output" (func $print (;0;) (param i32)))

  (import "env" "get_data_dummy" (func $get_data (;1;) (result i32)))
  (import "env" "push_data_dummy" (func $push_data (;2;) (param i32)))

  (func $main       ;; push 1 function scope
                    ;; push 1 block scope

                    ;; push 1 function scope
    call $get_data  ;;  import function -> no follow
                    ;; pop 1 function scope
                    ;; push 1 value -> (result i32)
                    
                    ;; push 1 function scope
    call $get_data  ;;  import function -> no follow
                    ;; pop 1 function scope
                    ;; push 1 value -> (result i32)

    i32.const 0     ;; push 1 value
    select          ;; pop 3 values and push 1
    i32.const 20    ;; push 1 value

    drop            ;; pop 1 value

                    ;; pop 1 value -> (param i32)
                    ;; push 1 function scope
    call $push_data ;;  import function -> no follow
                    ;; pop 1 function scope

                    ;; pop 1 block scope
                    ;; pop 1 function scope
  )
  (start $main)
)