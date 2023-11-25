'use strict';
const log = require('npmlog')

module.exports = log;

function log() {
  log.info('cli', 'test')
}
