'use strict';

const Command = require('@jie-cli/command')
const log = require('@jie-cli/log')

const fs = require('fs')
const inquirer = require('inquirer')
const fse = require('fs-extra')

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || ''
    this.force = this._argv[this._argv.length - 1].force;
    log.verbose('projectName', this.projectName)
    log.verbose('force', this.force)
  }

  async exec() {
    // console.log('init 的业务逻辑')
    // 1. 准备阶段
    // 2. 下载模板
    // 3. 安装模板
    try {
      const ret = await this.prepare();
      if (ret) {
        
      }
    } catch (error) {
      log.error(error.message)
    }
  }

  async prepare() {
    const localPath = process.cwd();
    if (!this.isDirEmpty(localPath)) {
      let ifContinue = false;
      if (!this.force) {
        ifContinue = (await inquirer.prompt({
          type: 'confirm',
          name: 'ifContinue',
          default: false,
          message: '当前文件夹不为空，是否继续创建项目？'
        })).ifContinue
        if (!ifContinue) {
          return;
        }
      }
      if (ifContinue || this.force) {
        const { confirmDelete } = await inquirer.prompt({
          type: 'confirm',
          name: 'confirmDelete',
          default: false,
          message: '是否确认清空当前目录下的文件？'
        })
        if (confirmDelete) {
          fse.emptyDirSync(localPath);
        }
      }
    }
  }

  isDirEmpty(localPath) {
    console.log('localPath', localPath)
    // console.log('path', path)
    console.log('localPath', path.resolve('.'))
    let fileList = fs.readdirSync(localPath)
    console.log('fileList', fileList)
    fileList = fileList.filter((file) => !file.startsWith('.') && ['node_modules'].indexOf(file) < 0)
    return !fileList || fileList.length <= 0;
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

