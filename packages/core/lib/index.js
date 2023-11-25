#! /usr/bin/env node
const utils = require('@jie-cli/utils')
const pkg = require('../package.json')
const log = require('@jie-cli/log')

module.exports = core;

function core() {
  utils();
  // console.log('222344')
  log();
  checkPkgVersion()
  return 'Hello from core jie 23';
}

function checkPkgVersion() {
  console.log(pkg.version)
}