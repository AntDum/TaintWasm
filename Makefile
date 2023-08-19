all: unit_test c b

unit_test:
	./src/builder/buildAllWat.sh taint_analysis src/wat/unit_test
	python3 src/builder/create_test.py build/unit_test
	python3 src/builder/create_test_perf.py build/unit_test

c:
	./src/builder/buildAllC.sh src/c/examples
	python3 src/builder/create_test.py build/examples

b:
	./src/builder/buildAllC.sh src/c/benchmarks
	python3 src/builder/create_test.py build/benchmarks

run_server:
	python3 -m http.server

run_server_win:
	py -m http.server