#! /usr/bin/env node

const semver = require('semver')
const colors = require('colors/safe')
const userHome = require('user-home')
const pathExists = require('path-exists').sync;
const path = require('path')

const utils = require('@jie-cli/utils')
const log = require('@jie-cli/log')
const commands = require('@jie-cli/commands')
const models = require('@jie-cli/models')

const pkg = require('../package.json')
const constant = require('./const')

let args, config;

module.exports = core;

function core() {
  try {
    // utils();
    // console.log('222344444**2')
    // commands();
    // models();
    checkPkgVersion()
    checkNodeVersion();
    checkRoot()
    checkUserHome();
    checkInputArgs();
    checkEnv();
    checkGlobalUpdate();
    // getNpmInfo.getNpmInfo();
    // createDefaultConfig();
    // log.verbose('debug', 'test debug log')
    return 'Hello from core jie 23';
  } catch (error) {
    log.error(error.message)
  }
}

function checkGlobalUpdate() {
  const currentVersion = pkg.version;
  const npmName = pkg.name;

  const { getNpmInfo } = require('@jie-cli/get-npm-info')
  getNpmInfo(npmName)
}

function createDefaultConfig() {
  const cliConfig = {
    home: userHome
  }
  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
  } else {
    cliConfig['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME)
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome;
  return cliConfig;
}

function checkEnv() {
  const dotenv = require('dotenv')
  const dotenvPath = path.resolve(userHome, '.env')
  if (pathExists(dotenvPath)) {
    config = dotenv.config({
      path: dotenvPath
    });
  } else {
    config = createDefaultConfig();
  }
  log.verbose('环境变量', config, process.env.DB_USER)
}

function checkInputArgs() {
  const minimist = require('minimist')
  args = minimist(process.argv.slice(2))
  console.log(args)
  checkArgs();
}

function checkArgs() {
  if (args.debug) {
    process.env.LOG_LEVEL = 'verbose'
  } else {
    process.env.LOG_LEVEL = 'info'
  }
  log.level = process.env.LOG_LEVEL;
}

function checkUserHome() {
  // console.log(pathExists(userHome))
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red('当前登录用户主目录不存在！'))
  }
  console.log(userHome);
}

function checkRoot() {
  // console.log(process.geteuid())   // MAC 才可以 , windos不行
  const rootCheck = require('root-check')
  rootCheck();
}

function checkNodeVersion() {
  const currentVersion = process.version;
  const lowestVersion = constant.LOWEST_NODE_VERSION;
  console.log(currentVersion, lowestVersion)
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(colors.yellow(`jie-cli 需要安装${lowestVersion} 以上版本的 Node.js`))
  }
}


function checkPkgVersion() {
  log.notice('cli', pkg.version)
}