# Service Base
A simple base for a microservice-type of servlet. It processes a query string and post data as JSON, 
and separates all the boiler-plate code out so the end-product can focus only on its API.

# To create a Service
You need to do 2 things:
- Create the api.json file as a resource
- Derive your Servlet class from Base with handlers

# About Handlers
Handlers are autowired by the Base according to the names of the events, converted to "handleEvent" + YourEventName (camel cased).

