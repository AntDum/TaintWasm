#include "../api.h"
#include <string.h>
#include <stdio.h>
#include <stdlib.h>

int init() {
    int temp_len = -1;
    char* sensor = "temp_sens";
    char* temperature = (char*)get_data(sensor, strlen(sensor), &temp_len);

    char temp[temp_len-2];
    memcpy(temp, temperature, temp_len-2);

    float temp_float = atof(temp);

    char* query_log = "mycompany.com/temperature_log";
    char* query_alert = "mycompany.com/temperature_alert";
    
    char message_log[50];
    sprintf(message_log, "userID=%s&temp=%f", "DEADBEEF", temp_float);
    push_data(query_log, strlen(query_log), message_log, strlen(message_log));
    
    if (temp_float > 40) {
        char* message = "Temperature too high, your house is burning.";
        char data[70];
        sprintf(data, "userID=%s&msg=%s", "DEADBEEF", message);
        push_data(query_alert, strlen(query_alert), data, strlen(data));
    }
    else if (temp_float < -10) {
        char* message = "Your house is now a freezer.";
        char data[70];
        sprintf(data, "userID=%s&msg=%s", "DEADBEEF", message);
        push_data(query_alert, strlen(query_alert), data, strlen(data));
    }
    else if (temp_float < 15) {
        char* message = "Your house is too cold";
        char data[70];
        sprintf(data, "userID=%s&msg=%s", "DEADBEEF", message);
        push_data(query_alert, strlen(query_alert), data, strlen(data));
    }
    else if (temp_float > 27) {
        char* message = "Your house is too hot";
        char data[70];
        sprintf(data, "userID=%s&msg=%s", "DEADBEEF", message);
        push_data(query_alert, strlen(query_alert), data, strlen(data));
    } else {
        char* message = "Your house has a good temperature";
        char data[70];
        sprintf(data, "userID=%s&msg=%s", "DEADBEEF", message);
        push_data(query_alert, strlen(query_alert), data, strlen(data));
    }

    return 0;
}