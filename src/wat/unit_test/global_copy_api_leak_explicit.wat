(module
    (import "imports" "output" (func $print (;0;) (param i32)))

    (import "env" "get_data_dummy" (func $get_data (;1;) (result i32)))
    (import "env" "push_data_dummy" (func $push_data (;2;) (param i32)))

    (global $globA (mut i32) (i32.const 55))

    (func $f
        ;; mark globA as tainted
        call $get_data
        global.set $globA

        global.get $globA
        call $push_data
    )

    (start $f)
)