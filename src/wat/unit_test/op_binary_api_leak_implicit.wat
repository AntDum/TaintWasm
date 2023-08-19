(module
    (import "imports" "output" (func $print (;0;) (param i32)))

    (import "env" "get_data_dummy" (func $get_data (;1;) (result i32)))
    (import "env" "push_data_dummy" (func $push_data (;2;) (param i32)))

    (func $f (local $locA i32) (local $locB i32)
        i32.const 86
        local.set $locB

        call $get_data
        local.set $locA

        ;; unary operation involving tainted locA
        local.get $locA
        i32.const 0
        i32.eq

        (if
            (then
                local.get $locB
                drop
            )
            (else
                local.get $locB
                call $push_data
            )
        )
        ;; pass result to sink
    )

    (start $f)
)