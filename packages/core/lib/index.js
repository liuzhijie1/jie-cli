#! /usr/bin/env node

const semver = require('semver')
const colors = require('colors/safe')
const userHome = require('user-home')
const pathExists = require('path-exists').sync;
const path = require('path')
const commander = require('commander')

const utils = require('@jie-cli/utils')
const log = require('@jie-cli/log')
const { initCommand } = require('@jie-cli/init')
const models = require('@jie-cli/package')
const exec = require('@jie-cli/exec')

const pkg = require('../package.json')
const constant = require('./const')

let args, config;

const program = new commander.Command();

module.exports = core;

async function core() {
  try {
    await prepare();
    registerCommand();
  } catch (error) {
    log.error(error.message)
  }
}

async function prepare() {
  // utils();
  // console.log('222344444**2')
  // commands();
  // models();
  // exec();
  checkPkgVersion()
  checkNodeVersion();
  checkRoot()
  checkUserHome();
  // checkInputArgs();
  checkEnv();
  await checkGlobalUpdate();
  // getNpmInfo.getNpmInfo();
  // createDefaultConfig();
  // log.verbose('debug', 'test debug log')
  // return 'Hello from core jie 23';
}

function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false)
    .option('-tp, --targetPath <targetPath>', '是否指定本地调试文件路径', '')


  program
    .command('init [projectName] [description]')
    .option('-f, --force', '是否强制初始化项目')
    .action(exec)

  program.on('option:debug', function () {
    console.log('监听是否执行', this.opts())
    if (this.opts().debug) {
      process.env.LOG_LEVEL = 'verbose'
    } else {
      process.env.LOG_LEVEL = 'info'
    }
    log.level = process.env.LOG_LEVEL
  })

  program.on('option:targetPath', function () {
    console.log(this.opts())
    process.env.CLI_TARGET_PATH = this.opts().targetPath;
  })

  program.on('command:*', function (obj) {
    const availableCommands = program.commands.map(cmd => cmd.name())
    console.log(colors.red('未知的命令：' + obj[0]))
    if (availableCommands.length > 0) {
      console.log(colors.red('可用命令：' + availableCommands.join(',')))
    }
  })

  // if (process.argv.length < 3) {
  //   program.outputHelp();
  // } 

  program.parse(process.argv)

  // console.log(program.args)

  if (program.args && program.args.length < 1) {
    program.outputHelp();
    console.log()
  }

}

async function checkGlobalUpdate() {
  const currentVersion = pkg.version;
  const npmName = pkg.name;

  const { getNpmSemverVersion } = require('@jie-cli/get-npm-info')
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName)
  // console.log('ooo', lastVersion)
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn('更新提示：', colors.yellow(`请手动更新 ${npmName}, 当前版本：${currentVersion}, 最新版本：${lastVersion},更新命令: npm install -g ${npmName}`));
  }
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
  // console.log('cliConfig', cliConfig)
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
  }
  config = createDefaultConfig();

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
  // console.log(userHome);
}

function checkRoot() {
  // console.log(process.geteuid())   // MAC 才可以 , windos不行
  const rootCheck = require('root-check')
  rootCheck();
}

function checkNodeVersion() {
  const currentVersion = process.version;
  const lowestVersion = constant.LOWEST_NODE_VERSION;
  // console.log(currentVersion, lowestVersion)
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(colors.yellow(`jie-cli 需要安装${lowestVersion} 以上版本的 Node.js`))
  }
}


function checkPkgVersion() {
  log.notice('cli', pkg.version)
}