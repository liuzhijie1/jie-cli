'use strict';
const LOWEST_NODE_VERSION = '12.0.0'
const colors = require('colors/safe')
const semver = require('semver')
const log = require('@jie-cli/log')
const { isObject } = require('@jie-cli/utils')

class Command {
  constructor(argv) {
    // log.verbose('Command constructor', argv)
    if (!argv) {
      throw new Error('参数不能为空')
    }
    if (!Array.isArray(argv)) {
      throw new Error('参数必须为数组！')
    }
    if (argv.length < 1) {
      throw new Error('参数列表为空！')
    }
    this._argv = argv;
    let runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve();
      chain = chain.then(() => this.checkNodeVersion())
      chain = chain.then(() => this.initArgs())
      chain = chain.then(() => this.init())
      chain = chain.then(() => this.exec())
      chain.catch(err => {
        log.error(err.message)
      })
    })
  }

  initArgs() {
    this._cmd = this._argv[this._argv.length - 1]
    this._argv = this._argv.slice(0, this._argv.length - 1)
    // console.log(this._cmd, this._argv)
  }

  checkNodeVersion() {
    const currentVersion = process.version;
    const lowestVersion = LOWEST_NODE_VERSION;
    // console.log(currentVersion, lowestVersion)
    if (!semver.gte(currentVersion, lowestVersion)) {
      throw new Error(colors.yellow(`jie-cli 需要安装${lowestVersion} 以上版本的 Node.js`))
    }
  }

  init() {
    throw new Error('init 必须实现')
  }

  exec() {
    throw new Error('exec 必须实现')
  }
}

module.exports = Command;


