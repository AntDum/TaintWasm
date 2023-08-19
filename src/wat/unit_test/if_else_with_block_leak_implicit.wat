(module 
    (import "env" "get_data_dummy" (func $get_data (;0;) (result i32)))
    (import "env" "push_data_dummy" (func $push_data (;1;) (param i32)))
    (func $main (;2;) (local $secret i32) (local $public i32)
        (local.set $secret (call $get_data))
        (local.set $public (i32.const -1))
        block ;; label = @1
            ;; Condition
            block ;; label = @2
                local.get $secret
                br_if 0 ;; @2
                
                ;; IF
                (local.set $public (i32.const 0))
                br 1 ;; @1
            end
            ;; ELSE
            (local.set $public (i32.const 1))
        end
        (call $push_data (local.get $public))
    )
    (start $main)
)