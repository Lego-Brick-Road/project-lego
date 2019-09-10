'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const errorHandler = require('./middleware/500.js');
const notFound = require('./middleware/404.js');
const routes = require('./router.js');

// const webApiRoutes = require('./web-api-route');

<<<<<<< HEAD
const roleTestRoutes = require('./brick-router.js');
const myBricksRoute = require('./myBricks');
=======
const brickRouter = require('./brick-router.js');
>>>>>>> e17c4c769b79ee5f6c2092ab26af5ce09fabb1c3


require('./helper/init-roles.js')();

const app = express();

app.use(cors());
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TODO: Temporary route to get brick data from Rebrickable API
// app.use(webApiRoutes);

app.use(routes);
<<<<<<< HEAD
app.use(roleTestRoutes);
app.use(myBricksRoute);
=======
app.use(brickRouter);

>>>>>>> e17c4c769b79ee5f6c2092ab26af5ce09fabb1c3
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
