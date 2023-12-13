'use strict';

const pkgDir = require('pkg-dir').sync
const path = require('path')
const pathExists = require('path-exists').sync
const npminstall = require('npminstall')
const fse = require('fs-extra')
const { isObject } = require('@jie-cli/utils')
const formatPath = require('@jie-cli/format-path')
const { getDefaultRegistry, getNpmLatestVersion } = require('@jie-cli/get-npm-info')

class Package {
  constructor(options = {}) {
    // console.log('Package constructor', options, !options, !isObject(options))
    if (!options || !isObject(options)) {
      throw new Error('Package类的options参数不能为空')
    }
    this.targetPath = options.targetPath;
    this.storeDir = options.storeDir;
    this.packageName = options.packageName;
    this.packageVersion = options.packageVersion;
    this.cacheFilePathPrefix = this.packageName.replace('/', '_')
  }

  async install() {
    await this.prepare()
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [
        {
          name: this.packageName,
          version: this.packageVersion
        }
      ]
    })
  }

  async update() {
    await this.prepare();
    const latestPackageVersion = await getNpmLatestVersion(this.packageName)
    const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion);
    // console.log('latestPackageVersion', latestPackageVersion, pathExists(latestFilePath), latestFilePath)
    if (!pathExists(latestFilePath)) {
      await npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [
          {
            name: this.packageName,
            version: latestPackageVersion
          }
        ]
      })
      this.packageVersion = latestPackageVersion;
    }
    return latestFilePath
  }

  async prepare() {
    if (this.storeDir && !pathExists(this.storeDir)) {
      fse.mkdirpSync(this.storeDir);
    }
    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName)
    }
    // console.log(this.packageVersion)
  }

  get cacheFilePath() {
    // return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`)
    // console.log(this.packageName);
    return path.resolve(this.storeDir, `${this.packageName}`)
  }

  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(this.storeDir, `${this.packageName}`)
  }

  async exists() {
    if (this.storeDir) {
      await this.prepare()
      return pathExists(this.cacheFilePath)
    } else {
      return pathExists(this.targetPath)
    }
  }

  getRootFilePath() {
    function _getRootFile(targetPath) {
      const dir = pkgDir(targetPath);
      // console.log(dir)
      if (dir) {
        const pkgFile = require(path.resolve(dir, 'package.json'))
        // console.log(pkgFile)
        if (pkgFile && pkgFile.main) {
          // 路径的兼容 针对操作系统
          return formatPath(path.resolve(dir, pkgFile.main))
        }
      }
      return null;
    }
    if (this.storeDir) {
      return _getRootFile(this.cacheFilePath)
    } else {
      return _getRootFile(this.targetPath)
    }
  }

}

module.exports = Package;

