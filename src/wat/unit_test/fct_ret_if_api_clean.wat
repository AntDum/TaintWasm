(module
    (import "imports" "output" (func $print (;0;) (param i32)))

    (import "env" "get_data_dummy" (func $get_data (;1;) (result i32)))
    (import "env" "push_data_dummy" (func $push_data (;2;) (param i32)))

  (func $ret (result i32)

      i32.const 12
      i32.const 100
      i32.eq
      (if
        (then
          i32.const 25
          return
        )
      )

      call $get_data
      call $print

      i32.const 45
  )

  (func $f
    call $ret
    call $push_data
  )

  (start $f)
)