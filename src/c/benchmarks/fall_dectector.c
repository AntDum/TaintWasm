#include "../api.h"
#include <string.h>

int init() {
    char* sensor = "camera";
    int image_size = -1;
    int* image = (int*)get_data(sensor, strlen(sensor), &image_size);

    if (image_size > -1) {
        return 0;
    }

    

    return 1;
}