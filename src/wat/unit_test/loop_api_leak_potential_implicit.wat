(module
  (import "imports" "output" (func $print (;0;) (param i32)))

  (import "env" "get_data_dummy" (func $get_data (;1;) (result i32)))
  (import "env" "push_data_dummy" (func $push_data (;2;) (param i32)))

  (func $f (local $locA i32) (local $i i32)
    call $get_data
    i32.const 97
    i32.sub
    local.set $locA

    i32.const 0
    local.set $i

    (loop $loop

      local.get $locA
      i32.const 1
      i32.sub
      local.set $locA

      local.get $i
      i32.const 1
      i32.add
      local.set $i

      local.get $locA
      i32.const 0
      i32.ne
      br_if $loop
    )

    i32.const 97
    local.get $i
    i32.add
    call $push_data
  )

  (start $f) 
)
