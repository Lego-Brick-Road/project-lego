'use strict';

const Roles = require('../model/role.js');

let roles = {
  superuser: { role: 'superuser', capabilities: ['create', 'read', 'update', 'delete', 'superuser'] },
  admin: { role: 'admin', capabilities: ['create', 'read', 'update', 'delete'] },
  editor: { role: 'editor', capabilities: ['create', 'read', 'update'] },
  user: { role: 'user', capabilities: ['read'] },
};

module.exports = () => {
  Object.keys(roles).forEach(async (userType) => {
    await new Roles(roles[userType]).save();
  });
};

