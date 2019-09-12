'use strict';

const mongoose = require('mongoose');

require('dotenv').config();

let MONGOOSE_URI = process.env.MONGO_ATLAS;

mongoose.connect(MONGOOSE_URI, {useNewUrlParser: true});

// Start the web server
require('./src/app.js').start(process.env.PORT ||3000 );
