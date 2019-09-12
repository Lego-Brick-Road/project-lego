'use strict';

process.env.SECRET = 'secretsecret';

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
            var token = jwt.verify(results.headers.token, process.env.SECRET);
            id = token.id;
            encodedToken = results.headers.token;
            expect(token.id).toBeDefined();
            expect(token.capabilities).toBeDefined();
          });
      });

      it('can signin with basic', () => {
        return mockRequest.post('/signin')
          .auth(users[userType].username, users[userType].password)
          .then(results => {
            var token = jwt.verify(results.headers.token, process.env.SECRET);
            expect(token.id).toEqual(id);
            expect(token.capabilities).toBeDefined();
          });
      });

      it('can signin with bearer', () => {
        return mockRequest.post('/signin')
          .set('Authorization', `Bearer ${encodedToken}`)
          .then(results => {
            var token = jwt.verify(results.headers.token, process.env.SECRET);
            expect(token.id).toEqual(id);
            expect(token.capabilities).toBeDefined();
          });
      });
    });
  });
});

describe('Bricks Router', () => {

  // it('can get user bricks', () => {
  //   return mockRequest.get('/bricks')
  //     .set('Authorization', `Bearer ${encodedToken}`)
  //     .then(results => {
  //       expect(results.text).toEqual('{"10000":1}');
  //     });
  // });

  it('can increase the quantity of a user\'s existing brick', () => {
    return mockRequest.post('/brick/10000')
      .set('Authorization', `Bearer ${encodedToken}`)
      .then(results => {
        expect(results.text).toEqual('{"10000":2}');
      });
  });

  it('can add a new brick to a user\'s bricks', () => {
    return mockRequest.post('/brick/22222')
      .set('Authorization', `Bearer ${encodedToken}`)
      .then(results => {
        expect(results.text).toEqual('{"10000":2,"22222":1}');
      });
  });

  // TODO: check if certain function have been called
  // it('can get a brick not in our DB', () => {
  //   return mockRequest.get('/brick/4079')
  //     .set('Authorization', `Bearer ${encodedToken}`)
  //     .then(results => {
  //       expect(results.text).toEqual('{"10000":2,"22222":1}');
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

describe('module.exports', ()=>{
  
})