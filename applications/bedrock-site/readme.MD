## Description

Bag Test Server is a simple JSON repeater designed to be part of the test suite for com.brettonw.bedrock.

Online JSON test servers were proving very unreliable, substantially affecting the software development process as tests randomly failed. We developed this very simple application to run on a default Tomcat installation on localhost to provide a more reliable test service.

Some people might find it to be a useful application for themselves, so we are sharing it as a separate project from the bag library.

## URL

http://localhost:8080/bag-test-server/api?command=echo&word=hello

## Commands

- **ip:** return a JSON object with the IP address of the requestor.
- **echo:** return a JSON object representing the URL query parameters, with the tag "post-data" containing the JSON from a POST request (if present).
- **post-data:** return a JSON array or object as an echo of the POST data.
- **headers:** return a JSON array of the headers supplied in the request.</li>
