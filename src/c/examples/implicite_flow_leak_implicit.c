#include <emscripten.h>

extern int get_data_dummy(void);
extern void push_data_dummy(int);

EMSCRIPTEN_KEEPALIVE void init() {
    int secret = get_data_dummy();
    int public = -10;
    if (secret == 0) {
        public = 0;
    } else {
        public = 10;
    }
    push_data_dummy(public);
}
