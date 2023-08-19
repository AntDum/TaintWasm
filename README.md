# TaintWasm : A dynamic taint analysis

The proliferation of modern technology, including smartphones, computers, and Internet of Things (IoT) devices, has revolutionized convenience and connectivity. However, this advancement comes with a trade-off between user comfort and the risk of data leakage and privacy breaches. This master's thesis focuses on privacy issues within smart homes. The objective is to provide a proof of concept of whether dynamic taint analysis on its own is a viable solution to identify and prevent sensitive data leaks within a smart home environment. To achieve this, we created TaintWasm a dynamic taint analysis for WebAssembly binaries. TaintWasm is an extension of Wasabi a dynamic analysis framework for WebAssembly. The research unveils that efficient dynamic taint analysis is challenging to implement in many aspects. The Most notable ones are real-time analysis, portability and implicit flow handling. Though some results are encouraging and dynamic taint analysis arises as a strong asset for such systems. it appears that to be a viable solution it should be combined with other techniques to overcome real-world limitations.

## Get TainWasm

```bash
git clone https://github.com/AntDum/taintTheWasabi.git
cd taintTheWasabi
```

### Running it

In the *taintTheWasabi* folder

On Windows :

```bash
make run_server_win
```

On linux :

```bash
make run_server
```

Explore the build folder

There are 3 folders:

- benchmark : some example application
- example : some little example of code write in c
- unit_test : Unit test write in wat

The table is only for the unit_test.
For the other it does nothing and is only there for simplisity

On each test page and in the unit test table, you'll find a performance section that displays the execution times. This section also includes a comparison between instrumented and non-instrumented scenarios.

### Build the test

Only on linux

#### Dependencies

- WebAssembly Binary Toolkit (WABT): <https://github.com/WebAssembly/wabt>. `wasm2wat`/`wat2wasm`
- Wasabi: <https://github.com/danleh/wasabi>. `wasabi`
- Emscripten: <https://emscripten.org>. `emcc`

#### Build

```bash
make all
```
