#! /usr/bin/env node

const importLocal = require('import-local')

if (importLocal(__filename)) {
  require('npmlog').info('cli', '正在使用 jie-cli 本地文件')
} else {
  // console.log('import local false2333', __filename)
  require('../lib')(process.argv.slice(2))
}