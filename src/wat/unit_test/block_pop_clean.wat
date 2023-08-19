(module
    (import "imports" "output" (func $print (;0;) (param i32)))

    (import "env" "get_data_dummy" (func $get_data (;1;) (result i32)))
    (import "env" "push_data_dummy" (func $push_data (;2;) (param i32)))

  (func $f
    (block $block (result i32)
      i32.const 53
    )
    call $print
  )

  (start $f)
)