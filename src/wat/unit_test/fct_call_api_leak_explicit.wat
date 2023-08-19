(module
    (import "imports" "output" (func $print (;0;) (param i32)))

    (import "env" "get_data_dummy" (func $get_data (;1;) (result i32)))
    (import "env" "push_data_dummy" (func $push_data (;2;) (param i32)))


    (func $addToTainted (param i32) (result i32) (local $locA i32)
        ;; create tainted value
        call $get_data
        local.set $locA

        ;; add tainted value to argument and return the result
        local.get $locA
        local.get 0
        i32.add
    )

    (func $f
        i32.const -7
        call $addToTainted
        call $push_data
    )

    (start $f)
)