(module
    (import "imports" "output" (func $print (;0;) (param i32)))

    (import "env" "get_data_dummy" (func $get_data (;1;) (result i32)))
    (import "env" "push_data_dummy" (func $push_data (;2;) (param i32)))

  (func $f
    (block $block  ;; push block scope
      (block      ;; push block scope
        call $get_data
        i32.const 50
        i32.eq

        (if   ;;
            (then
            br $block 
            )
        )

        i32.const 36
        call $push_data

    )
    )
  )

  (start $f)
)