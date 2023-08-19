#include <emscripten.h>

extern int get_data_dummy(void);
extern void push_data_dummy(int);

EMSCRIPTEN_KEEPALIVE void init() {
    get_data_dummy();
    push_data_dummy(0);
}
