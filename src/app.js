'use strict';

const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const expressSwagger = require('express-swagger-generator')(app);

const errorHandler = require('./middleware/500.js');
const notFound = require('./middleware/404.js');
const authRouter = require('./auth-router.js');
const brickRouter = require('./brick-router.js');

require('./helper/init-roles.js')();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));

// SWAGGER======================
const options = {
  swaggerDefinition: {
    info: {
      description: 'This is a sample server',
      title: 'Swagger',
      version: '1.0.0',
    },
    host: 'localhost:3000',
    basePath: '/',
    produces: [
      'application/json',
    ],
    schemes: ['http'],
    securityDefinitions: {
      JWT: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        description: '',
      },
    },
  },
  basedir: __dirname, //app absolute path
  files: ['./**/*.js'], //Path to the API handle folder
};

// ROUTES=========================

app.use('/train', express.static('public/train'));
app.use('/classify', express.static('public/classify'));

app.get('/', (req, res, next) => {
  res.send('./public');
});

app.use(authRouter);
app.use(brickRouter);

//Setting ejs as view engine
app.set('view engine', 'ejs');

expressSwagger(options);

//================================

app.use('/docs', express.static('docs'));

app.use('*', notFound);
app.use(errorHandler);

module.exports = {
  server: app,
  start: (port) => {
    app.listen(port, () => {
      console.log(`Server is up on ${port}`);
    });
  },
};
