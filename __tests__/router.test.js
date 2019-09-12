'use strict';

process.env.SECRET = 'secretsecret';

const jwt = require('jsonwebtoken');
const Roles = require('../src/model/role.js');
const Bricks = require('../src/model/brick.js');
const server = require('../src/app.js').server;
const supergoose = require('cf-supergoose');

const mockRequest = supergoose.server(server);

const users = {
  admin: { username: 'admin', password: 'password', role: 'admin', email: 'test@test.com', bricks: {2518: 1}},
  editor: { username: 'editor', password: 'password', role: 'editor', email: 'test@test.com', bricks: {2518: 1} },
  user: { username: 'user', password: 'password', role: 'user', email: 'test@test.com', bricks: {2518: 1} },
};

const roles = {
  admin: { role: 'admin', capabilities: ['create', 'read', 'update', 'delete'] },
  editor: { role: 'editor', capabilities: ['create', 'read', 'update'] },
  user: { role: 'user', capabilities: ['read'] },
};

const mockBricks = [
  {
    name: 'Plant, Palm Leaf Large 10 x 5',
    partNum: '2518',
    imgUrl: 'https://cdn.rebrickable.com/media/parts/ldraw/2/2518.png',
    externalId: { BrickOwl: [Array] },
  },
  {
    name: 'Door 1 x 3 x 6 Curved Top',
    partNum: '2554',
    imgUrl: 'https://cdn.rebrickable.com/media/parts/ldraw/6/2554.png',
    externalId: { BrickOwl: [Array] },
  },
];

beforeAll(async (done) => {
  await supergoose.startDB();
  const admin = await new Roles(roles.admin).save();
  const editor = await new Roles(roles.editor).save();
  const user = await new Roles(roles.user).save();
  await new Bricks(mockBricks[0]).save();
  await new Bricks(mockBricks[1]).save();
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

  it('can increase the quantity of a user\'s existing brick', () => {
    return mockRequest.post('/brick/2518')
      .set('Authorization', `Bearer ${encodedToken}`)
      .then(results => {
        expect(results.text).toEqual('{"2518":2}');
      });
  });
  
  it('can add a new brick to a user\'s bricks', () => {
    return mockRequest.post('/brick/2554')
      .set('Authorization', `Bearer ${encodedToken}`)
      .then(results => {
        expect(results.text).toEqual('{"2518":2,"2554":1}');
      });
  });
  
  it('can get user bricks', () => {
    return mockRequest.get('/bricks')
      .set('Authorization', `Bearer ${encodedToken}`)
      .then(results => {
        expect(results.status).toEqual(200);
      });
  });
  
  // TODO: check if certain function have been called
  it('can get a brick from DB', () => {
    return mockRequest.get('/brick/2554')
      .set('Authorization', `Bearer ${encodedToken}`)
      .then(results => {
        expect(results.body.partNum).toEqual('2554');
      });
  });

  it('can DELETE a brick from user bricks', () => {
    return mockRequest.delete('/brick/2554')
      .set('Authorization', `Bearer ${encodedToken}`)
      .then(results => {
        expect(results.text).toEqual('{"2518":2}');
      });
  });

  it('can UPDATE a brick from user bricks', () => {
    return mockRequest.put('/brick/2518')
      .set('Authorization', `Bearer ${encodedToken}`)
      .then(results => {
        expect(results.status).toEqual(204);
      });
  });
  
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