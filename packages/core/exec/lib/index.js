'use strict';

const Package = require('@jie-cli/package')
const log = require('@jie-cli/log')

const path = require('path')
const cp = require('child_process')

const SETTINGS = {
  init: "@jie-cli/init"
}

const CACHE_DIR = 'dependencies'

async function exec() {
  let targetPath = process.env.CLI_TARGET_PATH
  let storeDir = ''
  let pkg
  const homePath = process.env.CLI_HOME_PATH
  log.verbose('targetPath', targetPath)
  log.verbose('homePath', homePath)

  // projectName cmbObj Command
  // console.log('arguments', arguments)
  const cmbObj = arguments[arguments.length - 2]
  const command = arguments[arguments.length - 1]
  const cmdName = command.name()
  const packageName = SETTINGS[cmdName]
  const packageVersion = 'latest'

  // console.log(cmbObj)
  // console.log(command.name())

  if (!targetPath) {
    // 生产缓存路径
    targetPath = path.resolve(homePath, CACHE_DIR)
    storeDir = path.resolve(targetPath, 'node_modules')
    log.verbose('targetPath', targetPath)
    log.verbose('storeDir', storeDir)
    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion
    });
    if (await pkg.exists()) {
      // 更新package
      // console.log('更新package');
      await pkg.update();
    } else {
      // 安装package
      await pkg.install();
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion
    });
  }

  // example rootFile => D:/Project/Learn/webimooc/jie-cli/packages/commands/init/lib/index.js
  // console.log('pkgexist', await pkg.exists())
  // console.log('arguments', arguments)
  const rootFile = pkg.getRootFilePath();
  console.log('rootFile', rootFile)
  if (rootFile) {
    try {
      // NOTE 在主线程中执行的 
      // require(rootFile).call(null, Array.from(arguments));
      const args = Array.from(arguments)
      const cmd = args[args.length - 1]
      const o = Object.create(null)
      Object.keys(cmd).forEach(key => {
        if (cmd.hasOwnProperty(key) && !key.startsWith('_') && key !== 'parent') {
          o[key] = cmd[key]
        }
      })
      // console.log('cmd', cmd)
      // console.log('o', o)
      args[args.length - 1] = o;
      const code = `require('${rootFile}').call(null, ${JSON.stringify(args)})`
      // NOTE 在windos下系统浴缸执行的命令
      // cp.spawn('cmd', ['/c', 'node', '-e', code]) 
      const child = spawn('node', ['-e', code], {
        cwd: process.cwd(),
        stdio: 'inherit'
      })
      child.on('error', e => {
        log.error(e.message)
        process.exit(1)
      })
      child.on('exit', e => {
        log.verbose('命令执行成功: ' + e)
        process.exit(e)
      })
      // child.stdout.on('data', (chunk => {

      // }))
      // child.stderr.on('data', (chunk => {

      // }))
    } catch (error) {
      log.error(error.message)
    }
  }
  // console.log(pkg)
  // console.log(pkg.getRootFilePath());
  // console.log('exec')
}

function spawn(command, args, options) {
  const win32 = process.platform === 'win32';

  const cmd = win32 ? 'cmd' : command;
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args

  return cp.spawn(cmd, cmdArgs, options || {});
}


module.exports = exec;