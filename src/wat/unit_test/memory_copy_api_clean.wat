(module
    (import "imports" "output" (func $print (;0;) (param i32)))

    (import "env" "get_data_dummy" (func $get_data (;1;) (result i32)))
    (import "env" "push_data_dummy" (func $push_data (;2;) (param i32)))

    (memory 1024)

    (func $f (local $locA i32) (local $locB i32)
        i32.const 25
        call $get_data
        i32.store

        i32.const 7
        local.set $locA

        i32.const 42    ;; address for store
        local.get $locA ;; value for store
        i32.store

        i32.const 42    ;; address for load
        i32.load

        ;; pass value to sink
        call $push_data
    )

    (start $f)
)