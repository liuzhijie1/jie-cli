'use strict';

const Package = require('@jie-cli/models')
const log = require('@jie-cli/log')

const SETTINGS = {
  init: "@jie-cli/init"
}

function exec() {
  const targetPath = process.env.CLI_TARGET_PATH
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

  const pkg = new Package({
    targetPath,
    packageName,
    packageVersion
  });
  console.log(pkg)
  // console.log('exec')
}


module.exports = exec;