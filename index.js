'use strict';

const mongoose = require('mongoose');

require('dotenv').config();

let MONGOOSE_URI = newFunction();

mongoose.connect(MONGOOSE_URI, {useNewUrlParser: true});

// Start the web server
require('./src/app.js').start(process.env.PORT ||3000 );
function newFunction() {
  return 'mongodb+srv://hanna9:estifaman9@cluster0-s90so.mongodb.net/test?retryWrites=true&w=majority';
}
