
module.exports.connections = {
 
  production: {
    adapter: 'sails-postgresql',
    host: 'localhost',
    user: 'scientilla',
    password: 'scientillapassword',
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

