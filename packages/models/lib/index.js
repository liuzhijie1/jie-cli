'use strict';

const pkgDir = require('pkg-dir').sync
const path = require('path')
const { isObject } = require('@jie-cli/utils')

class Package {
  constructor(options = {}) {
    // console.log('Package constructor', options, !options, !isObject(options))
    if (!options || !isObject(options)) {
      throw new Error('Package类的options参数不能为空')
    }
    this.targetPath = options.targetPath;
    this.storePath = options.storePath;
    this.packageName = options.packageName;
    this.packageVersion = options.packageVersion;
  }


  getRootFilePath() {
    const dir = pkgDir(this.targetPath);
    console.log(dir)
    if (dir) {
      const pkgFile = require(path.resolve(dir, 'package.json')) 
      console.log(pkgFile)
    }
    return null;
  }

}

module.exports = Package;

