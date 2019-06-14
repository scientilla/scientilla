module.exports.connections = {
  "production": {
    "adapter": "sails-postgresql",
    "host": "localhost",
    "user": "scientilla",
    "password": "scientillapassword",
    "database": "scientilla"
  },
  "development": {
    "adapter": "sails-postgresql",
    "host": "localhost",
    "user": "scientilla",
    "password": "scientillapassword",
    "database": "scientilla"
  },
  "test": {
    "adapter": "sails-postgresql",
    "host": "db-test",
    "user": "scientilla",
    "password": "scientillapassword",
    "database": "scientillatest"
  }
}

