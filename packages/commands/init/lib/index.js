'use strict';

function init(projectName) {
  let cmb = arguments[arguments.length - 2];
  console.log('init', projectName, cmb.force, process.env.CLI_TARGET_PATH)
}

module.exports = init

