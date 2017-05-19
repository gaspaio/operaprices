var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  APP_CONFIG: {
    apiUrl: '"http://localhost:9999/api"'
  }
})
