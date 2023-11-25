'use strict';
const npmlog = require('npmlog')

module.exports = log_;

function log_() {
  npmlog.info('cli', 'test1')
}
