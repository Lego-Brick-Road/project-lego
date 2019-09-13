'use strict';

process.env.SECRET = 'test';

const Cookies = require('../src/middleware/cookies.js');


describe('Cookie to Auth Header', () => {

  it('can set an auth header from cookie', () => {

    const req = {headers:{cookie:'auth=123456'}};
    const next = jest.fn();
    const res = {};

    Cookies(req, res, next);

    expect(req.headers.authorization).toBe('bearer 123456');

  }); 

});
