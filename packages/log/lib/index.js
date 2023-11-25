'use strict';
const npmlog = require('npmlog')

module.exports = log;

function log() {
  npmlog.info('cli', 'test1')
}
