
module.exports.connections = {

  production: {
    adapter: 'sails-postgresql',
    host: '',
    user: 'scientilla',
    password: '',
    database: 'scientilla'
  },

  development: {
    adapter: 'sails-postgresql',
    host: '',
    user: 'scientilla',
    password: '',
    database: 'scientilla'
  },
  
  test: {
    adapter: 'sails-postgresql',
    host: 'localhost',
    user: 'scientilla',
    password: 'scientillapassword',
    database: 'scientillatest'
  }
};

