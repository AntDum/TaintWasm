(module
    (import "imports" "output" (func $print (;0;) (param i32)))

    (import "env" "get_data_dummy" (func $get_data (;1;) (result i32)))
    (import "env" "push_data_dummy" (func $push_data (;2;) (param i32)))

    (func $propagateArgToSink (param i32)
        local.get 0
        call $push_data
    )

    (func $f
        i32.const 33
        call $propagateArgToSink
    )

    (start $f)
)