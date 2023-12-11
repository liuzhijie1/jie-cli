'use strict';

const axios = require("axios")
const urljoin = require('url-join')
const semver = require('semver')


function getNpmInfo(npmName, registry) {
  // console.log('getNpmInfo', npmName)
  if (!npmName) return null;
  const registryUrl = registry || getDefaultRegistry();
  const npmInfoUrl = urljoin(registryUrl, npmName);

  // console.log(npmInfoUrl)

  return axios.get(npmInfoUrl).then(res => {
    // console.log(res)
    if (res.status === 200) {
      return res.data;
    } else {
      return null;
    }
  }).catch(error => {
    return Promise.reject(error);
  });
}

function getDefaultRegistry(isOriginal = true) {
  return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org'
}

async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry);
  if (data) {
    return Object.keys(data.versions)
  } else {
    return [];
  }
}

function getNpmSemverVersions(baseVersion, versions) {
  versions = versions.filter(version => {
    return semver.satisfies(version, `^${baseVersion}`)
  }).sort((a, b) => {
    return semver.gt(b, a)
  })
  return versions;
}

async function getNpmSemverVersion(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry);
  // console.log('111', baseVersion, versions)
  const newVersions = await getNpmSemverVersions(baseVersion, versions);
  // console.log(newVersions)
  if (newVersions && newVersions.length > 0) {
    return newVersions[0];
  }
  return null;
}

async function getNpmLatestVersion(npmName, registry) {
  let versions = await getNpmVersions(npmName, registry)
  if (versions) {
    versions = versions.sort((a, b) => semver.gt(b, a))
    return versions[0]
  }
  return null;
}

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getNpmSemverVersion,
  getDefaultRegistry,
  getNpmLatestVersion
};