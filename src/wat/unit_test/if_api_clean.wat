(module
    (import "imports" "output" (func $print (;0;) (param i32)))

    (import "env" "get_data_dummy" (func $get_data (;1;) (result i32)))
    (import "env" "push_data_dummy" (func $push_data (;2;) (param i32)))

    (func $f (local $locA i32) (local $locB i32)
        call $get_data
        local.set $locA
        i32.const 95
        local.set $locB
        i32.const 52
        i32.const 0
        nop
        (if
            (then
                local.get $locA
                call $print
            )
            (else
                local.get $locB
                call $print
            )
        )
        call $push_data
    )

    (start $f)
)