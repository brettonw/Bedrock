# Release Process
Bedrock is currently deployed via Sonatype Nexus and AWS Elastic Beanstalk (AWSEB). AWSEB does not support tomcat versions above 8.5ish right now, so until it does we have to do a tomcat downgrade merge step when we do a release.

1) in the tomcat9 branch, complete all changes, run "mvn clean test && gitgo" to check in the changes. You will need to be running mongod for the database tests to succeed, and you will need to be online with access to bedrock.brettonw.com for the network bag tests to succeed.
2) checkout the tomcat8 branch, and merge the tomcat 9 changes to tomcat8.
3) make sure AWSEB command-line interface (CLI) tools are up to date. Note, those tools are hard oded to python versions, so if you change your python version you have some headaches.
4) check in all merged changes, and confirm that the java version is set to 8 in the master POM.
5) use the "go-maven" tool to invoke the release process (I find the maven release step to be generally broken, so I built one that works). type "go release" in the shell and let it proceed.
6) merge changes forward to tomcat 9.
