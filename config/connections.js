
module.exports.connections = {

  production: {
    adapter: 'sails-postgresql',
    host: 'db',
    user: 'scientilla',
    password: 'scientillapassword',
    database: 'scientilla'
  },

  development: {
    adapter: 'sails-postgresql',
    host: 'db',
    user: 'scientilla',
    password: 'scientillapassword',
    database: 'scientilla'
  },
  
  test: {
    adapter: 'sails-postgresql',
    host: 'testdb',
    user: 'scientilla',
    password: 'scientillapassword',
    database: 'scientilla'
  }
};

