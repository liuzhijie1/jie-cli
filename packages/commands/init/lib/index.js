'use strict';

const Command = require('@jie-cli/command')
const log = require('@jie-cli/log')

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || ''
    this.force = this._argv[this._argv.length - 1].force;
    log.verbose('projectName', this.projectName)
    log.verbose('force', this.force)
  }

  exec() {
    console.log('init 的业务逻辑')
  }
}

function init(argv) {
  // console.log(argv)
  // let cmb = arguments[arguments.length - 2];
  // console.log('init', projectName, cmb.force, process.env.CLI_TARGET_PATH)
  return new InitCommand(argv);
}

module.exports = init;
module.exports.InitCommand = InitCommand

