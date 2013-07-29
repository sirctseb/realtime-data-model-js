#!/bin/bash

# build dependency file (deprecated)
python closure-library/closure/bin/calcdeps.py -i realtime_data_model.js -o deps > rdm-deps.js

# combine and run closure compiler
python closure-library/closure/bin/build/closurebuilder.py \
	--root=closure-library/ \
	--root=rdm \
	--namespace="rdm" \
	--output_mode=compiled \
	--compiler_jar=compiler.jar \
	--compiler_flags="--compilation_level=SIMPLE_OPTIMIZATIONS" \
	> rdm.js
	# --compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" \