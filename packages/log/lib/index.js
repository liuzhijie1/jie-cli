'use strict';
const npmlog = require('npmlog')

npmlog.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info'

npmlog.heading = 'jie-cli'

npmlog.headingStyle = { fg: 'white', bg: 'green' }

npmlog.addLevel('success', 2000, { fg: 'green', bold: true })

module.exports = npmlog;

function index() {
  npmlog.info('cli', 'test1')
  npmlog.success('ok', 'family')
}
