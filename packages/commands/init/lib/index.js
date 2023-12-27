'use strict';

const Command = require('@jie-cli/command')
const Package = require('@jie-cli/package')
const log = require('@jie-cli/log')
const { spinnerStart, execAsync } = require('@jie-cli/utils')

const fs = require('fs')
const inquirer = require('inquirer')
const fse = require('fs-extra')
const semver = require('semver')
const path = require('path')
const userHome = require('user-home')
const getProjectTemplate = require('./getProjectTemplate')

const TYPE_PROJECT = 'project'
const TYPE_COMPONENT = 'component'

const TEMPLATE_TYPE_NORMAL = 'normal'
const TEMPLATE_TYPE_CUSTOM = 'custom'

const WHITE_COMMAND = ['npm', 'cnpm']

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
      const projectInfo = await this.prepare();
      if (projectInfo) {
        log.verbose('projectInfo', projectInfo)
        this.projectInfo = projectInfo;
        await this.downloadTemplate(projectInfo)
        // 3. 安装模板
        await this.installTemplate()
      }
    } catch (error) {
      log.error(error.message)
    }
  }

  async installTemplate() {
    console.log('installTemplate', this.templateInfo)
    if (this.templateInfo) {
      if (!this.templateInfo.type) {
        this.templateInfo.type = TEMPLATE_TYPE_NORMAL
      }
      if (this.templateInfo.type === TEMPLATE_TYPE_NORMAL) {
        await this.installNormalTemplate()
      } else if (this.templateInfo.type === TEMPLATE_TYPE_CUSTOM) {
        await this.installCustomTemplate()
      } else {
        throw new Error('无法识别项目模板类别！')
      }
    } else {
      throw new Error('模板信息不存在！')
    }
  }

  checkCommand(cmd) {
    if (WHITE_COMMAND.includes(cmd)) {
      return cmd;
    }
    return null;
  }

  async execCommand(command, errorMsg = '') {
    let ret;
    if (command) {
      const cmdArray = command.split(' ')
      const cmd = this.checkCommand(cmdArray[0])
      if (!cmd) {
        throw new Error('命令不在白名单中 ' + cmd)
      }
      const args = cmdArray.slice(1)
      console.log('cmd args', cmd, args)
      ret = await execAsync(cmd, args, {
        stdio: 'inherit',
        cwd: process.cwd()
      })
    }
    if (ret !== 0) {
      throw new Error(errorMsg)
    }
    return ret;
  }

  async installNormalTemplate() {
    console.log('安装标准模板')
    log.verbose('templateNpm', this.templateNpm)
    console.log(this.templateNpm.cacheFilePath)
    const spinner = spinnerStart('正在安装模板...');
    try {
      const templatePath = path.resolve(this.templateNpm.cacheFilePath, 'template')
      const targetPath = process.cwd();
      fse.ensureDirSync(templatePath)
      fse.ensureDirSync(targetPath)
      fse.copySync(templatePath, targetPath)
    } catch (error) {
      throw error;
    } finally {
      spinner.stop(true)
      // if (fs) {
      log.success('模板安装成功')
      // }
    }
    // 依赖安装
    const { installCommand, startCommand } = this.templateInfo
    await this.execCommand(installCommand, '依赖安装过程失败')
    await this.execCommand(startCommand, '启动命令过程失败')
  }

  async installCustomTemplate() {
    console.log('安装自定义模板')
  }

  async prepare() {

    const template = await getProjectTemplate();
    console.log('template', template)
    if (!template || template.length === 0) {
      throw new Error('项目模板不存在')
    }
    this.template = template;

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
    return this.getProjectInfo();
  }

  async downloadTemplate() {
    // 1. 通过项目模板API获取项目模板信息
    // 1.1 通过egg.js 搭建一套后端系统
    // 1.2 通过npm存储项目模板
    // 1.3 将项目模板信息存储到mongodb数据库中
    // 1.4 通过egg.js 获取mongodb中的数据并且通过API 返回
    console.log('downloadTemplate', this.projectInfo, this.template)
    const { projectTemplate } = this.projectInfo;
    const templateInfo = this.template.find(item => item.npmName === projectTemplate)
    console.log('templateInfo', templateInfo);
    console.log('userHome', userHome);
    const targetPath = path.resolve(userHome, '.jie-cli', 'template')
    const storeDir = path.resolve(userHome, '.jie-cli', 'template', 'node_modules')
    console.log(targetPath, storeDir)
    const { npmName, version } = templateInfo
    this.templateInfo = templateInfo
    const templateNpm = new Package({
      targetPath,
      storeDir,
      packageName: npmName,
      packageVersion: version
    })
    if (!(await templateNpm.exists())) {
      const spinner = spinnerStart('正在下载模板...');
      try {
        await templateNpm.install()
      } catch (error) {
        throw error
      } finally {
        spinner.stop(true)
        if (await templateNpm.exists()) {
          log.success('下载模板成功')
          this.templateNpm = templateNpm
        }
      }
    } else {
      const spinner = spinnerStart('正在更新模板...');
      try {
        await templateNpm.update()
      } catch (error) {
        throw error
      } finally {
        spinner.stop(true)
        if (await templateNpm.exists()) {
          log.success('更新模板成功')
          this.templateNpm = templateNpm
        }
      }
    }
  }

  async getProjectInfo() {
    let projectInfo = {};
    const { type } = await inquirer.prompt({
      type: 'list',
      name: 'type',
      message: '请选择初始化类型',
      default: TYPE_PROJECT,
      choices: [{
        name: '项目',
        value: TYPE_PROJECT
      }, {
        name: '组件',
        value: TYPE_COMPONENT
      }]
    })
    log.verbose('type', type)
    if (type === TYPE_PROJECT) {
      const project = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: '',
          default: '',
          validate: function (v) {
            const done = this.async();

            setTimeout(function () {
              if (!/^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(v)) {
                done('请输入合法的项目名称')
                return
              }
              done(null, true)
            }, 0)
            // 1. 首字符必须为英文字符
            // 2. 尾字符必须为英文或数字，不能为字符
            // 3. 字符仅允许"-_"

            // 合法: a, a-b, a_b, a-b-c, a_b_c, a-b1-c1, a_b1_c1
            // 不合法: 1, a_, a-, a_1, a-1
            // return /^[a-zA-Z]+[\w-]*[a-zA-Z0-9]$/.test(v)
            // return /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(v)
          },
          filter: function (v) {
            return v;
          }
        },
        {
          type: 'input',
          name: 'projectVersion',
          message: '请输入项目版本号',
          default: '1.0.0',
          validate: function (v) {
            const done = this.async();

            setTimeout(function () {
              if (!(!!semver.valid(v))) {
                done('请输入合法的版本号')
                return
              }
              done(null, true)
            }, 0)
          },
          filter: function (v) {
            if (!!semver.valid(v)) {
              return semver.valid(v);
            } else {
              return v;
            }
          }
        },
        {
          type: 'list',
          name: 'projectTemplate',
          message: '请选择项目模板',
          choices: this.createTemplateChoice()
        }
      ])
      projectInfo = {
        type,
        ...project
      }
    } else if (type === TYPE_COMPONENT) {

    }
    return projectInfo;
  }

  createTemplateChoice() {
    return this.template.map((item) => ({
      value: item.npmName,
      name: item.name
    }))
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

