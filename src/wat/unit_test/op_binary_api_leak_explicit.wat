(module
    (import "imports" "output" (func $print (;0;) (param i32)))

    (import "env" "get_data_dummy" (func $get_data (;1;) (result i32)))
    (import "env" "push_data_dummy" (func $push_data (;2;) (param i32)))


    (func $f (local $locA i32) (local $locB i32)
        call $get_data
        local.set $locA

        ;; binary operation involving tainted locA
        local.get $locA
        i32.const 2
        i32.add

        ;; pass result to sink
        call $push_data
    )

    (start $f)
)