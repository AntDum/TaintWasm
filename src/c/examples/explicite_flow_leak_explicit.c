#include <emscripten.h>

extern int get_data_dummy(void);
extern void push_data_dummy(int);

EMSCRIPTEN_KEEPALIVE void init() {
    int secret = get_data_dummy();
    int public = secret;
    push_data_dummy(public);
}
