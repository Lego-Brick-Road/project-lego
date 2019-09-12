'use strict';

const mongoose = require('mongoose');

require('dotenv').config();

// Vinicio - why is tthe mongose URI implemented this way? It seems too overcomplicated.
let MONGOOSE_URI = newFunction();

mongoose.connect(MONGOOSE_URI, {useNewUrlParser: true});


// Start the web server
require('./src/app.js').start(process.env.PORT ||3000 );
// Vinicio - this should be in an .env Also, can you elaborate on what this function is doing?
function newFunction() {
  return 'mongodb+srv://hanna9:estifaman9@cluster0-s90so.mongodb.net/test?retryWrites=true&w=majority';
}
