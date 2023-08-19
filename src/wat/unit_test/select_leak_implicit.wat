(module
    (import "imports" "output" (func $print (;0;) (param i32)))

    (import "env" "get_data_dummy" (func $get_data (;1;) (result i32)))
    (import "env" "push_data_dummy" (func $push_data (;2;) (param i32)))

  (func $select (export "select") (param $cond i32) (result i32)
    i32.const 0
    i32.const 20

    local.get $cond
    select
  )

  (func $f
    call $get_data
    call $select
    call $push_data
  )

  (start $f)
)
