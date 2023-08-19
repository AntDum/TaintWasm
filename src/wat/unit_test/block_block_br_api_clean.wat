(module
    (import "imports" "output" (func $print (;0;) (param i32)))

    (import "env" "get_data_dummy" (func $get_data (;1;) (result i32)))
    (import "env" "push_data_dummy" (func $push_data (;2;) (param i32)))

  (func $f
    (block $parent      ;; push block scope
      (block $child     ;; push block scope
        call $get_data
        i32.const 100
        i32.eq

        (if  
            (then
            br $parent 
            )
        )

        i32.const 36
        call $push_data

    )
    )
  )

  (start $f)
)