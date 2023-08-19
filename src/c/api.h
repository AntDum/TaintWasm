#include <emscripten.h>

extern void* get_data(const char *from, const int size, int* r_size);
extern void push_data(const char* dest, const int desize, const void* data, const int dasize);
extern void get_data_dummy();
extern void push_data_dummy(int data);
extern void print(int val);

EMSCRIPTEN_KEEPALIVE int init();