# Release Process
Bedrock is currently deployed via Sonatype Nexus and AWS Elastic Beanstalk (AWSEB). AWSEB does not support tomcat versions above 8.5ish right now, so we are migrating to a self-built container running Tomcat 9 on Open JDK 11.

As part of this change, we are switching to a more git-flow oriented branching structure, where master will be reserved for final builds, and a new branch called development will be used for most changes before deployment. tomcat8 and tomcat 9 are going away.

1) in the development branch, complete all changes, run "mvn clean test && gitgo" to check in the changes. You will need to be running mongod for the database tests to succeed, and you will need to be online with access to bedrock.brettonw.com for the network bag tests to succeed.
2) checkout the master branch, and merge the development branch changes to master.
3) make sure AWSEB command-line interface (CLI) tools are up to date. Note, those tools are hard coded to python versions, so if you change your python version you have some headaches.
5) use the "go-maven" tool to invoke the release process (I find the maven release step to be generally broken, so I built one that works). type "go release" in the shell and let it proceed.
6) deploy the site changes by navigating to the bedrock-site directory and running "eb deploy".
7) merge changes back to development (if needed).
