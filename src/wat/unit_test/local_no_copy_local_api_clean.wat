(module
    (import "imports" "output" (func $print (;0;) (param i32)))

    (import "env" "get_data_dummy" (func $get_data (;1;) (result i32)))
    (import "env" "push_data_dummy" (func $push_data (;2;) (param i32)))

    (func $f (local $locA i32) (local $locB i32)
        call $get_data
        local.set $locA

        ;; put fresh, untainted value into locB
        i32.const 23
        local.set $locB

        ;; pass locB to sink
        local.get $locB
        call $push_data

        ;; sanity check: should print 23
        local.get $locB
        call $print
    )

    (start $f)
)