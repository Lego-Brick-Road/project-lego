'use strict';

process.env.SECRET = 'test';

const jwt = require('jsonwebtoken');

const Roles = require('../src/model/role.js');
const server = require('../src/app.js').server;
const supergoose = require('cf-supergoose');

const mockRequest = supergoose.server(server);

let users = {
  admin: { username: 'admin', password: 'password', role: 'admin', email: 'test@test.com', bricks: {10000: 1}},
  editor: { username: 'editor', password: 'password', role: 'editor', email: 'test@test.com', bricks: {10000: 1} },
  user: { username: 'user', password: 'password', role: 'user', email: 'test@test.com', bricks: {10000: 1} },
};

let roles = {
  admin: { role: 'admin', capabilities: ['create', 'read', 'update', 'delete'] },
  editor: { role: 'editor', capabilities: ['create', 'read', 'update'] },
  user: { role: 'user', capabilities: ['read'] },
};

beforeAll(async (done) => {
  await supergoose.startDB();
  const admin = await new Roles(roles.admin).save();
  const editor = await new Roles(roles.editor).save();
  const user = await new Roles(roles.user).save();
  done();
});

let encodedToken;
let id;

afterAll(supergoose.stopDB);

describe('Auth Router', () => {

  Object.keys(users).forEach(userType => {

    describe(`${userType} users`, () => {
      it('can create one', () => {
        return mockRequest.post('/signup')
          .send(users[userType])
          .then(results => {
            var token = jwt.verify(results.text, process.env.SECRET);
            id = token.id;
            encodedToken = results.text;
            expect(token.id).toBeDefined();
            expect(token.capabilities).toBeDefined();
          });
      });

      it('can signin with basic', () => {
        return mockRequest.post('/signin')
          .auth(users[userType].username, users[userType].password)
          .then(results => {
            var token = jwt.verify(results.text, process.env.SECRET);
            expect(token.id).toEqual(id);
            expect(token.capabilities).toBeDefined();
          });
      });

      it('can signin with bearer', () => {
        return mockRequest.post('/signin')
          .set('Authorization', `Bearer ${encodedToken}`)
          .then(results => {
            var token = jwt.verify(results.text, process.env.SECRET);
            expect(token.id).toEqual(id);
            expect(token.capabilities).toBeDefined();
          });
      });
    });
  });
});

describe('Bricks Router', () => {

  it('can get user bricks', () => {
    return mockRequest.get('/bricks')
      .set('Authorization', `Bearer ${encodedToken}`)
      .then(results => {
        expect(results.text).toEqual('{"10000":1}');
      });
  });

  it('can increase the quantity of a user\'s existing brick', () => {
    return mockRequest.post('/brick?partNum=10000')
      .set('Authorization', `Bearer ${encodedToken}`)
      .then(results => {
        expect(results.text).toEqual('{"10000":2}');
      });
  });

  // it('can get brick data from the rebrickable API', () => {
  //   let key = 'af366864216c9d8cfedf0e4aec5cd43e';
  //
  //   return mockRequest.get(`/brick?partNum=10000`)
  //     .send({key: 'af366864216c9d8cfedf0e4aec5cd43e'})
  //     .set('Authorization', `Bearer ${encodedToken}`)
  //     .then(results => {
  //       expect(results).toEqual('s');
  //     });
  // });

});

describe('Errors', () => {
  it('returns 404 page does not exist', () => {
    return mockRequest.get('/random')
      .then(results => {
        expect(results.status).toEqual(404);
      });
  });

  it('returns 500 when server error', () => {
    return mockRequest.post('/signin')
      .then(results => {
        expect(results.status).toEqual(500);
      });
  });
});