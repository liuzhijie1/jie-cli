#! /usr/bin/env node
const utils = require('@jie-cli/utils')


module.exports = core;

function core() {
  utils();
  console.log('222')
  return 'Hello from core jie 23';
}
core();