var data_text = "10.4°C";
var data_int = 100;
const image_of_me = "ABDCDE";

var last_leak = {name:""};

const randomFloat = (min, max) =>(Math.random() * (max - min) + min);

function get_string(from, size) {
    return String.fromCharCode.apply(null, new Int8Array(
        api.memory.buffer,
        from,
        size
    ));
}

function create_string(data) {
    const str = new Int8Array(api.memory.buffer);
    for (let index = 0; index < data.length; index++) {
        str[index] = data.charCodeAt(index);
    }
    return { ptr:str.byteOffset, length:data.length};
}

function create_int(data) {
    const int = new Int8Array(api.memory.buffer);
    int[0] = data;
    return { ptr: int.byteOffset, length: 1};
}

function create_image(image) {
    const img = atob(image);
    const dataPtr = api.malloc(img.length);
    const dataOnHeap = new Uint8Array(api.memory.buffer, dataPtr, img.length);
    dataOnHeap.set(img);
    return { ptr:dataOnHeap.byteOffset, length:img.length }
}

function set_value(at, value) {
    let arr = new Int32Array(api.memory.buffer, at, 1);
    arr.set([value]);
}

function get_data(from, size, return_size) {
    // Sensor
    let sensor = get_string(from, size);
    console.log("GET DATA FROM :", sensor);

    // console.log("Return pointer", return_size);
    

    // Value of sensor
    switch(sensor) {
        case ("temp_sens"): {
            const {ptr, length} = create_string(randomFloat(-30, 60)+"°C");
            set_value(return_size, length);
            return ptr;
        }
        case ("camera"): {
            const { ptr, length } = create_image(data_text);
            set_value(return_size, length);
            return ptr;
        }
        default: {
            const { ptr, length } = create_int(100);
            set_value(return_size, length);
            return ptr;
        }
    }
}

function push_data(destination, dest_size, data, dat_size) {
    let taintLvl = 0;
    if (last_leak.name === "push_data") {
        taintLvl = last_leak.taintLvl;
    }

    let recv_data =  get_string(data, dat_size);
    let recv_dest = get_string(destination, dest_size);
    
    let log = console.log;
    if (taintLvl == 1 ||taintLvl == 2) log = console.warn;
    if (taintLvl == 3) log = console.error;
    log("DATA PUSHED :", recv_data, " TO ", recv_dest);


    if (last_leak.name === "push_data") last_leak = {name:""};
}

function push_data_dummy(value) {
    let taintLvl = 0;
    if (last_leak.name === "push_data_dummy") {
        taintLvl = last_leak.taintLvl;
    }

    let log = console.log;
    if (taintLvl == 1 || taintLvl == 2) log = console.warn;
    if (taintLvl == 3) log = console.error;
    log("DATA DUMMY PUSHED:", value)

    if (last_leak.name === "push_data_dummy") last_leak = { name: "" };
}

function print(val) {
    console.log(val)
}

function leakCallBack(functionName, args, taintLvl) {
    last_leak = {name:functionName,
                args:args,
                taintLvl: taintLvl,
                };
}

const api = {
        get_data,
        push_data,
        print,
        get_data_dummy: () => data_int,
        push_data_dummy,
    };