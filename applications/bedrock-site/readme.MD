## Description

This Bedrock-Site Service hosts Bedrock APIs, and provides a simple JSON repeater designed to be part of the test suite for com.brettonw.bedrock.

Online JSON test servers were proving very unreliable, substantially affecting the software development process as tests randomly failed. We developed this very simple application to run on a default Tomcat installation on localhost to provide a more reliable test service.

Some people might find it to be a useful application for themselves, so we are sharing it as a separate project from the bedrock library.

## URL

http://localhost:8080/bedrock-site/api?command=echo&word=hello

## Commands

- **help:** return a JSON object that documents the entire interface.
- **version:** return a JSON object with the build version for the current WAR.
- **ok:** return a JSON object with "OK".
- **ip:** return a JSON object with the IP address of the requestor.
- **echo:** return a JSON object representing the URL query parameters, with the tag "post-data" containing the JSON from a POST request (if present).
- **post-data:** return a JSON array or object as an echo of the POST data.
- **headers:** return a JSON array of the headers supplied in the request.</li>
- **fetch:** return a JSON object with the content response from the requested URL.</li>

## Some Coding Standards
$ is used for name space
_ is used for object declaration
