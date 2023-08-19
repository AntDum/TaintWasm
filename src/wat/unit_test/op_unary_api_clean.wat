(module
    (import "imports" "output" (func $print (;0;) (param i32)))

    (import "env" "get_data_dummy" (func $get_data (;1;) (result i32)))
    (import "env" "push_data_dummy" (func $push_data (;2;) (param i32)))

    (func $f (local $locA i32) (local $locB i32)
        call $get_data
        i32.const 32
        local.set $locA

        ;; unary operation involving tainted locA
        local.get $locA
        i32.eqz

        ;; pass result to sink
        call $push_data
        drop
    )

    (start $f)
)