'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const errorHandler = require('./middleware/500.js');
const notFound = require('./middleware/404.js');
const routes = require('./router.js');

const myBricksRoute = require('./myBricks');
const brickRouter = require('./brick-router.js');

require('./helper/init-roles.js')();

const app = express();

app.use(cors());
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));

// ROUTES=========================

app.use('/train', express.static('public/train'));
app.use('/classify', express.static('public/classify'));

app.get('/', (req, res, next) => {
  res.send('./public');
});

app.use(routes);
app.use(myBricksRoute);
app.use(brickRouter);

//================================
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
