# Unit test

## Instruction

| Operation                 | Clean | Explicit | Implicit  |
| ------------              |:-----:|:--------:|:---------:|
| nop                       |   D   |     I    |     I     |
| unreachable               |   D   |     I    |     I     |
| drop                      |   D   |     D    |     I     |
| select                    |   D   |     D    |     D     |
| const                     |   D   |     D    |     D     |
| unary                     |   D   |     D    |     D     |
| binary                    |   D   |     D    |     D     |
| memory_size               |   ~   |     ~    |     ~     |
| memory_grow               |   ~   |     ~    |     ~     |
| if                        |-------|----------|-----------|
| going in if               |   ~   |     ~    |     ~     |
| going in if multi         |   ~   |     ~    |     D     |
| not going in              |   ~   |     ~    |     D     |
| else going in if          |   ~   |     ~    |     D     |
| else going in else        |   ~   |     ~    |     D     |
| br                        |-------|----------|-----------|
| break current block       |   ~   |     ~    |     ~     |
| break current loop        |   ~   |     ~    |     ~     |
| break if                  |   ~   |     ~    |     ~     |
| break parent block        |   ~   |     ~    |     D     |
| break loop inside a block |   ~   |     ~    |     ~     |
| br_if                     |-------|----------|-----------|
| not breaking              |   ~   |     ~    |     ~     |
| break current block       |   ~   |     ~    |     D     |
| break current loop        |   ~   |     ~    |     ~     |
| break if                  |   ~   |     ~    |     ~     |
| break parent block        |   ~   |     ~    |     ~     |
| break loop inside a block |   ~   |     ~    |     ~     |
| br_table                  |-------|----------|-----------|
| block                     |-------|----------|-----------|
| normal block              |   ~   |     ~    |     ~     |
| with result               |   ~   |     ~    |     ~     |
| multiple block            |   ~   |     ~    |     D     |
| function                  |-------|----------|-----------|
| imported push             |   D   |     I    |     I     |
| imported get              |   ~   |     I    |     ~     |
| imported get push         |   ~   |     D    |     ~     |
| exported                  |   ~   |     ~    |     ~     |
| wasm function             |   ~   |     D    |     ~     |
| mutli wasm function       |   ~   |     ~    |     ~     |
| imported -> exported      |   ~   |     ~    |     ~     |
| exported -> imported      |   ~   |     ~    |     ~     |
| return                    |-------|----------|-----------|
| with                      |   ~   |     D    |     ~     |
| without                   |   ~   |     ~    |     ~     |
| in block                  |   ~   |     ~    |     ~     |
| in if                     |   D   |     D    |     ~     |
| in loop                   |   ~   |     ~    |     ~     |
| load                      |-------|----------|-----------|
| value                     |   D   |     D    |     ~     |
| address                   |   ~   |     ~    |     ~     |
| store                     |-------|----------|-----------|
| value                     |   D   |     D    |     ~     |
| address                   |   ~   |     ~    |     ~     |
| local                     |-------|----------|-----------|
| set                       |   D   |     D    |     ~     |
| tee                       |   ~   |     ~    |     ~     |
| get                       |   D   |     D    |     ~     |
| global                    |-------|----------|-----------|
| set                       |   ~   |     D    |     ~     |
| get                       |   D   |     D    |     ~     |
