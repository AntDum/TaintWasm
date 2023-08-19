#include <emscripten.h>

extern int get_data_dummy(void);
extern void push_data_dummy(int);

EMSCRIPTEN_KEEPALIVE void init() {
    push_data_dummy(get_data_dummy());
}
