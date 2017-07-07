# Bedrock Client JS
Javascript tools for building service-client interactions. 

### Building
This project uses ant for building, with the "dev" target being the default:
 
    ant | ant dev | ant rel

### Build Dependencies
* ant
* node/npm
* gcc (for the C-preprocessor)
* uglifyjs (for Minification)
* yuidoc (for Documentation)

### UglifyJS2
For ES6 compatibility, you have to use the "harmony" branch of UglifyJS2:

    npm install uglify-es -g
    
### YUIDoc
YUIDoc only reads the comments, so it doesn't impose any code structure:
 
    npm install -g yuidocjs
    
It would be better if I could point it at a single file. Syntax reference at: 
http://yui.github.io/yuidoc/

The theme is "lucid", from https://www.npmjs.com/package/yuidoc-lucid-theme

    npm install -g yuidoc-lucid-theme
    
