'use strict';

const Package = require('@jie-cli/package')
const log = require('@jie-cli/log')

const path = require('path')

const SETTINGS = {
  init: "@jie-cli/init"
}

const CACHE_DIR = 'dependencies'

function exec() {
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

  console.log(cmbObj)
  console.log(command.name())

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
    if (pkg.exists()) {
      // 更新package
    } else {
      // 安装package
      pkg.install();
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion
    });
  }

  // example rootFile => D:/Project/Learn/webimooc/jie-cli/packages/commands/init/lib/index.js
  console.log('arguments', arguments)
  const rootFile = pkg.getRootFilePath();
  require(rootFile).apply(null, arguments);

  // console.log(pkg)
  // console.log(pkg.getRootFilePath());
  // console.log('exec')

}


module.exports = exec;