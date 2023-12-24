const request = require('@jie-cli/request')

module.exports = function() {
  return request({
    url: '/project/template'
  })
}