#! /usr/bin/env bash

. bin/common.sh $1

echo "Testing $PROJECT_NAME in $PROJECT_DIR";

#<exec executable="jjs" failonerror="true">
#<arg value="-scripting"/>
#<arg value="--language=es6"/>
#<arg value="${javascript.testDistDirectory}/test-harness.js"/>
#<arg value="${javascript.srcDistLatestDirectory}/bedrock-debug.js"/>
#<arg value="${javascript.testDistDirectory}/binary-search.js"/>
#</exec>

exit 0;
